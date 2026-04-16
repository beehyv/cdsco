from sqlalchemy import text
from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy import distinct,literal,func

# 1. Get product details by name
# def get_product_by_name(db: Session, product_name: str):
#     return (
#         db.query(
#             models.LabTestsRaw.materials_products.label("product_name"),
#             models.LabTestsRaw.component,
#             models.LabTestsRaw.discipline_group,
#         )
#         .filter(models.LabTestsRaw.materials_products.ilike(f"%{product_name}%"))
#         .distinct()
#         .first()
#     )

# 2. Get tests for a given product
# def get_tests_by_product(db: Session, product_name: str):
#     return (
#         db.query(
#             models.LabTestsRaw.test_method,
#             models.LabTestMethodEnriched.method_no,
#             models.TOCEntry.title_method,
#             models.LabTestMethodEnriched.manual,
#             models.LabTestMethodEnriched.page_no,
#         )
#         .join(
#             models.LabTestMethodEnriched,
#             models.LabTestsRaw.test_method == models.LabTestMethodEnriched.test_method,
#         )
#         .join(
#             models.TOCEntry,
#             models.TOCEntry.method_no.like(
#                 func.concat('%', models.LabTestMethodEnriched.method_no, '%')))
#         .filter(models.LabTestsRaw.materials_products.ilike(f"%{product_name}%"))
#         .distinct(models.TOCEntry.method_no,models.TOCEntry.title_method)
#         .all()
#     )

def get_tests_by_product(db: Session, manual_key: str):
    return (
        db.query(
            models.LabTestsRaw.test_method,
            models.LabTestMethodEnriched.method_no,
            models.TOCEntry.title_method,
            models.LabTestMethodEnriched.manual,
            models.LabTestMethodEnriched.page_no,
        )
        .join(
            models.LabTestMethodEnriched,
            models.LabTestsRaw.test_method == models.LabTestMethodEnriched.test_method,
        )
        .join(
            models.TOCEntry,
            models.TOCEntry.method_no.like(
                func.concat('%', models.LabTestMethodEnriched.method_no, '%')))
        .filter(models.LabTestMethodEnriched.manual==manual_key)
        .distinct(models.TOCEntry.method_no,models.TOCEntry.title_method)
        .all()
    )

# 3. Get labs supporting a given test
def get_labs_by_test_method(db: Session, title_method: str):
    # Build "enriched" = manuals ⟶ lab_test_method_enriched
    enriched = (
        db.query(
            models.LabTestMethodEnriched.test_method.label("test_method"),
            models.LabTestMethodEnriched.method_no.label("method_no"),
            models.LabTestMethodEnriched.manual.label("manual"),
            models.LabTestMethodEnriched.page_no.label("page_no"),
            models.Manual.key.label("manual_key"),
            models.Manual.value.label("manual_name"),
        )
        .join(
            models.Manual,
            models.Manual.key == models.LabTestMethodEnriched.manual,
            isouter=False,  # inner join = same as RIGHT JOIN here since manuals is base
        )
        .filter(models.LabTestMethodEnriched.method_no.isnot(None))
        .subquery()
    )

    # Build "source" = LabTestsRaw ⟶ enriched
    source = (
        db.query(
            models.LabTestsRaw.lab_id.label("lab_id"),
            models.LabTestsRaw.test_method.label("test_method"),
            enriched.c.method_no,
            enriched.c.manual,
            enriched.c.page_no,
            enriched.c.manual_name,
        )
        .join(enriched, enriched.c.test_method == models.LabTestsRaw.test_method)
        .subquery()
    )

    # Final query anchored on TOCEntry
    return (
        db.query(
            models.TOCEntry.method_no,
            models.TOCEntry.title_method,
            models.Lab.LabId.label("lab_id"),
            models.Lab.LaboratoryName.label("laboratory_name"),
            models.Lab.Labtype.label("lab_type"),
            models.Lab.PrimeAddress.label("prime_address"),
            models.Lab.City.label("city"),
            models.Lab.State.label("state"),
            models.Lab.ContactPerson.label("contact_person"),
            models.Lab.ContactEmail.label("contact_email"),
            models.Lab.ContactMobile.label("contact_mobile"),
            source.c.manual,
            source.c.page_no,
            source.c.manual_name,
        )
        # LEFT JOIN source (LIKE on method_no)
        .outerjoin(
            source,
            models.TOCEntry.method_no.like(
                func.concat('%', source.c.method_no, '%')
            ),
        )
        # LEFT JOIN labs
        .outerjoin(models.Lab, source.c.lab_id == models.Lab.LabId)
        # Filter by title_method
        .filter(models.TOCEntry.title_method.ilike(f"%{title_method}%"))
        .distinct(
            models.TOCEntry.method_no,
            models.TOCEntry.title_method,
            models.Lab.LabId,
        )
        .all()
    )

