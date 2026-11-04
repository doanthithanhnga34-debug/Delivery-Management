export type ShippingCalculationStatus = "matched" | "needs_review" | "not_found" | "not_applicable";
export interface ShippingReportRow{
    ticketId:string;
    createdAt:string;
    content:string;
    actualShippingFee:number;
    calculatedShippingFee:number|null;
    calculationStatus:ShippingCalculationStatus;
    oldDistrict:string|null;
    newWard:string|null;

}

export interface DailyShippingReport{
    shipperName:string;
    date:string;
    totalTickets:number;
    totalActualShippingFee:number;
    totalCalculatedShippingFee:number;
    matchedTickets:number;
    rows:ShippingReportRow[];
}