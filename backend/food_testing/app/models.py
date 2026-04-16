from sqlalchemy import Column, Integer, String, BigInteger, Float, Text
from .database import Base

class Lab(Base):
    __tablename__ = "labs"

    index = Column(BigInteger, primary_key=True, index=True)
    LabId = Column(String)
    LaboratoryName = Column(String)
    Labtype = Column(String)
    ContactPerson = Column(String)
    ContactEmail = Column(String)
    ContactMobile = Column(String)
    PrimeAddress = Column(String)
    City = Column(String)
    State = Column(String)
    Zone = Column(Float)
    LITypeOfLABbyService = Column(String)
    LandLine = Column(String)
    Pin = Column(Float)
    Fax = Column(String)
    Cert_No = Column(String)
    Issue_Date = Column(String)
    ExtendDate = Column(Float)
    ToDate = Column(String)
    AmendmentDate = Column(String)
    CertUrl = Column(Float)
    SampleURL = Column(Float)
    disciplineName = Column(String)
    groupName = Column(String)
    subGrpName = Column(String)
    PermanentFacility = Column(String)
    SiteFacility = Column(String)
    MobileFacility = Column(String)
    AdditionalCertificate = Column(BigInteger)
    ScopeURL = Column(String)

class LabTestsRaw(Base):
    __tablename__ = "lab_tests_raw"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)  # synthetic PK
    sno = Column(BigInteger)
    index = Column(BigInteger)
    discipline_group = Column(String)
    materials_products = Column(String)
    component = Column(String)
    test_method = Column(String)
    lab_id = Column(String)

class LabTestMethodEnriched(Base):
    __tablename__ = "lab_test_method_enriched"

    id = Column(BigInteger, primary_key=True, index=True)
    test_method = Column(String)
    manual = Column(String)
    page_no = Column(String)
    method_no = Column(String)
    
class Manual(Base):
    __tablename__ = "manuals"

    index = Column(BigInteger, primary_key=True, index=True)
    key = Column(String)
    value = Column(String)

class TOCEntry(Base):
    __tablename__ = "toc_entries"

    index = Column(BigInteger, primary_key=True, index=True)
    sno = Column(BigInteger)
    method_no = Column(String)
    title_method = Column(String)
    page_no = Column(String)
    manual = Column(String)    
       
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
