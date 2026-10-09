const ts = require('typescript')
const fs = require('node:fs')
const assert = require('node:assert/strict')
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename)
const { questions, createBalancedInterviewMock } = require('../lib/question-bank.ts')
const { scenarioItems, workStyleItems, createScenarioMock } = require('../lib/assessment.ts')
const { getReadinessFromHistory, getSpeakingMetrics } = require('../lib/evaluation.ts')
for (const [name, items] of Object.entries({ questions, scenarioItems, workStyleItems })) {
  assert.equal(new Set(items.map(item => item.id)).size, items.length, `${name}: duplicate IDs`)
}
for (const q of questions) {
  assert(q.prompt.trim().length > 15, q.id)
  assert(q.rubric.length >= 3 && q.hint && q.followUp, q.id)
  assert(['easy', 'medium', 'hard'].includes(q.difficulty), q.id)
}
for (const item of scenarioItems) {
  assert.equal(item.options.length, 4, item.id)
  assert.equal(item.options.filter(option => option.score === 3).length, 1, item.id)
  assert(item.options.every(option => option.rationale && option.text), item.id)
}
for (let index = 0; index < 100; index++) {
  const mock = createBalancedInterviewMock(questions.map(q => q.id))
  assert.equal(mock.length, 3)
  assert.equal(new Set(mock.map(q => q.id)).size, 3)
  assert(mock.some(q => q.category === 'customer-service' || q.category === 'behavioral'))
}
const positions = new Set()
for (let index = 0; index < 40; index++) {
  for (const item of createScenarioMock(scenarioItems.length)) {
    assert.equal(new Set(item.options.map(option => option.id)).size, 4)
    positions.add(item.options.findIndex(option => option.score === 3))
  }
}
assert.equal(positions.size, 4, 'Correct answers should not stay in one position')
assert.equal(getReadinessFromHistory([]), 0)
assert.equal(getSpeakingMetrics('one two three four', 60).wordsPerMinute, 4)
console.log(JSON.stringify({ questions: questions.length, scenarios: scenarioItems.length, workStyle: workStyleItems.length, status: 'Content, mock coverage and option-shuffle checks passed.' }, null, 2))

;(async () => {
  const originalKey = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY
  try {
    const route = require('../app/api/evaluate/route.ts')
    const bad = await route.POST(new Request('http://localhost/api/evaluate', { method: 'POST', body: '{invalid' }))
    assert.equal(bad.status, 400)
    const missingKey = await route.POST(new Request('http://localhost/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: questions[0].prompt, answer: 'This is a complete enough answer for input validation.', rubric: questions[0].rubric, mode: questions[0].type }) }))
    assert.equal(missingKey.status, 503)
    console.log('API invalid-input and missing-key checks passed.')
  } finally { if (originalKey !== undefined) process.env.GROQ_API_KEY = originalKey }
})().catch(error => { console.error(error); process.exitCode = 1 })
