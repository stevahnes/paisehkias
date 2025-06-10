export interface GiftItem {
  id: string;
  name: string;
  quantityNeeded: number;
  quantityReserved: number;
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
