export interface GiftItem {
  id: string;
  name: string;
  quantityNeeded: number;
  quantityReserved: number;
  reservedBy?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
}
