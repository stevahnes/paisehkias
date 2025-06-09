import { ChatOpenAI } from "@langchain/openai";
import {
  initializeAgentExecutorWithOptions,
  AgentExecutor,
} from "langchain/agents";
import { GoogleSheetsClient } from "../sheets/client";
import { GiftItem } from "../types";
import { DynamicTool } from "langchain/tools";

export class HousewarmingAgent {
  private executor: AgentExecutor | undefined;
  private sheetsClient: GoogleSheetsClient;

  constructor(sheetsClient: GoogleSheetsClient) {
    this.sheetsClient = sheetsClient;
  }

  async init() {
    const model = new ChatOpenAI({
      modelName: "gpt-4.1-mini",
      temperature: 0.7,
    });

    const tools: DynamicTool[] = [
      new DynamicTool({
        name: "getGiftList",
        description: "Get the list of available housewarming gifts.",
        func: async () => {
          const gifts = await this.sheetsClient.getGiftList();
          return JSON.stringify(gifts);
        },
      }),
      new DynamicTool({
        name: "reserveGift",
        description:
          "Reserve a gift for a guest. Input should be the giftId and the guest's name, e.g., '1, John Doe'",
        func: async (input: string) => {
          const [giftId, guestName] = input
            .split(",")
            .map((s: string) => s.trim());
          await this.sheetsClient.updateGiftStatus(giftId, true, guestName);
          return `Gift ${giftId} has been reserved for ${guestName}`;
        },
      }),
    ];

    this.executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "chat-conversational-react-description",
      verbose: true,
    });
  }

  async chat(message: string): Promise<string> {
    try {
      if (!this.executor) {
        console.warn("Agent not initialized. Initializing now...");
        await this.init();
      }
      const result = await this.executor!.call({
        input: message,
      });

      return result.output;
    } catch (error) {
      console.error("Error in chat:", error);
      return "I apologize, but I encountered an error. Please try again.";
    }
  }
}
