import type { Question } from './questions'

export type InterviewFramework = {
  label: string
  steps: string[]
  guidance: string
}

function hr(
  id: string,
  title: string,
  prompt: string,
  rubric: string[],
  hint: string,
  followUp: string,
): Question {
  return {
    id,
    category: 'extempore',
    difficulty: 'easy',
    competency: 'communication',
    type: 'extempore',
    title,
    prompt,
    context:
      'HR / communication practice. The exact question can vary by location and hiring flow; answer truthfully and naturally.',
    rubric,
    hint,
    followUp,
    idealCharacteristics: rubric.slice(0, 5),
    commonMistakes: [
      'Giving a memorized answer that does not address the actual question',
      'Using generic adjectives without a concrete detail or example',
      'Speaking for too long before reaching the main point',
      'Claiming experience, availability, or skills that are not true',
    ],
  }
}

export const hrQuestions: Question[] = [
  hr(
    'hr-01',
    'Tell me about yourself',
    'Tell me about yourself in 60–90 seconds, focusing on the background, skills, or experiences that are most relevant to customer service.',
    [
      'Opens with a concise present-day introduction',
      'Selects relevant education or experience instead of narrating the entire CV',
      'Connects strengths to customer-facing work',
      'Uses at least one concrete detail instead of only adjectives',
      'Ends with a clear reason this role makes sense',
    ],
    'Use present → relevant past → strengths → role fit.',
    'Which experience best proves you can stay calm and clear with a frustrated customer?',
  ),

  hr(
    'hr-02',
    'Why customer service?',
    'Why do you want to work in customer service?',
    [
      'Gives a genuine reason rather than only saying a job is needed',
      'Shows that customer service involves problem solving as well as communication',
      'Connects personal strengths or experience to the work',
      'Acknowledges difficult interactions realistically',
      'Keeps the answer concise and role-focused',
    ],
    'Explain what part of customer service suits you, what evidence supports that, and what you want to contribute.',
    'What part of customer service do you expect to find most difficult?',
  ),

  hr(
    'hr-03',
    'Why Amazon?',
    'Why are you interested in a customer-service role at Amazon?',
    [
      'Shows basic understanding of a large customer-focused operation',
      'Explains why both the role and company are relevant',
      'Avoids empty praise about brand size alone',
      'Connects the answer to service, ownership, learning, or scale',
      'Does not invent company facts',
    ],
    'Use one role/company reason and one personal-fit reason.',
    'What would good customer service at a large company look like to you?',
  ),

  hr(
    'hr-04',
    'Understanding the CSA role',
    'What do you think a Customer Service Associate is responsible for?',
    [
      'Explains listening and understanding the customer issue',
      'Mentions accurate investigation and correct use of tools or policy',
      'Includes clear communication and expectation setting',
      'Recognizes documentation, escalation, or handoff when needed',
      'Balances customer outcome with process and security',
    ],
    'Think: understand → verify → resolve → explain → document / follow through.',
    'Which part of that workflow is easiest to get wrong under pressure?',
  ),

  hr(
    'hr-05',
    'Why should we hire you?',
    'Why should we hire you for this customer-service role?',
    [
      'Names two or three job-relevant strengths',
      'Supports at least one strength with evidence',
      'Connects those strengths to actual CSA responsibilities',
      'Avoids unsupported claims such as being perfect for the job',
      'Closes confidently without sounding entitled',
    ],
    'Choose strengths you can actually prove: communication, patience, learning speed, accuracy, ownership, or composure.',
    'Which of those strengths have you had to work hardest to develop?',
  ),

  hr(
    'hr-06',
    'Strongest relevant strength',
    'What is one strength that would help you perform well in customer service?',
    [
      'Chooses a role-relevant strength',
      'Explains what that strength looks like in behavior',
      'Provides a short real example',
      'Connects the example to customer impact',
      'Avoids listing unrelated strengths',
    ],
    'One strength + one example + one customer-service connection.',
    'When has that strength needed balancing?',
  ),

  hr(
    'hr-07',
    'Improvement area',
    'What is one professional skill you are currently trying to improve?',
    [
      'Chooses a genuine but manageable development area',
      'Explains what action is being taken',
      'Shows evidence of progress or feedback',
      'Avoids fake weaknesses disguised as strengths',
      'Shows responsibility for improvement',
    ],
    'Name the skill, why it matters, what you are doing, and what has improved.',
    'What feedback first made you realize you needed to improve it?',
  ),

  hr(
    'hr-08',
    'Rotational and night shifts',
    'How would you think about working rotational shifts, weekends, or nights if the role requires them?',
    [
      'Answers availability truthfully',
      'Shows understanding that customer operations may use varied schedules',
      'Explains real constraints clearly if they exist',
      'Avoids promising availability that is not possible',
      'Answers directly before adding explanation',
    ],
    'Give the truthful answer first. Mention constraints only if they actually exist.',
    'What routine would help you remain reliable on a changing schedule?',
  ),

  hr(
    'hr-09',
    'Repetitive work',
    'How do you stay accurate and engaged when work becomes repetitive?',
    [
      'Recognizes repetition realistically',
      'Explains a practical method for maintaining accuracy',
      'Mentions checks, goals, focus techniques, or learning from patterns',
      'Connects consistency to customer impact',
      'Avoids claiming never to become tired or bored',
    ],
    'Describe a real system: checks, short goals, careful notes, quality review, or pattern learning.',
    'How would you notice if repetition was starting to affect your quality?',
  ),

  hr(
    'hr-10',
    'High-volume pressure',
    'How do you maintain quality when the queue is busy and customers are waiting?',
    [
      'Prioritizes accuracy and customer impact instead of rushing blindly',
      'Explains how to keep communication concise',
      'Uses a clear prioritization or workflow method',
      'Recognizes when risk or capacity should be escalated',
      'Does not promise impossible speed',
    ],
    'Prioritize → verify high-risk actions → communicate clearly → document essentials.',
    'What would you do if a speed target started pushing you toward mistakes?',
  ),

  hr(
    'hr-11',
    'Learning a new tool',
    'How do you approach learning an unfamiliar system or process?',
    [
      'Explains a practical learning method',
      'Uses documentation, practice, questions, or feedback appropriately',
      'Tests understanding rather than assuming it',
      'Protects accuracy before independent use',
      'Provides a concrete example where possible',
    ],
    'Understand purpose → practice safely → ask focused questions → verify → work independently.',
    'How do you decide when you are ready to stop asking for help?',
  ),

  hr(
    'hr-12',
    'Working from feedback',
    'How do you react when a manager or quality reviewer gives you corrective feedback?',
    [
      'Receives feedback without immediate defensiveness',
      'Clarifies the expected behavior when necessary',
      'Applies feedback to later work',
      'Checks whether performance actually improved',
      'Can disagree respectfully when evidence supports it',
    ],
    'A real example works best: feedback → change → result.',
    'Tell me about feedback you initially disagreed with.',
  ),

  hr(
    'hr-13',
    'Career gap or transition',
    'If relevant, how would you explain a career gap, course change, or transition in your background?',
    [
      'Explains the situation factually and briefly',
      'Does not become defensive or over-share',
      'States what was learned or done where relevant',
      'Connects the present decision to the role',
      'Keeps dates and facts consistent',
    ],
    'Explain the transition, what happened during it, and why you are ready now.',
    'What did that period teach you about the kind of work you want next?',
  ),

  hr(
    'hr-14',
    'Leaving a previous role',
    'Why did you leave, or why are you considering leaving, your previous job?',
    [
      'Gives a professional truthful reason',
      'Avoids attacking a previous manager or employer',
      'Explains what the candidate is moving toward',
      'Keeps the answer proportionate',
      'Does not contradict the rest of the candidate background',
    ],
    'Focus more on what you want next than on complaints about the old role.',
    'What did you value most in your previous workplace?',
  ),

  hr(
    'hr-15',
    'Handling several tools',
    'Customer-service work can require reading, typing, talking, and using several tools at once. How would you manage that?',
    [
      'Acknowledges the cognitive load realistically',
      'Explains how key facts would be captured while listening',
      'Keeps customer attention above unnecessary multitasking',
      'Mentions verification before committing important actions',
      'Shows willingness to learn efficient tool workflows',
    ],
    'Explain how you capture important information without losing the conversation.',
    'What would you do if multitasking caused you to miss an important customer detail?',
  ),

  hr(
    'hr-16',
    'Language comfort',
    'How comfortable are you communicating with customers in the language required for this role?',
    [
      'Answers language comfort truthfully',
      'Distinguishes speaking, understanding, reading, or writing if relevant',
      'Uses clear simple language rather than forced complexity',
      'Explains how clarification is handled',
      'Avoids exaggerating fluency',
    ],
    'Clear, accurate language is more useful than complicated vocabulary.',
    'What do you do when a customer uses a word, accent, or phrase you do not immediately understand?',
  ),

  hr(
    'hr-17',
    'Recent weekend',
    'Tell me how you spent your most recent weekend.',
    [
      'Uses a simple chronological structure',
      'Includes two or three concrete details',
      'Uses appropriate tense consistently',
      'Sounds conversational rather than rehearsed',
      'Closes naturally',
    ],
    'This is a communication exercise, not an achievement question.',
    'What would you have done differently if you had one extra free day?',
  ),

  hr(
    'hr-18',
    'Your hometown or city',
    'Tell me about the place where you live or grew up.',
    [
      'Organizes the answer around two or three clear points',
      'Includes specific details about the place',
      'Explains a personal connection or observation',
      'Uses natural descriptive vocabulary',
      'Avoids unrelated biography',
    ],
    'Location → distinctive details → personal view → close.',
    'What is one thing you would improve about that place?',
  ),

  hr(
    'hr-19',
    'A genuine hobby',
    'Tell me about one hobby or activity you genuinely enjoy.',
    [
      'Names a genuine activity',
      'Explains how or why the candidate does it',
      'Includes a concrete example or routine',
      'Shows natural spontaneous language',
      'Avoids inventing an impressive-sounding hobby',
    ],
    'Pick something real and explain what you actually do.',
    'What has that hobby taught you that is useful elsewhere?',
  ),

  hr(
    'hr-20',
    'Reliability',
    'What would make you a reliable member of a customer-service team?',
    [
      'Focuses on reliability behaviors instead of personality labels',
      'Mentions consistency, communication, ownership, attendance, or learning where relevant',
      'Supports one claim with evidence',
      'Recognizes team and customer impact',
      'Ends with a concise summary',
    ],
    'Describe what teammates and customers could consistently expect from you.',
    'What reliability habit would you want your manager to notice in your first month?',
  ),
]

