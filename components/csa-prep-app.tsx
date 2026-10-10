'use client'

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import {
  Activity, ArrowLeft, BarChart3, BookOpen, Brain, Check, ChevronRight, CircleStop,
  Clock3, Flame, Gauge, Headphones, LayoutDashboard, ListChecks, Mic,
  RefreshCcw, RotateCcw, Search, Settings, ShieldCheck,
  Sparkles, Star, Target, Trophy, Users, Volume2, WandSparkles, X,
} from 'lucide-react'
import {
  evaluateAnswer, getCompetencyLabel, getReadinessFromHistory, getSpeakingMetrics,
  type Evaluation, type TranscriptWord,
} from '@/lib/evaluation'
import { createBalancedInterviewMock, getRandomQuestions, questions, type Question } from '@/lib/question-bank'
import { createScenarioMock, createWorkStyleMock, scenarioItems, workStyleItems, type ScenarioItem, type WorkStyleItem } from '@/lib/assessment'

import { answerFeedbackSchema, speakingFeedbackSchema } from '@/lib/feedback-schema'
import { speakingTopics, pickSpeakingTopic, remainingSpeakingSeconds } from '@/lib/speaking-topics'

type View = 'Dashboard' | 'Practice' | 'Question Bank' | 'Assessment' | 'Interview' | 'Speaking Coach' | 'Progress' | 'Study Plan' | 'Settings'
type HistoryItem = { id: string; questionId: string; question: string; score: number; category: Question['category']; date: string; answer: string; evaluation: Evaluation }
type SpeakingResult = { transcript?: string; evaluation?: SpeakingEval; pauseMetricsAvailable?: boolean; id: string; prompt: string; date: string; duration: number; wpm: number; fillers: number; longPauses: number; score: number }
type SessionResult = { decisions?: { prompt: string; answer: string; reason?: string; better?: string }[]; id: string; date: string; kind: 'customer-practice' | 'customer-mock' | 'workstyle' | 'interview'; count: number; score?: number }
type Persisted = { sessions: SessionResult[]; history: HistoryItem[]; completed: string[]; mockResults: number[]; speakingResults: SpeakingResult[]; favorites: string[]; streak: number; lastPractice: string | null }
type SpeakingEval = { overall: number; fluency: number; grammar: number; vocabulary: number; structure: number; relevance: number; conciseFeedback: string; strengths: string[]; improvements: string[]; grammarFixes: { original: string; better: string; reason: string }[]; improvedVersion: string; nextDrill: string }

const STORAGE_KEY = 'csa-prep-progress-v4'
const EMPTY_DATA: Persisted = { sessions: [], history: [], completed: [], mockResults: [], speakingResults: [], favorites: [], streak: 0, lastPractice: null }
const CATEGORY_LABELS = { 'customer-service': 'Customer service', behavioral: 'Real examples', 'amazon-style': 'Role & judgment', extempore: 'Speaking & HR' }

const NAV: { label: View; name: string; icon: typeof Target }[] = [
  { label: 'Dashboard', name: 'Overview', icon: LayoutDashboard },
  { label: 'Study Plan', name: 'Study plan', icon: Target },
  { label: 'Speaking Coach', name: 'Speaking', icon: Mic },
  { label: 'Practice', name: 'Interview answers', icon: Users },
  { label: 'Assessment', name: 'Assessments', icon: ListChecks },
  { label: 'Question Bank', name: 'Question library', icon: BookOpen },
  { label: 'Progress', name: 'Your activity', icon: BarChart3 },
  { label: 'Settings', name: 'Settings', icon: Settings },
]
const VIEW_LABEL: Record<View, string> = {
  Dashboard: 'Overview', 'Study Plan': 'Study plan', 'Speaking Coach': 'Speaking',
  Practice: 'Interview answers', Interview: 'Interview answers', Assessment: 'Assessments',
  'Question Bank': 'Question library', Progress: 'Your activity', Settings: 'Settings',
}
const VIEW_HASH: Record<View, string> = { Dashboard: 'overview', Practice: 'written', Interview: 'interview', 'Question Bank': 'questions', Assessment: 'assessments', 'Speaking Coach': 'speaking', Progress: 'activity', 'Study Plan': 'study-plan', Settings: 'settings' }

function useDraftWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
}

export default function CsaPrepApp() {
  const [view, setView] = useState<View>('Dashboard')
  const [visited, setVisited] = useState<View[]>(['Dashboard'])
  const [data, setData] = useState<Persisted>(EMPTY_DATA)
  const [notice, setNotice] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [storageWritable, setStorageWritable] = useState(true)
  const [practiceSeed, setPracticeSeed] = useState<string | null>(null)
  const [speakingSeed, setSpeakingSeed] = useState<{ id: string; seconds: number } | null>(null)

  useEffect(() => {
    const syncView = () => {
      const next = (Object.keys(VIEW_HASH) as View[]).find(key => VIEW_HASH[key] === window.location.hash.slice(1)) || 'Dashboard'
      setVisited(prev => prev.includes(next) ? prev : [...prev, next]); setView(next); setNotice('')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    syncView(); window.addEventListener('popstate', syncView); window.addEventListener('hashchange', syncView)
    return () => { window.removeEventListener('popstate', syncView); window.removeEventListener('hashchange', syncView) }
  }, [])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setData(validateProgress(JSON.parse(saved)))
    } catch { setStorageWritable(false); setNotice('Saved progress could not be loaded. Export your saved data before resetting it.') }
    finally { setHydrated(true) }
  }, [])
  useEffect(() => {
    if (!hydrated || !storageWritable) return
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }
    catch { setStorageWritable(false); setNotice('Your browser could not save progress. Export a backup from Settings.') }
  }, [data, hydrated, storageWritable])

  const readiness = getReadinessFromHistory(data.history.map(item => item.score))
  const average = data.history.length ? Math.round(data.history.reduce((sum, item) => sum + item.score, 0) / data.history.length) : 0
  const competencyStats = useMemo(() => {
    const scores: Record<string, number[]> = {}
    data.history.forEach(item => Object.entries(item.evaluation.scores).forEach(([key, value]) => {
      if (typeof value === 'number') (scores[key] ||= []).push(value)
    }))
    return Object.entries(scores).map(([key, values]) => ({ key, score: Math.round(values.reduce((a, b) => a + b, 0) / values.length) })).sort((a, b) => a.score - b.score)
  }, [data.history])

  function go(next: View) {
    if (next === view) return
    setVisited(prev => prev.includes(next) ? prev : [...prev, next])
    setView(next)
    window.history.pushState(null, '', `#${VIEW_HASH[next]}`)
    if (next !== 'Speaking Coach') setSpeakingSeed(null)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function startFirstSession() { setSpeakingSeed({ id: 'topic-6', seconds: 60 }); go('Speaking Coach') }
  function openPractice(questionId?: string) { setPracticeSeed(questionId || null); go('Practice') }
  function updateData(updater: (prev: Persisted) => Persisted) { setData(prev => updater(prev)) }
  function reset() { if (window.confirm('Reset all local practice history, favorites and speaking results?')) { setData(EMPTY_DATA); setStorageWritable(true); setVisited(['Settings']); setView('Settings'); setSpeakingSeed(null); setPracticeSeed(null); setNotice('Local progress has been reset.') } }

  return (
    <div className="app-root min-h-screen bg-background text-foreground">
      <div className="app-frame">
        <aside className="app-sidebar">
          <Brand />
          
          <nav className="studio-navigation" aria-label="Main navigation">
            {[
              { title: 'Your preparation', views: ['Dashboard', 'Study Plan'] },
              { title: 'Practice', views: ['Speaking Coach', 'Practice', 'Assessment'] },
              { title: 'Review', views: ['Question Bank', 'Progress'] },
            ].map(group => <div className="nav-group" key={group.title}><p>{group.title}</p>{group.views.map(label => {
              const item = NAV.find(item => item.label === label)!
              const Icon = item.icon
              const active = view === item.label || (item.label === 'Practice' && view === 'Interview')
              return <button key={item.label} onClick={() => { setSpeakingSeed(null); go(item.label) }} aria-current={active ? 'page' : undefined} className={`nav-row ${active ? 'nav-row-active' : ''}`}><Icon className="size-[18px]" /><span>{item.name}</span></button>
            })}</div>)}
          </nav>
          <div className="sidebar-bottom"><button className={`nav-row ${view === 'Settings' ? 'nav-row-active' : ''}`} aria-current={view === 'Settings' ? 'page' : undefined} onClick={() => go('Settings')}><Settings className="size-[18px]" />Settings</button><div className="sidebar-footer"><span className="local-status-dot" data-error={!storageWritable || undefined} />{storageWritable ? 'Saved on this device' : 'Saving unavailable'}</div></div>
        </aside>

        <main className="app-main">
          <div className="mobile-app-header sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background px-4 py-3 lg:hidden">
            <Brand compact />
            <select aria-label="Navigate" value={view === 'Interview' ? 'Practice' : view} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setSpeakingSeed(null); go(e.target.value as View) }} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold">
              {NAV.map(item => <option key={item.label} value={item.label}>{item.name}</option>)}
            </select>
          </div>

          {notice && <div role="status" className="mx-4 mt-4 flex items-start justify-between rounded-lg border border-[#DADCE0] bg-white px-4 py-3 text-sm text-foreground sm:mx-8"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><X className="size-4" /></button></div>}

          <header className="workspace-bar"><div><span>CSA preparation</span><ChevronRight className="size-3.5" /><strong>{VIEW_LABEL[view]}</strong></div><button onClick={() => go('Progress')} className="workspace-activity"><Activity className="size-4" />{data.history.length + data.speakingResults.length} scored {data.history.length + data.speakingResults.length === 1 ? 'answer' : 'answers'}</button></header>
          {(view === 'Practice' || view === 'Interview') && <nav className="answer-tabs" aria-label="Answer practice format"><button aria-current={view === 'Practice' ? 'page' : undefined} onClick={() => go('Practice')}>Written practice</button><button aria-current={view === 'Interview' ? 'page' : undefined} onClick={() => go('Interview')}>Interview & mock</button></nav>}

          {visited.includes('Dashboard') && <section hidden={view !== 'Dashboard'}><Dashboard data={data} readiness={readiness} average={average} competencyStats={competencyStats} go={go} startFirstSession={startFirstSession} /></section>}
          {visited.includes('Practice') && <section hidden={view !== 'Practice'}><PracticeLab active={view === 'Practice'} data={data} updateData={updateData} setNotice={setNotice} seedQuestionId={practiceSeed} onSeedConsumed={() => setPracticeSeed(null)} /></section>}
          {visited.includes('Question Bank') && <section hidden={view !== 'Question Bank'}><QuestionBank data={data} updateData={updateData} onPractice={openPractice} /></section>}
          {visited.includes('Assessment') && <section hidden={view !== 'Assessment'}><AssessmentLab data={data} updateData={updateData} /></section>}
          {visited.includes('Interview') && <section hidden={view !== 'Interview'}><InterviewLab visible={view === 'Interview'} data={data} updateData={updateData} setNotice={setNotice} /></section>}
          {visited.includes('Speaking Coach') && <section hidden={view !== 'Speaking Coach'}><SpeakingCoach visible={view === 'Speaking Coach'} initialSession={speakingSeed} data={data} updateData={updateData} setNotice={setNotice} /></section>}
          {visited.includes('Progress') && <section hidden={view !== 'Progress'}><Progress data={data} readiness={readiness} average={average} competencyStats={competencyStats} reset={reset} go={go} /></section>}
          {visited.includes('Study Plan') && <section hidden={view !== 'Study Plan'}><StudyPlan data={data} competencyStats={competencyStats} go={go} startFirstSession={startFirstSession} /></section>}
          {visited.includes('Settings') && <section hidden={view !== 'Settings'}><SettingsPanel data={data} reset={reset} restore={next => { setData(next); setStorageWritable(true); setNotice('Backup restored in this browser.') }} /></section>}
        </main>
      </div>
    </div>
  )
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3">
    <div className="brand-mark"><Headphones className="size-5" /></div>
    {!compact && <div><p className="text-base font-semibold tracking-tight">CSA Prep Studio</p><p className="text-[11px] font-medium text-muted-foreground">Amazon customer service preparation</p></div>}
    {compact && <strong className="text-sm">CSA Prep</strong>}
  </div>
}

