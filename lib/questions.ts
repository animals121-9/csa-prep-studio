export type Question = {
  id: string
  category: 'customer-service' | 'behavioral' | 'amazon-style' | 'extempore'
  difficulty: 'easy' | 'medium' | 'hard'
  competency: 'empathy' | 'ownership' | 'bias-for-action' | 'dive-deep' | 'trust' | 'curiosity' | 'standards' | 'results' | 'communication'
  type: 'workstyle' | 'scenario' | 'extempore'
  title: string
  prompt: string
  context?: string
  rubric: string[]
  hint: string
  followUp: string
  idealCharacteristics: string[]
  commonMistakes: string[]
}

type QuestionSeed = {
  title: string
  prompt: string
  hint: string
  category: Question['category']
  competency: Question['competency']
  type: Question['type']
}

const RUBRICS = {
  conversation: [
    'Answers the question directly instead of circling around the topic',
    'Uses a simple structure that is easy to follow aloud',
    'Develops the answer with specific reasons, details, or examples',
    'Uses clear, natural language rather than memorized corporate wording',
    'Finishes with a clear final point instead of stopping abruptly',
  ],
  customer: [
    'Acknowledges the customer’s concern or practical impact',
    'Clarifies the facts that matter before deciding what to do',
    'Explains a safe and useful next step without inventing policy or guarantees',
    'Communicates expectations clearly and respectfully',
    'Shows ownership without blaming the customer, another agent, or another team',
  ],
  experience: [
    'Uses one truthful and specific example',
    'Explains the situation briefly enough to understand the problem',
    'Makes the candidate’s own actions and decisions clear',
    'Explains what happened afterward or what changed',
    'Shows a useful lesson without forcing the answer into corporate jargon',
  ],
} satisfies Record<string, string[]>

const COMMON_MISTAKES = {
  conversation: [
    'Giving a memorized speech that does not answer the exact question',
    'Repeating the same point in different words',
    'Using complicated vocabulary that makes the answer less natural',
    'Adding too many unrelated details before reaching the main point',
  ],
  customer: [
    'Guessing policy, timelines, refunds, or outcomes that have not been verified',
    'Jumping to a solution before understanding the customer’s actual issue',
    'Arguing with the customer or blaming another person or team',
    'Making a promise simply to calm the customer down',
  ],
  experience: [
    'Using a vague example that could have happened to anyone',
    'Spending most of the answer on background instead of personal action',
    'Saying “we” throughout without making your own contribution clear',
    'Inventing a corporate-scale achievement instead of using a truthful example',
  ],
} satisfies Record<string, string[]>

function buildQuestion(seed: QuestionSeed, index: number): Question {
  const kind = seed.category === 'customer-service'
    ? 'customer'
    : seed.category === 'behavioral'
      ? 'experience'
      : 'conversation'

  const rubric = RUBRICS[kind]
  return {
    id: `core-${String(index + 1).padStart(2, '0')}`,
    category: seed.category,
    difficulty: 'medium',
    competency: seed.competency,
    type: seed.type,
    title: seed.title,
    prompt: seed.prompt,
    rubric,
    hint: seed.hint,
    followUp: kind === 'customer'
      ? 'What would you say if the customer rejected your first explanation or next step?'
      : kind === 'experience'
        ? 'What would you do differently if a similar situation happened again?'
        : 'What follow-up detail or example would make your answer more convincing?',
    idealCharacteristics: rubric,
    commonMistakes: COMMON_MISTAKES[kind],
  }
}

