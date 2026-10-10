// Candidate reports are anecdotal, not an official Amazon question bank.
// Prompts are rewritten for practice; source wording is not reproduced.
const report = {
  vcs: { label: 'VCS candidate account · February 2026', url: 'https://www.geeksforgeeks.org/interview-experiences/amazon-virtual-customer-service-associate-vcs-complete-work-from-home-contract-6-months/' },
  routine: { label: 'Reddit CSA candidate account · May 2026', url: 'https://www.reddit.com/r/AmazonFCs/comments/1tlhjyi/amazon_wfh_csa_interview_went_well_but_no_email/' },
  resume: { label: 'Glassdoor VCS account · interview September 2023', url: 'https://www.glassdoor.sg/Interview/Amazon-Virtual-Customer-Service-Associate-Interview-Questions-EI_IE6036.0,6_KO7,41.htm' },
  official: { label: 'Amazon India assessment guidance', url: 'https://prod.contactus.jobsatamazon.hvh.a2z.com/india/in-cs-vcs-job-assessment-en' },
}
const reported = [
  ['A favourite colour', 'Describe your favourite colour and why you like it.', 'Give a real preference, a reason and an everyday example. Keep the explanation natural.', 'Asked to the speaker · YouTube account', 659],
  ['Someone who inspires you', 'Describe a person who inspires you and explain why.', 'Choose someone you know enough about. Describe a specific action and how it influenced you.', 'Asked to the speaker · YouTube account', 849],
  ['Previous work', 'Describe your previous work and what your responsibilities involved.', 'Explain a normal task, how you handled it and one difficulty. If you have no work experience, choose another topic.', 'Asked to the speaker · YouTube account', 760],
  ['A difficult customer experience', 'Describe a difficult experience you had while helping a customer.', 'Use a real incident: the problem, your response and the outcome. Do not invent employment experience.', 'Asked to the speaker · YouTube account', 787],
  ['A recent film', 'Describe a film you watched recently.', 'Give brief context without retelling the whole plot. Explain a scene or idea that stood out and why.', 'Reported as asked to another candidate · YouTube account', 881],
  ['Your daily routine', 'Walk me through a normal day in your life.', 'Pick one actual day. Explain the order, one responsibility and how you make time for it.', 'Reported as asked to another candidate · YouTube account', 892],
  ['A favourite web series', 'Describe a web series you like and explain why it is your favourite.', 'Explain the premise briefly, then support your preference with one specific detail.', 'Reported as asked to another candidate · YouTube account', 897],
] as const
const written = [
  ['Technology and education', 'How has technology changed the way people learn?', 'Compare one learning task before and after. Include a benefit, a limitation and your own experience.', report.vcs],
  ['Choosing a phone', 'Would you choose an Android phone or an iPhone? Explain your reasons.', 'Compare needs, cost and usability. You do not need to own either; avoid claims you cannot explain.', report.vcs],
  ['Why customer service matters', 'Why does a business need good customer service?', 'Use a real service experience. Explain what the customer needed and how the response affected trust.', report.vcs],
  ['Technology from your background', 'Explain a new technology related to your studies or previous work to someone unfamiliar with it.', 'Choose something you understand. Explain what it does, one use and one limitation in ordinary language.', report.resume],
  ['A place you want to visit', 'Describe a place you would like to visit and what interests you about it.', 'Name the place, give two specific reasons and describe something you would do there.', report.routine],
] as const
export const speakingTopics = [
  ...reported.map(([title, prompt, hint, basis, timestamp], index) => ({ id: `topic-${index + 1}`, title, prompt, hint, basis, source: { label: `Grow With Suzie · ${Math.floor(timestamp / 60)}:${String(timestamp % 60).padStart(2, '0')} · Hindi auto-captions`, url: `https://www.youtube.com/watch?v=au3IR4P0FXs&t=${timestamp}s` } })),
  { id: 'live-hard-work', title: 'Hard work and smart work', prompt: 'Compare hard work and smart work using an example.', hint: 'Explain what each means to you. Use the same task to show the difference and discuss when effort and planning work together.', basis: 'Theme demonstrated in a recorded candidate answer · prompt wording unclear in captions', source: { label: 'Exploring Me · 3:16 · Hindi/English auto-captions', url: 'https://www.youtube.com/watch?v=NI7Yz-MIr6Y&t=196s' } },
  { id: 'live-festival', title: 'A favourite festival', prompt: 'Describe your favourite festival and what you enjoy about it.', hint: 'Describe what you personally do, who you spend time with and one detail that makes it memorable.', basis: 'Theme demonstrated in a recorded candidate answer · prompt wording unclear in captions', source: { label: 'Exploring Me · 4:17 · Hindi/English auto-captions', url: 'https://www.youtube.com/watch?v=NI7Yz-MIr6Y&t=257s' } },
  { id: 'work-environment', title: 'Your previous workplace', prompt: 'Describe the environment in your previous workplace.', hint: 'Describe how people worked together and give a concrete example. Use this only if you have previous work experience.', basis: 'Asked to the speaker · YouTube account', source: { label: 'Aman Kohli · 2:07 · Hindi auto-captions', url: 'https://www.youtube.com/watch?v=qd8MEa9rjFQ&t=127s' } },
  ...written.map(([title, prompt, hint, source], index) => ({ id: `account-${index + 1}`, title, prompt, hint, basis: 'Asked to the author · written candidate account', source })),
]
export function pickSpeakingTopic(excludeId?: string) {
  const pool = speakingTopics.filter(topic => topic.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}
export function remainingSpeakingSeconds(startedAt: number, now: number, targetSeconds: number) {
  return Math.max(0, targetSeconds - Math.floor(Math.max(0, now - startedAt) / 1000))
}
