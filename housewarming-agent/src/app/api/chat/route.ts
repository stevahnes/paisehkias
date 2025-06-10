import { GoogleSheetsClient } from "@/lib/sheets/client";
import { HousewarmingAgent } from "@/lib/chat/agent";

const sheetsClient = new GoogleSheetsClient(
  process.env.GOOGLE_SHEETS_ID || "",
  "Gifts!A2:D"
);

const agent = new HousewarmingAgent(sheetsClient);

export async function POST(request: Request) {
  try {
    const { message, chat_history } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await agent.chat(message, chat_history);

    return new Response(JSON.stringify({ response }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