function Shell({
  children,
  action,
  eyebrow, title, subtitle,
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="app-page" data-page={title || 'session'}>
      {title && <header className="studio-header-row"><div className="studio-page-heading"><h1>{title}</h1>{subtitle && <div>{subtitle}</div>}</div>{action && <div className="studio-header-action">{action}</div>}</header>}
      {action && !title && (
        <div className="page-toolbar">
          {action}
        </div>
      )}

      <div className="page-content">
        {children}
      </div>
    </section>
  )
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`h-2.5 overflow-hidden rounded-md bg-muted ${className}`}><div className="h-full rounded-md bg-[var(--ui-accent)] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
}

function Dashboard({ data, go, startFirstSession }: any) {
  const total = data.history.length + data.speakingResults.length
  const recent = [
    ...data.history.map((item: HistoryItem) => ({ id: item.id, label: item.question, date: item.date, score: item.score, type: 'Written answer' })),
    ...data.sessions.map((item: SessionResult) => ({ id: item.id, label: item.kind === 'workstyle' ? 'Work-style set' : item.kind === 'interview' ? 'Interview mock' : 'Customer-situation set', date: item.date, score: item.score, type: `${item.count} questions` })),
    ...data.speakingResults.map((item: SpeakingResult) => ({ id: item.id, label: item.prompt, date: item.date, score: item.score, type: 'Speaking' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
  return <Shell eyebrow="Your preparation" title="Prepare for your CSA interview" subtitle="Build clear answers, confident speech and sound customer judgment.">
    <div className="overview-top">
      <section className="recommended-session"><span className="session-label"><Mic className="size-4" />{total ? 'A quick speaking drill' : 'Recommended starting point'}</span><h2>Talk about your<br className="desktop-break" /> daily routine.</h2><p>Describe your morning, work or studies, and evening. Record for one minute, review a correction, then try again.</p><div className="session-facts"><span><Clock3 className="size-4" />1-minute recording</span><span>English or Hindi</span></div><button className="btn-primary" onClick={startFirstSession}>Start speaking <ChevronRight className="size-4" /></button></section>
      <aside className="overview-plan"><div className="section-heading"><span className="section-label">A simple way to prepare</span><span className="plan-duration">7 days</span></div><ol><li><span>01</span><div><strong>Get comfortable speaking</strong><p>Use familiar topics and your own words.</p></div></li><li><span>02</span><div><strong>Build your interview answers</strong><p>Prepare truthful examples, then try a mock.</p></div></li><li><span>03</span><div><strong>Practise customer decisions</strong><p>Understand the reasoning behind a response.</p></div></li></ol><button onClick={() => go('Study Plan')} className="text-link">Open the study plan <ChevronRight className="size-4" /></button></aside>
    </div>
    <section className="practice-paths"><div className="section-heading"><h2>Choose what to practise</h2><button onClick={() => go('Question Bank')} className="text-link">Browse all questions <ChevronRight className="size-4" /></button></div><div className="practice-path-grid">{[
      { title: 'Speaking', text: 'Record a timed answer, listen back and review your delivery.', meta: `${speakingTopics.length} sourced topics · 1–3 minutes`, icon: Mic, view: 'Speaking Coach' as View, action: 'Choose a topic' },
      { title: 'Interview answers', text: 'Write a clear answer or run a short interview mock.', meta: 'Written practice · 3-question mock', icon: Users, view: 'Practice' as View, action: 'Practise an answer' },
      { title: 'Assessments', text: 'Work through customer situations and work-style choices.', meta: 'Practice sets · 24-item mocks', icon: ListChecks, view: 'Assessment' as View, action: 'Choose a practice set' },
    ].map(item => <button key={item.title} className="practice-path" onClick={() => go(item.view)}><item.icon className="path-icon" /><h3>{item.title}</h3><p>{item.text}</p><small>{item.meta}</small><span>{item.action}<ChevronRight className="size-4" /></span></button>)}</div></section>
    <section className="practice-recent"><div className="section-heading"><h2>Recent activity</h2><button className="text-link" onClick={() => go('Progress')}>View activity <ChevronRight className="size-4" /></button></div>{!recent.length ? <div className="recent-empty"><Clock3 className="size-5" /><p>Your completed sessions will appear here.</p><span>Start with the speaking drill above.</span></div> : recent.map(item => <div key={item.id} className="recent-row"><div><p>{item.label}</p><small>{item.type} · {new Date(item.date).toLocaleDateString()}</small></div><strong>{item.score !== undefined ? <>{item.score}<small>/100</small></> : <Check className="size-5" aria-label="Completed" />}</strong></div>)}</section>
  </Shell>
}

function MetricCard({ icon: Icon, label, value, note, className }: any) {
  return <div className={`metric-card ${className}`}><div className="flex items-center justify-between"><span className="metric-icon"><Icon className="size-5" /></span><span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>
}

function QuickAction({ label, sub, icon: Icon, onClick, tone }: any) {
  return (
    <button onClick={onClick} className={`quick-action ${tone || ''}`}>
      <Icon className="size-5 shrink-0" />

      <span className="quick-action-copy">
        <strong>{label}</strong>
        <small>{sub}</small>
      </span>

      <ChevronRight className="ml-auto size-4 shrink-0" />
    </button>
  )
}

function PracticeLab({
  active,
  data,
  updateData,
  setNotice,
  seedQuestionId,
  onSeedConsumed,
}: {
  data: Persisted
  updateData: (fn: (p: Persisted) => Persisted) => void
  setNotice: (s: string) => void
  active: boolean
  seedQuestionId: string | null
  onSeedConsumed: () => void
}) {
  const seenQuestionIds = useRef<string[]>([])
  const [set, setSet] = useState<Question[]>(() => {
    const seeded = seedQuestionId ? questions.find(question => question.id === seedQuestionId) : undefined
    const initial = seeded
      ? [seeded, ...getRandomQuestions(7, { excludeIds: [seeded.id] })]
      : getRandomQuestions(8)
    seenQuestionIds.current = initial.map(question => question.id)
    return initial
  })
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const selected = set[index]
  useDraftWarning(Boolean(answer.trim()) && !evaluation)

  useEffect(() => {
    if (!seedQuestionId) return
    const seeded = questions.find(question => question.id === seedQuestionId)
    if (seeded) { setSet([seeded, ...getRandomQuestions(7, { excludeIds: [seeded.id] })]); setIndex(0); setAnswer(''); setEvaluation(null); setSeconds(0) }
    onSeedConsumed()
  }, [seedQuestionId, onSeedConsumed])

  useEffect(() => {
    if (!active || evaluation || loading) return
    const id = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [active, evaluation, index, loading])

  function createSet() {
    if (answer.trim() && !evaluation && !window.confirm('Start a new set and discard this unreviewed answer?')) return
    let excluded = seenQuestionIds.current
    if (questions.length - excluded.length < 8) {
      excluded = set.map(question => question.id)
    }

    const nextSet = getRandomQuestions(8, { excludeIds: excluded })
    seenQuestionIds.current = [...excluded, ...nextSet.map(question => question.id)]
    setSet(nextSet)
    setIndex(0)
    setAnswer('')
    setEvaluation(null)
    setSeconds(0)
  }

  async function submit() {
    if (loading || evaluation) return
    if (!selected || answer.trim().length < 20) {
      setNotice('Write enough detail to evaluate — at least 20 characters.')
      return
    }

    setLoading(true)
    let result = evaluateAnswer(selected, answer)

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 22000)
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: selected.prompt,
          answer,
          rubric: selected.rubric,
          mode: selected.type,
        }),
      })
      window.clearTimeout(timeout)
      const payload = await res.json().catch(() => ({}))
      if (res.ok && payload.evaluation) {
        result = {
          ...result,
          isFallback: false,
          overall: Math.round(payload.evaluation.score),
          summary: payload.evaluation.verdict,
          aiFeedback: payload.evaluation,
        }
      } else {
        setNotice(payload.error || 'AI coaching was unavailable; the local answer check was used.')
      }
    } catch {
      setNotice('AI coaching was unavailable; the local answer check was used.')
    } finally {
      setLoading(false)
    }

    setEvaluation(result)
    const item: HistoryItem = {
      id: `${selected.id}-${Date.now()}`,
      questionId: selected.id,
      question: selected.prompt,
      score: result.overall,
      category: selected.category,
      date: new Date().toISOString(),
      answer,
      evaluation: result,
    }
    updateData(prev => ({
      ...prev,
      history: [item, ...prev.history].slice(0, 150),
      completed: prev.completed.includes(selected.id) ? prev.completed : [...prev.completed, selected.id],
      lastPractice: new Date().toISOString(),
      streak: computeStreak(prev.lastPractice, prev.streak),
    }))
  }

  function next() {
    const nextIndex = index + 1
    if (nextIndex >= set.length) {
      createSet()
      return
    }

    setIndex(nextIndex)
    setAnswer('')
    setEvaluation(null)
    setSeconds(0)
  }

  return (
    <Shell title="Written answer practice" eyebrow="Guided practice" subtitle="Read the question, respond in your own words, then review what to improve."
      action={
        <button onClick={createSet} disabled={loading} className="btn-secondary">
          <RefreshCcw className="size-4" /> New set
        </button>
      }
    >
      {selected && (
        <QuestionWorkspace
          question={selected}
          answer={answer}
          setAnswer={value => { setAnswer(value); setEvaluation(null) }}
          evaluation={evaluation}
          loading={loading}
          submit={submit}
          next={next}
          seconds={seconds}
          progress={`${index + 1}/${set.length}`}
        />
      )}
    </Shell>
  )
}

