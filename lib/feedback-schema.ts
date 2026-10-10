import { z } from 'zod'

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

export const answerFeedbackSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  verdict: z.string().min(3).max(320),
  rubricAnalysis: z.array(rubricItemSchema).min(1).max(12),
  wordingFixes: z.array(wordingFixSchema).max(8).default([]),
  strengths: z.array(z.string().max(420)).max(5).default([]),
  contentGaps: z.array(z.string().max(420)).max(6).default([]),
  improvedAnswer: z.string().min(20).max(4200),
  followUp: z.string().max(500).default(''),
})


export const speakingFeedbackSchema = z.object({
  overall: z.coerce.number().int().min(1).max(100),
  fluency: z.coerce.number().int().min(1).max(100),
  grammar: z.coerce.number().int().min(1).max(100),
  vocabulary: z.coerce.number().int().min(1).max(100),
  structure: z.coerce.number().int().min(1).max(100),
  relevance: z.coerce.number().int().min(1).max(100),
  conciseFeedback: z.string().min(5).max(700),
  strengths: z.array(z.string().max(320)).max(5).default([]),
  improvements: z.array(z.string().max(320)).max(6).default([]),
  grammarFixes: z.array(z.object({ original: z.string().max(280), better: z.string().max(380), reason: z.string().max(360) })).max(8).default([]),
  improvedVersion: z.string().min(20).max(3200),
  nextDrill: z.string().min(5).max(400),
})

