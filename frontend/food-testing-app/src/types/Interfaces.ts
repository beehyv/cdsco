export interface Category {
  product_key: string;
  product_category: string;
}
export interface Test {
  test_method: string;
  method_no: string | null;
  title_method: string;
  manual: string;
  page_no: string | null;
}

export interface BookingState {
    selectedCategory?: Category;
    selectedTests?: Test[];
    // titleMethod?: string;
  }

export interface Lab {
    index: number;
    lab_id: string;
    laboratory_name: string;
    lab_type: string;
    prime_address: string;
    city: string;
    state: string;
    contact_person: string;
    contact_email: string;
    contact_mobile: string;
  }
export interface Labs {
  LabId?: string;
    LaboratoryName?: string;
    Labtype?: string;
    ContactPerson?: string;
    ContactEmail?: string;
    ContactMobile?: string;
    PrimeAddress?: string;
    City?: string;
    State?: string;
    Zone?: number;
    LITypeOfLABbyService?: string;
    LandLine?: string;
    Pin?: number;
    Fax?: string;
    Cert_No?: string;
    Issue_Date?: string;
    ExtendDate?: number;
    ToDate?: string;
    AmendmentDate?: string;
    CertUrl?: number;
    SampleURL?: number;
    disciplineName?: string;
    groupName?: string;
    subGrpName?: string;
    PermanentFacility?: string;
    SiteFacility?: string;
    MobileFacility?: string;
    AdditionalCertificate?: number;
    ScopeURL?: string;
    index?: number;
}

export interface TestByLab {
  test_method?: string;
  method_no?: string;
  title_method?: string;
  manual?: string;
  manual_name?: string;
  page_no?: string;
  discipline_group?: string;
  materials_products?: string;
  component?: string;
}

// Pagination interfaces
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}