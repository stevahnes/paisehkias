import { NextResponse } from "next/server";
import { GoogleSheetsClient } from "@/lib/sheets/client";
import { HousewarmingAgent } from "@/lib/chat/agent";

const sheetsClient = new GoogleSheetsClient(
  process.env.GOOGLE_SHEETS_ID || "",
  "Gifts!A2:D"
);

const agent = new HousewarmingAgent(sheetsClient);

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await agent.chat(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
