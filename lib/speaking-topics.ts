// Original topic drills, not claimed interview questions or an official time limit.
const topicSeeds = [
  ['Your hometown', 'Describe your hometown to someone who has never visited it.', 'Choose two distinctive things, explain what you like, and give one personal example.'],
  ['A hobby', 'Talk about a hobby you enjoy and how you got interested in it.', 'Explain how you started, what you actually do, and why you enjoy it.'],
  ['A recent weekend', 'Describe how you spent a recent weekend.', 'Tell events in order and develop one detail rather than listing everything.'],
  ['A memorable trip', 'Talk about a memorable trip or outing.', 'Describe the place, one event, and why you remember it.'],
  ['Social media', 'How does social media affect everyday life?', 'Explain a benefit and a drawback with examples, then give your view.'],
  ['Online shopping', 'Compare shopping online with shopping in a store.', 'Compare convenience, trust and experience, then explain your preference.'],
  ['Working from home', 'What are the benefits and challenges of working from home?', 'Develop both sides and explain what helps you work reliably.'],
  ['Technology in daily life', 'Describe how technology has changed your daily routine.', 'Choose two real changes and explain what life was like before them.'],
  ['A useful skill', 'Talk about a useful skill you learned recently.', 'Explain why you learned it, how you practised, and what improved.'],
  ['A book or film', 'Talk about a book or film you enjoyed.', 'Give brief context, describe what stood out, and explain why.'],
  ['A person you admire', 'Describe someone you admire.', 'Use a real action or quality as evidence rather than only adjectives.'],
  ['Your daily routine', 'Describe your usual day and one habit that helps you.', 'Use a clear order and explain the purpose of the habit.'],
  ['A place to visit', 'Where would you like to travel, and why?', 'Give specific reasons and describe what you would do there.'],
  ['A good friend', 'What qualities make someone a good friend?', 'Develop two qualities and support them with an everyday example.'],
  ['Learning online', 'Compare learning online with learning in a classroom.', 'Compare the same criteria and explain when each works best.'],
  ['Public transport', 'What would make public transport better in your city?', 'Describe one practical problem and a realistic improvement.'],
  ['A favourite meal', 'Describe a meal you enjoy and what makes it special.', 'Describe it clearly and connect it to a memory or routine.'],
  ['A difficult decision', 'Talk about an everyday decision that was difficult for you.', 'Describe the options, your reasoning, and what happened.'],
  ['Listening well', 'Why is listening important in a conversation?', 'Describe what good listening looks like and give an example.'],
  ['A product you use', 'Describe a product you use often and one improvement you would make.', 'Explain its purpose, one useful feature, and one specific problem.'],
  ['A small achievement', 'Talk about a recent achievement you are proud of.', 'Keep it truthful: explain the effort, the result and what you learned.'],
  ['City or village life', 'Compare living in a city with living in a village.', 'Explain advantages and challenges without making sweeping claims.'],
  ['Teamwork', 'What makes a team work well together?', 'Explain two practical behaviours and illustrate them with an example.'],
  ['A change in your life', 'Describe a change in your life and how you adapted.', 'Explain what changed, your first response and what helped.'],
] as const
export const speakingTopics = topicSeeds.map(([title, prompt, hint], index) => ({ id: `topic-${index + 1}`, title, prompt, hint }))
export function pickSpeakingTopic(excludeId?: string) {
  const pool = speakingTopics.filter(topic => topic.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}
export function remainingSpeakingSeconds(startedAt: number, now: number, targetSeconds: number) {
  return Math.max(0, targetSeconds - Math.floor(Math.max(0, now - startedAt) / 1000))
}