function ReviewDialog({ open, onClose, title = 'Answer review', children, footer, returnFocus }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode; returnFocus?: RefObject<HTMLButtonElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current
    if (!element || !open) return
    element.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { element.close(); document.body.style.overflow = previousOverflow }
  }, [open])
  return <dialog ref={dialog} onClose={() => returnFocus?.current?.focus()} className="review-dialog" onKeyDown={event => { if (event.key !== 'Tab') return; const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], summary, input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')).filter(element => element.getClientRects().length > 0); const first = controls[0]; const last = controls[controls.length - 1]; if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last?.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() } }} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose() } }}>
    <header className="review-dialog-header"><div><p>Practice feedback</p><h2 id={titleId}>{title}</h2></div><button autoFocus type="button" className="review-dialog-close" aria-label="Close review" onClick={onClose}><X className="size-5" /></button></header>
    <div className="review-dialog-body">{children}</div>
    <footer className="review-dialog-footer"><button className="btn-secondary" onClick={onClose}>Back to answer</button>{footer}</footer>
  </dialog>
}

function SavedReview({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  return <><button ref={trigger} className="btn-secondary mt-4" onClick={() => setOpen(true)}>View saved review</button><ReviewDialog returnFocus={trigger} open={open} onClose={() => setOpen(false)} title={title}>{children}</ReviewDialog></>
}

function QuestionWorkspace({
  question,
  answer,
  setAnswer,
  evaluation,
  loading,
  submit,
  next,
  seconds,
  progress,
  nextLabel = 'Next question',
}: {
  question: Question
  answer: string
  setAnswer: (value: string) => void
  evaluation: Evaluation | null
  loading: boolean
  submit: () => void
  next: () => void
  seconds: number
  progress: string
  nextLabel?: string
}) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const reviewTrigger = useRef<HTMLButtonElement>(null)
  const answerInput = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { setReviewOpen(Boolean(evaluation)) }, [evaluation])
  function advance() { setReviewOpen(false); next(); window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => answerInput.current?.focus()) }
  function retry() { setReviewOpen(false); setAnswer(answer); requestAnimationFrame(() => answerInput.current?.focus()) }
  return (
    <div className="final-practice-layout">
      <div className="final-practice-main">
        <div className="final-practice-meta">
          <span>Question {progress}</span>
          <span className="tabular-nums">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>

        <h2 className="final-practice-prompt">{question.prompt}</h2>

        {question.context && <p className="final-practice-context">{question.context}</p>}

        <textarea
          ref={answerInput}
          aria-label="Your answer"
          disabled={loading}
          readOnly={Boolean(evaluation)}
          maxLength={12000}
          value={answer}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setAnswer(e.target.value)}
          placeholder="Write what you would actually say. Keep it clear, natural and specific."
          className="final-practice-answer"
        />

        <div className="final-practice-foot">
          <span role="status">{answer.trim() ? answer.trim().split(/\s+/).length : 0} words{!evaluation && answer.trim().length < 20 && ' · At least 20 characters to review'}</span>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAnswer('')}
              disabled={loading || !answer.trim() || Boolean(evaluation)}
              className="btn-secondary"
            >
              Clear
            </button>
            {evaluation && <button onClick={retry} className="btn-secondary">Edit and retry</button>}
            <button disabled={loading || Boolean(evaluation) || answer.trim().length < 20} onClick={submit} className="btn-primary">
              <WandSparkles className="size-4" />
              {loading ? 'Reviewing your answer…' : evaluation ? 'Answer reviewed' : 'Review answer'}
            </button>
          </div>
        </div>
      </div>

      {evaluation && <>
        <div className="review-ready" role="status"><div><strong>{evaluation.overall}/100</strong><span>Your answer has been reviewed.</span></div><button ref={reviewTrigger} className="btn-secondary" onClick={() => setReviewOpen(true)}>View answer review</button><button className="btn-primary" onClick={advance}>{nextLabel}<ChevronRight className="size-4" /></button></div>
        <ReviewDialog returnFocus={reviewTrigger} open={reviewOpen} onClose={() => setReviewOpen(false)} footer={<><button className="btn-secondary" onClick={retry}>Edit and retry</button><button className="btn-primary" onClick={advance}>{nextLabel}<ChevronRight className="size-4" /></button></>}>
          <p className="review-dialog-prompt">{question.prompt}</p>
          <EvaluationCard evaluation={evaluation} question={question} answer={answer} onNext={advance} showActions={false} />
        </ReviewDialog>
      </>}
    </div>
  )
}

