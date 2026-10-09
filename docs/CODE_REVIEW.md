# Code review and upgrade notes

## How the application works

`app/page.tsx` mounts a single client application in `components/csa-prep-app.tsx`. The nine views share browser progress through the existing v4 storage key. Practice and interview workspaces take `Question` records from `lib/question-bank.ts`; assessment uses independent scenario-choice and work-style-pair records. Speaking uses MediaRecorder, a transcription endpoint, then a separate coaching endpoint.

`lib/evaluation.ts` supplies a synchronous keyword/structure checklist. The answer endpoint can overlay a Groq score, rubric evidence and wording feedback. Numeric competency dimensions still come from the local checklist, even when the overall score is AI-generated. They should not be interpreted as independent validated skill measurements.

All AI credentials stay server-side. Progress and answers are local to the browser origin; optional coaching and transcription send material to Groq. This is not an entirely offline app.

## Findings addressed

| Finding in uploaded source | Change |
| --- | --- |
| Shell accepted headings but dropped them | Rendered page titles, descriptions and section labels |
| Extra questions, HR prompts and assessment banks were disconnected | Connected those banks and added 40 original guided prompts |
| Mock composition depended on core ID number ranges | Selects by category, with fresh-question preference and exhausted-pool fallback |
| Assessment rotation assumed a fixed 24-item pool | Uses actual pool sizes |
| Correct scenario answer was consistently first | Shuffles options and assigns display letters after shuffling |
| Assessment results disappeared without useful review | Saves session scores and offers choice-by-choice explanations |
| Startup could write empty data before loading saved progress | Added hydration gate and record validation |
| No portable progress backup | Added versioned JSON export/import with replacement confirmation |
| Speaking microphone could survive navigation | Stops recorder and stream tracks on unmount and releases late permission results |
| Non-WebM recordings always used a WebM filename | Picks an extension for MP4/OGG recordings |
| Speaking privacy copy contradicted automatic upload | Explicitly states stopping a recording starts transcription upload |
| AI report inserted local criticisms when AI reported no gaps | Preserves the AI finding instead of inventing missing elements |
| Empty history started at 18% readiness | Uses zero baseline and an unscored dashboard display |
| AI route contained an unclosed system-message object | Fixed the syntax error |
| Production ignored TypeScript failures | Removed ignoreBuildErrors |
| Question bank rendered all large guidance cards together | Added filters, 12-item pages, metadata and expandable guidance |

## Current content

136 guided questions, 40 customer judgment situations, 40 work-style pairs. The 40 new guided prompts include payments, return pickup failures, delivery investigations, subscription billing, accessibility, internal case notes, truthful behavioral examples, shift availability and natural speaking topics. They include difficulty, rubric, hint and follow-up. Existing question IDs are retained.

## Validation

Production build and TypeScript checks pass. Automated content checks verify unique IDs, required guidance, scenario answer validity, mock coverage after all questions have been seen and randomized answer positions. Missing-key and invalid-input API behavior is checked without making a paid provider request.

## Remaining limits

- The local evaluator cannot establish semantic relevance, factual correctness, real pronunciation or hiring success. Its report now states this explicitly.
- The readiness number is a weighted recent answer-score indicator; it is not a calibrated estimate of hiring success or a complete assessment of every training lane.
- AI rubric feedback is only as dependable as the configured model. No live Groq call was validated because a key was not supplied for this upgraded project.
- Work-style prompts encourage authentic reflection; there is no scientifically validated personality scoring model here.
- The main client file remains large. A later refactor can split views and shared persistence hooks without changing their behavior.
- API endpoints do not implement user authentication or a shared rate limiter. A broadly accessible deployment needs an explicit usage-control decision before inviting many users with one provider key.
- Historical backup and old Vercel ownership metadata are excluded from the new repository. Deployment requires its own environment variables.
- Browser progress does not migrate across domains automatically; use the backup controls.
