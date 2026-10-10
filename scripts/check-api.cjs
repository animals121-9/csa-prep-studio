const ts = require('typescript')
const fs = require('node:fs')
const assert = require('node:assert/strict')
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename)
const answer = require('../app/api/evaluate/route.ts')
const speech = require('../app/api/speaking-evaluate/route.ts')
const audio = require('../app/api/transcribe/route.ts')
const originalFetch = global.fetch
const originalKey = process.env.GROQ_API_KEY
const request = (path, data) => new Request('http://localhost'+path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
const input = {question:'Describe your daily routine.', answer:'I study in the morning and walk in the evening.', rubric:['Answer the topic clearly'], mode:'extempore'}
const spoken = {prompt:input.question, transcript:input.answer, duration:25, wpm:24, fillers:0, longPauses:0, language:'en', pauseMetricsAvailable:false}
const answerReport = {score:80,verdict:'Clear and relevant answer.',rubricAnalysis:[{criterion:input.rubric[0],score:80}],wordingFixes:[{original:'Not present in the answer',better:'Something else',reason:'Invented quote'}],strengths:[],contentGaps:[],improvedAnswer:input.answer}
const speechReport = {overall:80,fluency:80,grammar:80,vocabulary:80,structure:80,relevance:80,conciseFeedback:'Clear and relevant answer.',strengths:[],improvements:[],grammarFixes:[{original:'Not in the transcript',better:'Something else',reason:'Invented quote'}],improvedVersion:input.answer,nextDrill:'Repeat with one more relevant detail.'}
;(async()=>{
  process.env.GROQ_API_KEY='test-fixture-key'
  let cases=0
  const stub = (status, body) => { global.fetch=async()=>new Response(JSON.stringify(body),{status}) }
  for(const [status,expected] of [[401,503],[429,429]]){stub(status,{error:{message:'Fixture provider error'}});assert.equal((await answer.POST(request('/api/evaluate',input))).status,expected);cases++}
  stub(200,{choices:[{message:{content:'not json'}}]});assert.equal((await answer.POST(request('/api/evaluate',input))).status,502);cases++
  stub(200,{choices:[{message:{content:'{}'}}]});assert.equal((await speech.POST(request('/api/speaking-evaluate',spoken))).status,502);cases++
  for(const duration of [0,901]){assert.equal((await speech.POST(request('/api/speaking-evaluate',{...spoken,duration}))).status,400);cases++}
  stub(200,{choices:[{message:{content:JSON.stringify(answerReport)}}]});const report=await (await answer.POST(request('/api/evaluate',input))).json();assert.deepEqual(report.evaluation.wordingFixes,[]);cases++
  stub(200,{choices:[{message:{content:JSON.stringify(speechReport)}}]});const speakingReport=await (await speech.POST(request('/api/speaking-evaluate',spoken))).json();assert.deepEqual(speakingReport.evaluation.grammarFixes,[]);cases++
  stub(200,{choices:[{message:{content:JSON.stringify({...answerReport,improvedAnswer:input.answer+' This saved three hours.'})}}]});const inventedAnswer=await (await answer.POST(request('/api/evaluate',input))).json();assert.equal(inventedAnswer.evaluation.improvedAnswer,input.answer);cases++
  stub(200,{choices:[{message:{content:JSON.stringify({...speechReport,improvedVersion:input.answer+' This saved 20% of my time.'})}}]});const inventedSpeech=await (await speech.POST(request('/api/speaking-evaluate',spoken))).json();assert.equal(inventedSpeech.evaluation.improvedVersion,input.answer);cases++
  const {hasUnsupportedQuantity}=require('../lib/feedback-schema.ts');assert.equal(hasUnsupportedQuantity('We finished a day early.', 'We finished one day early.'),false);assert.equal(hasUnsupportedQuantity('I saved 3 hours.', 'I saved three hours.'),false);cases++
  global.fetch=async()=>{const error=new Error('Fixture timeout');error.name='AbortError';throw error};assert.equal((await speech.POST(request('/api/speaking-evaluate',spoken))).status,504);cases++
  const missingAudio=new FormData();assert.equal((await audio.POST(new Request('http://localhost/api/transcribe',{method:'POST',body:missingAudio}))).status,400);cases++
  console.log(`${cases} API failure, boundary and evidence regression checks passed.`)
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{global.fetch=originalFetch;if(originalKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=originalKey})