# 4. Get tests for a given lab ID
def get_tests_by_lab_id(db: Session, lab_id: str):
    # Build "enriched" = manuals ⟶ lab_test_method_enriched
    enriched = (
        db.query(
            models.LabTestMethodEnriched.test_method.label("test_method"),
            models.LabTestMethodEnriched.method_no.label("method_no"),
            models.LabTestMethodEnriched.manual.label("manual"),
            models.LabTestMethodEnriched.page_no.label("page_no"),
            models.Manual.key.label("manual_key"),
            models.Manual.value.label("manual_name"),
        )
        .join(
            models.Manual,
            models.Manual.key == models.LabTestMethodEnriched.manual,
            isouter=False,
        )
        .filter(models.LabTestMethodEnriched.method_no.isnot(None))
        .subquery()
    )

    # Build "source" = LabTestsRaw ⟶ enriched (filtered by lab_id)
    source = (
        db.query(
            models.LabTestsRaw.lab_id.label("lab_id"),
            models.LabTestsRaw.test_method.label("test_method"),
            models.LabTestsRaw.discipline_group.label("discipline_group"),
            models.LabTestsRaw.materials_products.label("materials_products"),
            models.LabTestsRaw.component.label("component"),
            enriched.c.method_no,
            enriched.c.manual,
            enriched.c.page_no,
            enriched.c.manual_name,
        )
        .join(enriched, enriched.c.test_method == models.LabTestsRaw.test_method)
        .filter(models.LabTestsRaw.lab_id == lab_id)
        .subquery()
    )

    # Final query anchored on TOCEntry to get title_method
    return (
        db.query(
            source.c.test_method,
            models.TOCEntry.method_no,
            models.TOCEntry.title_method,
            source.c.manual,
            source.c.manual_name,
            source.c.page_no,
            source.c.discipline_group,
            source.c.materials_products,
            source.c.component,
        )
        # LEFT JOIN TOCEntry (LIKE on method_no)
        .outerjoin(
            models.TOCEntry,
            models.TOCEntry.method_no.like(
                func.concat('%', source.c.method_no, '%')
            ),
        )
        .distinct(
            source.c.test_method,
            models.TOCEntry.method_no,
            models.TOCEntry.title_method,
        )
        .all()
    )

 

def get_product_categories(db: Session):
    return (
        db.query(
            models.Manual.key.label("product_key"),
            models.Manual.value.label("product_category")
        )
        .distinct()
        .order_by(models.Manual.value.asc())
        .all()
    )


def get_product_names_by_category(db: Session, product_key: str):
    return (
        db.query(
            models.LabTestsRaw.materials_products.label("product_name"),
            models.Manual.key.label("product_key"),
        )
        .select_from(models.LabTestsRaw)
        .join(
            models.LabTestMethodEnriched,
            models.LabTestsRaw.test_method == models.LabTestMethodEnriched.test_method,
            isouter=True,
        )
        .join(
            models.Manual,
            models.Manual.key == models.LabTestMethodEnriched.manual,
            isouter=True,
        )
        .filter(models.Manual.key == product_key)
        .filter(models.LabTestsRaw.materials_products.isnot(None))
        .distinct()
        .order_by(models.LabTestsRaw.materials_products.asc())
        .all()
    )


def get_product_details(db: Session, product_name: str):
    return (
        db.query(
            models.LabTestsRaw.materials_products.label("product_name"),
            models.LabTestsRaw.component,
            models.LabTestsRaw.discipline_group,
            models.Lab.groupName,
            models.Lab.subGrpName
        )
        .join(models.Lab, models.LabTestsRaw.lab_id == models.Lab.LabId, isouter=True)
        .filter(models.LabTestsRaw.materials_products == product_name)
        .first()
    )

   

