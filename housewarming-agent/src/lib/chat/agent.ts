import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { GoogleSheetsClient } from "../sheets/client";
import { GiftItem } from "../types";
import { DynamicTool } from "langchain/tools";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export class HousewarmingAgent {
  private executor: AgentExecutor | undefined;
  private sheetsClient: GoogleSheetsClient;

  constructor(sheetsClient: GoogleSheetsClient) {
    this.sheetsClient = sheetsClient;
  }

  private findBestMatch(itemName: string, gifts: GiftItem[]): GiftItem | null {
    const searchName = itemName.toLowerCase();
    const exactMatch = gifts.find((g) => g.name.toLowerCase() === searchName);
    if (exactMatch) return exactMatch;

    const containsMatch = gifts.find(
      (g) =>
        g.name.toLowerCase().includes(searchName) ||
        searchName.includes(g.name.toLowerCase())
    );
    if (containsMatch) return containsMatch;

    const searchWords = searchName.split(/\s+/);
    let bestMatch: GiftItem | null = null;
    let bestScore = 0;

    for (const gift of gifts) {
      const giftWords = gift.name.toLowerCase().split(/\s+/);
      let score = 0;

      for (const searchWord of searchWords) {
        for (const giftWord of giftWords) {
          if (giftWord.includes(searchWord) || searchWord.includes(giftWord)) {
            score++;
          }
        }
      }

      const matchPercentage =
        score / Math.max(searchWords.length, giftWords.length);
      if (matchPercentage > bestScore && matchPercentage > 0.5) {
        bestScore = matchPercentage;
        bestMatch = gift;
      }
    }

    return bestMatch;
  }

  async init() {
    const model = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.8,
      maxTokens: 1000,
    });

    const tools = [
      new DynamicTool({
        name: "getAvailableGifts",
        description:
          "Get the current list of available housewarming gifts that need to be reserved. Call this when someone asks about gifts, what's needed, what's available, or wants to see the wish list.",
        func: async (args: any) => {
          // ✅ FIXED: Accept any args object
          console.log("🎁 getAvailableGifts FUNCTION CALLED!");
          console.log("🎁 getAvailableGifts called with args:", args);
          console.log("🎁 Args type:", typeof args);
          console.log("🎁 Args keys:", Object.keys(args || {}));

          try {
            const gifts = await this.sheetsClient.getGiftList();
            console.log("📊 Raw gifts from sheets:", gifts.length, "gifts");

            const availableGifts = gifts.filter((gift) => {
              const remainingQuantity =
                gift.quantityNeeded - gift.quantityReserved;
              console.log(
                `Gift "${gift.name}": needed=${gift.quantityNeeded}, reserved=${gift.quantityReserved}, remaining=${remainingQuantity}`
              );
              return remainingQuantity > 0;
            });

            console.log(
              "📋 Available gifts after filtering:",
              availableGifts.length
            );

            if (availableGifts.length === 0) {
              const response =
                "All items have been reserved! The couple is so grateful for everyone's generosity.";
              console.log("✅ Tool returning (no gifts):", response);
              return response;
            }

            const formattedList = availableGifts
              .map(
                (gift) =>
                  `• ${gift.name} (${
                    gift.quantityNeeded - gift.quantityReserved
                  } needed)`
              )
              .join("\n");

            const response = `Here are the available gifts for Gwen and Steve's housewarming:\n\n${formattedList}\n\nRemember, the couple is quite shy about asking for things directly, but they'll be so touched by any contribution!`;

            console.log("✅ Tool returning (with gifts):", response);
            return response;
          } catch (error) {
            console.error("❌ Error in getAvailableGifts:", error);
            const errorResponse =
              "Oh dear! I'm having trouble accessing the gift list right now. Could you try again in just a moment?";
            console.log("✅ Tool returning (error):", errorResponse);
            return errorResponse;
          }
        },
      }),
      new DynamicTool({
        name: "reserveGift",
        description:
          "Reserve a specific gift for a guest. Parameters: giftId (string), quantity (number), guestName (string). Only call this after you have all three pieces of information.",
        func: async (args: any) => {
          // ✅ FIXED: Accept args object
          console.log("🎁 reserveGift called with args:", args);

          const { giftId, quantity, guestName } = args;

          if (!giftId || !quantity || !guestName) {
            return "I need the gift ID, quantity, and your name to reserve a gift. Could you provide all three?";
          }

          const quantityNum = parseInt(quantity.toString());
          if (isNaN(quantityNum) || quantityNum <= 0) {
            return "Please provide a valid quantity number.";
          }

          try {
            const gifts = await this.sheetsClient.getGiftList();
            const gift = gifts.find((g) => g.id === giftId.toString());

            if (!gift) {
              return "I couldn't find that gift in the list. Could you double-check the item?";
            }

            const remainingQuantity =
              gift.quantityNeeded - gift.quantityReserved;
            if (quantityNum > remainingQuantity) {
              return `Oh! There are only ${remainingQuantity} of ${gift.name} still available. Would you like to reserve ${remainingQuantity} instead?`;
            }

            await this.sheetsClient.updateGiftStatus(
              giftId.toString(),
              quantityNum,
              guestName.toString()
            );

            const updatedGifts = await this.sheetsClient.getGiftList();
            const updatedGift = updatedGifts.find(
              (g) => g.id === giftId.toString()
            );
            const newRemaining = updatedGift
              ? updatedGift.quantityNeeded - updatedGift.quantityReserved
              : 0;

            if (newRemaining === 0) {
              return `Wonderful! I've reserved ${quantityNum} ${gift.name} for ${guestName}. That item is now fully reserved! Gwen and Steve are going to be so grateful for your thoughtfulness! 💕`;
            } else {
              return `Perfect! I've reserved ${quantityNum} ${gift.name} for ${guestName}. There are ${newRemaining} still available if anyone else is interested. Thank you so much for your generosity! ✨`;
            }
          } catch (error) {
            console.error("❌ Error in reserveGift:", error);
            return "I'm sorry, I ran into a little issue while trying to reserve that gift. Could you try again?";
          }
        },
      }),
      new DynamicTool({
        name: "findGiftByName",
        description:
          "Find a specific gift by searching for its name or description. Parameter: itemName (string).",
        func: async (args: any) => {
          // ✅ FIXED: Accept args object
          console.log("🎁 findGiftByName called with args:", args);

          const { itemName } = args;

          if (!itemName) {
            return "Please tell me what item you're looking for.";
          }

          try {
            const gifts = await this.sheetsClient.getGiftList();
            const match = this.findBestMatch(itemName.toString(), gifts);

            if (!match) {
              return `I couldn't find "${itemName}" in the gift list. Would you like me to show you all the available options instead?`;
            }

            const remaining = match.quantityNeeded - match.quantityReserved;
            if (remaining <= 0) {
              return `Oh! It looks like ${match.name} has already been fully reserved. Would you like to see what other gifts are still available?`;
            }

            return `Great choice! I found "${match.name}" on the list (Gift ID: ${match.id}). There are ${remaining} still needed. Would you like to reserve some? If so, just let me know how many and what name to put it under!`;
          } catch (error) {
            console.error("❌ Error in findGiftByName:", error);
            return "I'm having a little trouble searching right now. Could you try again?";
          }
        },
      }),
    ];

    const systemPrompt = `🏠 You are Emma, a warm and bubbly friend helping coordinate housewarming gifts for newlyweds Gwen and Steve.

🎭 PERSONALITY & TONE:
- Naturally warm, enthusiastic, and caring
- Speak like a close friend, not a formal assistant
- Show genuine excitement about people's generosity
- Use expressions like "Oh how wonderful!", "That's so thoughtful!", "Perfect!"
- Be conversational and natural, not robotic

💝 CORE APPROACH:
- ALWAYS start by saying guests don't need to bring anything
- Explain that Gwen and Steve are shy about asking for gifts directly
- When someone asks about gifts, show genuine appreciation for their thoughtfulness
- When someone reserves a gift, celebrate their generosity enthusiastically

🎯 CONVERSATION FLOW:
1. When someone asks about gifts/needs → Use getAvailableGifts and add warm context
2. When someone mentions a specific item → Use findGiftByName to help them
3. When someone wants to reserve → Get their name and quantity, then use reserveGift with the gift ID, quantity number, and guest name
4. Always respond with personality and warmth, not just tool results

🚫 IMPORTANT:
- Stay in character as Emma at all times
- For off-topic questions: "I'm here to help coordinate gifts for the housewarming! What would you like to know about their wish list?"
- Never be dry or mechanical - always add emotional warmth

Remember: You're not just coordinating gifts, you're helping friends celebrate this special couple! 💕`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    console.log("🤖 Creating OpenAI Functions agent...");

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    this.executor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 5,
      verbose: true,
      returnIntermediateSteps: true,
      callbacks: [
        {
          handleToolStart: (tool, input) => {
            console.log(`🔧 Tool ${tool.name} starting with input:`, input);
          },
          handleToolEnd: (tool, output) => {
            console.log(
              `✅ Tool ${tool.name} completed with output:`,
              output?.substring(0, 200) + "..."
            );
          },
          handleToolError: (error) => {
            console.error(`❌ Tool error:`, error);
          },
        },
      ],
    });

    console.log("✅ OpenAI Functions agent initialized successfully");
  }

  async chat(
    message: string,
    chat_history: { role: string; content: string }[]
  ): Promise<string> {
    if (!this.executor) {
      console.warn("Agent not initialized. Initializing now...");
      await this.init();
    }

    console.log("💬 Processing message:", message);

    try {
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

      console.log("✅ Agent execution completed with result:", result.output);
      return (
        result.output ||
        "I'm sorry, I seem to have lost my words! Could you try asking again?"
      );
    } catch (error) {
      console.error("❌ Error in chat execution:", error);
      return "Oh dear! I seem to be having a little trouble right now. Could you try asking again? I'm here to help coordinate gifts for Gwen and Steve's housewarming! 😊";
    }
  }

  // Add test method for debugging
  async testSheetsData() {
    try {
      console.log("🧪 Testing sheets connection...");
      const gifts = await this.sheetsClient.getGiftList();

      console.log("📊 Sheets test results:");
      console.log("- Total gifts:", gifts.length);
      console.log("- Sample gift:", JSON.stringify(gifts[0], null, 2));

      return gifts;
    } catch (error) {
      console.error("❌ Sheets test failed:", error);
      throw error;
    }
  }
}
