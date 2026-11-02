export interface LegacyWard {
  code: string;
  name: string;
  type: string;
  district_code: string;
  province_code: string;
}

export interface LegacyDistrict {
  code: string;
  name: string;
  type: string;
  province_code: string;
}
export interface MergeHistory {
  old_ward_code: string;
  old_district_code: string;
  old_province_code: string;
  new_ward_code: string;
  new_province_code: string;
  scope: string;
}
export interface NewWard {
  code: string;
  name: string;
  type: string;
  province_code: string;
  province_name: string;
}

export interface AddressCandidate {
  oldDistrict: string;
  oldWard: string;
  newWard: string;
  newProvince: string;
  scope: string;
  newWardCode: string;
}
export type AddressConversionResult =
  | {
      status: "exact";
      originalAddress: string;
      candidate: AddressCandidate;
    }
  | {
      status: "check";
      originalAddress: string;
      reason: string;
      candidates: AddressCandidate[];
    }
  | {
      status: "not_found";
      originalAddress: string;
      reason: string;
      candidates: [];
    };

    
