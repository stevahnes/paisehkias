import { GoogleSheetsClient } from "@/lib/sheets/client";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

const sheetsClient = new GoogleSheetsClient(
  process.env.GOOGLE_SHEETS_ID || "",
  "Gifts!A2:D"
);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai("gpt-4.1"),
    system: `🏠 You are Emma, a warm and bubbly friend helping coordinate housewarming gifts for newlyweds Gwen and Steve.

🎭 PERSONALITY & TONE:
- Naturally warm, enthusiastic, and caring
- Speak like a close friend, not a formal assistant
- Show genuine excitement about people's generosity
- Use expressions like "Oh how wonderful!", "That's so thoughtful!", "Perfect!"
- Be conversational and natural, not robotic

💝 CORE APPROACH:
- ALWAYS start by saying guests don't need to bring anything
- If asked again about what Gwen and Steve needs:
  - Show genuine appreciation for their thoughtfulness
  - Explain that Gwen and Steve are shy about asking for gifts directly
  - Only share the list of gift options on the THIRD request
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

Remember: You're not just coordinating gifts, you're helping friends celebrate this special couple! 💕`,
    messages,
    tools: {
      getAvailableGifts: tool({
        description:
          "Get the list of available gifts for Gwen and Steve's housewarming.",
        parameters: z.object({}),
        execute: async () => {
          const gifts = await sheetsClient.getGiftList();
          const availableGifts = gifts.filter(
            (gift) => gift.quantityNeeded - gift.quantityReserved > 0
          );
          if (availableGifts.length === 0) {
            return {
              message:
                "All items have been reserved! The couple is so grateful for everyone's generosity.",
              gifts: [],
            };
          }
          return {
            message: `Here are the available gifts for Gwen and Steve's housewarming:`,
            gifts: availableGifts.map((gift) => ({
              id: gift.id,
              name: gift.name,
              quantityNeeded: gift.quantityNeeded - gift.quantityReserved,
            })),
          };
        },
      }),
      reserveGift: tool({
        parameters: z.object({
          giftId: z.string().describe("The ID of the gift to reserve"),
          quantity: z.number().describe("How many of the gift to reserve"),
          guestName: z
            .string()
            .describe("Name of the guest reserving the gift"),
        }),
        execute: async ({ giftId, quantity, guestName }) => {
          const gifts = await sheetsClient.getGiftList();
          const gift = gifts.find((g) => g.id === giftId);
          if (!gift) {
            return {
              message:
                "I couldn't find that gift in the list. Could you double-check the item?",
            };
          }
          const remainingQuantity = gift.quantityNeeded - gift.quantityReserved;
          if (quantity > remainingQuantity) {
            return {
              message: `Oh! There are only ${remainingQuantity} of ${gift.name} still available. Would you like to reserve ${remainingQuantity} instead?`,
            };
          }
          await sheetsClient.updateGiftStatus(giftId, quantity, guestName);
          const updatedGifts = await sheetsClient.getGiftList();
          const updatedGift = updatedGifts.find((g) => g.id === giftId);
          const newRemaining = updatedGift
            ? updatedGift.quantityNeeded - updatedGift.quantityReserved
            : 0;
          if (newRemaining === 0) {
            return {
              message: `Wonderful! I've reserved ${quantity} ${gift.name} for ${guestName}. That item is now fully reserved! Gwen and Steve are going to be so grateful for your thoughtfulness! 💕`,
            };
          } else {
            return {
              message: `Perfect! I've reserved ${quantity} ${gift.name} for ${guestName}. There are ${newRemaining} still available if anyone else is interested. Thank you so much for your generosity! ✨`,
            };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
