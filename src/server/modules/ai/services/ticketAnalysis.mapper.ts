import { AnalyzedTicket, TicketAnalysis, TicketCarrier, TicketPayment } from "@/types/ticket.types";
import { boolean } from "zod";
import { SavedTicketAnalysis } from "./analysisRepo";
import { createHash } from "node:crypto";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}


function optionalText(value:unknown):string | null{
    if(typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}

function noramlizeConfidence(value:unknown):number | null{
    return (
        typeof value === "number" && Number.isFinite(value) && value >=0 && value<1
    ) ? value :null;
}

function parseCarrier(value:unknown) :TicketCarrier|null{
    if(!isObject(value)) return null;
    if(typeof value.hasCarrier !== "boolean"){
        return null;
    }
    const name = optionalText(value.name);
    const address = optionalText(value.address);

    if(!value.hasCarrier && (name || address)){
        return null;
    }
    return {
        hasCarrier:value.hasCarrier,
        name,
        address
    }
}

function parsePayment(value:unknown):TicketPayment | null{
    if(!isObject(value)) return null;
    if(value.type !== "cash" && value.type !=="debt" && value.type !== "bank_transfer"){
        return null;
    }
    const amount = optionalText(value.amount);
    if(!amount) return null;
    const defaultLabels = {
        cash:"Thu khách",
        debt:"Công nợ",
        bank_transfer:"CK"
    }
    return {
        type:value.type,
        label: optionalText(value.label) ?? defaultLabels[value.type],
        amount
    }
}

export function mergeTicketAnalysis(regexTicket:AnalyzedTicket, saved :SavedTicketAnalysis | undefined):AnalyzedTicket{
    if(!saved) return regexTicket
    if(saved.ticketId !== regexTicket.id || saved.shipperId !== regexTicket.shipperId){
        return regexTicket
    }
    const currentHash = createHash("sha256").update(regexTicket.content.trim(), "utf8").digest("hex");
    if(saved.contentHash !== currentHash || saved.analysisVersion !== "v1"){
        return regexTicket;
    }
    let ai:unknown;
    try{
        ai = JSON.parse(saved.analysisJson);
        
    }catch{
        return regexTicket
    }

    if(!isObject(ai)) return regexTicket;

    const regex = regexTicket.analysis;
    const aiAddress = optionalText(ai.deliveryAddress);
    const aiConfidence = noramlizeConfidence(ai.addressConfidence)
    const aiCarrier = parseCarrier(ai.carrier);
    const aiPayment = parsePayment(ai.payment);
    const aiInvoiceAddress = optionalText(ai.invoiceAddress);

    const merged:TicketAnalysis={
        deliveryAddress:aiAddress ?? regex.deliveryAddress,
        addressConfidence:aiAddress ? aiConfidence : regex.addressConfidence,
        carrier:aiCarrier ?? regex.carrier,
        payment:aiPayment ?? regex.payment,
        invoiceAddress:aiInvoiceAddress ?? regex.invoiceAddress
    }

    return {
        ...regexTicket,
        analysis:merged
    }
}