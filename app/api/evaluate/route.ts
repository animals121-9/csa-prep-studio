import { z } from 'zod'

const inputSchema = z.object({
  question: z.string().trim().min(5).max(2500),
  answer: z.string().trim().min(20).max(12000),
  rubric: z.array(z.string().trim().min(2).max(300)).min(1).max(12),
  mode: z.enum(['workstyle', 'scenario', 'extempore']),
})

const rubricItemSchema = z.object({
  criterion: z.string().min(2).max(300),
  score: z.coerce.number().min(0).max(100),
  evidence: z.string().max(420).default(''),
  missing: z.string().max(420).default(''),
  fix: z.string().max(520).default(''),
})

const wordingFixSchema = z.object({
  original: z.string().max(320),
  better: z.string().max(420),
  reason: z.string().max(420),
})

const outputSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  verdict: z.string().min(3).max(320),
  rubricAnalysis: z.array(rubricItemSchema).min(1).max(12),
  wordingFixes: z.array(wordingFixSchema).max(8).default([]),
  strengths: z.array(z.string().max(420)).max(5).default([]),
  contentGaps: z.array(z.string().max(420)).max(6).default([]),
  improvedAnswer: z.string().min(20).max(4200),
  followUp: z.string().max(500).default(''),
})

function compactError(detail: string) {
  try {
    const parsed = JSON.parse(detail)
    return String(parsed?.error?.message || parsed?.message || detail).replace(/\s+/g, ' ').slice(0, 300)
  } catch {
    return detail.replace(/\s+/g, ' ').slice(0, 300)
  }
}

