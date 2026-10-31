export type AddressMappingResult =
  | {
      status: "matched";
      oldDistrict: string;
      oldWard: string;
      newWard: string;
    }
  | {
      status: "ambiguous";
      candidates: string[];
    }
  | {
      status: "not_found";
    };