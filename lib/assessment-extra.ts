import type {
  ScenarioItem,
  WorkStyleItem,
} from './assessment'

export const extraWorkStyleItems: WorkStyleItem[] = [
  {
    id: 'wsx-01',
    type: 'workstyle-pair',
    dimension: 'customer',
    left:
      'I prefer to stay with one customer issue until every possible detail is complete.',
    right:
      'I am comfortable moving another case forward when the first one is safely waiting on information or another team.',
    note:
      'Both can be responsible. Think about customer effort, dependencies, and whether work is genuinely blocked.',
  },
  {
    id: 'wsx-02',
    type: 'workstyle-pair',
    dimension: 'quality',
    left:
      'I usually verify details before I explain the likely outcome to a customer.',
    right:
      'I usually explain the likely outcome first, then verify the remaining details before I commit to it.',
    note:
      'Consider how you balance clarity and speed without turning a likely outcome into an unsupported promise.',
  },
  {
    id: 'wsx-03',
    type: 'workstyle-pair',
    dimension: 'learning',
    left:
      'When I meet an unfamiliar problem, I investigate independently for a short time before asking for help.',
    right:
      'When I meet an unfamiliar problem, I ask a focused question early so I do not spend too long on the wrong path.',
    note:
      'The trade-off is independent problem solving versus efficient use of help. Context and risk matter.',
  },
  {
    id: 'wsx-04',
    type: 'workstyle-pair',
    dimension: 'action',
    left:
      'When several cases are waiting, I usually protect first-in-first-out order unless there is a clear risk reason not to.',
    right:
      'When several cases are waiting, I am comfortable changing the order based on urgency and customer impact.',
    note:
      'Think about fairness, SLA expectations, and when risk justifies reprioritization.',
  },
  {
    id: 'wsx-05',
    type: 'workstyle-pair',
    dimension: 'ownership',
    left:
      'I prefer to remain visibly involved after a specialist handoff until I know the customer has a clear next step.',
    right:
      'I prefer to make a very complete handoff and then let the specialist own the next stage without duplicating work.',
    note:
      'Both can show ownership. The important question is whether the handoff is complete and the customer knows what happens next.',
  },
  {
    id: 'wsx-06',
    type: 'workstyle-pair',
    dimension: 'trust',
    left:
      'If I disagree with a teammate, I usually raise the concern as soon as I can explain the risk clearly.',
    right:
      'If I disagree with a teammate, I usually gather a little more evidence before I raise the concern.',
    note:
      'Consider urgency, reversibility, evidence quality, and the cost of waiting.',
  },
  {
    id: 'wsx-07',
    type: 'workstyle-pair',
    dimension: 'quality',
    left:
      'I prefer to document important case notes immediately before moving on.',
    right:
      'During a short volume spike, I may batch non-urgent documentation for a few minutes as long as I have captured the critical facts safely.',
    note:
      'The trade-off is documentation freshness versus queue flow. High-risk or required notes should not be deferred.',
  },
  {
    id: 'wsx-08',
    type: 'workstyle-pair',
    dimension: 'customer',
    left:
      'I usually give customers the full reasoning behind a decision so they understand it.',
    right:
      'I usually start with the decision and next step, then add more explanation if the customer needs it.',
    note:
      'Both can be clear. Think about customer effort and how much explanation is actually useful in the moment.',
  },
  {
    id: 'wsx-09',
    type: 'workstyle-pair',
    dimension: 'learning',
    left:
      'I learn new processes best by reading the instructions carefully before trying them.',
    right:
      'I learn new processes best by trying a safe example and referring back to the instructions as questions arise.',
    note:
      'Different learning approaches can work. Accuracy, feedback, and willingness to adapt matter more than one preferred method.',
  },
  {
    id: 'wsx-10',
    type: 'workstyle-pair',
    dimension: 'action',
    left:
      'For a reversible low-risk decision, I prefer to act and adjust if new information appears.',
    right:
      'For a reversible low-risk decision, I prefer one quick verification step before acting even if it adds a little time.',
    note:
      'Consider the cost of delay versus the cost of a wrong reversible step.',
  },
  {
    id: 'wsx-11',
    type: 'workstyle-pair',
    dimension: 'trust',
    left:
      'I tend to be very direct when a process error needs correction.',
    right:
      'I tend to spend more time framing corrective feedback so the other person understands the intent.',
    note:
      'Effective feedback needs both clarity and respect. Think about urgency and how the message will be received.',
  },
  {
    id: 'wsx-12',
    type: 'workstyle-pair',
    dimension: 'ownership',
    left:
      'When I notice a recurring issue, I prefer to collect several examples before escalating the pattern.',
    right:
      'When I notice a recurring issue, I prefer to flag the pattern early and add evidence as more examples appear.',
    note:
      'The balance is signal quality versus early visibility. The right choice may depend on severity and reversibility.',
  },
  {
    id: 'wsx-13',
    type: 'workstyle-pair',
    dimension: 'customer',
    left:
      'I prefer to give a customer two or three valid options and let them choose.',
    right:
      'I prefer to recommend the strongest valid option first and explain alternatives if needed.',
    note:
      'Both can reduce customer effort. Think about complexity, customer preference, and whether one option is clearly better.',
  },
  {
    id: 'wsx-14',
    type: 'workstyle-pair',
    dimension: 'quality',
    left:
      'I am comfortable using a well-established standard response when it fully fits the case.',
    right:
      'I prefer to personalize most explanations even when the standard response is technically complete.',
    note:
      'Consistency and personalization both matter. The question is whether customization adds clarity or only extra time.',
  },
  {
    id: 'wsx-15',
    type: 'workstyle-pair',
    dimension: 'learning',
    left:
      'After a difficult case, I prefer to review it immediately while the details are fresh.',
    right:
      'After a difficult case, I prefer to finish the urgent queue first and review the case later in a calmer moment.',
    note:
      'Reflection is useful, but timing should respect customer demand and the risk of forgetting important details.',
  },
  {
    id: 'wsx-16',
    type: 'workstyle-pair',
    dimension: 'action',
    left:
      'When instructions conflict, I prefer to pause the action until I know which source is current.',
    right:
      'When instructions conflict, I prefer to take any safe reversible step that does not depend on the disputed rule while I verify it.',
    note:
      'Consider whether useful progress can continue without risking an incorrect commitment.',
  },
]

