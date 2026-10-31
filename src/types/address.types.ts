export type AddressType =
  | "delivery"
  | "carrier"
  | "invoice"
  | "unknown";


export interface OldWardMapping{
    oldDistrict:string;
    oldWard:string;
    newWard:string;

    mappingType:"exact" | "partial"
}

export interface MatchedAddress{
    oldDistrict:string;
    newWard:string;
    source:"new_address" | "old_address";
}

export type AddressMatchResult =
  | {
      status: "matched";
      data: MatchedAddress;
    }
  | {
      status: "ambiguous";
      reason: string;
      candidates: MatchedAddress[];
    }
  | {
      status: "not_found";
      reason: string;
      candidates: [];
    };