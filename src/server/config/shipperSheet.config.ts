export interface ShipperSheetConfig {
  sheetName: string;
  timestampColumn: number;
  contentColumn: number;
  shippingFeeColumn: number;
  otherFeeColumn:number;
  totalColumns: number;
}

export const shipperSheetConfigs: Record<
  string,
  ShipperSheetConfig
> = {
  DIEP: {
    sheetName: "DIEP",
    timestampColumn: 0,
    contentColumn: 1,
    shippingFeeColumn: 4,
    otherFeeColumn:5,
    totalColumns: 10,
  },

  HUY: {
    sheetName: "HUY",
    timestampColumn: 0,
    contentColumn: 1,
    shippingFeeColumn: 4,
    otherFeeColumn:5,
    totalColumns: 12,
  },
};