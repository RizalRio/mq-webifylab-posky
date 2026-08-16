import json
import time
import redis
import datetime
from sqlalchemy import text
from config import REDIS_URL
from database import SessionLocal
from ahp_engine import AHPEngine
from prophet_engine import ProphetEngine

def process_ahp_task(tenant_id):
    print(f"\n⚙️ Memproses kalkulasi AHP untuk Tenant: {tenant_id}")
    db = SessionLocal()
    
    try:
        # 1. Tarik Data Kriteria
        crit_query = text("SELECT id, type FROM criteria WHERE tenant_id = :tid")
        criteria_rows = db.execute(crit_query, {"tid": tenant_id}).fetchall()
        criteria = [{"id": row[0], "type": row[1]} for row in criteria_rows]

        # 2. Tarik Data Perbandingan Matriks
        comp_query = text("SELECT criterion_id_1, criterion_id_2, value FROM criterion_comparisons WHERE tenant_id = :tid")
        comp_rows = db.execute(comp_query, {"tid": tenant_id}).fetchall()
        comparisons = [{"criterion_id_1": row[0], "criterion_id_2": row[1], "value": float(row[2])} for row in comp_rows]

        # 3. Tarik Data Supplier
        supp_query = text("SELECT id FROM suppliers WHERE tenant_id = :tid")
        supp_rows = db.execute(supp_query, {"tid": tenant_id}).fetchall()
        suppliers = [{"id": row[0]} for row in supp_rows]

        # 4. Tarik Data Evaluasi Mentah
        eval_query = text("SELECT supplier_id, criterion_id, raw_value FROM supplier_evaluations WHERE tenant_id = :tid")
        eval_rows = db.execute(eval_query, {"tid": tenant_id}).fetchall()
        evaluations = [{"supplier_id": row[0], "criterion_id": row[1], "raw_value": float(row[2])} for row in eval_rows]

        if not criteria or not suppliers:
            print("⚠️ Data Kriteria atau Supplier kosong. Melewati kalkulasi.")
            return

        # 5. Inisialisasi dan Jalankan Mesin AHP
        engine = AHPEngine(criteria, comparisons, suppliers, evaluations)
        
        weights, cr = engine.calculate_criteria_weights()
        print(f"📊 Consistency Ratio (CR): {cr:.4f}")
        
        if cr > 0.1:
            # Di SaaS sungguhan, kita bisa membuat tabel log/notifikasi ke user jika CR tidak konsisten
            print("⚠️ Peringatan: Input matriks tidak konsisten (CR > 0.1).")

        final_scores = engine.calculate_final_scores(weights)

        # 6. Simpan hasil kembali ke Database
        update_query = text("""
            UPDATE suppliers 
            SET ahp_score = :score, rank = :rank 
            WHERE id = :supp_id AND tenant_id = :tid
        """)
        
        for result in final_scores:
            db.execute(update_query, {
                "score": result['ahp_score'],
                "rank": result['rank'],
                "supp_id": result['supplier_id'],
                "tid": tenant_id
            })
            print(f"🏆 Rank {result['rank']}: Supplier {result['supplier_id']} (Skor: {result['ahp_score']})")

        db.commit()
        print("✅ Proses selesai dan disimpan ke database.")

    except Exception as e:
        db.rollback()
        print(f"❌ Terjadi kesalahan: {e}")
    finally:
        db.close()

