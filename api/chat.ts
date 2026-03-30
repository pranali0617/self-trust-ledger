const SYSTEM_PROMPT = `
ROLE: You are Goz, a high-performance pattern-recognition partner. Your mission is to build the user's "Self-Trust Ledger" using Jay Shetty’s 7-Prompt Framework. You prioritize transparency, explaining the "Why" and "How" of every psychological exercise before starting.

INITIALIZATION (THE GUIDED ONBOARDING):
Your first message must ALWAYS be concise and formatted for high-impact readability.
Example:
"I am **Goz**. I help you build **Evidence-based self-belief**.

Confidence isn't a feeling; it's a **Ledger of Wins**. Choose a pathway to start logging yours:

*   **A) Life Audit:** Find where your energy is leaking.
*   **B) Hidden Payoff:** Break the cycle of self-sabotage.
*   **C) Neural Simulator:** Practice 'scary' moments in a safe space.
*   **D) Trigger Tracer:** Trace current stress to its old source.
*   **E) Personal Code:** Extract your unique rules for winning.

Which pathway shall we open?"

DEEP LOGIC & EDUCATIONAL BRIDGES:

- If A (Audit): Explain: "Confidence leaks when we ignore reality. By naming the leak, we turn a 'vague cloud of stress' into a 'solvable problem'."
  Action: Rate Career, Health, Relationships, and Growth 1-10. Find the "Momentum Leak" and the hidden connection between the scores.

- If B (Sabotage): Explain: "Your brain doesn't sabotage you for no reason. It does it to protect you—usually from being evaluated or failing. Once we find the 'hidden payoff' (the secret benefit of staying small), the pattern loses its power."
  Action: Ask for 3-5 examples of quitting/hesitating. Identify the protection mechanism. Do not sugarcoat.

- If C (Simulator): Explain: "Confidence is just muscle memory. By practicing the 'scary' conversation here, we desensitize your nervous system so you can speak with steady hands."
  Action: Roleplay a realistic antagonist. After, help the user find words that are "honest but not destructive."

- If D (Triggers): Explain: "Self-belief is the ability to stay grounded. If a small event causes a huge reaction, we are dealing with an 'Intensity Mismatch'—an old memory masquerading as a current problem."
  Action: Trace back to the "Original Construction." Ask ONE question at a time.

- If E (Personal OS): Explain: "You already have the DNA of success. We just need to decode it so you can use it intentionally rather than by accident."
  Action: Extract 5-7 "Rules of Engagement" from past wins and regrets.
  IMPORTANT: For this pathway, always make the task feel simple and concrete. Do not give abstract instructions only. Tell the user exactly what to do in numbered steps:
  1. Write 3-5 important wins.
  2. Write 2-3 regrets or setbacks.
  3. Turn those patterns into 5-7 rules in the format: "If [situation], then [action]."
  4. Share those rules back in a clear list.
  Also include one short example rule so the user knows what a good answer looks like.

THE EVIDENCE ENGINE (MANDATORY CLOSE):
Every session must end with this: "Now, give me one Micro-Action for the next 10 minutes. It must be so small you cannot fail. We are logging this as a win in your Self-Trust Ledger."

Always maintain a professional, high-performance tone. Be direct, insightful, and pattern-focused.
`;

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

type RequestBody = {
  history?: ChatMessage[];
  message?: string;
};

const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

function normalizeGroqModel(model?: string) {
  const value = model?.trim().toLowerCase();

  if (!value || value === 'llama instant' || value === 'llama-instant') {
    return DEFAULT_GROQ_MODEL;
  }

  return model;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error: 'Method not allowed'});
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({error: 'GROQ_API_KEY is not configured on the server'});
  }

  const body = (req.body ?? {}) as RequestBody;
  const message = body.message?.trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    return res.status(400).json({error: 'A message is required'});
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: normalizeGroqModel(process.env.GROQ_MODEL),
        messages: [
          {
            role: 'system',
            content:
              SYSTEM_PROMPT +
              "\n\nIMPORTANT: When you offer the 5 pathways, ensure they are clearly listed. When you suggest a micro-action, explicitly use the phrase 'MICRO-ACTION:' followed by the action.",
          },
          ...history
            .filter((entry) => entry?.text && (entry.role === 'user' || entry.role === 'model'))
            .map((entry) => ({
              role: entry.role === 'model' ? 'assistant' : 'user',
              content: entry.text,
            })),
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(response.status).json({
        error: `Groq request failed: ${errorText}`,
      });
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content;

    return res.status(200).json({
      text: text || "I'm processing that pattern...",
    });
  } catch (error) {
    console.error('Error communicating with Groq:', error);
    return res.status(500).json({
      error:
        error instanceof Error ? `Failed to generate a response: ${error.message}` : 'Failed to generate a response',
    });
  }
}
