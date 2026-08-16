import pandas as pd
from prophet import Prophet
import datetime
import math

class ProphetEngine:
    def __init__(self, sales_data):
        """
        sales_data harus berupa list of dictionaries dengan format:
        [{'ds': 'YYYY-MM-DD', 'y': jumlah_terjual}]
        """
        self.df = pd.DataFrame(sales_data)
        if not self.df.empty:
            self.df['ds'] = pd.to_datetime(self.df['ds'])

    def calculate_stockout(self, current_stock, forecast_days=90):
        """
        Menghitung kapan stok akan habis berdasarkan tren penjualan masa lalu.
        """
        if len(self.df) < 2 or current_stock <= 0:
            return None, 0, 0 

        try:
            # Inisialisasi dan latih model Prophet
            model = Prophet(daily_seasonality=True, yearly_seasonality=False, weekly_seasonality=True)
            model.fit(self.df)

            # Buat kerangka waktu 90 hari ke depan
            future = model.make_future_dataframe(periods=forecast_days)
            forecast = model.predict(future)

            # Filter data prediksi masa depan (setelah tanggal historis terakhir)
            max_hist_date = self.df['ds'].max()
            future_forecast = forecast[forecast['ds'] > max_hist_date].copy()

            if future_forecast.empty:
                future_forecast = forecast.tail(forecast_days).copy()

            # Pastikan prediksi penjualan tidak bernilai negatif
            future_forecast['yhat'] = future_forecast['yhat'].clip(lower=0)
            future_forecast['yhat_upper'] = future_forecast['yhat_upper'].clip(lower=0)

            # Hitung penjualan kumulatif ke depan
            future_forecast['cumulative_sales'] = future_forecast['yhat'].cumsum()

            # Cari tanggal pertama di mana total penjualan kumulatif melampaui sisa stok
            stockout_row = future_forecast[future_forecast['cumulative_sales'] >= current_stock]

            estimated_date = None
            if not stockout_row.empty:
                estimated_date = stockout_row.iloc[0]['ds'].strftime('%Y-%m-%d')
            else:
                # Jika stok sangat banyak melebihi horizon 90 hari, hitung proyeksi linier dari rata-rata harian
                avg_daily = future_forecast['yhat'].mean()
                if avg_daily > 0:
                    days_remaining = math.ceil(current_stock / avg_daily)
                    est_dt = datetime.date.today() + datetime.timedelta(days=days_remaining)
                    estimated_date = est_dt.strftime('%Y-%m-%d')

            # Hitung Safety Stock (minimal stok aman) berdasarkan batas atas estimasi 7 hari (dibulatkan ke atas)
            avg_upper_7d = future_forecast.head(7)['yhat_upper'].mean()
            safety_stock = math.ceil(max(1, avg_upper_7d * 1.25))

            # Tingkat keyakinan berbasis jumlah sampel data historis (skala 0.80 - 0.985)
            confidence = min(80.0 + (len(self.df) * 0.6), 98.5) / 100.0

            return estimated_date, float(safety_stock), round(confidence, 3)

        except Exception as e:
            print(f"Error pada Prophet Engine: {e}")
            return None, 0, 0