def get_enriched_lab_results(db: Session, title_method: str):
    sql = text("""
        with enriched as (
            SELECT * FROM public.lab_test_method_enriched e
            right join manuals
            on manuals.key = e.manual
              where method_no is not null
        ),
        source as (
            select * from public.lab_tests_raw l
            join enriched e on e.test_method = l.test_method
        )
        select distinct 
            t.method_no, 
            t.title_method, 
            s.lab_id, 
            lb."LaboratoryName", 
            lb."Labtype", 
            lb."PrimeAddress", 
            lb."City", 
            lb."State"
        from public.toc_entries t
        left join source s on t.method_no like '%' || s.method_no || '%'
        left join public.labs lb on s.lab_id = lb."LabId"
        where t.title_method=:title_method;
    """)

    result = db.execute(sql, {"title_method": title_method}).fetchall()

    return [
        schemas.EnrichedLabResult(
            method_no=row[0],
            title_method=row[1],
            lab_id=row[2],
            laboratory_name=row[3],
            labtype=row[4],
            prime_address=row[5],
            city=row[6],
            state=row[7],
        )
        for row in result
    ]



# ---------------- Lab ----------------
def create_lab(db: Session, lab: schemas.LabCreate):
    db_lab = models.Lab(**lab.dict())
    db.add(db_lab)
    db.commit()
    db.refresh(db_lab)
    return db_lab

def get_labs(db: Session, skip: int = 0, limit: int = 10, search: str = None):
    if search:
        # Build "enriched" = manuals ⟶ lab_test_method_enriched
        enriched = (
            db.query(
                models.LabTestMethodEnriched.test_method.label("test_method"),
                models.LabTestMethodEnriched.method_no.label("method_no"),
                models.LabTestMethodEnriched.manual.label("manual"),
                models.LabTestMethodEnriched.page_no.label("page_no"),
                models.Manual.key.label("manual_key"),
                models.Manual.value.label("manual_name"),
            )
            .join(
                models.Manual,
                models.Manual.key == models.LabTestMethodEnriched.manual,
                isouter=False,
            )
            .filter(models.LabTestMethodEnriched.method_no.isnot(None))
            .subquery()
        )

        # Build "source" = LabTestsRaw ⟶ enriched
        source = (
            db.query(
                models.LabTestsRaw.lab_id.label("lab_id"),
                models.LabTestsRaw.test_method.label("test_method"),
                enriched.c.method_no,
                enriched.c.manual,
                enriched.c.page_no,
                enriched.c.manual_name,
            )
            .join(enriched, enriched.c.test_method == models.LabTestsRaw.test_method)
            .subquery()
        )

        # Get lab IDs that match the test title method search
        test_based_lab_ids_subquery = (
            db.query(distinct(models.Lab.LabId))
            .select_from(models.TOCEntry)
            .outerjoin(
                source,
                models.TOCEntry.method_no.like(
                    func.concat('%', source.c.method_no, '%')
                ),
            )
            .outerjoin(models.Lab, source.c.lab_id == models.Lab.LabId)
            .filter(models.TOCEntry.title_method.ilike(f"%{search}%"))
            .filter(models.Lab.LabId.isnot(None))
            .subquery()
        )

        # Main query with combined search criteria
        query = db.query(models.Lab).filter(
            # Search across lab fields OR labs that have matching test methods
            (
                models.Lab.LaboratoryName.ilike(f"%{search}%") |
                models.Lab.Labtype.ilike(f"%{search}%") |
                models.Lab.City.ilike(f"%{search}%") |
                models.Lab.State.ilike(f"%{search}%") |
                models.Lab.ContactPerson.ilike(f"%{search}%") |
                models.Lab.ContactEmail.ilike(f"%{search}%") |
                models.Lab.PrimeAddress.ilike(f"%{search}%") |
                models.Lab.LabId.ilike(f"%{search}%") |
                models.Lab.LabId.in_(test_based_lab_ids_subquery)
            )
        )
    else:
        query = db.query(models.Lab)
    
    return query.offset(skip).limit(limit).all()

