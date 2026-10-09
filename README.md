# CSA Prep Studio

A local-first preparation workspace for Amazon Customer Service Associate applicants. Original practice content, not official, leaked or guaranteed assessment questions.

## What is included

- 136 guided prompts across customer service, truthful behavioral examples, HR/role communication and spontaneous speaking.
- 40 customer judgment situations with explanations and shuffled answer positions.
- 40 work-style pairs for authentic reflection; these are not scored as a personality test.
- Balanced three-question interview mocks selected by category rather than numeric ID ranges.
- Searchable question bank: category, difficulty, saved and unpracticed filters, compact expandable guidance and pagination.
- Light studio interface with navy navigation, visible page headings, useful empty states and mobile layouts.
- Local browser history and favorites, with JSON export/import backups.
- Optional Groq answer coaching and Whisper audio transcription.

## Run

Requires Node.js 20.9+ and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

For production:

```bash
pnpm build
pnpm start
```

Copy `.env.example` to `.env.local` and supply your own server-side key for AI features:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo
```

Never commit the real API key. Text practice still works with an explicitly approximate local checklist if AI is unavailable. Its scores do not verify relevance, factual correctness or hiring readiness.

## Privacy and progress

Progress is saved under the existing `csa-prep-progress-v4` key on the same browser origin. Export a backup in Settings before moving to another domain or browser, then import it there. Changing domains does not automatically transfer localStorage.

Stopping a microphone recording automatically uploads it through the server to Groq for transcription. Requesting AI review also sends the prompt and answer/transcript to Groq. Audio is kept in memory for playback; this app does not persist recordings in localStorage. Leaving the coach releases microphone tracks.

## Validate

```bash
pnpm exec tsc --noEmit
node scripts/check-content.cjs
pnpm build
```

Content checks cover unique IDs, required guidance, scenario option scores, exhausted-bank interview mocks and randomized correct-answer positions.

## Vercel

Import this repository as a Next.js project. Use `pnpm install --frozen-lockfile` and `pnpm build`, and configure the Groq variables in Vercel environment settings. Redeploy after changing environment variables. Existing hosting metadata and historical backup folders are intentionally excluded from this project.
