import os

# Konfigurasi PostgreSQL 
# Sesuaikan 'postgres' dan 'password_database_kamu' dengan kredensial aslimu
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "asdqwe123")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "webifylab_omnipos") # Sesuai dengan nama database dari error sebelumnya

# Perhatikan penggunaan postgresql+pg8000 di sini
DATABASE_URL = f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Konfigurasi Redis (Sebagai Message Broker untuk Celery)
REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"