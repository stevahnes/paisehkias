import { google } from "googleapis";
import { GiftItem } from "../types";

export class GoogleSheetsClient {
  private sheets;
  private spreadsheetId: string;
  private range: string;

  constructor(spreadsheetId: string, range: string) {
    this.spreadsheetId = spreadsheetId;
    this.range = range;

    // Initialize the Google Sheets API client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
  }

  async getGiftList(): Promise<GiftItem[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.range,
      });

      const rows = response.data.values;
      if (!rows) return [];

      return rows.map((row, index) => ({
        id: index.toString(),
        name: row[0] || "",
        quantity: parseInt(row[1] || "0"),
        reserved: row[2]?.toLowerCase() === "yes",
        reservedBy: row[3] || undefined,
      }));
    } catch (error) {
      console.error("Error fetching gift list:", error);
      throw error;
    }
  }

  async updateGiftStatus(
    giftId: string,
    reserved: boolean,
    reservedBy?: string
  ): Promise<void> {
    try {
      const rowIndex = parseInt(giftId) + 1; // Adding 1 because sheets are 1-indexed
      const range = `${this.range}!C${rowIndex}:D${rowIndex}`;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [[reserved ? "Yes" : "No", reservedBy || ""]],
        },
      });
    } catch (error) {
      console.error("Error updating gift status:", error);
      throw error;
    }
  }
}