const scenario = (
  id: string,
  title: string,
  principle: string,
  situation: string,
  options: ScenarioItem['options'],
): ScenarioItem => ({
  id,
  type: 'scenario-choice',
  title,
  principle,
  situation,
  options,
})

export const extraScenarioItems: ScenarioItem[] = [
  scenario(
    'sjx-01',
    'Duplicate charge after one order',
    'Dive deep + customer trust',
    'A customer sees two card charges for one order. One is posted and the other is still pending. What is the best response?',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Verify the order and payment status, explain the difference between a posted charge and a pending authorization if that is what the records show, then give the correct timeline or escalation path.',
        rationale:
          'This investigates the actual payment states before explaining them and gives the customer a concrete next step without assuming the pending item will disappear.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Tell the customer pending charges often disappear and ask them to wait a few days.',
        rationale:
          'That may eventually be true, but it skips verification of whether the second amount is really only an authorization and gives weak ownership if it is a genuine duplicate.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Refund the posted charge immediately so the customer is protected.',
        rationale:
          'Refunding before confirming what happened can create another payment problem and does not diagnose whether there was actually a duplicate capture.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Tell the customer the bank caused the issue and they must contact the bank.',
        rationale:
          'This shifts responsibility before checking the available account/payment records and may send the customer elsewhere unnecessarily.',
      },
    ],
  ),

  scenario(
    'sjx-02',
    'Delivered scan but package is missing',
    'Customer focus + investigation',
    'Tracking says delivered, but the customer says the package is not at the address. What should you do first?',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Acknowledge the concern, verify delivery details and account/address information, follow the supported delivered-not-received checks, then explain the available next step.',
        rationale:
          'This treats the report seriously while using evidence and the correct process before deciding on replacement, refund, or escalation.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Ask the customer to check nearby locations and with household members, then contact support again if it is still missing.',
        rationale:
          'Those checks can be useful, but requiring a completely new contact creates extra customer effort and omits agent-side investigation.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Tell the customer that a delivered scan proves the package arrived.',
        rationale:
          'A scan is evidence, but it does not by itself prove the customer received the parcel. The discrepancy still requires investigation.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Immediately issue a high-value replacement without verification.',
        rationale:
          'Skipping required checks can create fraud and inventory risk and may bypass the correct resolution process.',
      },
    ],
  ),

  scenario(
    'sjx-03',
    'Return without original packaging',
    'Policy + practical resolution',
    'A customer wants to return an eligible item but no longer has the original retail packaging. What is the best response?',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Check the return requirements for that item and reason, explain what packaging is actually required, and offer the valid return method that fits the policy.',
        rationale:
          'This answers the real constraint using item-specific requirements instead of assuming all returns work the same way.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Tell the customer to package it safely in any box and try the return location.',
        rationale:
          'That may work in some situations, but the advice is incomplete unless the applicable return method and restrictions are verified.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Tell the customer returns are impossible without the original box.',
        rationale:
          'This may incorrectly deny a valid return because it assumes a universal packaging requirement.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Create a refund without requiring the return because the packaging is gone.',
        rationale:
          'Missing retail packaging alone does not justify bypassing required return or refund controls.',
      },
    ],
  ),

  scenario(
    'sjx-04',
    'Customer struggles with the support language',
    'Clarity + inclusion',
    'A customer can communicate in the support language but is struggling to understand long explanations. What should you do?',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Use shorter sentences and one step at a time, confirm understanding, and use any supported language or accessibility options available.',
        rationale:
          'This reduces communication load without sacrificing accuracy and checks whether the customer actually understands each next step.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Repeat the same explanation more slowly.',
        rationale:
          'Slowing down may help, but the structure itself may still be too complex. Breaking the explanation into steps is more useful.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Use more technical language so the explanation is precise.',
        rationale:
          'Precision is not useful if the customer cannot follow the terminology. Simpler language can remain fully accurate.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'End the contact and tell the customer to find someone who speaks better English.',
        rationale:
          'This creates avoidable exclusion and customer effort instead of adapting communication or using supported assistance.',
      },
    ],
  ),

  scenario(
    'sjx-05',
    'Suspicious password-reset request',
    'Security + verification',
    'A caller urgently needs access to an account but cannot complete normal verification and asks you to just send the reset link.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Protect the account, explain that verification cannot be bypassed, and guide the caller through the supported recovery path without revealing protected details.',
        rationale:
          'This maintains the required security boundary while still providing a legitimate recovery path.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Refuse the reset and tell the caller to try again later.',
        rationale:
          'Refusing the unsafe request is correct, but it is incomplete because the caller is not given the proper recovery next step.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Ask for several pieces of personal information and decide yourself whether they sound convincing.',
        rationale:
          'Ad-hoc verification creates inconsistent security and may solicit information outside the approved process.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Send the reset link because the caller knows the recent order number.',
        rationale:
          'Knowing one account detail may not satisfy verification requirements, so bypassing controls creates serious account-security risk.',
      },
    ],
  ),

  scenario(
    'sjx-06',
    'System outage during live contact',
    'Ownership + expectation setting',
    'A tool outage prevents you from completing a customer request. You do not know exactly when the system will recover.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Explain the limitation plainly, complete any safe steps that are still possible, record what is needed, and give the supported follow-up or retry expectation without inventing a recovery time.',
        rationale:
          'This is transparent, preserves useful progress, and avoids an unsupported promise about an outage the agent cannot control.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Apologize and ask the customer to contact support again later.',
        rationale:
          'This is honest, but it puts all recovery effort back on the customer and misses any available documentation or follow-up ownership.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Tell the customer the system should be back in about an hour.',
        rationale:
          'A guessed recovery time creates an expectation that is not supported by known information.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Pretend the request completed so the customer leaves satisfied.',
        rationale:
          'This is dishonest and leaves the customer with an unresolved issue and a false expectation.',
      },
    ],
  ),

  scenario(
    'sjx-07',
    'Replacement item is unavailable',
    'Customer focus + alternatives',
    'A damaged item qualifies for replacement, but the exact item is currently unavailable. What is the best approach?',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Explain the availability issue, verify the valid alternatives such as refund or another supported option, and help the customer choose the best available resolution.',
        rationale:
          'This is transparent and continues working toward the customer goal instead of stopping when the preferred resolution is unavailable.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Tell the customer to wait for the item to return to stock.',
        rationale:
          'Waiting may be acceptable, but it should be an informed customer choice after valid alternatives are explained.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Choose a similar product for the customer without asking.',
        rationale:
          'A substitute may not meet the same need and should not be imposed without customer agreement and process support.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Promise the same item will be available tomorrow.',
        rationale:
          'Inventory timing should not be invented. An unsupported promise can create another service failure.',
      },
    ],
  ),

  scenario(
    'sjx-08',
    'Address mistake after dispatch',
    'Accuracy + realistic options',
    'A customer notices the shipping address is wrong after the package has already been dispatched.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Verify the shipment status and supported address/intercept options, explain what can still be changed and what cannot, then give the safest next step.',
        rationale:
          'This uses the actual shipment state to set realistic expectations instead of assuming an in-transit change is possible.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Tell the customer to contact the carrier directly.',
        rationale:
          'The carrier may eventually be relevant, but support should first verify whether that handoff is actually the correct available path.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Cancel the order immediately even though it has shipped.',
        rationale:
          'Cancellation may no longer be available, so attempting it without checking the shipment state does not solve the actual problem.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Tell the customer the address has been corrected even though the system did not allow a change.',
        rationale:
          'This creates a false expectation and hides the real delivery risk from the customer.',
      },
    ],
  ),

  scenario(
    'sjx-09',
    'Expired promotion request',
    'Trust + policy',
    'A customer says they intended to use a promotion yesterday but forgot, and asks you to apply it after expiry.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Verify the promotion terms and any supported exception path, explain the result clearly, and offer any valid current alternative without promising an exception.',
        rationale:
          'This checks the actual rules, preserves fair treatment, and still searches for a legitimate customer option.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Explain that the promotion expired and end the discussion.',
        rationale:
          'The policy may prevent the request, but the response does not explore any valid alternative or supported exception path.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Create a manual discount of the same value because the customer meant to use it.',
        rationale:
          'Intent alone does not provide authority to create an equivalent discount outside the defined process.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Tell the customer to place the order and promise the discount will be refunded later.',
        rationale:
          'This asks the customer to spend money based on an unsupported future promise.',
      },
    ],
  ),

  scenario(
    'sjx-10',
    'Refund is still pending',
    'Expectation setting + investigation',
    'A refund was processed several days ago, but the customer says the money is not visible yet.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Verify the refund status, amount, method, and processing date, explain the applicable timeline, and use the correct escalation path if that expected window has passed.',
        rationale:
          'This distinguishes a normally processing refund from an actual exception and gives the customer a concrete threshold for the next action.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Tell the customer refunds can take time and ask them to wait longer.',
        rationale:
          'That may be correct, but without checking date and payment method it is too vague to be genuinely useful.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Process a second refund because the first one is taking too long.',
        rationale:
          'Duplicating a refund without proving failure can create over-refund and reconciliation problems.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Tell the customer their bank has lost the refund.',
        rationale:
          'This assigns blame without evidence and skips the investigation needed to determine the real status.',
      },
    ],
  ),

  scenario(
    'sjx-11',
    'Conflicting advice from a previous contact',
    'Trust + ownership',
    'A customer says the previous agent gave instructions that conflict with the current policy you see.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Review available notes, verify the current policy, acknowledge the conflicting experience, explain the accurate next step, and escalate any prior promise through the supported path if needed.',
        rationale:
          'This neither blindly follows the previous advice nor dismisses it. Both the current rule and the customer’s previous experience are investigated.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Explain the current policy and continue without checking the previous notes.',
        rationale:
          'The current policy matters, but ignoring the claimed previous promise can damage trust and miss a valid escalation consideration.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Tell the customer the previous agent was wrong and should not have said that.',
        rationale:
          'Blaming a colleague does not resolve the customer issue and may be premature before the previous interaction is reviewed.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Honor whatever the customer says the previous agent promised.',
        rationale:
          'An unverified claimed promise should not automatically override policy or authority boundaries.',
      },
    ],
  ),

  scenario(
    'sjx-12',
    'Customer threatens a public complaint',
    'De-escalation + consistency',
    'A customer says they will post publicly about the company unless you give them an exception you are not authorized to grant.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Stay calm, acknowledge the frustration, continue with the same verified policy and available options, and use the correct escalation path if the case qualifies.',
        rationale:
          'Public pressure should not change authorization boundaries. The customer still receives a respectful and resolution-focused response.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Tell the customer they are free to post what they want, then repeat the policy.',
        rationale:
          'This preserves the boundary, but the phrasing is dismissive and misses an opportunity to de-escalate.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Offer a small unauthorized concession so they do not post publicly.',
        rationale:
          'Changing treatment because of reputational pressure creates inconsistency and may exceed the agent’s authority.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Argue that their complaint would be unfair and defend the company.',
        rationale:
          'Arguing about whether the customer is fair escalates the interaction and distracts from the actual service problem.',
      },
    ],
  ),

  scenario(
    'sjx-13',
    'High-value item needs extra verification',
    'Risk + customer effort',
    'A customer wants a fast resolution on a high-value item, but the process requires additional verification.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Explain why the additional step is needed in plain language, complete it efficiently, and keep the customer informed about what happens next.',
        rationale:
          'This protects the higher-risk transaction while reducing avoidable uncertainty and delay.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Complete the verification without explaining why it is taking longer.',
        rationale:
          'The control is preserved, but unexplained delay increases customer uncertainty and frustration.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Skip one verification step because the customer has a long account history.',
        rationale:
          'Account history does not automatically replace a required control for a higher-risk action.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Tell the customer you completed the verification when you did not.',
        rationale:
          'Falsifying a required control creates serious security, financial, and integrity risk.',
      },
    ],
  ),

  scenario(
    'sjx-14',
    'Incomplete notes after several contacts',
    'Ownership + documentation',
    'A customer has contacted support several times, but the case notes are incomplete and they are frustrated about repeating the story.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Acknowledge the repeated effort, ask only for the missing facts needed now, reconstruct the timeline from available records, and document the case clearly before another handoff.',
        rationale:
          'This minimizes another full retelling while repairing the documentation problem for the remainder of the resolution.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Ask the customer to explain everything again so you can be certain nothing is missed.',
        rationale:
          'It may produce complete information, but it maximizes customer effort even though some history can be reconstructed internally.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Proceed using only the incomplete notes so the customer does not have to explain anything.',
        rationale:
          'Avoiding necessary clarification can lead to the wrong resolution when important facts are genuinely missing.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Tell the customer the previous agents failed to do their jobs.',
        rationale:
          'Blaming colleagues does not repair missing information and can further damage customer trust.',
      },
    ],
  ),

  scenario(
    'sjx-15',
    'Customer wants verification bypassed',
    'Security + empathy',
    'A customer is angry because they verified themselves on a previous contact and do not want to repeat the required identity checks.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Acknowledge the frustration, explain that the required verification protects the account for this contact, complete it efficiently, and avoid requesting anything beyond the approved process.',
        rationale:
          'This explains the customer benefit while maintaining the required security boundary.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Repeat that verification is mandatory without any explanation.',
        rationale:
          'The security decision is correct, but a brief explanation can reduce friction and increase cooperation.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Ask one easier security question instead of completing the required checks.',
        rationale:
          'Changing verification informally creates inconsistent account protection.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Skip verification because account notes show it was completed during the previous contact.',
        rationale:
          'Prior verification may not satisfy the required control for the current interaction or action.',
      },
    ],
  ),

  scenario(
    'sjx-16',
    'A teammate suggests an unsupported shortcut',
    'Standards + trust',
    'A teammate tells you a shortcut will save time, but you cannot find it in the current process documentation.',
    [
      {
        id: 'a',
        score: 3,
        text:
          'Ask where the shortcut is documented or approved, verify it before using it, and raise the discrepancy through the right channel if the guidance remains unclear.',
        rationale:
          'This respects the teammate while protecting customers and the business from an undocumented process change.',
      },
      {
        id: 'b',
        score: 2,
        text:
          'Keep using the documented process and say nothing about the shortcut.',
        rationale:
          'This avoids immediate customer risk, but it leaves a potentially risky team habit or process mismatch unresolved.',
      },
      {
        id: 'c',
        score: 1,
        text:
          'Use the shortcut only on simple cases to see whether it works.',
        rationale:
          'Testing an unverified process on live customer cases can still create inconsistent outcomes.',
      },
      {
        id: 'd',
        score: 0,
        text:
          'Use the shortcut because an experienced teammate recommended it.',
        rationale:
          'Experience does not replace current approval or documentation for customer-impacting process changes.',
      },
    ],
  ),
]
