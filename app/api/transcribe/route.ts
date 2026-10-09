export const runtime = 'nodejs'

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 503 })

  try {
    const incoming = await request.formData()
    const audio = incoming.get('audio')
    const language = incoming.get('language') === 'hi' ? 'hi' : 'en'
    if (!(audio instanceof File)) return Response.json({ error: 'No audio recording received.' }, { status: 400 })
    if (audio.size > 24 * 1024 * 1024) return Response.json({ error: 'Recording is too large. Keep speaking sessions under about 10 minutes.' }, { status: 413 })

    const body = new FormData()
    body.append('file', audio, audio.name || 'speaking.webm')
    body.append('model', process.env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo')
    body.append('language', language)
    body.append('response_format', 'verbose_json')
    body.append('timestamp_granularities[]', 'word')
    body.append('timestamp_granularities[]', 'segment')
    body.append('temperature', '0')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    let response: Response
    try {
      response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body,
        signal: controller.signal,
        cache: 'no-store',
      })
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      const detail = await response.text()
      return Response.json({ error: `Transcription failed (${response.status}): ${detail.slice(0, 220)}` }, { status: response.status === 429 ? 429 : 503 })
    }

    const payload = await response.json()
    return Response.json({
      text: payload.text || '',
      duration: Number(payload.duration || 0),
      words: Array.isArray(payload.words) ? payload.words : [],
      segments: Array.isArray(payload.segments) ? payload.segments : [],
      model: process.env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo',
    })
  } catch (error) {
    console.error('[groq-transcribe]', error)
    return Response.json({ error: error instanceof Error ? error.message : 'Could not transcribe this recording.' }, { status: 503 })
  }
}
