from fastapi import FastAPI, Depends, APIRouter
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, Base, get_db
import math

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware to disable CORS restrictions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Create API router with prefix
api_router = APIRouter(prefix="/api")

# 1) Get Product details by name
# @app.get("/products/{product_name}", response_model=schemas.ProductOut)
# def read_product(product_name: str, db: Session = Depends(get_db)):
#     product = crud.get_product_by_name(db, product_name)
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")
#     return schemas.ProductOut(
#         product_name=product.product_name,
#         component=product.component,
#         discipline_group=product.discipline_group,
#     )

# 2) Get Tests for product by name
@api_router.get("/products/{manual_key}/tests", response_model=list[schemas.TestOut])
def read_tests_for_product(manual_key: str, db: Session = Depends(get_db)):
    tests = crud.get_tests_by_product(db, manual_key)
    return [schemas.TestOut(**test._mapping) for test in tests]

# 3) Get Labs for test by test_method
@api_router.get("/tests/{test_method}/labs", response_model=list[schemas.LabsOut])
def read_labs_for_test(test_method: str, db: Session = Depends(get_db)):
    labs = crud.get_labs_by_test_method(db, test_method)
    return [schemas.LabsOut(**lab._mapping) for lab in labs]

# 4) Get Tests for lab by lab_id
@api_router.get("/labs/{lab_id}/tests", response_model=list[schemas.TestByLabOut])
def read_tests_for_lab(lab_id: str, db: Session = Depends(get_db)):
    tests = crud.get_tests_by_lab_id(db, lab_id)
    return [schemas.TestByLabOut(**test._mapping) for test in tests]

# 5) Get list of all products (key + name from manuals)
@api_router.get("/products/categories", response_model=list[schemas.ProductCategoryOut])
def read_product_categories(db: Session = Depends(get_db)):
    results = crud.get_product_categories(db)
    return [schemas.ProductCategoryOut(**r._mapping) for r in results]


@api_router.get("/products/by-category/{product_key}", response_model=list[schemas.ProductNameOut])
def read_product_names_by_category(product_key: str, db: Session = Depends(get_db)):
    return crud.get_product_names_by_category(db, product_key)



@api_router.get("/products/details/{product_name}", response_model=schemas.ProductDetailOut)
def read_product_details(product_name: str, db: Session = Depends(get_db)):
    product = crud.get_product_details(db, product_name)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return schemas.ProductDetailOut(**product._mapping)



@api_router.get("/enriched-results/", response_model=list[schemas.EnrichedLabResult])
def read_enriched_results(manual: str = "FISH_AND_FISH_PRODUCTS", db: Session = Depends(get_db)):
    return crud.get_enriched_lab_results(db, manual=manual)


# ---------------- Labs ----------------
@api_router.post("/labs/", response_model=schemas.LabOut)
def create_lab(lab: schemas.LabCreate, db: Session = Depends(get_db)):
    return crud.create_lab(db=db, lab=lab)

@api_router.get("/allLabs", response_model=schemas.PaginatedResponse[schemas.LabOut])
def read_labs(skip: int = 0, limit: int = 10, search: str = None, db: Session = Depends(get_db)):
    # Get the labs data
    labs = crud.get_labs(db, skip=skip, limit=limit, search=search)
    
    # Get the total count
    total = crud.get_labs_count(db, search=search)
    
    # Calculate pagination info
    page = (skip // limit) + 1
    total_pages = math.ceil(total / limit) if limit > 0 else 1
    
    # Return paginated response
    return schemas.PaginatedResponse(
        data=labs,
        pagination=schemas.PaginationInfo(
            page=page,
            limit=limit,
            total=total,
            totalPages=total_pages
        )
    )

# ---------------- LabTestRaw ----------------
@api_router.post("/lab-tests-raw/", response_model=schemas.LabTestRawOut)
def create_lab_test_raw(lab_test: schemas.LabTestRawCreate, db: Session = Depends(get_db)):
    return crud.create_lab_test_raw(db=db, lab_test=lab_test)

@api_router.get("/lab-tests-raw/", response_model=list[schemas.LabTestRawOut])
def read_lab_tests_raw(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_lab_tests_raw(db, skip=skip, limit=limit)


# ---------------- LabTestMethodEnriched ----------------
@api_router.post("/lab-test-method-enriched/", response_model=schemas.LabTestMethodEnrichedOut)
def create_lab_test_method_enriched(enriched: schemas.LabTestMethodEnrichedCreate, db: Session = Depends(get_db)):
    return crud.create_lab_test_method_enriched(db=db, enriched=enriched)

@api_router.get("/lab-test-method-enriched/", response_model=list[schemas.LabTestMethodEnrichedOut])
def read_lab_test_methods_enriched(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_lab_test_methods_enriched(db, skip=skip, limit=limit)

# ---------------- Manual ----------------
@api_router.post("/manuals/", response_model=schemas.ManualOut)
def create_manual(manual: schemas.ManualCreate, db: Session = Depends(get_db)):
    return crud.create_manual(db=db, manual=manual)

@api_router.get("/manuals/", response_model=list[schemas.ManualOut])
def read_manuals(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_manuals(db, skip=skip, limit=limit)

# ---------------- TOCEntry ----------------
@api_router.post("/toc-entries/", response_model=schemas.TOCEntryOut)
def create_toc_entry(toc_entry: schemas.TOCEntryCreate, db: Session = Depends(get_db)):
    return crud.create_toc_entry(db=db, toc_entry=toc_entry)

@api_router.get("/toc-entries/", response_model=list[schemas.TOCEntryOut])
def read_toc_entries(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_toc_entries(db, skip=skip, limit=limit)


@api_router.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@api_router.get("/users/", response_model=list[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

# Include the API router in the app
app.include_router(api_router)