export function getRandomHrQuestions(
  count: number,
  excludeIds: string[] = [],
): Question[] {
  const pool = hrQuestions.filter(q => !excludeIds.includes(q.id))

  return [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, pool.length))
}

export function getInterviewFramework(
  question: Question,
): InterviewFramework {
  if (
    question.id.startsWith('hr-') ||
    question.id === 'recent-intro-1'
  ) {
    return {
      label: 'HR / communication',
      steps: [
        'Direct answer',
        'Relevant detail',
        'Role connection',
        'Concise close',
      ],
      guidance:
        'Answer the question first. Add only the detail that proves the point, then connect it to the role where relevant.',
    }
  }

  if (question.category === 'behavioral') {
    return {
      label: 'Behavioral / STAR',
      steps: [
        'Situation',
        'Task',
        'Action',
        'Result + learning',
      ],
      guidance:
        'Keep Situation and Task short. Spend most of the answer on your own actions, decisions, result, and what you learned.',
    }
  }

  if (question.category === 'customer-service') {
    return {
      label: 'Customer scenario',
      steps: [
        'Acknowledge',
        'Clarify',
        'Investigate',
        'Resolve',
        'Set expectation',
        'Follow through',
      ],
      guidance:
        'Speak as if the customer were present. Do not invent policy or promise an outcome you have not verified.',
    }
  }

  return {
    label: 'Spontaneous speaking',
    steps: [
      'Opening',
      '2–3 developed points',
      'Example',
      'Clear close',
    ],
    guidance:
      'Use simple natural English. Develop a few points instead of listing many shallow ideas.',
  }
}
