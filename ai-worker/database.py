from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Membuat engine koneksi ke PostgreSQL
# echo=False agar terminal tidak terlalu penuh dengan log query SQL
engine = create_engine(DATABASE_URL, echo=False)

# Membuat pabrik sesi (session factory)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fungsi untuk mendapatkan sesi database (Generator)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()