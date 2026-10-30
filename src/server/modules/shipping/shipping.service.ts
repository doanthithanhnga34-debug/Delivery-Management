import { ShippingRate } from "./shipping.repository";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/^phuong\s+|^xa\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function calculateShippingFee(district:string, ward:string, rates:ShippingRate[]):number | null{
    const normalizeDistrict = normalize(district);
    const normalizeWard = normalize(ward);
    const matches = rates.filter((rate) => normalize(rate.district) === normalizeDistrict && normalize(rate.ward) === normalizeWard)
    if(matches.length === 0) return null;

    const uniqueFees =[...new Set(matches.map((r)=> r.fee))];
    return uniqueFees.length === 1 ? uniqueFees[0]:null
}