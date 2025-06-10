export interface GiftItem {
  id: string;
  name: string;
  quantity: number;
  reserved: boolean;
  reservedBy?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "loading";
  content: string;
  timestamp: Date;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
}