function EvaluationCard({ evaluation, question, answer, onNext, nextLabel = 'Next question', showActions = true }: { evaluation: Evaluation; question: Question; answer: string; onNext: () => void; nextLabel?: string; showActions?: boolean }) {
  const [tab, setTab] = useState<'overview' | 'details' | 'suggestion'>('overview')
  const ai = evaluation.aiFeedback
  if (ai) {
    return <section className="review-panel" data-review-tab={!showActions ? tab : undefined}>
      <div className="review-head">
        <div>
          <p className="review-kicker">Practice score</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <span className="review-score">{ai.score}</span>
            <span className="pb-1 text-sm font-semibold text-muted-foreground">/100</span>
          </div>
          <h3 className="mt-3 max-w-4xl text-xl font-semibold leading-8">{ai.verdict}</h3>
        </div>
        <span className="review-source"><Brain className="size-4" /> Groq analysis</span>
      </div>

      {!showActions && <div className="review-tabs" aria-label="Feedback sections">{([['overview', 'Overview'], ['details', 'Detailed feedback'], ['suggestion', 'Suggested answer']] as const).map(([value, label]) => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</button>)}</div>}
      <details className="feedback-disclosure review-overview"><summary>Scores by criterion</summary><div className="report-metrics-grid mt-6">
        {ai.rubricAnalysis.slice(0, 6).map((item, index) => <ReportMetric key={`${item.criterion}-${index}`} label={item.criterion} value={item.score} />)}
      </div></details>

      <div className="report-coaching-grid review-overview mt-6">
        <div className="report-coaching-panel report-positive"><FeedbackList title="What worked" items={ai.strengths.length ? ai.strengths : ['No specific strengths reported by the coach.']} /></div>
        <div className="report-coaching-panel report-improve"><FeedbackList title="Improve next" items={ai.contentGaps.length ? ai.contentGaps : ['No significant content gaps reported by the coach.']} /></div>
      </div>

      <div className="review-details"><div className="report-detail-stack mt-5">
        <section className="report-wording-section">
          <div className="report-section-title">
            <span>Wording & grammar</span>
            <small>Cleaner, more professional phrasing</small>
          </div>

          <div className="report-wording-list">
            {ai.wordingFixes.length ? ai.wordingFixes.map((fix, index) => (
              <div key={index} className="report-wording-card">
                <div className="report-wording-original">“{fix.original}”</div>
                <div className="report-wording-better">
                  <ChevronRight className="size-4 shrink-0" />
                  <span>{fix.better}</span>
                </div>
                <p>{fix.reason}</p>
              </div>
            )) : (
              <div className="empty-note">
                No wording correction was necessary. Focus on the content and structure below.
              </div>
            )}
          </div>
        </section>

        <section className="report-detail-panel report-coaching-section">
          <div className="report-section-title">
            <span>Detailed coaching</span>
            <small>What to change in your next answer</small>
          </div>

          <div className="report-submitted-answer">
            <span>Your submitted answer</span>
            <p>{answer}</p>
          </div>

          <div className="report-coaching-cards">
            {ai.rubricAnalysis.slice(0, 4).map((item, index) => (
              <article key={`${item.criterion}-detail-${index}`} className="report-coaching-card">
                <div className="report-coaching-card-head">
                  <span className="report-coaching-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h4>{item.criterion}</h4>
                </div>

                {item.missing && (
                  <div className="report-coaching-point report-coaching-missing">
                    <span>What’s missing</span>
                    <p>{item.missing}</p>
                  </div>
                )}

                {item.fix && (
                  <div className="report-coaching-point report-coaching-try">
                    <span>Try this</span>
                    <p>{item.fix}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>

      </div><div className="review-suggestion mt-5 card-surface p-5 sm:p-6">
        <div className="report-section-heading"><div><div className="section-label">Suggested wording</div><p>Use only details that are true for you.</p></div><WandSparkles className="size-5" /></div>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7">{ai.improvedAnswer}</p>
      </div>

      {ai.followUp && <div className="review-suggestion mt-5 rounded-lg border border-[#DADCE0] bg-white p-5"><p className="section-label">Possible follow-up</p><p className="mt-2 text-sm leading-6">{ai.followUp}</p></div>}

      <details className="review-details mt-5 rounded-lg border border-border bg-background p-4">
        <summary className="cursor-pointer text-sm font-semibold">Show local answer check</summary>
        <div className="mt-4 grid gap-5 md:grid-cols-3"><FeedbackList title="Local strengths" items={evaluation.strengths} /><FeedbackList title="Local weaknesses" items={evaluation.weaknesses} /><FeedbackList title="Local missing elements" items={evaluation.missingElements} /></div>
      </details>

      {showActions && <div className="mt-7 flex flex-wrap gap-3"><button onClick={onNext} className="btn-primary">{nextLabel} <ChevronRight className="size-4" /></button><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-secondary">Review prompt</button></div>}
    </section>
  }

  const visibleScores = Object.entries(evaluation.scores).filter(([, v]) => typeof v === 'number') as [string, number][]
  return <section className="review-panel">
    <div className="review-head"><div><p className="review-kicker">Practice score</p><div className="mt-2 flex items-end gap-2"><span className="review-score">{evaluation.overall}</span><span className="pb-1 text-sm font-semibold">/100</span></div><h3 className="mt-3 max-w-3xl text-xl font-semibold leading-8">{evaluation.summary}</h3></div><span className="review-source"><Brain className="size-4" /> Local analysis</span></div>
    <p className="report-context-note">This is an approximate keyword and structure check. It cannot verify relevance, factual accuracy or interview readiness; use it as a checklist, not a hiring score.</p>
    <details className="feedback-disclosure"><summary>Scores by criterion</summary><div className="report-metrics-grid">{visibleScores.map(([key, score]) => <ReportMetric key={key} label={getCompetencyLabel(key)} value={score} />)}</div></details>
    <div className="report-coaching-grid mt-6"><div className="report-coaching-panel report-positive"><FeedbackList title="What worked" items={evaluation.strengths} /></div><div className="report-coaching-panel report-improve"><FeedbackList title="Improve next" items={[...evaluation.weaknesses, ...evaluation.missingElements]} /></div></div>
    {showActions && <div className="mt-7 flex flex-wrap gap-3"><button onClick={onNext} className="btn-primary">{nextLabel} <ChevronRight className="size-4" /></button><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn-secondary">Review prompt</button></div>}
  </section>
}

function FeedbackList({ title, items, dark = false }: { title: string; items: string[]; dark?: boolean }) {
  return <div className="coaching-list"><h4 className={dark ? 'text-white' : ''}>{title}</h4><ul className={dark ? 'text-white' : ''}>{items.slice(0, 4).map((item, i) => <li key={i}><Check className="size-4 shrink-0" />{item}</li>)}</ul></div>
}

function ReportMetric({ label, value }: { label: string; value: number }) {
  return <div className="report-metric"><div className="report-metric-head"><span>{label}</span><strong>{Math.round(value)}</strong></div><ProgressBar value={value} /></div>
}

function QuestionBank({
  data,
  updateData,
  onPractice,
}: {
  data: Persisted
  updateData: (fn: (p: Persisted) => Persisted) => void
  onPractice: (questionId: string) => void
}) {
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [category, setCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [unpracticed, setUnpracticed] = useState(false)
  const [page, setPage] = useState(0)
  const pageSize = 12
  useEffect(() => setPage(0), [query, category, difficulty, favoritesOnly, unpracticed])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return questions.filter(question => {
      const matchesSearch = !normalized
        || `${question.title} ${question.prompt}`.toLowerCase().includes(normalized)
      const matchesSaved = !favoritesOnly || data.favorites.includes(question.id)
      return matchesSearch && matchesSaved && (category === 'all' || question.category === category) && (difficulty === 'all' || question.difficulty === difficulty) && (!unpracticed || !data.completed.includes(question.id))
    })
  }, [query, favoritesOnly, data.favorites, category, difficulty, unpracticed, data.completed])

  function toggle(id: string) {
    updateData(prev => ({
      ...prev,
      favorites: prev.favorites.includes(id)
        ? prev.favorites.filter(questionId => questionId !== id)
        : [...prev.favorites, id],
    }))
  }

  return (
    <Shell eyebrow="Question library" title="Question library" subtitle="Browse original practice prompts. Save useful ones and build confidence one answer at a time.">
      <div className="final-bank-toolbar">
        <label className="final-bank-search">
          <Search className="size-4" />
          <input
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            aria-label="Search questions" placeholder="Search topics, situations or skills…"
          />
        </label>

        <button
          aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(value => !value)}
          className={`btn-secondary ${favoritesOnly ? 'text-[var(--ui-accent)]' : ''}`}
        >
          <Star className={`size-4 ${favoritesOnly ? 'fill-current' : ''}`} />
          Saved
        </button>
      </div>

      <div className="studio-bank-filters"><select aria-label="Question category" value={category} onChange={e => setCategory(e.target.value)}><option value="all">All categories</option>{Object.entries(CATEGORY_LABELS).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select><select aria-label="Question difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="all">All levels</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><button className="btn-secondary" aria-pressed={unpracticed} onClick={() => setUnpracticed(value => !value)}>Unpracticed only</button><button className="studio-text-button" onClick={() => { setQuery(''); setCategory('all'); setDifficulty('all'); setFavoritesOnly(false); setUnpracticed(false) }}>Clear filters</button></div>
      <div className="final-bank-heading">
        <div>
          <h2>Practice prompts</h2>
          <p>{filtered.length} of {questions.length} questions</p>
        </div>
      </div>

      <div className="final-question-list">
        {filtered.slice(page * pageSize, (page + 1) * pageSize).map((question, questionIndex) => (
          <article key={question.id} className="final-question-row">
            <div className="final-question-copy">
              <div className="final-question-title-row">
                <span className="final-question-number">{String(page * pageSize + questionIndex + 1).padStart(2, '0')}</span>
                <h2>{question.prompt}</h2>
              </div>

              <div className="studio-question-meta"><span>{CATEGORY_LABELS[question.category]}</span><span>{question.difficulty}</span><span>{getCompetencyLabel(question.competency)}</span></div>
              <details className="studio-question-details"><summary>View answer guidance</summary><div className="final-question-guidance">
                <div>
                  <strong>What to cover</strong>
                  <ul>
                    {question.rubric.slice(0, 3).map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div>
                  <strong>Answer tip</strong>
                  <p>{question.hint}</p>
                </div>
              </div>

              </details>
              {data.completed.includes(question.id) && (
                <span className="final-question-state">
                  <Check className="size-3.5" /> Practiced
                </span>
              )}
            </div>

            <div className="final-question-actions">
              <button
                onClick={() => toggle(question.id)}
                className="icon-button-secondary"
                aria-label={data.favorites.includes(question.id) ? 'Remove saved question' : 'Save question'}
                title={data.favorites.includes(question.id) ? 'Remove saved question' : 'Save question'}
              >
                <Star className={`size-4 ${data.favorites.includes(question.id) ? 'fill-current text-[var(--ui-accent)]' : ''}`} />
              </button>

              <button onClick={() => onPractice(question.id)} className="btn-secondary">
                Practice <ChevronRight className="size-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length > pageSize && <nav className="studio-pagination" aria-label="Question pages"><button className="btn-secondary" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Previous</button><span aria-live="polite">Page {page + 1} of {Math.ceil(filtered.length / pageSize)}</span><button className="btn-secondary" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage(value => value + 1)}>Next</button></nav>}
      {!filtered.length && (
        <div className="final-bank-empty">No questions match that search.</div>
      )}
    </Shell>
  )
}

function AssessmentLab({ data, updateData }: { data: Persisted; updateData: (fn: (p: Persisted) => Persisted) => void }) {
  const [tab, setTab] = useState<'simulation' | 'workstyle'>('simulation')
  const [session, setSession] = useState<ScenarioItem[]>([])
  const [workSession, setWorkSession] = useState<WorkStyleItem[]>([])
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [workChoices, setWorkChoices] = useState<Record<string, 'left' | 'right'>>({})
  const [scenarioChoices, setScenarioChoices] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const [scenarioMode, setScenarioMode] = useState<'practice' | 'exam'>('practice')
  const seenScenarioIds = useRef<string[]>([])
  const seenWorkStyleIds = useRef<string[]>([])

  const current = tab === 'simulation' ? session[index] : workSession[index]
  const selectedOption = tab === 'simulation' && current && 'options' in current
    ? current.options.find(option => option.id === choice)
    : null
  const average = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length * 3) * 100)
    : 0

  function startScenario(count: number, mode: 'practice' | 'exam') {
    let excluded = mode === 'practice' ? seenScenarioIds.current : []
    if (scenarioItems.length - new Set(excluded).size < count) excluded = []
    const nextSession = createScenarioMock(count, excluded)
    if (mode === 'practice') seenScenarioIds.current = [...excluded, ...nextSession.map(item => item.id)]

    setScenarioMode(mode)
    setTab('simulation')
    setSession(nextSession)
    setWorkSession([])
    setIndex(0)
    setChoice(null)
    setRevealed(false)
    setScores([])
    setScenarioChoices({})
    setFinished(false)
  }

  function startWork(count: number) {
    let excluded = seenWorkStyleIds.current
    if (workStyleItems.length - new Set(excluded).size < count) excluded = []
    const nextSession = createWorkStyleMock(count, excluded)
    seenWorkStyleIds.current = [...excluded, ...nextSession.map(item => item.id)]

    setTab('workstyle')
    setWorkSession(nextSession)
    setSession([])
    setIndex(0)
    setChoice(null)
    setRevealed(false)
    setWorkChoices({})
    setFinished(false)
  }

  function submitScenario() {
    if (!choice || revealed || !selectedOption) return
    setScenarioChoices(prev => ({ ...prev, [session[index].id]: choice }))
    setScores(prev => [...prev, selectedOption.score])

    if (scenarioMode === 'practice') {
      setRevealed(true)
      return
    }

    if (index + 1 >= session.length) {
      finishAssessment([...scores, selectedOption.score])
      return
    }

    setIndex(value => value + 1)
    setChoice(null)
    setRevealed(false)
  }

  function finishAssessment(finalScores: number[]) {
    const score = Math.round(finalScores.reduce((sum, value) => sum + value, 0) / (finalScores.length * 3) * 100)
    const sessionResult: SessionResult = { id: `assessment-${Date.now()}`, date: new Date().toISOString(), kind: scenarioMode === 'exam' ? 'customer-mock' : 'customer-practice', count: session.length, score, decisions: session.map(item => { const chosen = item.options.find(option => option.id === (item.id === session[index]?.id ? choice : scenarioChoices[item.id])); return { prompt: item.situation, answer: chosen?.text || '', reason: chosen?.rationale, better: chosen?.score !== 3 ? item.options.find(option => option.score === 3)?.text : undefined } }) }
    updateData(prev => ({ ...prev, sessions: [sessionResult, ...prev.sessions].slice(0, 100), mockResults: [score, ...prev.mockResults].slice(0, 30), lastPractice: new Date().toISOString(), streak: computeStreak(prev.lastPractice, prev.streak) }))
    setFinished(true)
  }

  function nextScenario() {
    if (index + 1 >= session.length) {
      finishAssessment(scores)
      return
    }

    setIndex(value => value + 1)
    setChoice(null)
    setRevealed(false)
  }

  function chooseWork(side: 'left' | 'right') {
    const item = workSession[index]
    if (!item) return

    setWorkChoices(prev => ({ ...prev, [item.id]: side }))

    if (index + 1 >= workSession.length) {
      const sessionResult: SessionResult = { id: `workstyle-${Date.now()}`, date: new Date().toISOString(), kind: 'workstyle', count: workSession.length, decisions: workSession.map(question => ({ prompt: 'Which statement better describes how you usually work?', answer: (question.id === item.id ? side : workChoices[question.id]) === 'left' ? question.left : question.right })) }
      updateData(prev => ({ ...prev, sessions: [sessionResult, ...prev.sessions].slice(0, 100), lastPractice: new Date().toISOString(), streak: computeStreak(prev.lastPractice, prev.streak) }))
      setFinished(true)
    } else {
      setIndex(value => value + 1)
    }
  }

  if (!current || finished) {
    return (
      <Shell eyebrow="Assessment" title="Assessments" subtitle="Choose a format, read carefully, and understand the reasoning behind each decision.">
        {finished && (
          <section className="evaluation-report evaluation-report-assessment final-assessment-result">
            <div className="report-header"><div><p className="report-kicker">Assessment complete</p><div className="report-score-line"><strong>{tab === 'simulation' ? average : Object.keys(workChoices).length}</strong><span>{tab === 'simulation' ? '/100' : `/${workSession.length}`}</span></div><p className="report-verdict">{tab === 'simulation' ? 'Use this as a coaching signal for customer judgment, not as an Amazon score prediction.' : 'You completed the work-style set. Work-style practice has no right-or-wrong personality score.'}</p></div><div className="report-meta"><span>{tab === 'simulation' ? `${session.length} situations` : `${workSession.length} choices`}</span><span>{tab === 'simulation' ? 'Original practice' : 'Answer authentically'}</span></div></div>
            <div className="report-next-step mt-5"><Target className="size-5 shrink-0" /><div><strong>Next step</strong><p>{tab === 'simulation' ? 'Review any weak decisions, then try another set without checking explanations until you commit.' : 'Use your answers consistently. Do not try to reverse-engineer a personality profile.'}</p></div></div>
          </section>
        )}

        {finished && tab === 'simulation' && <details className="card-surface p-5 mb-6"><summary className="cursor-pointer font-semibold">Review your {session.length} decisions</summary><div className="mt-4 divide-y divide-border">{session.map(item => { const chosen = item.options.find(option => option.id === scenarioChoices[item.id]); const best = item.options.find(option => option.score === 3); return <div key={item.id} className="py-4"><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-2 text-sm">Your choice: {chosen?.text || 'No choice recorded'}</p><p className="mt-2 text-xs text-muted-foreground">{chosen?.rationale}</p>{chosen?.score !== 3 && <p className="mt-3 text-sm"><strong>Stronger approach:</strong> {best?.text}</p>}</div> })}</div></details>}

        <div className="final-assessment-grid">
          <section className="final-assessment-entry final-assessment-customer">
            <span className="final-assessment-icon"><Headphones className="size-5" /></span>
            <h2>Customer situations</h2>
            <p>Choose the best response to realistic customer-service situations. These are original practice items inspired by the published job-simulation format.</p>
            <div className="final-assessment-actions">
              <button onClick={() => startScenario(12, 'practice')} className="btn-primary">
                Start 12 situations
              </button>
              <button onClick={() => startScenario(24, 'exam')} className="btn-secondary">
                24-item mock
              </button>
            </div>
          </section>

          <section className="final-assessment-entry final-assessment-work">
            <span className="final-assessment-icon"><Users className="size-5" /></span>
            <h2>Work style questions</h2>
            <p>Choose the statement that better describes how you normally work. The goal is to read carefully and answer authentically.</p>
            <div className="final-assessment-actions">
              <button onClick={() => startWork(10)} className="btn-primary">
                Start 10 choices
              </button>
              <button onClick={() => startWork(24)} className="btn-secondary">
                24-item mock
              </button>
            </div>
          </section>
        </div>

        <p className="final-assessment-note">
          Amazon publicly describes a Customer Service Job Simulation and a Work Style Assessment. The questions here are original training material, not copied assessment items.
        </p>
      </Shell>
    )
  }

  if (tab === 'simulation' && 'options' in current) {
    return (
      <Shell title={scenarioMode === 'exam' ? 'Customer-situation mock' : 'Customer-situation practice'} subtitle="Choose a response before continuing.">
        <div className="final-assessment-active">
          <div className="final-assessment-progress">
            <span>Situation {index + 1} of {session.length}</span>
            <span>{Math.round(scores.length / session.length * 100)}% complete</span>
          </div>

          <h2>{current.situation}</h2>

          <div className="final-assessment-options">
            {current.options.map(option => (
              <button
                key={option.id}
                disabled={revealed}
                aria-pressed={choice === option.id}
                onClick={() => setChoice(option.id)}
                className={`assessment-choice ${choice === option.id ? 'assessment-choice-selected' : ''} ${revealed && choice === option.id ? (option.score >= 2 ? 'assessment-choice-good' : 'assessment-choice-bad') : ''}`}
              >
                <span className="choice-key">{option.id.toUpperCase()}</span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>

          {revealed && selectedOption && (
            <div className="final-assessment-explanation">
              <strong>
                {selectedOption.score === 3
                  ? 'Strongest response'
                  : selectedOption.score === 2
                    ? 'Reasonable, but incomplete'
                    : selectedOption.score === 1
                      ? 'Weak response'
                      : 'High-risk response'}
              </strong>
              <p>{selectedOption.rationale}</p>
            </div>
          )}

          <div className="final-assessment-submit">
            {!revealed ? (
              <button disabled={!choice} onClick={submitScenario} className="btn-primary">
                {scenarioMode === 'practice'
                  ? 'Check answer'
                  : index + 1 >= session.length
                    ? 'Finish set'
                    : 'Submit answer'}
              </button>
            ) : (
              <button onClick={nextScenario} className="btn-primary">
                {index + 1 >= session.length ? 'Finish session' : 'Next situation'}
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </Shell>
    )
  }

  const work = current as WorkStyleItem
  return (
    <Shell title="Work-style practice" subtitle="Choose the statement that best describes you. Each choice moves to the next question.">
      <div className="final-assessment-active">
        <div className="final-assessment-progress">
          <span>Question {index + 1} of {workSession.length}</span>
          <span>{Object.keys(workChoices).length} answered</span>
        </div>

        <h2>Which statement better describes how you usually work?</h2>

        <div className="final-workstyle-options">
          <button onClick={() => chooseWork('left')} className="workstyle-choice">
            <span className="choice-key">A</span>
            <span>{work.left}</span>
          </button>
          <button onClick={() => chooseWork('right')} className="workstyle-choice">
            <span className="choice-key">B</span>
            <span>{work.right}</span>
          </button>
        </div>
      </div>
    </Shell>
  )
}

function InterviewLab({
  visible,
  data,
  updateData,
  setNotice,
}: {
  visible: boolean
  data: Persisted
  updateData: (fn: (p: Persisted) => Persisted) => void
  setNotice: (s: string) => void
}) {
  const [completion, setCompletion] = useState<{ count: number; average: number } | null>(null)
  const [mode, setMode] = useState<'single' | 'mock'>('single')
  const [active, setActive] = useState(false)
  const [set, setSet] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const recentInterviewIds = useRef<string[]>([])
  useDraftWarning(active && Boolean(answer.trim()) && !evaluation)

  useEffect(() => {
    if (!visible || !active || evaluation || loading) return
    const id = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [visible, active, evaluation, index, loading])

  function begin(chosen: 'single' | 'mock') {
    let excluded = recentInterviewIds.current
    const minimumNeeded = chosen === 'single' ? 1 : 3
    if (questions.length - excluded.length < minimumNeeded) excluded = []

    const nextSet = chosen === 'single'
      ? getRandomQuestions(1, { excludeIds: excluded })
      : createBalancedInterviewMock(excluded)

    recentInterviewIds.current = [...excluded, ...nextSet.map(question => question.id)].slice(-48)
    setCompletion(null)
    setMode(chosen)
    setSet(nextSet)
    setIndex(0)
    setAnswer('')
    setEvaluation(null)
    setScores([])
    setSeconds(0)
    setActive(true)
  }

  async function submit() {
    if (loading || evaluation) return
    const question = set[index]
    if (!question || answer.trim().length < 20) {
      setNotice('Give a complete interview answer before submitting.')
      return
    }

    setLoading(true)
    let result = evaluateAnswer(question, answer)

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 22000)
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: question.prompt,
          answer,
          rubric: question.rubric,
          mode: question.type,
        }),
      })
      window.clearTimeout(timeout)
      const payload = await res.json().catch(() => ({}))
      if (res.ok && payload.evaluation) {
        result = {
          ...result,
          isFallback: false,
          overall: Math.round(payload.evaluation.score),
          summary: payload.evaluation.verdict,
          aiFeedback: payload.evaluation,
        }
      } else {
        setNotice(payload.error || 'AI coaching was unavailable; the local answer check was used.')
      }
    } catch {
      setNotice('AI coaching was unavailable; the local answer check was used.')
    } finally {
      setLoading(false)
    }

    setEvaluation(result)
    setScores(prev => { const nextScores = [...prev]; nextScores[index] = result.overall; return nextScores })

    const item: HistoryItem = {
      id: `${question.id}-${Date.now()}`,
      questionId: question.id,
      question: question.prompt,
      score: result.overall,
      category: question.category,
      date: new Date().toISOString(),
      answer,
      evaluation: result,
    }

    updateData(prev => ({
      ...prev,
      history: [item, ...prev.history].slice(0, 150),
      completed: prev.completed.includes(question.id)
        ? prev.completed
        : [...prev.completed, question.id],
      lastPractice: new Date().toISOString(),
      streak: computeStreak(prev.lastPractice, prev.streak),
    }))
  }

  function next() {
    if (index + 1 >= set.length) {
      if (mode === 'mock') {
        const finalScores = scores.length
          ? scores
          : evaluation
            ? [evaluation.overall]
            : []
        const average = finalScores.length
          ? Math.round(finalScores.reduce((a, b) => a + b, 0) / finalScores.length)
          : 0
        updateData(prev => ({
          ...prev,
          mockResults: [average, ...prev.mockResults].slice(0, 30),
          sessions: [{ id: `interview-${Date.now()}`, date: new Date().toISOString(), kind: 'interview' as const, count: set.length, score: average }, ...prev.sessions].slice(0, 100),
        }))
        setNotice(`Mock interview complete: ${average}/100 average.`)
      } else {
        setNotice('Interview question complete.')
      }

      setCompletion({ count: set.length, average: Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length)) })
      setActive(false)
      return
    }

    setIndex(value => value + 1)
    setAnswer('')
    setEvaluation(null)
    setSeconds(0)
  }

  if (!active) {
    return (
      <Shell eyebrow="Interview" title="Interview practice" subtitle="Practice a single answer or run a short mock. Clear, truthful examples matter more than memorized scripts.">

        {completion && <section className="session-completion" role="status"><Check className="size-5" /><div><h2>{completion.count === 1 ? 'Practice complete' : 'Mock interview complete'}</h2><p>{completion.count} {completion.count === 1 ? 'answer' : 'answers'} reviewed · {completion.average}/100 {completion.count === 1 ? 'score' : 'average'}. Your feedback is saved in Your activity.</p></div></section>}
        <div className="final-interview-grid">
          <button onClick={() => begin('single')} className="final-interview-card final-interview-practice">
            <span className="final-interview-icon"><Mic className="size-5" /></span>
            <h2>Practice a question</h2>
            <p>Answer one realistic interview question at a time and get focused feedback.</p>
            <span>Start practice <ChevronRight className="size-4" /></span>
          </button>

          <button onClick={() => begin('mock')} className="final-interview-card final-interview-mock">
            <span className="final-interview-icon"><Users className="size-5" /></span>
            <h2>Take a mock interview</h2>
            <p>Three mixed questions for a short, realistic communication-focused practice session.</p>
            <span>Start 3-question mock <ChevronRight className="size-4" /></span>
          </button>
        </div>

        <div className="final-interview-note">
          <strong>How to answer:</strong> answer the exact question, use simple natural English, give a real example when needed, and finish clearly. You do not need a special framework for every answer.
        </div>
      </Shell>
    )
  }

  const question = set[index]
  return (
    <Shell title={mode === 'mock' ? 'Mock interview' : 'Interview answer'} subtitle={mode === 'mock' ? 'Three questions. Review each answer, then finish the mock.' : 'Answer in your own words and review the feedback.'}>
      <QuestionWorkspace
        question={question}
        answer={answer}
        setAnswer={value => { setAnswer(value); setEvaluation(null) }}
        evaluation={evaluation}
        loading={loading}
        submit={submit}
        next={next}
        seconds={seconds}
        progress={`${index + 1}/${set.length}`}
        nextLabel={index + 1 === set.length ? mode === 'mock' ? 'Finish mock' : 'Finish practice' : 'Next question'}
      />
    </Shell>
  )
}

function SpeakingCoach({ visible, initialSession, data, updateData, setNotice }: { visible: boolean; initialSession?: { id: string; seconds: number } | null; data: Persisted; updateData: (fn: (p: Persisted) => Persisted) => void; setNotice: (s: string) => void }) {
  const prompts = speakingTopics
  const [prompt, setPrompt] = useState(() => initialSession ? speakingTopics.find(topic => topic.id === initialSession.id)! : pickSpeakingTopic())
  const [targetSeconds, setTargetSeconds] = useState(initialSession?.seconds || 120)
  const [timeUp, setTimeUp] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [words, setWords] = useState<TranscriptWord[]>([])
  const [duration, setDuration] = useState(0)
  const [transcribing, setTranscribing] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<SpeakingEval | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)
  useDraftWarning(Boolean(transcript.trim()) && !evaluation)
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; if (recorderRef.current) { recorderRef.current.onstop = null; if (recorderRef.current.state !== 'inactive') recorderRef.current.stop() } streamRef.current?.getTracks().forEach(track => track.stop()) } }, [])

  useEffect(() => {
    if (!visible && recorderRef.current?.state === 'recording') stopRecording()
  }, [visible])
  useEffect(() => {
    if (initialSession) { newPrompt(speakingTopics.find(topic => topic.id === initialSession.id)!); setTargetSeconds(initialSession.seconds) }
  }, [initialSession])

  useEffect(() => {
    if (!recording) return
    const tick = () => {
      const remaining = remainingSpeakingSeconds(startedRef.current, Date.now(), targetSeconds)
      setElapsed(targetSeconds - remaining)
      if (remaining === 0) {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
        setRecording(false); setTimeUp(true)
      }
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [recording, targetSeconds])
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }, [audioUrl])

  const metrics = { ...getSpeakingMetrics(transcript, duration || elapsed, words), wordsPerMinute: duration || elapsed ? getSpeakingMetrics(transcript, duration || elapsed, words).wordsPerMinute : 0 }
  const paceState = metrics.wordsPerMinute === 0 ? '—' : metrics.wordsPerMinute < 105 ? 'slow' : metrics.wordsPerMinute > 175 ? 'fast' : 'good'

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current) { stream.getTracks().forEach(track => track.stop()); return }
      setTimeUp(false); setEvaluation(null); setTranscript(''); setWords([]); setDuration(0); setElapsed(0)
      streamRef.current = stream
      const preferred = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''
      const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = event => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || preferred || 'audio/webm' })
        const url = URL.createObjectURL(blob); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(url)
        const measured = Math.max(1, (Date.now() - startedRef.current) / 1000); setDuration(measured)
        await transcribe(blob)
      }
      recorderRef.current = recorder; startedRef.current = Date.now(); recorder.start(500); setRecording(true)
    } catch { streamRef.current?.getTracks().forEach(track => track.stop()); setNotice('Microphone permission was blocked or no microphone is available. You can still paste a transcript below.') }
  }

  function stopRecording() { if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop(); setRecording(false) }

  async function transcribe(blob: Blob) {
    setTranscribing(true)
    try {
      const form = new FormData(); form.append('audio', blob, blob.type.includes('mp4') ? 'speaking.m4a' : blob.type.includes('ogg') ? 'speaking.ogg' : 'speaking.webm'); form.append('language', language)
      const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 30000)
      const res = await fetch('/api/transcribe', { method: 'POST', body: form, signal: controller.signal }); window.clearTimeout(timeout)
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Transcription failed.')
      setTranscript(payload.text || ''); setWords(payload.words || []); if (payload.duration) setDuration(payload.duration)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not transcribe. You can paste/edit the transcript manually.') } finally { setTranscribing(false) }
  }

  async function analyze() {
    if (evaluating || transcribing || recording || evaluation) return
    if (transcript.trim().length < 15) return setNotice('Record or enter a longer speaking sample first.')
    if (duration < 1 || duration > 900) return setNotice('Enter the speaking duration, between 1 and 900 seconds, for your pasted transcript.')
    setEvaluating(true)
    try {
      const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 18000)
      const res = await fetch('/api/speaking-evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ prompt: prompt.prompt, transcript, duration: Math.max(1, duration || elapsed), wpm: metrics.wordsPerMinute, fillers: metrics.fillerWords, longPauses: metrics.longPauses, language, pauseMetricsAvailable: words.length > 0 }) }); window.clearTimeout(timeout)
      const payload = await res.json().catch(() => ({})); if (!res.ok) throw new Error(payload.error || 'Speaking analysis failed.')
      setEvaluation(payload.evaluation)
      const result: SpeakingResult = { transcript, evaluation: payload.evaluation, pauseMetricsAvailable: words.length > 0, id: `speak-${Date.now()}`, prompt: prompt.prompt, date: new Date().toISOString(), duration: Math.max(1, duration || elapsed), wpm: metrics.wordsPerMinute, fillers: metrics.fillerWords, longPauses: metrics.longPauses, score: payload.evaluation.overall }
      updateData(prev => ({ ...prev, speakingResults: [result, ...prev.speakingResults].slice(0, 50), lastPractice: new Date().toISOString(), streak: computeStreak(prev.lastPractice, prev.streak) }))
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Speaking analysis failed.') } finally { setEvaluating(false) }
  }

  function newPrompt(next = pickSpeakingTopic(prompt.id)) { setPrompt(next); setTimeUp(false); setTranscript(''); setWords([]); setDuration(0); setElapsed(0); setEvaluation(null); if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null) } }

  return <Shell title="Speaking practice" subtitle="Think of a few points. Record, listen back, then choose one thing to improve." action={<button onClick={() => newPrompt()} disabled={recording || transcribing || evaluating} className="btn-secondary"><RefreshCcw className="size-4" /> Random topic</button>}>
    <div className="topic-controls">
      <label>Topic<select aria-label="Speaking topic" value={prompt.id} disabled={recording || transcribing || evaluating} onChange={e => newPrompt(prompts.find(item => item.id === e.target.value)!)}>{prompts.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <label>Time limit<select aria-label="Speaking time limit" value={targetSeconds} disabled={recording || transcribing || evaluating} onChange={e => { setTargetSeconds(Number(e.target.value)); setElapsed(0); setTimeUp(false) }}><option value={60}>1 minute</option><option value={120}>2 minutes</option><option value={180}>3 minutes</option></select></label>
    </div>
    <div className="speaking-layout">
    <div className="speaking-workspace p-6 sm:p-8"><p className="session-privacy">Recording is transcribed by Groq. Actual interview timing varies.</p>
        <div className="flex flex-wrap items-center justify-between gap-3"><select aria-label="Recording language" value={language} disabled={recording || transcribing || evaluating} onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as 'en' | 'hi')} className="rounded-md border border-[#E5E5E5] bg-white px-3 py-1 text-xs font-bold text-[var(--ui-accent)]"><option value="en">English</option><option value="hi">Hindi</option></select><span className="topic-timer" role="timer" aria-label="Time remaining">{Math.floor(Math.max(0, targetSeconds - elapsed) / 60)}:{String(Math.max(0, targetSeconds - elapsed) % 60).padStart(2, '0')}<small>remaining</small></span></div>
        <h2 className="final-speaking-prompt">{prompt.prompt}</h2><details className="topic-tip"><summary>Show speaking tips</summary><p>{prompt.hint}</p></details><details className="topic-tip"><summary>Topic source</summary><p>{prompt.basis}. These are rewritten practice prompts, not guaranteed interview questions. Auto-captions can contain errors.</p><a href={prompt.source.url} target="_blank" rel="noreferrer" className="underline">{prompt.source.label}</a></details>{timeUp && <p className="topic-finished" role="status">Time is up. Your recording has stopped.</p>}
        <div className="mt-7 flex flex-wrap items-center gap-3">{!recording ? <button onClick={startRecording} disabled={transcribing || evaluating} className="btn-rose"><Mic className="size-4" /> Start recording</button> : <button onClick={stopRecording} className="btn-stop"><CircleStop className="size-4" /> Stop recording</button>}{audioUrl && <audio controls src={audioUrl} className="h-10 max-w-full" />}{transcribing && <span className="text-sm font-semibold text-[var(--ui-accent)]">Transcribing with Whisper…</span>}</div>
        <label className="mt-7 block text-sm font-semibold">Transcript <span className="font-normal text-muted-foreground">(editable)</span></label><textarea aria-label="Speaking transcript" maxLength={12000} disabled={recording || transcribing || evaluating} value={transcript} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => { setTranscript(e.target.value); setWords([]); setEvaluation(null) }} placeholder="Your recording transcript will appear here. You can also paste a transcript manually." className="mt-2 min-h-52 w-full rounded-lg border border-[#E5E5E5] bg-white p-4 text-base leading-7 outline-none focus:ring-2 focus:ring-[var(--recording)]/30" />
        {!audioUrl && transcript.trim() && <label className="manual-duration">Speaking duration for pasted text (seconds)<input aria-label="Pasted transcript duration" type="number" min="1" max="900" disabled={evaluating || transcribing} value={duration || ''} onChange={e => { setDuration(Number(e.target.value)); setEvaluation(null) }} /><small>Use the time you actually spoke. Pace is unavailable without it.</small></label>}
        <button onClick={analyze} disabled={Boolean(evaluation) || evaluating || transcribing || recording || transcript.trim().length < 15 || duration < 1 || duration > 900} className="btn-rose mt-5"><Brain className="size-4" /> {evaluating ? 'Analyzing speech…' : evaluation ? 'Speaking reviewed' : 'Analyze speaking'}</button>
      </div>

      <details className="speaking-details"><summary>Delivery details</summary><div className="card-surface p-6"><div className="flex items-center gap-2"><Gauge className="size-5 text-[var(--accent-primary)]" /><h3 className="font-semibold">Delivery metrics</h3></div><div className="mt-5 grid grid-cols-2 gap-3"><SpeechMetric label="Words" value={metrics.words || '—'} /><SpeechMetric label="Pace" value={metrics.wordsPerMinute ? `${metrics.wordsPerMinute} wpm` : '—'} note={paceState === 'good' ? 'Good range' : paceState === 'slow' ? 'May feel slow' : paceState === 'fast' ? 'May feel rushed' : ''} /><SpeechMetric label="Fillers" value={metrics.fillerWords} note={metrics.words ? `${metrics.fillerRate}% of words` : ''} /><SpeechMetric label="Long pauses" value={words.length ? metrics.longPauses : '—'} note={!words.length ? 'Unavailable without timestamps' : metrics.longestPause ? `Longest ${metrics.longestPause}s` : 'From word timestamps'} /></div><p className="mt-4 text-xs leading-5 text-muted-foreground">Pause metrics are available when the audio transcription returns word timestamps. Edited/manual transcripts cannot recreate real pauses.</p></div><div className="speaking-guidance p-5 text-sm leading-6 text-muted-foreground"><Volume2 className="size-5 text-[var(--accent-primary)]" /><p className="mt-3"><strong className="text-[var(--accent-primary)]">Useful target:</strong> roughly 120–160 WPM is often comfortable for clear interview speech, but clarity matters more than chasing one number.</p></div></details>
    </div>

    {evaluation && <SpeakingReview key={evaluation.overall + evaluation.conciseFeedback} evaluation={evaluation} metrics={metrics} />}
  </Shell>
}

