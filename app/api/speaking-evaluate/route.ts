import { z } from 'zod'
import { hasUnsupportedQuantity, speakingFeedbackSchema as outputSchema } from '../../../lib/feedback-schema'

const inputSchema = z.object({
  prompt: z.string().trim().min(3).max(1200),
  transcript: z.string().trim().min(15).max(12000),
  duration: z.number().min(1).max(900),
  wpm: z.number().min(0).max(500),
  fillers: z.number().min(0).max(500),
  longPauses: z.number().min(0).max(500),
  language: z.enum(['en', 'hi']).default('en'),
  pauseMetricsAvailable: z.boolean().default(false),
})


export async function POST(request: Request) {
  const parsedInput = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsedInput.success) {
    return Response.json({ error: 'Speaking sample was incomplete.', details: parsedInput.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).slice(0, 5) }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 503 })

  const body = parsedInput.data
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18000)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      cache: 'no-store',
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_completion_tokens: 1900,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a practical interview speaking coach. The candidate language is ${body.language === 'hi' ? 'Hindi' : 'English'}. Evaluate only what is supported by the transcript and delivery metrics. Do not pretend to measure accent, pronunciation, confidence, volume, or tone from text.\n\nFluency can use WPM, transcript filler count, repetition and sentence flow. Use long-pause count only when explicitly marked available; unavailable does not mean zero pauses. Do not claim smooth delivery, no hesitation or no pauses from a pasted transcript. WPM is an average only, not evidence of consistent speed, rhythm or confidence. A pasted transcript cannot establish smooth delivery. Grammar fixes must quote an exact short excerpt from the transcript. Verify that the original is actually ungrammatical before proposing a correction. Independent finite verbs joined with AND are valid: "I spend the morning studying and take a break at noon" is grammatical; do not change TAKE to TAKING to force parallelism. Do not treat optional commas, transitions or varied sentence openings as errors in otherwise clear speech. Do not invent errors. Prefer natural professional language over fancy vocabulary. Simple, accurate everyday vocabulary is a strength; do not lower its score merely for being simple or request vivid adjectives or sensory detail unless the exact topic needs them. Do not invent weaknesses to fill the report. Every improvement must address a specific issue in the sample, not an optional embellishment. Preserve the candidate facts in the improved version; do not add feelings, experiences or claims they did not state. Scores are practice estimates, never employer scores or hiring predictions. Structure and relevance must be specific to the exact prompt.\n\nReturn ONLY JSON with: overall, fluency, grammar, vocabulary, structure, relevance (1-100 integers), conciseFeedback, strengths, improvements, grammarFixes [{original,better,reason}], improvedVersion, nextDrill. 70 means usable with gaps; 80 means strong; 90+ should be rare.`,
          },
          {
            role: 'user',
            content: `PROMPT:\n${body.prompt}\n\nDELIVERY METRICS:\nDuration ${body.duration.toFixed(1)} sec\nWPM ${body.wpm}\nFillers ${body.fillers}\nLong pauses ${body.pauseMetricsAvailable ? body.longPauses : 'unavailable (no usable word timestamps)'}\n\nTRANSCRIPT:\n${body.transcript}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return Response.json({ error: `Speaking coach failed (${response.status}): ${detail.slice(0, 240)}` }, { status: response.status === 429 ? 429 : 503 })
    }

    const payload = await response.json()
    const raw = payload?.choices?.[0]?.message?.content?.trim()
    if (!raw) return Response.json({ error: 'Speaking coach returned no content.' }, { status: 502 })

    let json: unknown
    try { json = JSON.parse(raw) }
    catch { return Response.json({ error: 'Speaking coach returned malformed JSON. Please retry.' }, { status: 502 }) }

    const parsedOutput = outputSchema.safeParse(json)
    if (!parsedOutput.success) {
      console.error('[speaking-evaluate] output mismatch', parsedOutput.error.issues, json)
      return Response.json({ error: 'Speaking coach returned an incomplete report. Please retry; your recording is valid.' }, { status: 502 })
    }

    const evaluation = parsedOutput.data
    if (hasUnsupportedQuantity(body.transcript, evaluation.improvedVersion)) evaluation.improvedVersion = body.transcript
    evaluation.grammarFixes = evaluation.grammarFixes.filter(fix => fix.original.trim() && body.transcript.includes(fix.original))
    return Response.json({ evaluation, model })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return Response.json({ error: 'Speaking analysis timed out. Please retry.' }, { status: 504 })
    console.error('[speaking-evaluate]', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Speaking feedback is unavailable.' }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
