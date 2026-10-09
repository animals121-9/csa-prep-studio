import { questions as coreQuestions, type Question } from './questions'
import { extraQuestions } from './extra-questions'
import { hrQuestions } from './interview-bank'
import { expandedQuestions } from './expanded-questions'

export type { Question }
export const questions: Question[] = [...coreQuestions, ...extraQuestions, ...hrQuestions, ...expandedQuestions]

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

export function getRandomQuestions(
  count: number,
  filters?: {
    category?: Question['category']
    difficulty?: Question['difficulty']
    excludeIds?: string[]
  },
): Question[] {
  let filtered = questions

  if (filters?.category) {
    filtered = filtered.filter(question => question.category === filters.category)
  }

  if (filters?.difficulty) {
    filtered = filtered.filter(question => question.difficulty === filters.difficulty)
  }

  if (filters?.excludeIds?.length) {
    const excluded = new Set(filters.excludeIds)
    filtered = filtered.filter(question => !excluded.has(question.id))
  }

  return shuffle(filtered).slice(0, Math.min(count, filtered.length))
}

/** One role/communication, one judgment/story, and one spontaneous topic. */
export function createBalancedInterviewMock(excludeIds: string[] = []): Question[] {
  const selected: Question[] = []
  const groups = [
    (q: Question) => q.id.startsWith('hr-') || q.category === 'amazon-style',
    (q: Question) => q.category === 'behavioral' || q.category === 'customer-service',
    (q: Question) => q.category === 'extempore' && !q.id.startsWith('hr-'),
  ]
  for (const matches of groups) {
    const pool = questions.filter(q => matches(q) && !selected.some(item => item.id === q.id))
    const fresh = pool.filter(q => !excludeIds.includes(q.id))
    const question = shuffle(fresh.length ? fresh : pool)[0]
    if (question) selected.push(question)
  }
  return shuffle(selected)
}
