import type { Question } from './questions'

export type CompetencyScores = {
  relevance: number
  structure: number
  clarity: number
  customerFocus: number
  ownership: number
  empathy: number
  problemSolving: number
  judgment: number
  communication: number
  completeness: number
  star?: { situation: number; task: number; action: number; result: number }
}

export type AiFeedback = {
  score: number
  verdict: string
  rubricAnalysis: { criterion: string; score: number; evidence: string; missing: string; fix: string }[]
  wordingFixes: { original: string; better: string; reason: string }[]
  strengths: string[]
  contentGaps: string[]
  improvedAnswer: string
  followUp?: string
}

export type Evaluation = {
  overall: number
  scores: CompetencyScores
  strengths: string[]
  weaknesses: string[]
  missingElements: string[]
  suggestions: string[]
  summary: string
  modelStructure: string[]
  star?: { situation: number; task: number; action: number; result: number }
  isFallback?: boolean
  aiFeedback?: AiFeedback
}

export type TranscriptWord = { word?: string; start?: number; end?: number }

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))
const has = (text: string, patterns: RegExp[]) => patterns.some(pattern => pattern.test(text))
const count = (text: string, patterns: RegExp[]) => patterns.filter(pattern => pattern.test(text)).length

export function evaluateAnswer(question: Question, answer: string): Evaluation {
  const text = answer.trim()
  const lower = text.toLowerCase()
  const words = text ? text.split(/\s+/).length : 0
  const sentences = text.split(/[.!?]+/).filter(Boolean).length
  const action = has(lower, [/\bi (?:called|asked|created|checked|reviewed|offered|explained|resolved|organized|followed|escalated|measured|built|changed|decided|listened|verified|documented|prioritized)\b/])
  const result = has(lower, [/\d+%?|reduced|increased|improved|saved|resolved|result|outcome|because of this|as a result|learned|customer (?:accepted|understood|received)/])
  const empathy = has(lower, [/understand|frustrat|sorry|apolog|listen|impact|concern|experience|important|acknowledge/])
  const customer = has(lower, [/customer|client|user|their needs|customer's|customer’s/])
  const ownership = has(lower, [/i took|i owned|my responsibility|i made sure|i followed up|i drove|i decided|i personally|i would verify|i would check/])
  const problemSolving = has(lower, [/root cause|investigat|triage|option|solution|step|priorit|evidence|data|policy|verify|check/])
  const judgment = has(lower, [/policy|escalat|appropriate|authority|trade-off|risk|verify|confirm|security|privacy/])
  const star = question.type === 'workstyle' ? {
    situation: clamp(42 + (has(lower, [/when|while|during|at my|in my|there was|we had/]) ? 34 : 0) + (words > 70 ? 8 : 0)),
    task: clamp(38 + (has(lower, [/needed to|was asked to|goal|responsible|task|objective/]) ? 42 : 0)),
    action: clamp(34 + (action ? 46 : 0) + (has(lower, [/first|then|after|next|so that|because/]) ? 15 : 0)),
    result: clamp(32 + (result ? 52 : 0) + (has(lower, [/learned|would do differently|next time/]) ? 10 : 0)),
  } : undefined

  const structure = question.category === 'extempore'
    ? clamp(42 + (sentences >= 4 ? 22 : 0) + (has(lower, [/first|second|another|however|finally|overall|in conclusion|to conclude/]) ? 22 : 0) + (words >= 80 ? 10 : 0))
    : star ? Math.round((star.situation + star.task + star.action + star.result) / 4)
      : clamp(45 + (sentences >= 4 ? 20 : 0) + (action ? 20 : 0) + (result ? 15 : 0))

  const scores: CompetencyScores = {
    relevance: clamp(45 + (words >= 40 ? 20 : words >= 20 ? 10 : 0) + (count(lower, question.rubric.map(item => new RegExp(item.split(' ')[0].replace(/[^a-z]/gi, ''), 'i'))) * 5)),
    structure,
    clarity: clamp(42 + (sentences >= 3 ? 18 : 0) + (sentences <= 14 ? 15 : -10) + (words >= 45 && words <= 280 ? 15 : 0)),
    customerFocus: clamp(35 + (customer ? 24 : 0) + (empathy ? 20 : 0) + (has(lower, [/follow up|close the loop|prevent|long term|expectation/]) ? 20 : 0)),
    ownership: clamp(35 + (ownership ? 35 : 0) + (action ? 15 : 0) + (result ? 15 : 0)),
    empathy: clamp(35 + (empathy ? 45 : 0) + (customer ? 15 : 0)),
    problemSolving: clamp(35 + (problemSolving ? 35 : 0) + (action ? 15 : 0) + (result ? 15 : 0)),
    judgment: clamp(35 + (judgment ? 40 : 0) + (has(lower, [/why|because|considered|balance|if|depending/]) ? 20 : 0)),
    communication: clamp(45 + (sentences >= 3 ? 18 : 0) + (words >= 40 ? 18 : 0) + (words > 330 ? -15 : 0)),
    completeness: clamp(30 + (action ? 24 : 0) + (result ? 24 : 0) + (customer || question.type === 'workstyle' || question.category === 'extempore' ? 20 : 0)),
    star,
  }

  const weights: Record<string, number> = question.category === 'extempore'
    ? { relevance: 1.4, structure: 1.5, clarity: 1.5, customerFocus: 0.3, ownership: 0.3, empathy: 0.3, problemSolving: 0.5, judgment: 0.7, communication: 1.6, completeness: 1.1 }
    : question.category === 'customer-service'
      ? { relevance: 1, structure: 0.8, clarity: 1, customerFocus: 1.5, ownership: 1.2, empathy: 1.4, problemSolving: 1.2, judgment: 1.2, communication: 1, completeness: 1.1 }
      : question.category === 'behavioral'
        ? { relevance: 1, structure: 1.4, clarity: 1, customerFocus: 0.6, ownership: 1.5, empathy: 0.8, problemSolving: 1, judgment: 1, communication: 1, completeness: 1.3 }
        : { relevance: 1.1, structure: 1, clarity: 1, customerFocus: 1, ownership: 1.2, empathy: 0.8, problemSolving: 1.1, judgment: 1.3, completeness: 1, communication: 1 }

  const numericEntries = Object.entries(scores).filter(([, value]) => typeof value === 'number') as [string, number][]
  const weightedSum = numericEntries.reduce((sum, [key, value]) => sum + value * (weights[key] ?? 1), 0)
  const weightTotal = numericEntries.reduce((sum, [key]) => sum + (weights[key] ?? 1), 0)
  const overall = clamp(weightedSum / weightTotal)

  const strengths: string[] = []
  if (scores.clarity >= 70) strengths.push('Your answer is reasonably clear and easy to follow.')
  if (scores.empathy >= 70 && question.category === 'customer-service') strengths.push('You acknowledged the customer experience rather than treating the issue as only a process.')
  if (scores.ownership >= 70) strengths.push('Your personal ownership and next actions are visible.')
  if (scores.problemSolving >= 70) strengths.push('You described practical problem-solving steps.')
  if (scores.structure >= 70) strengths.push(question.category === 'extempore' ? 'Your ideas have a usable speaking structure.' : 'Your answer has a workable structure.')
  if (!strengths.length) strengths.push('You gave enough detail to identify a clear starting point for improvement.')

  const weaknesses: string[] = []
  const missingElements: string[] = []
  if (scores.ownership < 65 && question.category !== 'extempore') { weaknesses.push('Your personal ownership is not yet clear.'); missingElements.push('Name the decisions and actions you personally took or would take.') }
  if (scores.empathy < 65 && question.category === 'customer-service') { weaknesses.push('Customer impact gets less attention than process.'); missingElements.push('Acknowledge the customer’s emotion or practical impact before explaining policy.') }
  if (question.category !== 'extempore' && (scores.completeness < 65 || !result)) { weaknesses.push('The outcome is difficult to measure or verify.'); missingElements.push('End with a concrete result, customer outcome, or follow-up condition.') }
  if (star && star.action < 65) { weaknesses.push('The Action section needs more detail.'); missingElements.push('Use specific action verbs and explain your sequence of decisions.') }
  if (star && star.result < 65) { weaknesses.push('The Result section is underdeveloped.'); missingElements.push('Explain what changed and what you learned.') }
  if (question.category === 'extempore' && words < 70) { weaknesses.push('The response is too short to demonstrate sustained fluency.'); missingElements.push('Develop two distinct supporting points before closing.') }

  return {
    isFallback: true,
    overall,
    scores,
    strengths,
    weaknesses: weaknesses.length ? weaknesses : ['Keep sharpening the answer with more specific evidence and cleaner wording.'],
    missingElements: missingElements.length ? missingElements : ['Add one concrete detail that proves the impact or supports your point.'],
    suggestions: [...missingElements.slice(0, 3), 'Use truthful details and natural language rather than memorizing a model script.'],
    summary: overall >= 82 ? 'Strong response. Polish the weakest dimension and make the evidence even more specific.' : overall >= 68 ? 'Good foundation. One or two specific improvements could make this interview-ready.' : overall >= 52 ? 'Promising, but the response needs clearer structure, evidence, or customer impact.' : 'Rebuild this answer around the rubric before worrying about polished wording.',
    modelStructure: question.category === 'extempore'
      ? ['Open: answer the topic in one sentence.', 'Develop: give 2–3 distinct points with examples.', 'Connect: use simple transitions instead of filler.', 'Close: summarize your position cleanly.']
      : question.type === 'workstyle'
        ? ['What happened: give only the context needed to understand the situation.', 'What I did: make your own decisions and actions clear.', 'What happened afterward: explain the outcome and what you learned.']
        : ['Acknowledge and clarify the customer need.', 'Check the facts and avoid guessing policy or outcomes.', 'Explain the safest useful next step and set expectations.', 'Follow through clearly when another step is needed.'],
    star,
  }
}

export function getReadinessFromHistory(scores: number[]): number {
  if (!scores.length) return 0
  const recent = scores.slice(0, 20)
  const average = recent.reduce((sum, score) => sum + score, 0) / recent.length
  const experienceBonus = Math.min(8, recent.length * 0.4)
  return clamp(average * 0.92 + experienceBonus)
}

export function getSpeakingMetrics(text: string, durationSeconds: number, timestampWords: TranscriptWord[] = []) {
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
  const fillers = (text.match(/\b(um+|uh+|erm|hmm|like|basically|actually|you know|i mean|sort of|kind of)\b/gi) || [])
  const pauses: number[] = []
  const usable = timestampWords.filter(word => typeof word.start === 'number' && typeof word.end === 'number')
  for (let i = 1; i < usable.length; i += 1) {
    const gap = Number(usable[i].start) - Number(usable[i - 1].end)
    if (gap >= 1.2) pauses.push(gap)
  }
  const longPauses = pauses.filter(value => value >= 2).length
  const longestPause = pauses.length ? Math.max(...pauses) : 0
  const minutes = Math.max(durationSeconds / 60, 0.01)
  const wordsPerMinute = Math.round(words / minutes)
  const fillerRate = words ? Number(((fillers.length / words) * 100).toFixed(1)) : 0
  return { words, durationSeconds, wordsPerMinute, fillerWords: fillers.length, fillerRate, longPauses, longestPause: Number(longestPause.toFixed(1)), pauses }
}

export function getCompetencyLabel(key: keyof CompetencyScores | string): string {
  return String(key).replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase())
}