export async function GET() {
  const configured = Boolean(process.env.GROQ_API_KEY)
  return Response.json({ configured, provider: 'Groq', model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b' }, { status: configured ? 200 : 503 })
}

export async function POST(request: Request) {
  const parsedInput = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsedInput.success) {
    return Response.json({
      error: 'The answer request was incomplete.',
      details: parsedInput.error.issues.map(issue => `${issue.path.join('.') || 'request'}: ${issue.message}`).slice(0, 5),
    }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: 'GROQ_API_KEY is not configured on the server.' }, { status: 503 })

  const body = parsedInput.data
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  const modeGuide = body.mode === 'extempore'
    ? 'This is a JAM/extempore answer. Focus on whether the speaker actually answers this exact topic, develops distinct points, uses examples, stays coherent, avoids repetition, and uses natural professional English.'
    : body.mode === 'workstyle'
      ? 'This is a behavioral/work-style answer. Focus on specific context, personal decisions/actions, ownership, judgment, measurable or observable result, and learning. Do not reward Leadership Principle buzzwords without evidence.'
      : 'This is a customer-service scenario. Focus on empathy, clarification, facts/policy, ownership, safe judgment, customer communication, practical resolution, expectation setting, and follow-through.'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 16000)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      cache: 'no-store',
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_completion_tokens: 2200,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a rigorous but fair Amazon Customer Service Associate preparation coach. ${modeGuide}

Evaluate ONLY the candidate's actual answer against the exact question and rubric.

Your goal is to judge whether this answer would demonstrate strong customer-service judgment in a real hiring assessment.

IMPORTANT SCORING RULES:
- Score 0-100.
- 70 = acceptable but has noticeable gaps.
- 80 = strong and mostly complete.
- 90-94 = excellent and assessment-ready.
- 95+ = exceptional; use sparingly.
- Do NOT penalize an answer merely because it is short.
- Judge completeness by substance, not word count or number of lines.
- A concise 3-5 line answer can score 90+ if it fully demonstrates the required judgment.
- Do NOT reward filler, repetition, over-explaining, excessive politeness, or artificially long answers.
- Only say more detail is needed when a genuinely important action, reason, safeguard, or resolution step is missing.
- Do not invent weaknesses just to provide criticism.
- Do not invent strengths either.
- Every criticism must be directly supported by the candidate's answer or by something important the answer omitted.

FOR CUSTOMER-SERVICE SCENARIOS:
Prioritize:
1. Understanding and acknowledging the customer's problem.
2. Clarifying or verifying relevant facts before acting.
3. Following policy and avoiding unsupported promises.
4. Taking ownership and choosing a practical next action.
5. Communicating the resolution clearly.
6. Setting realistic expectations.
7. Confirming the issue is resolved or explaining the next step.

Do NOT require all seven elements mechanically. Judge what is actually relevant to the specific scenario.

FOR WORK-STYLE / BEHAVIORAL ANSWERS:
Prioritize:
- specific context
- candidate's own decisions and actions
- ownership
- judgment
- observable result
- learning or reflection where relevant

Do not reward Leadership Principle buzzwords without evidence.

FOR EXTEMPORE / JAM ANSWERS:
Prioritize:
- directly answering the topic
- clear progression of ideas
- distinct supporting points
- relevant examples
- coherence
- natural professional English
- avoiding repetition

RUBRIC ANALYSIS:
- Give each supplied rubric criterion its own 0-100 score.
- Evidence must quote or accurately paraphrase something actually present in the answer.
- "missing" should contain only a meaningful omission.
- If nothing important is missing for a criterion, say "Nothing significant."
- "fix" should be a precise improvement, not generic advice.

WORDING FIXES:
- Only include genuine grammar, clarity, professionalism, tone, or phrasing issues.
- "original" must be an exact short excerpt from the candidate answer.
- If the wording is already good, return few or zero wording fixes.
- Never invent an error to fill the array.

CONTENT GAPS:
- Include only gaps that could materially affect assessment performance.
- Do not list optional embellishments as gaps.
- Keep this list short.

IMPROVED ANSWER:
- Preserve the candidate's meaning and facts.
- Do not invent metrics, policies, employers, experiences, achievements, or outcomes.
- Improve only what actually needs improvement.
- Keep the improved answer concise and realistic.
- Do NOT make it unnecessarily longer than the candidate's answer.
- If the original answer is already excellent, make only minimal refinements.

FOLLOW-UP:
- Ask one useful follow-up only if there is a meaningful unresolved weakness.
- If the answer is already complete, return an empty string.

Never claim a practice question is leaked, official, guaranteed, or identical to a real Amazon assessment.

Return ONLY JSON with this exact shape:
{
  "score": 0,
  "verdict": "specific one-sentence diagnosis",
  "rubricAnalysis": [
    {
      "criterion": "...",
      "score": 0,
      "evidence": "...",
      "missing": "...",
      "fix": "..."
    }
  ],
  "wordingFixes": [
    {
      "original": "exact excerpt",
      "better": "better wording",
      "reason": "why"
    }
  ],
  "strengths": ["specific strength"],
  "contentGaps": ["specific missing content"],
  "improvedAnswer": "...",
  "followUp": "..."
}`,
          },
          {
            role: 'user',
            content: `QUESTION:\n${body.question}\n\nRUBRIC:\n- ${body.rubric.join('\n- ')}\n\nCANDIDATE ANSWER:\n${body.answer}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      const message = compactError(detail)
      if (response.status === 401 || response.status === 403) return Response.json({ error: `Groq authentication failed: ${message}` }, { status: 503 })
      if (response.status === 429) return Response.json({ error: 'Groq rate limit reached. Your local rubric score is still available.' }, { status: 429 })
      return Response.json({ error: `Groq request failed (${response.status}): ${message}` }, { status: 503 })
    }

    const payload = await response.json()
    const raw = payload?.choices?.[0]?.message?.content?.trim()
    if (!raw) return Response.json({ error: 'Groq returned an empty evaluation.' }, { status: 502 })

    let json: unknown
    try { json = JSON.parse(raw) }
    catch { return Response.json({ error: 'Groq returned malformed JSON. Please retry this answer.' }, { status: 502 }) }

    const parsedOutput = outputSchema.safeParse(json)
    if (!parsedOutput.success) {
      console.error('[groq-evaluate] output schema mismatch', parsedOutput.error.issues, json)
      return Response.json({ error: 'Groq returned an incomplete coaching response. Please retry; your answer itself is valid.' }, { status: 502 })
    }

    const evaluation = parsedOutput.data
    const rubricOrder = new Map(body.rubric.map((criterion, index) => [criterion.toLowerCase(), index]))
    evaluation.rubricAnalysis.sort((a, b) => (rubricOrder.get(a.criterion.toLowerCase()) ?? 999) - (rubricOrder.get(b.criterion.toLowerCase()) ?? 999))

    return Response.json({ evaluation, model, provider: 'Groq' })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return Response.json({ error: 'Groq timed out. Local scoring is still available; retry AI coaching in a moment.' }, { status: 504 })
    console.error('[groq-evaluate]', error)
    return Response.json({ error: error instanceof Error ? error.message : 'AI coaching is temporarily unavailable.' }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
