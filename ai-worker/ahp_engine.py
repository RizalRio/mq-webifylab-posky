import numpy as np
import pandas as pd

# Tabel Random Index (RI) standar dari Saaty
RI_DICT = {1: 0.0, 2: 0.0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}

class AHPEngine:
    def __init__(self, criteria, comparisons, suppliers, evaluations):
        """
        Inisialisasi data mentah dari database.
        criteria: list of dict [{'id': 'c1', 'type': 'cost'}]
        comparisons: list of dict [{'c1': 'c1', 'c2': 'c2', 'value': 3}]
        suppliers: list of dict [{'id': 's1'}]
        evaluations: list of dict [{'supplier_id': 's1', 'criterion_id': 'c1', 'raw_value': 10000}]
        """
        self.criteria = criteria
        self.comparisons = comparisons
        self.suppliers = suppliers
        self.evaluations = evaluations

    def calculate_criteria_weights(self):
        n = len(self.criteria)
        if n == 0:
            return None, 0
            
        # Membuat pemetaan ID kriteria ke index matriks (0, 1, 2, ...)
        crit_idx = {c['id']: i for i, c in enumerate(self.criteria)}
        
        # Inisialisasi matriks NxN dengan angka 1
        matrix = np.ones((n, n))
        
        # Mengisi matriks perbandingan berpasangan
        for comp in self.comparisons:
            i = crit_idx.get(comp['criterion_id_1'])
            j = crit_idx.get(comp['criterion_id_2'])
            if i is not None and j is not None:
                matrix[i, j] = comp['value']
                matrix[j, i] = 1.0 / comp['value'] # Kebalikannya
                
        # Normalisasi kolom matriks
        col_sums = matrix.sum(axis=0)
        norm_matrix = matrix / col_sums
        
        # Menghitung bobot prioritas (Rata-rata setiap baris)
        weights = norm_matrix.mean(axis=1)
        
        # Menghitung Consistency Ratio (CR)
        lambda_max = (col_sums * weights).sum()
        ci = (lambda_max - n) / (n - 1) if n > 1 else 0
        ri = RI_DICT.get(n, 1.49)
        cr = ci / ri if ri > 0 else 0
        
        # Kembalikan dictionary {criterion_id: weight} dan nilai CR
        weight_dict = {self.criteria[i]['id']: weights[i] for i in range(n)}
        return weight_dict, cr

    def calculate_final_scores(self, weights):
        if not self.evaluations or not self.suppliers:
            return []

        # Convert evaluations to Pandas DataFrame untuk kemudahan pivot
        df_eval = pd.DataFrame(self.evaluations)
        
        # Pivot table: Baris = Supplier, Kolom = Kriteria, Value = Raw Value
        pivot_df = df_eval.pivot(index='supplier_id', columns='criterion_id', values='raw_value').astype(float)
        
        # Normalisasi nilai supplier berdasarkan tipe kriteria (benefit/cost)
        norm_df = pd.DataFrame(index=pivot_df.index, columns=pivot_df.columns)
        
        for c in self.criteria:
            c_id = c['id']
            if c_id not in pivot_df.columns:
                continue
                
            col_data = pivot_df[c_id]
            if c['type'] == 'benefit':
                # Normalisasi Benefit: Nilai / Nilai Max
                norm_df[c_id] = col_data / col_data.max()
            else:
                # Normalisasi Cost: Nilai Min / Nilai
                norm_df[c_id] = col_data.min() / col_data
                
        # Mengisi NaN (jika ada nilai kosong) dengan 0
        norm_df = norm_df.fillna(0)
        
        # Menghitung skor akhir: Mengalikan nilai normalisasi dengan bobot kriteria
        final_scores = {}
        for supplier_id, row in norm_df.iterrows():
            score = sum(row[c_id] * weights.get(c_id, 0) for c_id in norm_df.columns)
            final_scores[supplier_id] = score
            
        # Mengurutkan dari skor tertinggi ke terendah dan memformat hasil
        sorted_suppliers = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
        
        results = []
        for rank, (supp_id, score) in enumerate(sorted_suppliers, start=1):
            results.append({
                'supplier_id': supp_id,
                'ahp_score': round(float(score), 4),
                'rank': rank
            })
            
        return results