const seeds: QuestionSeed[] = [

  { title: "Tell me about yourself", prompt: "Tell me about yourself and what you are currently doing.", hint: "Keep it to the present, one or two relevant background details, and why customer service makes sense for you.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Why customer service?", prompt: "Why are you interested in a customer service role?", hint: "Give one genuine reason, connect it to how you work with people or solve problems, and keep it specific.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Why Amazon?", prompt: "Why do you want to work with Amazon?", hint: "Give one role-related reason and one personal-fit reason. Avoid generic praise about the brand.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "What good service means", prompt: "What does good customer service mean to you?", hint: "Focus on listening, accurate help, clear expectations, and making the customer feel understood.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Good CSA qualities", prompt: "What qualities do you think a good customer service associate needs?", hint: "Choose two or three qualities and explain what each looks like in a real interaction.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Helping people", prompt: "What do you enjoy about helping other people?", hint: "Use a real example or observation instead of saying only that you like helping people.", category: "extempore", competency: "empathy", type: "extempore" },
  { title: "Speed or accuracy?", prompt: "What do you think is more important in customer service: speed or accuracy? Why?", hint: "A strong answer recognizes the trade-off: be efficient, but do not create a bigger problem by guessing or rushing.", category: "extempore", competency: "dive-deep", type: "extempore" },
  { title: "Explain something clearly", prompt: "How would you explain something complicated to a customer who does not understand it?", hint: "Use simple language, one step at a time, and check understanding before moving on.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Voice or chat?", prompt: "Do you prefer communicating by voice or chat? Why?", hint: "Choose honestly, explain the strengths of your preference, and show that you can adapt to the other format.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "When you do not know", prompt: "What would you do if you did not immediately know the answer to a customer's question?", hint: "Do not guess. Explain how you would clarify the issue, verify the right information, and keep the customer informed.", category: "extempore", competency: "trust", type: "extempore" },
  { title: "Technology in daily life", prompt: "How has technology made everyday life easier for you?", hint: "Choose two concrete examples and explain the actual difference they made.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Technology and learning", prompt: "How has technology changed the way people learn?", hint: "Give two distinct changes, one example, and a balanced conclusion.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Technology you use", prompt: "What is one technology you use every day, and why is it useful?", hint: "Pick something real and explain how you use it rather than giving a general definition.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Clear communication", prompt: "What makes communication clear and effective?", hint: "Think about listening, simple wording, relevant detail, confirmation, and tone.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Fast-speaking customer", prompt: "What would you do if a customer was speaking very quickly and you could not understand everything?", hint: "Stay respectful, ask them to slow down or repeat one point, and summarize what you understood.", category: "extempore", competency: "empathy", type: "extempore" },
  { title: "Already-frustrated customer", prompt: "How would you handle a conversation with someone who is already frustrated before you begin helping them?", hint: "Acknowledge the frustration, avoid becoming defensive, clarify the issue, then move toward a concrete next step.", category: "extempore", competency: "empathy", type: "extempore" },
  { title: "Professional on a call", prompt: "What does being professional on a customer call mean to you?", hint: "Describe behaviors: calm tone, accurate information, respect, clear boundaries, and follow-through.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Communication skill to improve", prompt: "What is one communication skill you would like to improve?", hint: "Choose a genuine improvement area and explain what you are doing to get better.", category: "extempore", competency: "curiosity", type: "extempore" },
  { title: "What customers expect", prompt: "What do you think customers expect when they contact support?", hint: "Focus on being heard, getting accurate help, knowing what happens next, and not having to repeat themselves unnecessarily.", category: "extempore", competency: "empathy", type: "extempore" },
  { title: "A successful interaction", prompt: "What would make you feel that you had handled a customer interaction successfully?", hint: "Describe both the customer outcome and the quality of your own process, not just ending the call quickly.", category: "extempore", competency: "results", type: "extempore" },
  { title: "Late order", prompt: "A customer says their order is late and they are angry because they needed it today. How would you respond?", hint: "Acknowledge the impact, verify what is known, explain the available next step, and avoid promising a delivery time you cannot confirm.", category: "customer-service", competency: "empathy", type: "scenario" },
  { title: "Delivered but not received", prompt: "A customer says an order shows as delivered, but they have not received it. What would you do first?", hint: "Clarify the basic facts, check the available order information, and explain the safest next step without assuming what happened.", category: "customer-service", competency: "dive-deep", type: "scenario" },
  { title: "Wrong item", prompt: "A customer says they received the wrong item. How would you handle the conversation?", hint: "Confirm what was ordered versus received, understand the customer's immediate need, and explain only verified options.", category: "customer-service", competency: "ownership", type: "scenario" },
  { title: "Damaged product", prompt: "A customer received a damaged product and wants help. How would you respond?", hint: "Acknowledge the inconvenience, gather the necessary details, and guide the customer through the valid next step without inventing policy.", category: "customer-service", competency: "empathy", type: "scenario" },
  { title: "Third contact", prompt: "A customer says they have contacted support twice already and their problem is still unresolved. How would you take ownership of the conversation?", hint: "Use the existing history if available, summarize the issue so they do not repeat everything, identify the blocker, and own the next step.", category: "customer-service", competency: "ownership", type: "scenario" },
  { title: "Immediate refund demand", prompt: "A customer demands an immediate refund, but you first need to understand what happened. How would you handle that?", hint: "Acknowledge the request directly, explain why you need a few facts, ask focused questions, and avoid promising the refund before verification.", category: "customer-service", competency: "dive-deep", type: "scenario" },
  { title: "Customer keeps interrupting", prompt: "A customer keeps interrupting and says they do not want explanations. How would you regain control of the conversation politely?", hint: "Keep your tone calm, acknowledge that they want a quick resolution, and ask permission to confirm the one or two facts needed to act.", category: "customer-service", competency: "communication", type: "scenario" },
  { title: "Impossible delivery promise", prompt: "A customer asks you to promise that a delayed order will arrive tonight, but you cannot verify that. What would you say?", hint: "Be transparent about what you can and cannot confirm, then give the most useful verified next step or expectation.", category: "customer-service", competency: "trust", type: "scenario" },
  { title: "Return picked up, refund pending", prompt: "A customer says their return was picked up but the refund has not arrived yet. How would you handle the conversation?", hint: "Confirm the return/refund status that is actually visible, explain the next verified step, and avoid inventing a refund timeline.", category: "customer-service", competency: "ownership", type: "scenario" },
  { title: "Incorrect delivery attempt", prompt: "A customer says a delivery attempt was marked unsuccessful even though they were home. What would you do?", hint: "Acknowledge the frustration, verify the tracking information, and focus on the next available action rather than blaming the customer or driver.", category: "customer-service", competency: "empathy", type: "scenario" },
  { title: "UPI debited, order not confirmed", prompt: "A customer's UPI payment was debited but their order was not confirmed. They are worried about paying twice. How would you explain the next steps without making promises you cannot verify?", hint: "Separate what is known from what still needs checking. Reassure without guaranteeing a refund time or telling them to pay again blindly.", category: "customer-service", competency: "dive-deep", type: "scenario" },
  { title: "COD payment change", prompt: "A customer has a Cash on Delivery order but asks whether they can change the payment method before delivery. How would you respond if you are not certain what options are available?", hint: "Do not guess. Verify what the order currently allows and explain the available choice clearly.", category: "customer-service", competency: "trust", type: "scenario" },
  { title: "Repeated return pickup failure", prompt: "A customer says a return pickup has failed more than once and they are becoming frustrated. How would you respond?", hint: "Recognize the repeat failure, avoid making them start from zero, verify the current status, and take ownership of the next valid action.", category: "customer-service", competency: "ownership", type: "scenario" },
  { title: "Missing item", prompt: "A customer says one item is missing from a multi-item order. What information would you clarify before deciding the next step?", hint: "Clarify the package/order details and what was actually received before deciding what kind of issue you are dealing with.", category: "customer-service", competency: "dive-deep", type: "scenario" },
  { title: "Sale-price frustration", prompt: "A customer is upset because an item bought during a sale is delayed and is now listed at a higher price. How would you handle the conversation without promising compensation or a price adjustment you cannot guarantee?", hint: "Acknowledge why the timing matters, verify the order status and available options, and do not invent a discount or compensation.", category: "customer-service", competency: "dive-deep", type: "scenario" },
  { title: "Social media", prompt: "Speak for about one minute about the advantages and disadvantages of social media.", hint: "Use a clear opening, two balanced points with examples, and a short conclusion.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Technology and education", prompt: "How has technology changed education?", hint: "Explain two concrete changes and support at least one with an example.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Android or iPhone", prompt: "Which do you prefer, Android or iPhone, and why?", hint: "Choose one, give two practical reasons, acknowledge one strength of the other option, and close.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Online or physical shopping", prompt: "Do you think online shopping is better than shopping in a physical store? Why?", hint: "Compare both using the same criteria such as convenience, price, trust, or experience, then give your view.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Working from home", prompt: "What are the advantages and disadvantages of working from home?", hint: "Give at least one benefit and one challenge, then explain what helps someone work effectively from home.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "A normal day", prompt: "Describe a normal day in your life.", hint: "Use a simple chronological flow with a few real details. Natural speech matters more than impressive content.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "A place to visit", prompt: "Talk about a place you would like to visit and explain why.", hint: "Say where, give two specific reasons, mention what you would like to do there, and close naturally.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "A recently learned skill", prompt: "Describe one skill you learned recently.", hint: "Explain why you learned it, how you practiced, what was difficult, and how you know you improved.", category: "extempore", competency: "curiosity", type: "extempore" },
  { title: "Improve a product or service", prompt: "Talk about a product or service you use regularly and one thing you would improve about it.", hint: "Briefly describe the product, identify one real friction point, and explain a practical improvement.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "AI in customer service", prompt: "Do you think AI will improve customer service? Why or why not?", hint: "Take a balanced position: explain one useful role for AI and one place where human judgment still matters.", category: "extempore", competency: "dive-deep", type: "extempore" },
  { title: "Good listening", prompt: "What makes someone a good listener?", hint: "Describe observable behaviors such as not interrupting, asking useful questions, and confirming understanding.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Describe your city", prompt: "Describe your hometown or city to someone who has never visited it.", hint: "Choose two or three distinctive details and explain why they matter to you.", category: "extempore", competency: "communication", type: "extempore" },
  { title: "Stay calm under pressure", prompt: "Tell me about a time you had to stay calm in a stressful situation.", hint: "Use a real example: what happened, what you personally did, and what happened afterward.", category: "behavioral", competency: "communication", type: "workstyle" },
  { title: "A mistake you corrected", prompt: "Tell me about a mistake you made and what you did afterward.", hint: "Own the mistake without excuses, explain the correction, and finish with what changed in your behavior.", category: "behavioral", competency: "ownership", type: "workstyle" },
  { title: "Help someone understand", prompt: "Tell me about a time you helped someone understand something difficult.", hint: "Explain what they were struggling with, how you adjusted your explanation, and whether it worked.", category: "behavioral", competency: "empathy", type: "workstyle" },
  { title: "Several priorities", prompt: "Describe a time you had several things to complete at once. How did you decide what to do first?", hint: "Explain the actual priorities, the rule you used to order them, and the result.", category: "behavioral", competency: "dive-deep", type: "workstyle" },
  { title: "Disagreement", prompt: "Tell me about a time you disagreed with someone while working or studying together.", hint: "Keep the disagreement factual, explain how you communicated, and show how you moved toward a useful outcome.", category: "behavioral", competency: "trust", type: "workstyle" },
  { title: "Learn quickly", prompt: "Tell me about something you had to learn quickly.", hint: "Explain the gap, the resources or practice you used, and how you checked that you had learned enough.", category: "behavioral", competency: "curiosity", type: "workstyle" },
  { title: "Difficult feedback", prompt: "Tell me about a time you received feedback you did not initially like. What did you do with it?", hint: "Show your first reaction briefly, then focus on how you evaluated the feedback and changed your behavior.", category: "behavioral", competency: "curiosity", type: "workstyle" },
  { title: "Take responsibility", prompt: "Give an example of a time you took responsibility for solving a problem.", hint: "Make your own actions clear and explain the outcome. The example can come from college, work, volunteering, or everyday life.", category: "behavioral", competency: "ownership", type: "workstyle" },
  { title: "Rotational shifts", prompt: "Are you comfortable working rotational shifts, including nights and weekends? Explain your answer.", hint: "Answer truthfully first. If you have constraints, state them clearly instead of promising availability you do not have.", category: "extempore", competency: "trust", type: "extempore" },
  { title: "Changing schedule", prompt: "How would you manage your routine if your work schedule changed from week to week?", hint: "Mention sleep, meals, commute or home responsibilities, and how you would protect reliability.", category: "extempore", competency: "standards", type: "extempore" },
  { title: "Effective WFH setup", prompt: "What would you need in order to work effectively from home?", hint: "Think about a quiet workspace, reliable connectivity, equipment, routine, and avoiding interruptions.", category: "extempore", competency: "standards", type: "extempore" },
  { title: "Internet fails during shift", prompt: "If you were working from home and your internet connection suddenly failed during your shift, what would you do?", hint: "Focus on notifying the right person promptly, using the approved backup process if available, and restoring service rather than improvising policy.", category: "extempore", competency: "ownership", type: "extempore" },
  { title: "Stay focused on a long shift", prompt: "What would help you stay focused during a long customer-service shift?", hint: "Give practical habits that protect attention and accuracy without pretending fatigue never happens.", category: "extempore", competency: "standards", type: "extempore" },
]
export const questions: Question[] = seeds.map(buildQuestion)