function SpeechMetric({ label, value, note }: any) { return <div className="rounded-lg bg-muted p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p>{note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}</div> }

function SpeakingReview({ evaluation, metrics }: { evaluation: SpeakingEval; metrics: ReturnType<typeof getSpeakingMetrics> }) {
  const [open, setOpen] = useState(true)
  const trigger = useRef<HTMLButtonElement>(null)
  return <><div className="review-ready"><div><strong>{evaluation.overall}/100</strong><span>Your speaking review is ready.</span></div><button ref={trigger} className="btn-primary" onClick={() => setOpen(true)}>View speaking review</button></div><ReviewDialog returnFocus={trigger} open={open} onClose={() => setOpen(false)} title="Speaking review"><SpeakingEvaluation evaluation={evaluation} metrics={metrics} /></ReviewDialog></>
}

function SpeakingEvaluation({ evaluation, metrics }: { evaluation: SpeakingEval; metrics: ReturnType<typeof getSpeakingMetrics> }) {
  const dims = [['Fluency', evaluation.fluency], ['Grammar', evaluation.grammar], ['Vocabulary', evaluation.vocabulary], ['Structure', evaluation.structure], ['Relevance', evaluation.relevance]] as const
  const paceIsSlow = metrics.wordsPerMinute > 0 && metrics.wordsPerMinute < 90
  const paceIsFast = metrics.wordsPerMinute > 180
  const paceNote = paceIsSlow ? 'Slow pace' : paceIsFast ? 'Fast pace' : 'Steady pace'
  const strengths = evaluation.strengths.filter(item => !(paceIsSlow || paceIsFast) || !/pace|speaking rate/i.test(item))
  const improvements = [...evaluation.improvements]
  if (paceIsSlow && !improvements.some(item => /pace|speaking rate|speed/i.test(item))) improvements.unshift('Build toward a more natural speaking pace while staying clear.')
  if (paceIsFast && !improvements.some(item => /pace|speaking rate|speed/i.test(item))) improvements.unshift('Slow down slightly so each idea is easy to follow.')
  return <section className="evaluation-report evaluation-report-speaking mt-6">
    <div className="report-header"><div><p className="report-kicker">Speaking report</p><div className="report-score-line"><strong>{evaluation.overall}</strong><span>/100</span></div><p className="report-verdict">{evaluation.conciseFeedback}</p></div><div className="report-meta"><span>{metrics.wordsPerMinute} WPM</span><span>{metrics.fillerWords} fillers</span><span>{paceNote}</span></div></div>
    <details className="feedback-disclosure"><summary>Scores by criterion</summary><div className="report-metrics-grid">{dims.map(([label, score]) => <ReportMetric key={label} label={label} value={score} />)}</div></details>
    <div className="report-coaching-grid mt-6"><div className="report-coaching-panel report-positive"><FeedbackList title="What worked" items={strengths} /></div><div className="report-coaching-panel report-improve"><FeedbackList title="Improve next" items={improvements} /></div></div>
    {evaluation.grammarFixes.length > 0 && <div className="report-section mt-6"><div className="report-section-heading"><div><h3>Wording corrections</h3><p>Small edits that make the answer cleaner and easier to follow.</p></div></div><div className="report-corrections">{evaluation.grammarFixes.map((fix, i) => <div key={i} className="report-correction"><div><span>Original</span><p className="report-correction-old">{fix.original}</p></div><ChevronRight className="size-4 shrink-0" /><div><span>Better</span><p className="report-correction-new">{fix.better}</p><small>{fix.reason}</small></div></div>)}</div></div>}
    <details className="report-expandable mt-6"><summary><span>A stronger spoken version</span><ChevronRight className="size-4" /></summary><p>{evaluation.improvedVersion}</p></details>
    <div className="report-next-step mt-5"><Target className="size-5 shrink-0" /><div><strong>Next drill</strong><p>{evaluation.nextDrill}</p></div></div>
  </section>
}

function Progress({ data, readiness, average, competencyStats, reset, go }: any) {
  const speaking = data.speakingResults.slice(0, 10)
  const recentAnswers = data.history.slice(0, 10)
  if (!data.history.length && !data.speakingResults.length && !data.mockResults.length && !data.sessions.length) return <Shell title="Your activity" subtitle="See what you have practised and where to focus next."><div className="activity-empty"><BarChart3 className="size-9" /><h2>Your first session starts here.</h2><p>Complete a speaking drill or written answer to build your practice history.</p><button className="btn-primary" onClick={() => go('Speaking Coach')}>Start speaking <ChevronRight className="size-4" /></button></div></Shell>

  return (
    <Shell title="Your activity" subtitle="Review completed sessions and the skills you have practised."
      action={
        <button onClick={reset} className="btn-danger">
          <RotateCcw className="size-4" /> Reset local data
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Gauge} label="Scored answers" value={data.history.length + data.speakingResults.length} note="Written and speaking" className="metric-indigo" />
        <MetricCard icon={BarChart3} label="Average" value={data.history.length ? `${average}/100` : '—'} note={`${data.history.length} answers`} className="metric-cyan" />
        <MetricCard icon={Mic} label="Speaking reviews" value={data.speakingResults.length} note="Speaking sessions" className="metric-rose" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h2 className="font-semibold">Skill breakdown</h2>
          <div className="mt-4 space-y-3">
            {competencyStats.length
              ? competencyStats.map((item: any) => (
                  <div key={item.key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{getCompetencyLabel(item.key)}</span>
                      <strong>{item.score}</strong>
                    </div>
                    <ProgressBar value={item.score} />
                  </div>
                ))
              : <p className="text-sm text-muted-foreground">Complete scored answers to build this view.</p>}
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="font-semibold">Recent answers</h2>
          <div className="mt-3 divide-y divide-border">
            {recentAnswers.length
              ? recentAnswers.map((item: HistoryItem) => (
                  <details key={item.id} className="saved-answer py-3"><summary>
                    <div className="flex gap-4">
                      <p className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold">{item.question}</p>
                      <strong>{item.score}</strong>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()} · View saved answer and feedback</p></summary><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{item.answer}</p><SavedReview title="Saved answer review"><EvaluationCard showActions={false} evaluation={item.evaluation} question={questions.find(q => q.id === item.questionId) || questions[0]} answer={item.answer} onNext={() => go('Practice')} nextLabel="Practise a new answer" /></SavedReview></details>
                ))
              : <p className="py-6 text-sm text-muted-foreground">No scored answers yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-4">
          <h2 className="font-semibold">Recent speaking</h2>
          <div className="mt-3 divide-y divide-border">
            {speaking.length
              ? speaking.map((result: SpeakingResult) => (
                  <details key={result.id} className="saved-answer py-2"><summary>
                    <div className="flex justify-between gap-4">
                      <p className="line-clamp-1 text-sm font-semibold">{result.prompt}</p>
                      <strong>{result.score}</strong>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.wpm} WPM · {result.fillers} fillers · {result.pauseMetricsAvailable ? `${result.longPauses} long pauses` : 'Pauses unavailable'}
                    </p></summary>{result.transcript && <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{result.transcript}</p>}{result.evaluation && <SavedReview title="Saved speaking review"><SpeakingEvaluation evaluation={result.evaluation} metrics={getSpeakingMetrics(result.transcript || '', result.duration)} /></SavedReview>}
                  </details>
                ))
              : <p className="py-6 text-sm text-muted-foreground">No speaking reviews yet.</p>}
          </div>
        </div>

        <div className="card-surface p-4">
          <h2 className="font-semibold">Completed sets</h2>
          <div className="mt-3 divide-y divide-border">{data.sessions.slice(0, 12).map((item: SessionResult) => <details key={item.id} className="saved-answer py-3 text-sm"><summary><strong>{{ 'customer-practice': 'Customer practice', 'customer-mock': 'Customer mock', workstyle: 'Work-style set', interview: 'Interview mock' }[item.kind]}</strong><p className="mt-1 text-muted-foreground">{item.count} {item.kind === 'workstyle' ? 'choices' : 'questions'} · {new Date(item.date).toLocaleDateString()}{item.score !== undefined && ` · ${item.score}/100`}</p></summary>{item.decisions && <div className="mt-4 divide-y divide-border">{item.decisions.map((decision, index) => <div key={index} className="py-3 text-sm leading-6"><h3 className="font-semibold">{index + 1}. {decision.prompt}</h3><p className="mt-2">Your choice: {decision.answer}</p>{decision.reason && <p className="mt-2 text-muted-foreground">{decision.reason}</p>}{decision.better && <p className="mt-2"><strong>Stronger approach:</strong> {decision.better}</p>}</div>)}</div>}</details>)}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.sessions.length ? null : data.mockResults.length
              ? data.mockResults.slice(0, 12).map((score: number, index: number) => (
                  <span key={index} className="inline-flex items-center rounded-md bg-surface px-2 py-1 text-sm font-semibold text-[var(--ui-accent)]">
                    {score}/100
                  </span>
                ))
              : <p className="text-sm text-muted-foreground">Complete an assessment set or interview mock to build this history.</p>}
          </div>
        </div>
      </div>
    </Shell>
  )
}

