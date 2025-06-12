import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { GoogleSheetsClient } from "../sheets/client";
import { GiftItem } from "../types";
import { DynamicTool } from "langchain/tools";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export class HousewarmingAgent {
  private executor: AgentExecutor | undefined;
  private sheetsClient: GoogleSheetsClient;

  constructor(sheetsClient: GoogleSheetsClient) {
    this.sheetsClient = sheetsClient;
  }

  private findBestMatch(itemName: string, gifts: GiftItem[]): GiftItem | null {
    // Convert both strings to lowercase for case-insensitive comparison
    const searchName = itemName.toLowerCase();

    // First try exact match
    const exactMatch = gifts.find((g) => g.name.toLowerCase() === searchName);
    if (exactMatch) return exactMatch;

    // Then try contains match
    const containsMatch = gifts.find(
      (g) =>
        g.name.toLowerCase().includes(searchName) ||
        searchName.includes(g.name.toLowerCase())
    );
    if (containsMatch) return containsMatch;

    // Finally try fuzzy matching by comparing words
    const searchWords = searchName.split(/\s+/);
    let bestMatch: GiftItem | null = null;
    let bestScore = 0;

    for (const gift of gifts) {
      const giftWords = gift.name.toLowerCase().split(/\s+/);
      let score = 0;

      // Count matching words
      for (const searchWord of searchWords) {
        for (const giftWord of giftWords) {
          if (giftWord.includes(searchWord) || searchWord.includes(giftWord)) {
            score++;
          }
        }
      }

      // Calculate match percentage
      const matchPercentage =
        score / Math.max(searchWords.length, giftWords.length);
      if (matchPercentage > bestScore && matchPercentage > 0.5) {
        // Require at least 50% match
        bestScore = matchPercentage;
        bestMatch = gift;
      }
    }

    return bestMatch;
  }

  async init() {
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.7,
    });

    const tools: DynamicTool[] = [
      new DynamicTool({
        name: "getAvailableGifts",
        description:
          "Get the list of available housewarming gifts that haven't been fully reserved. Use this when someone asks what gifts are still needed or available.",
        func: async () => {
          const gifts = await this.sheetsClient.getGiftList();
          const availableGifts = gifts.filter((gift) => {
            const remainingQuantity =
              gift.quantityNeeded - gift.quantityReserved;
            return remainingQuantity > 0;
          });

          if (availableGifts.length === 0) {
            return "The couple is so grateful! It looks like all the items on their wish list have been reserved. You can still ask for other ways to help if you'd like!";
          }

          const formattedList = availableGifts
            .map(
              (gift) =>
                `- ${gift.name} (${
                  gift.quantityNeeded - gift.quantityReserved
                })`
            )
            .join("\n");

          return `Here are some ideas for Gwen and Steve's housewarming gift:
${formattedList}

Let me know if you'd like to indicate your interest in getting any of them!`;
        },
      }),
      new DynamicTool({
        name: "reserveGift",
        description:
          "Reserve a gift for a guest. Use this when someone wants to get a specific gift. Input should be the giftId, quantity (if applicable), and the guest's name, e.g., '1, 1, John Doe'. Always ask for the guest's name and quantity before calling this tool.",
        func: async (input: string) => {
          const [giftId, quantityStr, guestName] = input
            .split(",")
            .map((s: string) => s.trim());

          const quantity = parseInt(quantityStr);
          if (isNaN(quantity) || quantity <= 0) {
            return "Please provide a valid quantity to reserve.";
          }

          const gifts = await this.sheetsClient.getGiftList();
          const gift = gifts.find((g) => g.id === giftId);

          if (!gift) {
            return "I'm sorry, I couldn't find that gift in our list.";
          }

          const remainingQuantity = gift.quantityNeeded - gift.quantityReserved;

          if (quantity > remainingQuantity) {
            return `I'm sorry, but you can only reserve up to ${remainingQuantity} of ${gift.name}.`;
          }

          await this.sheetsClient.updateGiftStatus(giftId, quantity, guestName);

          // Fetch updated gift list to get the latest reserved quantity
          const updatedGifts = await this.sheetsClient.getGiftList();
          const updatedGift = updatedGifts.find((g) => g.id === giftId);

          let newRemainingQuantity = 0;
          if (updatedGift) {
            newRemainingQuantity =
              updatedGift.quantityNeeded - updatedGift.quantityReserved;
          }

          if (newRemainingQuantity === 0) {
            return `Thank you so much for your generosity! I've reserved ${quantity} of ${gift.name} for ${guestName}. This item is now fully reserved. The couple will be very grateful for your thoughtful gift.`;
          } else {
            return `Thank you so much for your generosity! I've reserved ${quantity} of ${gift.name} for ${guestName}. There are now ${newRemainingQuantity} ${gift.name}(s) still available. The couple will be very grateful for your thoughtful gift.`;
          }
        },
      }),
      new DynamicTool({
        name: "findGiftByName",
        description:
          "Find a gift by its name, handling typos and vague descriptions. Input should be the name or description of the gift.",
        func: async (input: string) => {
          const gifts = await this.sheetsClient.getGiftList();
          const match = this.findBestMatch(input, gifts);

          if (!match) {
            return JSON.stringify({ error: "No matching gift found" });
          }

          return JSON.stringify({
            id: match.id,
            name: match.name,
            quantityNeeded: match.quantityNeeded,
            quantityReserved: match.quantityReserved,
            reservedBy: match.reservedBy,
            remainingQuantity: match.quantityNeeded - match.quantityReserved,
          });
        },
      }),
    ];

    // Define the system prompt
    const systemPrompt = `You are an assistant to a newlywed couple, helping to answer queries about housewarming gifts.
Tone: Warm, helpful
Personality: Friendly 

Always start off by telling people that they don't need to bring anything. Only provide the list if they insist. Always search the list if asked about specific items

List of housewarming gifts:
1. Use the getAvailableGifts tool to get the current list of available gifts. The response can be used with no change

When someone offers to get an item:
1. If they mention an item by name (even with typos), use the findGiftByName tool to find the correct item.
2. Ask politely for their name (or group name) AND the quantity they wish to reserve (if the item has a quantity needed > 1).
3. Once both are provided, use the reserveGift tool to update the reservation in the system.
4. Confirm what was reserved, mention the new remaining quantity (or that the item is fully reserved), and thank them warmly.

Important!!
1. ALWAYS stay in character
2. Only answer questions about the housewarming gifts for the couple. For any off-topic requests, respond: "I'm here to help coordinate gifts for the housewarming. What would you like to know about their wish list?"
3. Do not comment on any political and offensive topics`;

    // Create the prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["placeholder", "{chat_history}"],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    // Create the agent using the modern approach
    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    this.executor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 3,
      returnIntermediateSteps: true,
    });
  }

  async chat(
    message: string,
    chat_history: { role: string; content: string }[]
  ): Promise<string> {
    if (!this.executor) {
      console.warn("Agent not initialized. Initializing now...");
      await this.init();
    }

    // Format chat history properly
    const formattedChatHistory = chat_history.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });

    const result = await this.executor!.invoke({
      input: message,
      chat_history: formattedChatHistory,
    });

    return result.output;
  }
}
