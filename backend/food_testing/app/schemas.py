from pydantic import BaseModel
from typing import Optional, List, Generic, TypeVar

# Generic type for paginated responses
T = TypeVar('T')

# --- Product Schema ---
class ProductOut(BaseModel):
    product_name: str
    component: Optional[str] = None
    discipline_group: Optional[str] = None

    class Config:
        orm_mode = True

# --- Test Schema ---
class TestOut(BaseModel):
    test_method: Optional[str] = None
    method_no: Optional[str] = None
    title_method: Optional[str] = None
    manual: Optional[str] = None
    page_no: Optional[str] = None

    class Config:
        orm_mode = True

# --- Test by Lab ID Schema ---
class TestByLabOut(BaseModel):
    test_method: Optional[str] = None
    method_no: Optional[str] = None
    title_method: Optional[str] = None
    manual: Optional[str] = None
    manual_name: Optional[str] = None
    page_no: Optional[str] = None
    discipline_group: Optional[str] = None
    materials_products: Optional[str] = None
    component: Optional[str] = None

    class Config:
        orm_mode = True

# --- Lab Schema ---
class LabsOut(BaseModel):
    index: Optional[int] = None
    lab_id: Optional[str] = None
    laboratory_name: Optional[str] = None
    lab_type: Optional[str] = None
    prime_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_mobile: Optional[str] = None

    class Config:
        orm_mode = True
        

class ProductCategoryOut(BaseModel):
    product_key: str
    product_category: str
    class Config: 
        orm_mode = True


class ProductNameOut(BaseModel):
    product_key: str
    product_name: str

    class Config:
        orm_mode = True



class ProductDetailOut(BaseModel):
    product_name: str
    component: str | None = None
    discipline_group: str | None = None
    groupName: str | None = None
    subGrpName: str | None = None

    class Config:
        orm_mode = True


class EnrichedLabResult(BaseModel):
    method_no: str
    title_method: str | None = None

    lab_id: str | None = None
    laboratory_name: str | None = None
    labtype: str | None = None
    prime_address: str | None = None
    city: str | None = None
    state: str | None = None

    class Config:
        orm_mode = True
    
# ---------------- Lab ----------------
class LabBase(BaseModel):
    LabId: str | None = None
    LaboratoryName: str | None = None
    Labtype: str | None = None
    ContactPerson: str | None = None
    ContactEmail: str | None = None
    ContactMobile: str | None = None
    PrimeAddress: str | None = None
    City: str | None = None
    State: str | None = None
    Zone: float | None = None
    LITypeOfLABbyService: str | None = None
    LandLine: str | None = None
    Pin: float | None = None
    Fax: str | None = None
    Cert_No: str | None = None
    Issue_Date: str | None = None
    ExtendDate: float | None = None
    ToDate: str | None = None
    AmendmentDate: str | None = None
    CertUrl: float | None = None
    SampleURL: float | None = None
    disciplineName: str | None = None
    groupName: str | None = None
    subGrpName: str | None = None
    PermanentFacility: str | None = None
    SiteFacility: str | None = None
    MobileFacility: str | None = None
    AdditionalCertificate: int | None = None
    ScopeURL: str | None = None

class LabCreate(LabBase):
    pass

class LabOut(LabBase):
    index: int

    class Config:
        orm_mode = True

# ---------------- LabTestRaw ----------------
class LabTestRawBase(BaseModel):
    sno: int | None = None
    discipline_group: str | None = None
    materials_products: str | None = None
    component: str | None = None
    test_method: str | None = None
    lab_id: str | None = None

class LabTestRawCreate(LabTestRawBase):
    pass

class LabTestRawOut(LabTestRawBase):
    index: int

    class Config:
        orm_mode = True


# ---------------- LabTestMethodEnriched ----------------
class LabTestMethodEnrichedBase(BaseModel):
    test_method: str | None = None
    manual: str | None = None
    page_no: str | None = None
    method_no: str | None = None

class LabTestMethodEnrichedCreate(LabTestMethodEnrichedBase):
    pass

class LabTestMethodEnrichedOut(LabTestMethodEnrichedBase):
    id: int

    class Config:
        orm_mode = True

# ---------------- Manual ----------------
class ManualBase(BaseModel):
    key: str | None = None
    value: str | None = None

class ManualCreate(ManualBase):
    pass

class ManualOut(ManualBase):
    index: int

    class Config:
        orm_mode = True

# ---------------- TOCEntry ----------------
class TOCEntryBase(BaseModel):
    sno: int | None = None
    method_no: str | None = None
    title_method: str | None = None
    page_no: str | None = None
    manual: str | None = None

class TOCEntryCreate(TOCEntryBase):
    pass

class TOCEntryOut(TOCEntryBase):
    index: int

    class Config:
        orm_mode = True



        
# ---------------- User------------------
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True

# ---------------- Pagination ----------------
class PaginationInfo(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationInfo
