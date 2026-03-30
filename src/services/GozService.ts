export interface Message {
  role: "user" | "model";
  text: string;
  options?: string[];
  isMicroAction?: boolean;
}

export class GozService {
  private history: Message[] = [];

  constructor() {
    this.resetConversation();
  }

  async sendMessage(message: string): Promise<Message> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: this.history,
          message,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(async () => ({error: await response.text()}));
        const errorMessage =
          typeof errorPayload?.error === 'string' && errorPayload.error.trim()
            ? errorPayload.error
            : `Chat request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const text = data.text || "I'm processing that pattern...";
      
      const isMicroAction = text.toUpperCase().includes("MICRO-ACTION:");
      let options: string[] | undefined;

      if (text.includes("Which pathway shall we open?")) {
        options = [
          "A) The Life Audit",
          "B) The Hidden Payoff",
          "C) The Neural Simulator",
          "D) The Trigger Tracer",
          "E) The Personal Code"
        ];
      }

      const modelMessage = { role: "model", text, options, isMicroAction } as Message;
      this.history.push({ role: 'user', text: message }, { role: 'model', text });

      return modelMessage;
    } catch (error) {
      console.error("Error communicating with Goz:", error);
      return { role: "model", text: "I encountered a neural glitch. Let's try that again." };
    }
  }

  resetConversation(): Message {
    const initialMessage = this.getInitialMessage();
    this.history = [{role: 'model', text: initialMessage.text}];
    return initialMessage;
  }

  getInitialMessage(): Message {
    return {
      role: "model",
      text: `I am **Goz**. I help you build **Evidence-based self-belief**.

Confidence isn't a feeling; it's a **Ledger of Wins**. Choose a pathway to start logging yours:

*   **A) Life Audit:** Find where your energy is leaking.
*   **B) Hidden Payoff:** Break the cycle of self-sabotage.
*   **C) Neural Simulator:** Practice 'scary' moments in a safe space.
*   **D) Trigger Tracer:** Trace current stress to its old source.
*   **E) Personal Code:** Extract your unique rules for winning.

Which pathway shall we open?`,
      options: [
        "A) The Life Audit",
        "B) The Hidden Payoff",
        "C) The Neural Simulator",
        "D) The Trigger Tracer",
        "E) The Personal Code"
      ]
    };
  }
}