def get_labs_count(db: Session, search: str = None):
    if search:
        # Build "enriched" = manuals ⟶ lab_test_method_enriched
        enriched = (
            db.query(
                models.LabTestMethodEnriched.test_method.label("test_method"),
                models.LabTestMethodEnriched.method_no.label("method_no"),
                models.LabTestMethodEnriched.manual.label("manual"),
                models.LabTestMethodEnriched.page_no.label("page_no"),
                models.Manual.key.label("manual_key"),
                models.Manual.value.label("manual_name"),
            )
            .join(
                models.Manual,
                models.Manual.key == models.LabTestMethodEnriched.manual,
                isouter=False,
            )
            .filter(models.LabTestMethodEnriched.method_no.isnot(None))
            .subquery()
        )

        # Build "source" = LabTestsRaw ⟶ enriched
        source = (
            db.query(
                models.LabTestsRaw.lab_id.label("lab_id"),
                models.LabTestsRaw.test_method.label("test_method"),
                enriched.c.method_no,
                enriched.c.manual,
                enriched.c.page_no,
                enriched.c.manual_name,
            )
            .join(enriched, enriched.c.test_method == models.LabTestsRaw.test_method)
            .subquery()
        )

        # Get lab IDs that match the test title method search
        test_based_lab_ids_subquery = (
            db.query(distinct(models.Lab.LabId))
            .select_from(models.TOCEntry)
            .outerjoin(
                source,
                models.TOCEntry.method_no.like(
                    func.concat('%', source.c.method_no, '%')
                ),
            )
            .outerjoin(models.Lab, source.c.lab_id == models.Lab.LabId)
            .filter(models.TOCEntry.title_method.ilike(f"%{search}%"))
            .filter(models.Lab.LabId.isnot(None))
            .subquery()
        )

        # Count query with combined search criteria
        count_query = db.query(func.count(distinct(models.Lab.LabId))).filter(
            # Search across lab fields OR labs that have matching test methods
            (
                models.Lab.LaboratoryName.ilike(f"%{search}%") |
                models.Lab.Labtype.ilike(f"%{search}%") |
                models.Lab.City.ilike(f"%{search}%") |
                models.Lab.State.ilike(f"%{search}%") |
                models.Lab.ContactPerson.ilike(f"%{search}%") |
                models.Lab.ContactEmail.ilike(f"%{search}%") |
                models.Lab.PrimeAddress.ilike(f"%{search}%") |
                models.Lab.LabId.ilike(f"%{search}%") |
                models.Lab.LabId.in_(test_based_lab_ids_subquery)
            )
        )
    else:
        count_query = db.query(func.count(models.Lab.LabId))
    
    return count_query.scalar()

# ---------------- LabTestsRaw CRUD ----------------
def create_lab_test_raw(db: Session, lab_test: schemas.LabTestRawCreate):
    db_lab_test = models.LabTestsRaw(**lab_test.dict())
    db.add(db_lab_test)
    db.commit()
    db.refresh(db_lab_test)
    return db_lab_test

def get_lab_tests_raw(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.LabTestsRaw).order_by(models.LabTestsRaw.id).offset(skip).limit(limit).all()



# ---------------- LabTestMethodEnriched ----------------
def create_lab_test_method_enriched(db: Session, enriched: schemas.LabTestMethodEnrichedCreate):
    db_entry = models.LabTestMethodEnriched(**enriched.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_lab_test_methods_enriched(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.LabTestMethodEnriched).offset(skip).limit(limit).all()


# ---------------- Manual ----------------
def create_manual(db: Session, manual: schemas.ManualCreate):
    db_manual = models.Manual(**manual.dict())
    db.add(db_manual)
    db.commit()
    db.refresh(db_manual)
    return db_manual

def get_manuals(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Manual).offset(skip).limit(limit).all()

# ---------------- TOCEntry ----------------
def create_toc_entry(db: Session, toc_entry: schemas.TOCEntryCreate):
    db_entry = models.TOCEntry(**toc_entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_toc_entries(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.TOCEntry).offset(skip).limit(limit).all()

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
