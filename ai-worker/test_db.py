from sqlalchemy import text
from database import SessionLocal

def test_connection():
    print("Mencoba terhubung ke database PostgreSQL...")
    
    # Membuka sesi database dari session factory yang kita buat
    db = SessionLocal()
    
    try:
        # Menjalankan query SQL mentah ke tabel suppliers
        query = text("SELECT id, name FROM suppliers LIMIT 5")
        result = db.execute(query).fetchall()
        
        print("✅ Koneksi Database Berhasil!")
        
        if len(result) == 0:
            print("ℹ️ Tabel 'suppliers' bisa diakses, tetapi datanya masih kosong.")
        else:
            print(f"Ditemukan {len(result)} data supplier:")
            for row in result:
                # Menampilkan UUID dan Nama Supplier
                print(f"- [{row[0]}] {row[1]}")
                
    except Exception as e:
        print("❌ Koneksi Gagal!")
        print(f"Detail Error: {e}")
    finally:
        # Selalu tutup sesi untuk mencegah kebocoran memori (memory leak)
        db.close()

if __name__ == "__main__":
    test_connection()