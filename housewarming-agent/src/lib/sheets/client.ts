import { google } from "googleapis";
import { GiftItem } from "../types";

export class GoogleSheetsClient {
  private sheets;
  private spreadsheetId: string;
  private sheetName: string;
  private fullRange: string;

  constructor(spreadsheetId: string, range: string) {
    this.spreadsheetId = spreadsheetId;
    this.fullRange = range;
    this.sheetName = range.split("!")[0];

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
        range: this.fullRange,
      });

      const rows = response.data.values;
      if (!rows) return [];

      return rows.map((row, index) => ({
        id: index.toString(),
        name: row[0] || "",
        quantityNeeded: parseInt(row[1] || "0"),
        quantityReserved: parseInt(row[2] || "0"),
        reservedBy: row[3] || undefined,
      }));
    } catch (error) {
      console.error("Error fetching gift list:", error);
      throw error;
    }
  }

  async updateGiftStatus(
    giftId: string,
    quantityToReserve: number,
    guestName: string
  ): Promise<void> {
    try {
      const rowIndex = parseInt(giftId) + 2;
      const rangeToGet = `${this.sheetName}!B${rowIndex}:D${rowIndex}`;

      console.log(
        `[updateGiftStatus] Fetching current data from range: ${rangeToGet}`
      );

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: rangeToGet,
      });

      const row = response.data.values ? response.data.values[0] : [];
      const currentQuantityNeeded = parseInt(row[0] || "0");
      const currentReservedQuantity = parseInt(row[1] || "0");
      let currentReservedBy = row[2] || "";

      console.log(
        `[updateGiftStatus] Current data: Quantity Needed: ${currentQuantityNeeded}, Reserved: ${currentReservedQuantity}, Reserved By: ${currentReservedBy}`
      );

      const newReservedQuantity = currentReservedQuantity + quantityToReserve;

      // Update Reserved By column
      if (currentReservedBy) {
        const entries = currentReservedBy.split(", ").map((entry: string) => {
          const match = entry.match(/^(.*?)\s*\((\d+)\)$/);
          if (match && match[1] === guestName) {
            return `${guestName} (${parseInt(match[2]) + quantityToReserve})`;
          } else if (
            match &&
            match[1].toLowerCase() === guestName.toLowerCase()
          ) {
            // Case-insensitive match for existing name
            return `${match[1]} (${parseInt(match[2]) + quantityToReserve})`;
          }
          return entry;
        });
        if (!entries.some((entry: string) => entry.includes(guestName))) {
          currentReservedBy += `, ${guestName} (${quantityToReserve})`;
        } else {
          currentReservedBy = entries.join(", ");
        }
      } else {
        currentReservedBy = `${guestName} (${quantityToReserve})`;
      }

      console.log(
        `[updateGiftStatus] New values to write: Reserved Quantity: ${newReservedQuantity}, Reserved By: ${currentReservedBy}`
      );
      const rangeToUpdate = `${this.sheetName}!C${rowIndex}:D${rowIndex}`;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: rangeToUpdate,
        valueInputOption: "RAW",
        requestBody: {
          values: [[newReservedQuantity, currentReservedBy]],
        },
      });
      console.log(
        `[updateGiftStatus] Sheet update successful for giftId: ${giftId}`
      );
    } catch (error) {
      console.error("Error updating gift status:", error);
      throw error;
    }
  }
}