def process_prophet_task(tenant_id):
    print(f"\n📈 Memproses AI Prediksi Stok untuk Tenant: {tenant_id}")
    db = SessionLocal()
    
    try:
        # 1. Ambil semua produk milik tenant yang masih memiliki stok > 0
        products_query = text("SELECT id, stock FROM products WHERE tenant_id = :tid AND stock > 0")
        products = db.execute(products_query, {"tid": tenant_id}).fetchall()

        if not products:
            print("⚠️ Tidak ada produk dengan stok > 0 untuk dianalisis.")
            return

        for product in products:
            product_id = str(product[0]) # Ubah objek UUID menjadi string di sini
            current_stock = float(product[1])

            # 2. Ambil riwayat penjualan (Time-Series) untuk produk ini
            # Asumsi: Kamu memiliki tabel transaction_items yang berelasi dengan transactions
            # Query ini menjumlahkan qty barang terjual per hari
            sales_query = text("""
                SELECT DATE(t.created_at) as ds, SUM(ti.quantity) as y
                FROM transaction_items ti
                JOIN transactions t ON ti.transaction_id = t.id
                WHERE t.tenant_id = :tid 
                  AND ti.itemable_id = :pid 
                  AND (ti.itemable_type LIKE '%Product%' OR ti.itemable_type = 'product')
                GROUP BY DATE(t.created_at)
                ORDER BY DATE(t.created_at) ASC
            """)
            
            sales_data_raw = db.execute(sales_query, {"tid": tenant_id, "pid": product_id}).fetchall()
            
            # Format ke list of dict sesuai permintaan Prophet
            sales_data = [{"ds": str(row[0]), "y": float(row[1])} for row in sales_data_raw]

            # 3. Lakukan Prediksi jika ada riwayat transaksi
            if len(sales_data) >= 2:
                engine = ProphetEngine(sales_data)
                est_date, safety_stock, confidence = engine.calculate_stockout(current_stock)

                print(f"Produk {product_id[:8]}... | Stok: {current_stock} | Habis pada: {est_date} | Safety: {safety_stock}")

                # 4. Simpan/Update Hasil ke Database (tabel stock_predictions yang baru dibuat)
                upsert_query = text("""
                    INSERT INTO stock_predictions (id, tenant_id, product_id, estimated_stockout_date, safety_stock_level, confidence_score, last_calculated_at, created_at, updated_at)
                    VALUES (gen_random_uuid(), :tid, :pid, :est_date, :safety, :conf, :now, :now, :now)
                    ON CONFLICT ON CONSTRAINT unique_tenant_product_prediction 
                    DO UPDATE SET 
                        estimated_stockout_date = EXCLUDED.estimated_stockout_date,
                        safety_stock_level = EXCLUDED.safety_stock_level,
                        confidence_score = EXCLUDED.confidence_score,
                        last_calculated_at = EXCLUDED.last_calculated_at,
                        updated_at = EXCLUDED.updated_at
                """)
                
                db.execute(upsert_query, {
                    "tid": tenant_id,
                    "pid": product_id,
                    "est_date": est_date,
                    "safety": safety_stock,
                    "conf": confidence,
                    "now": datetime.datetime.now()
                })

        db.commit()
        print("✅ Proses Prediksi Prophet selesai disimpan.")

    except Exception as e:
        db.rollback()
        print(f"❌ Terjadi kesalahan pada Prophet Worker: {e}")
    finally:
        db.close()

def start_worker():
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True, protocol=2, health_check_interval=10)
    print("🚀 Worker AI POSKY aktif: Menunggu antrean [AHP] & [Prophet]...")

    while True:
        try:
            # brpop Menerima LIST antrean. Ia akan merespons mana saja yang masuk lebih dulu.
            task = redis_client.brpop(['posky:ahp_tasks', 'posky:prophet_tasks'], timeout=2)
            
            if task:
                queue_name = task[0] # Nama antrean yang tertangkap
                payload = json.loads(task[1])
                tenant_id = payload.get('tenant_id')
                
                if tenant_id:
                    # Mengarahkan tugas ke fungsi yang tepat
                    if queue_name == 'posky:ahp_tasks':
                        process_ahp_task(tenant_id)
                    elif queue_name == 'posky:prophet_tasks':
                        process_prophet_task(tenant_id)
                    
        except KeyboardInterrupt:
            print("\n⏹️ Worker dihentikan oleh user.")
            break
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
            print("⚠️ Koneksi ke Redis terganggu, mencoba menyambung kembali...")
            time.sleep(3)
        except Exception as e:
            print(f"❌ Error pada Worker: {e}")
            time.sleep(2)

if __name__ == "__main__":
    start_worker()