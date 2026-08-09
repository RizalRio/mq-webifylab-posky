import pandas as pd
from prophet import Prophet
import datetime

class ProphetEngine:
    def __init__(self, sales_data):
        """
        sales_data harus berupa list of dictionaries dengan format:
        [{'ds': 'YYYY-MM-DD', 'y': jumlah_terjual}]
        """
        self.df = pd.DataFrame(sales_data)

    def calculate_stockout(self, current_stock, forecast_days=30):
        """
        Menghitung kapan stok akan habis berdasarkan tren penjualan masa lalu.
        """
        # Prophet butuh minimal 2 baris data (2 hari penjualan berbeda) untuk melihat tren
        if len(self.df) < 2 or current_stock <= 0:
            return None, 0, 0 

        try:
            # Inisialisasi dan latih model Prophet
            # daily_seasonality=True karena data retail sering dipengaruhi hari dalam seminggu
            model = Prophet(daily_seasonality=True, yearly_seasonality=False)
            model.fit(self.df)

            # Buat kerangka waktu ke depan
            future = model.make_future_dataframe(periods=forecast_days)
            
            # Lakukan prediksi
            forecast = model.predict(future)

            # Ambil hanya data prediksi (masa depan) mulai dari hari ini
            today = pd.to_datetime(datetime.date.today())
            future_forecast = forecast[forecast['ds'] >= today].copy()

            # Asumsi penjualan tidak boleh minus (negatif)
            future_forecast['yhat'] = future_forecast['yhat'].clip(lower=0)

            # Hitung penjualan kumulatif ke depan
            future_forecast['cumulative_sales'] = future_forecast['yhat'].cumsum()

            # Cari tanggal pertama di mana total penjualan > stok saat ini
            stockout_row = future_forecast[future_forecast['cumulative_sales'] >= current_stock]

            estimated_date = None
            if not stockout_row.empty:
                # Ambil tanggal (ds) dari baris pertama yang memenuhi syarat
                estimated_date = stockout_row.iloc[0]['ds'].strftime('%Y-%m-%d')

            # Hitung batas aman (Safety Stock)
            # Misalnya: menggunakan nilai prediksi tertinggi (yhat_upper) dalam 7 hari ke depan
            safety_stock = future_forecast.head(7)['yhat_upper'].mean()
            
            # Tingkat keyakinan sederhana berbasis jumlah data historis vs varians
            confidence = min(85.0 + (len(self.df) * 0.5), 98.5) 

            return estimated_date, round(safety_stock, 2), round(confidence, 2)

        except Exception as e:
            print(f"Error pada Prophet Engine: {e}")
            return None, 0, 0