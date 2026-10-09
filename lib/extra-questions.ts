import type { Question } from './questions'

const speakingRubric = ['Answers the topic directly', 'Clear opening, developed middle, and close', 'Accurate natural grammar', 'Useful vocabulary without forced complexity', 'Specific examples or detail', 'Avoids repetition and filler-heavy phrasing']

export const extraQuestions: Question[] = [
  {
    id: 'recent-intro-1', category: 'behavioral', difficulty: 'easy', competency: 'communication', type: 'workstyle', title: 'Tell me about yourself — CSA version',
    prompt: 'Tell me about yourself in 60–90 seconds, focusing on the parts of your background that make you a strong fit for a customer-service role.',
    context: 'Recent candidate reports commonly describe a short HR/video round that checks basic communication and comfort in the applied language. Treat this as a practice pattern, not a guaranteed question.',
    rubric: ['Clear 60–90 second structure', 'Relevant background rather than full life story', 'Connects skills to customer service', 'Natural confident wording', 'Ends with why this role makes sense'],
    hint: 'Present → relevant past → strengths → why CSA. Do not recite your CV line by line.',
    followUp: 'Which one experience best proves you can stay calm with a frustrated customer?',
    idealCharacteristics: ['Concise', 'Role-relevant', 'Natural language', 'Evidence-based', 'Positive close'],
    commonMistakes: ['Too long', 'Generic adjectives', 'Unrelated personal history', 'Memorized robotic delivery']
  },
  {
    id: 'recent-weekend-1', category: 'extempore', difficulty: 'easy', competency: 'communication', type: 'extempore', title: 'How you spent your weekend',
    prompt: 'Describe how you spent your most recent weekend. Keep it natural, organized, and detailed enough to hold a 60–90 second conversation.', rubric: speakingRubric,
    hint: 'Use a simple timeline and two concrete details. The goal is conversational fluency, not impressive content.',
    followUp: 'What would you have changed about that weekend if you had one extra day?', idealCharacteristics: ['Natural chronology', 'Specific details', 'Correct tense', 'Smooth transitions', 'Clear close'], commonMistakes: ['Inventing a dramatic story', 'One-word events with no detail', 'Tense switching', 'Repeating “then” every sentence']
  },
  {
    id: 'recent-birthday-1', category: 'extempore', difficulty: 'easy', competency: 'communication', type: 'extempore', title: 'A memorable birthday',
    prompt: 'Talk about a memorable birthday or celebration and explain why you remember it.', rubric: speakingRubric, hint: 'Past tense + sequence + one reason it mattered.', followUp: 'Do you prefer large celebrations or small ones, and why?', idealCharacteristics: ['Past tense control', 'Story sequence', 'Personal detail', 'Natural emotion', 'Conclusion'], commonMistakes: ['No central point', 'Too many unrelated details', 'Incorrect tense', 'Stopping abruptly']
  },
  {
    id: 'speak-wfh-1', category: 'extempore', difficulty: 'medium', competency: 'communication', type: 'extempore', title: 'Work from home vs office',
    prompt: 'For a customer-service role, which is better: working from home or working from an office? Give a balanced answer and your final preference.', rubric: speakingRubric, hint: 'Compare focus, support, commute, discipline, equipment, and teamwork.', followUp: 'What is the biggest challenge of your preferred option?', idealCharacteristics: ['Balanced comparison', 'Clear preference', 'Relevant role context', 'Examples', 'Strong close'], commonMistakes: ['Only listing benefits', 'Ignoring customer-service realities', 'No preference', 'Repetition']
  },
  {
    id: 'speak-angry-1', category: 'extempore', difficulty: 'medium', competency: 'communication', type: 'extempore', title: 'Why customers become angry',
    prompt: 'Why do customers become angry with support teams, and what can an agent do to prevent frustration from escalating?', rubric: speakingRubric, hint: 'Organize around causes → agent behaviors → outcome.', followUp: 'Which is harder to recover from: a delay or a broken promise?', idealCharacteristics: ['Customer perspective', 'Cause-effect structure', 'Practical examples', 'Empathy', 'Conclusion'], commonMistakes: ['Blaming customers', 'Vague advice', 'No examples', 'Overusing jargon']
  },
  {
    id: 'cs-third-contact', category: 'customer-service', difficulty: 'hard', competency: 'ownership', type: 'scenario', title: 'Third contact, still unresolved',
    prompt: 'A customer says, “I have explained this twice already. You are the third person I have contacted.” Their issue is still unresolved. Walk me through exactly what you would do.',
    rubric: ['Acknowledges repeat-contact frustration', 'Uses existing notes before asking customer to repeat', 'Diagnoses why earlier attempts failed', 'Takes ownership of next action', 'Sets clear expectations and follow-up', 'Avoids blaming previous agents'], hint: 'Think first-contact resolution and preserving trust.', followUp: 'What if the only correct next step requires another team?', idealCharacteristics: ['Reads history', 'Summarizes understanding', 'Finds failure point', 'Owns next step', 'Warm handoff if needed'], commonMistakes: ['Restarting script', 'Immediate transfer', 'Blaming colleagues', 'Making unsupported promises']
  },
  {
    id: 'cs-fraud-concern', category: 'customer-service', difficulty: 'hard', competency: 'trust', type: 'scenario', title: 'Possible unauthorized order',
    prompt: 'A customer says they do not recognize an expensive order on their account and are worried their account was compromised. How would you handle the contact?',
    rubric: ['Treats potential security risk seriously', 'Verifies identity through approved process', 'Avoids exposing sensitive information', 'Uses appropriate security/escalation path', 'Sets calm expectations', 'Documents and follows through'], hint: 'Safety and verification before convenience.', followUp: 'What would you avoid saying or doing before identity verification?', idealCharacteristics: ['Risk-aware', 'Calm', 'Policy-conscious', 'No guessing', 'Clear next steps'], commonMistakes: ['Sharing order details too early', 'Assuming fraud', 'Promising refund before verification', 'Ignoring account security']
  },
  {
    id: 'cs-language-gap', category: 'customer-service', difficulty: 'medium', competency: 'empathy', type: 'scenario', title: 'Customer struggling with English',
    prompt: 'A customer is having difficulty explaining the issue in English and becomes embarrassed. How would you keep the interaction effective and respectful?',
    rubric: ['Uses simple respectful language', 'Does not talk down to customer', 'Asks one clear question at a time', 'Confirms understanding', 'Uses available language/support tools appropriately', 'Keeps patience visible'], hint: 'Clarity without condescension.', followUp: 'How would you confirm you understood the issue correctly?', idealCharacteristics: ['Patient', 'Simple language', 'Chunked questions', 'Confirmation', 'Respect'], commonMistakes: ['Speaking louder instead of clearer', 'Rushing', 'Complex vocabulary', 'Showing frustration']
  },
  {
    id: 'beh-critical-feedback', category: 'behavioral', difficulty: 'medium', competency: 'curiosity', type: 'workstyle', title: 'Critical feedback',
    prompt: 'Tell me about a time you received difficult or critical feedback. What did you do with it?', rubric: ['Specific context', 'Does not become defensive', 'Explains personal action', 'Shows observable improvement', 'Reflects on learning'], hint: 'The result should show a behavior change, not just “I accepted it.”', followUp: 'What part of the feedback did you initially disagree with?', idealCharacteristics: ['Self-awareness', 'Action', 'Improvement', 'Specificity', 'Learning'], commonMistakes: ['Fake weakness', 'Blaming reviewer', 'No changed behavior', 'No result']
  },
  {
    id: 'beh-difficult-customer', category: 'behavioral', difficulty: 'hard', competency: 'empathy', type: 'workstyle', title: 'Difficult customer you handled',
    prompt: 'Tell me about a real time you handled a difficult customer or stakeholder. What made it difficult, what did you personally do, and what happened?', rubric: ['Clear STAR context', 'Specific personal actions', 'Empathy without surrendering judgment', 'Explains trade-offs/constraints', 'Concrete result', 'Learning'], hint: 'Spend most time on Action and Result.', followUp: 'What would you do differently if the same situation happened today?', idealCharacteristics: ['STAR', 'Ownership', 'Calm communication', 'Evidence', 'Learning'], commonMistakes: ['Calling customer unreasonable', 'Vague team actions', 'No outcome', 'Too much Situation']
  },
  {
    id: 'beh-unknown-task', category: 'behavioral', difficulty: 'medium', competency: 'curiosity', type: 'workstyle', title: 'Task you did not know how to approach',
    prompt: 'Tell me about a time you were given a task you did not initially know how to approach. How did you learn enough to deliver?', rubric: ['Specific uncertainty', 'Structured learning/research', 'Uses available people/data wisely', 'Takes action instead of waiting', 'Result', 'Learning'], hint: 'Show how you reduced uncertainty.', followUp: 'At what point did you know you had enough information to act?', idealCharacteristics: ['Curiosity', 'Bias for action', 'Resourcefulness', 'Result', 'Reflection'], commonMistakes: ['Says “I just figured it out”', 'No learning method', 'Over-reliance on manager', 'No outcome']
  },
  {
    id: 'beh-above-beyond', category: 'behavioral', difficulty: 'hard', competency: 'ownership', type: 'workstyle', title: 'Above and beyond for a customer',
    prompt: 'Tell me about a time you went beyond the minimum expected to improve a customer or stakeholder outcome.', rubric: ['Real customer/stakeholder need', 'Explains why extra effort was justified', 'Specific actions', 'Balances boundaries/resources', 'Concrete outcome'], hint: 'Do not confuse “above and beyond” with ignoring policy.', followUp: 'How did you know the extra effort was worth it?', idealCharacteristics: ['Customer focus', 'Judgment', 'Ownership', 'Impact', 'Boundaries'], commonMistakes: ['Breaking rules', 'No measurable impact', 'Hero story with no customer need', 'Team actions only']
  } as Question,
  {
    id: 'recent-vacation-family', category: 'extempore', difficulty: 'easy', competency: 'communication', type: 'extempore', title: 'A vacation with family',
    prompt: 'Talk for one minute about a vacation or trip with your family. Describe where you went, what you did, and one thing you remember clearly.', rubric: speakingRubric, hint: 'Use a simple past-tense story: setting → two details → why it was memorable.', followUp: 'Where would you like to travel with your family next, and why?', idealCharacteristics: ['Natural story', 'Past tense', 'Specific details', 'Smooth transitions', 'Clear ending'], commonMistakes: ['Listing places without a story', 'Switching tense', 'Long pauses from overthinking', 'Trying to sound overly formal']
  },
  {
    id: 'recent-daily-routine', category: 'extempore', difficulty: 'easy', competency: 'communication', type: 'extempore', title: 'Your daily routine',
    prompt: 'Describe your normal daily routine in a clear and natural way, including how you organize your responsibilities.', rubric: speakingRubric, hint: 'Use present tense and group the day into morning, work/study, and evening.', followUp: 'Which part of your routine would you most like to improve?', idealCharacteristics: ['Present tense control', 'Chronological flow', 'Specific details', 'Natural transitions', 'Concise close'], commonMistakes: ['Repeating “then” constantly', 'No organization', 'Unnecessary detail', 'Tense errors']
  },
  {
    id: 'recent-place-visit', category: 'extempore', difficulty: 'easy', competency: 'communication', type: 'extempore', title: 'A place you would love to visit',
    prompt: 'Talk about a place you would love to visit. Explain why you chose it and what you would like to do there.', rubric: speakingRubric, hint: 'Answer where → why → what you would do → close.', followUp: 'Would you prefer to travel there alone or with someone?', idealCharacteristics: ['Clear choice', 'Reasons', 'Future/conditional grammar', 'Personal detail', 'Close'], commonMistakes: ['Generic travel clichés', 'No reasons', 'Going off-topic', 'Forced vocabulary']
  },
  {
    id: 'recent-hobbies', category: 'extempore', difficulty: 'easy', competency: 'communication', type: 'extempore', title: 'Your hobbies',
    prompt: 'Talk about one or two hobbies you genuinely enjoy. Explain how you started and what you get from them.', rubric: speakingRubric, hint: 'Choose real hobbies so follow-up questions are easy to answer naturally.', followUp: 'How has one of those hobbies changed over time?', idealCharacteristics: ['Authentic detail', 'Natural vocabulary', 'Reasoned explanation', 'Conversation-ready', 'Good close'], commonMistakes: ['Invented hobbies', 'One-sentence answer', 'No examples', 'Memorized definition']
  },

]