function StudyPlan({ data, competencyStats, go, startFirstSession }: any) {
  const weak = competencyStats[0]
  const days: { title: string; task: string; view: View; action?: () => void }[] = [
    { title: 'Your first speaking session', task: 'Speak about your daily routine for one minute. Review one correction and record a second attempt.', view: 'Speaking Coach', action: startFirstSession },
    { title: 'Introduction and real examples', task: 'Practise your introduction and a truthful example of solving a problem or handling pressure.', view: 'Interview' },
    { title: 'Customer judgment', task: 'Complete a 12-situation practice set. Read the reasoning after each decision.', view: 'Assessment' },
    { title: 'A longer speaking answer', task: 'Choose a familiar sourced topic and speak for two or three minutes. Compare your clarity and structure.', view: 'Speaking Coach' },
    { title: 'Improve one weak area', task: weak ? `Review your feedback on ${getCompetencyLabel(weak.key)} and practise a fresh written answer.` : 'Review your earlier feedback and practise a fresh written answer with one improvement.', view: 'Practice' },
    { title: 'Assessment mock', task: 'Try a 24-item customer-situation mock. Review your decisions after finishing the set.', view: 'Assessment' },
    { title: 'Interview mock and review', task: 'Run the three-question interview mock, then revisit the answer that needs the most work.', view: 'Interview' },
  ]
  return <Shell eyebrow="7-day adaptive plan" title="7-day study plan" subtitle="One focus each day. Repeat a session whenever you need more practice.">
    <div className="grid gap-4 xl:grid-cols-2">
      {days.map((day, i) => (
        <div key={day.title} className="plan-card">
          <div className="flex items-start gap-4">
            <span className="plan-day">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day {i + 1}</p>
              <h3 className="mt-1 text-base font-semibold">{day.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{day.task}</p>
              <div className="mt-3">
                <button onClick={() => day.action ? day.action() : go(day.view)} className="inline-flex items-center gap-2 text-sm font-semibold">Open drill <ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="readiness-definition mt-6 rounded-lg border border-[#E5E5E5] bg-white p-6 text-muted-foreground"><h3 className="font-semibold text-foreground">What “ready” should mean here</h3><div className="mt-4 grid gap-4 md:grid-cols-3"><p className="text-sm leading-6"><strong className="text-[var(--accent-primary)]">Judgment:</strong> you can explain safe, customer-focused decisions without guessing policy.</p><p className="text-sm leading-6"><strong className="text-[var(--accent-primary)]">Evidence:</strong> you have 4–6 truthful stories with clear actions and results.</p><p className="text-sm leading-6"><strong className="text-[var(--accent-primary)]">Delivery:</strong> you can speak naturally for 60–120 seconds with manageable fillers and clear grammar.</p></div></div>
  </Shell>
}

function SettingsPanel({ data, reset, restore }: { data: Persisted; reset: () => void; restore: (data: Persisted) => void }) {
  const [backupMessage, setBackupMessage] = useState('')
  function exportBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'csa-prep-v4', data }, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = `csa-progress-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setBackupMessage('Backup export requested. Check your browser’s downloads.')
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error('Backup is too large.')
      const parsed = JSON.parse(await file.text())
      if (parsed.format !== 'csa-prep-v4') throw new Error('Choose a CSA Prep progress backup.')
      const restored = validateProgress(parsed.data)
      if (window.confirm('Replace this browser’s progress with this backup? Export your current progress first if you want to keep it.')) { restore(restored); setBackupMessage('Backup restored.') }
    } catch (error) { setBackupMessage(error instanceof Error ? error.message : 'Could not import backup.') }
    finally { event.target.value = '' }
  }
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [detail, setDetail] = useState('')
  async function test() {
    setStatus('testing'); setDetail('')
    const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 22000)
    try { const res = await fetch('/api/evaluate', { method: 'GET', signal: controller.signal, cache: 'no-store' }); const payload = await res.json().catch(() => ({})); setStatus(res.ok && payload.configured ? 'ok' : 'error'); setDetail(res.ok && payload.configured ? `AI is configured with ${payload.provider || 'Groq'} · ${payload.model || 'default model'}.` : payload.error || 'GROQ_API_KEY is not configured on the server.') } catch (error) { setStatus('error'); setDetail(error instanceof Error && error.name === 'AbortError' ? 'Connection test timed out.' : 'Could not reach the server route.') } finally { window.clearTimeout(timeout) }
  }
  return <Shell eyebrow="Settings" title="Settings" subtitle="Manage AI access and the practice history saved on this device.">
    <div className="max-w-3xl space-y-5"><div className="card-surface p-6"><div className="flex gap-4"><ShieldCheck className="mt-1 size-5 text-[var(--success)]" /><div><h2 className="font-semibold">Local-first progress</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Scores, answers, favorites and speaking-report summaries are stored in this browser. Stopping a recording automatically sends its audio to the server and Groq for transcription; they are not stored in localStorage by this app.</p></div></div></div>
      <div className="card-surface p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">Groq AI + Whisper</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Groq provides answer feedback and transcribes your recordings.</p></div><span className={`pill ${status === 'ok' ? 'status-success' : status === 'error' ? 'status-error' : status === 'testing' ? 'status-warning' : ''}`}>{status === 'ok' ? 'Configured' : status === 'error' ? 'Unavailable' : status === 'testing' ? 'Testing…' : 'Not tested'}</span></div>{detail && <p className={`mt-4 rounded-lg border p-3 text-sm bg-white ${status === 'error' ? 'border-[var(--error-border)] text-[var(--error)]' : 'border-[var(--success-border)] text-[var(--success)]'}`}>{detail}</p>}<button onClick={test} disabled={status === 'testing'} className="btn-secondary mt-5"><Activity className="size-4" /> Check AI configuration</button></div>
      <div className="card-surface p-6"><h2 className="font-semibold">Stored locally</h2><p className="mt-2 text-sm text-muted-foreground">{data.history.length} answer records · {data.speakingResults.length} speaking reports · {data.favorites.length} saved prompts</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={exportBackup} className="btn-secondary">Export backup</button><label className="btn-secondary cursor-pointer">Import backup<input aria-label="Import progress backup" type="file" accept=".json,application/json" className="sr-only" onChange={importBackup} /></label></div>{backupMessage && <p role="status" className="mt-3 text-sm">{backupMessage}</p>}<button onClick={reset} className="btn-danger mt-5"><RotateCcw className="size-4" /> Reset all progress</button></div>
    </div>
  </Shell>
}

function computeStreak(prevLast: string | null, prevStreak: number) {
  const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (!prevLast) return 1
  const diffDays = Math.round((dayKey(new Date()) - dayKey(new Date(prevLast))) / 86400000)
  if (diffDays === 0) return prevStreak || 1
  if (diffDays === 1) return (prevStreak || 0) + 1
  return 1
}

/** Validate saved records before they enter render or scoring paths. */
function validateProgress(input: unknown): Persisted {
  if (!input || typeof input !== 'object') throw new Error('Invalid progress data.')
  const value = input as Record<string, unknown>
  const strings = (key: string) => Array.isArray(value[key]) ? (value[key] as unknown[]).filter((item): item is string => typeof item === 'string').slice(0, 10000) : []
  const score = (x: unknown) => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100
  const history = Array.isArray(value.history) ? value.history.filter((item: any) => item && typeof item.id === 'string' && typeof item.questionId === 'string' && typeof item.question === 'string' && typeof item.answer === 'string' && typeof item.date === 'string' && Number.isFinite(Date.parse(item.date)) && score(item.score) && item.category in CATEGORY_LABELS && item.evaluation && typeof item.evaluation === 'object' && item.evaluation.scores && typeof item.evaluation.scores === 'object' && ['strengths', 'weaknesses', 'missingElements', 'suggestions', 'modelStructure'].every(key => Array.isArray(item.evaluation[key]) && item.evaluation[key].every((x: unknown) => typeof x === 'string'))).slice(0, 150) as HistoryItem[] : []
  history.forEach(item => { if (item.evaluation.aiFeedback) { const parsed = answerFeedbackSchema.safeParse(item.evaluation.aiFeedback); item.evaluation.aiFeedback = parsed.success ? parsed.data : undefined } })
  const speakingResults = Array.isArray(value.speakingResults) ? value.speakingResults.filter((item: any) => item && typeof item.id === 'string' && typeof item.prompt === 'string' && typeof item.date === 'string' && Number.isFinite(Date.parse(item.date)) && score(item.score) && ['duration', 'wpm', 'fillers', 'longPauses'].every(key => typeof item[key] === 'number' && Number.isFinite(item[key]) && item[key] >= 0)).slice(0, 50) as SpeakingResult[] : []
  speakingResults.forEach(item => { if (item.evaluation) { const parsed = speakingFeedbackSchema.safeParse(item.evaluation); item.evaluation = parsed.success ? parsed.data : undefined }; if (typeof item.transcript !== 'string') item.transcript = undefined })
  const sessions = Array.isArray(value.sessions) ? value.sessions.filter((item: any) => item && typeof item.id === 'string' && Number.isFinite(Date.parse(item.date)) && ['customer-practice', 'customer-mock', 'workstyle', 'interview'].includes(item.kind) && Number.isInteger(item.count) && item.count > 0 && item.count <= 40 && (item.score === undefined || score(item.score))).slice(0, 100) as SessionResult[] : []
  sessions.forEach(item => { item.decisions = Array.isArray(item.decisions) ? item.decisions.filter(decision => decision && typeof decision.prompt === 'string' && typeof decision.answer === 'string' && (decision.reason === undefined || typeof decision.reason === 'string') && (decision.better === undefined || typeof decision.better === 'string')).slice(0, 40) : undefined })
  return { sessions, history, speakingResults, completed: strings('completed'), favorites: strings('favorites'), mockResults: Array.isArray(value.mockResults) ? value.mockResults.filter(score).slice(0, 30) as number[] : [], streak: typeof value.streak === 'number' && Number.isInteger(value.streak) && value.streak >= 0 ? value.streak : 0, lastPractice: typeof value.lastPractice === 'string' && Number.isFinite(Date.parse(value.lastPractice)) ? value.lastPractice : null }
}
