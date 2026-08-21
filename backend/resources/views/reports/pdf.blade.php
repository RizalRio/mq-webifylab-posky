<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kinerja Bisnis</title>
    <style>
        @page {
            margin: 40px 40px;
        }
        body {
            font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
            color: #0f172a; /* text-slate-900 */
            font-size: 12px;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        /* Layout Utilities */
        .w-full { width: 100%; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        .uppercase { text-transform: uppercase; }
        
        /* Header */
        .header-container {
            width: 100%;
            border-bottom: 2px solid #e2e8f0; /* border-slate-200 */
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .brand-title {
            font-size: 32px;
            color: #4f46e5; /* text-indigo-600 */
            letter-spacing: 4px;
            margin: 0 0 5px 0;
        }
        .report-title {
            font-size: 18px;
            color: #334155; /* text-slate-700 */
            margin: 0 0 5px 0;
        }
        .report-period {
            font-size: 13px;
            color: #64748b; /* text-slate-500 */
            margin: 0;
        }

        /* Section Titles */
        .section-title {
            font-size: 15px;
            font-weight: bold;
            color: #1e293b; /* text-slate-800 */
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #cbd5e1; /* border-slate-300 */
            padding-bottom: 6px;
        }

        /* Summary Grid using Table for DOMPDF compat */
        .summary-table {
            width: 100%;
            margin-bottom: 30px;
            border-spacing: 10px;
            border-collapse: separate;
        }
        .summary-box {
            background-color: #f8fafc; /* bg-slate-50 */
            border: 1px solid #e2e8f0; /* border-slate-200 */
            border-radius: 8px; /* DOMPDF supports basic border radius */
            padding: 16px;
            text-align: center;
            width: 25%;
        }
        .summary-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #64748b; /* text-slate-500 */
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: bold;
        }
        .summary-value {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a; /* text-slate-900 */
        }

        /* Data Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .data-table th {
            background-color: #f1f5f9; /* bg-slate-100 */
            color: #334155; /* text-slate-700 */
            font-size: 11px;
            text-transform: uppercase;
            padding: 12px 10px;
            border-bottom: 2px solid #cbd5e1;
            border-top: 1px solid #e2e8f0;
        }
        .data-table td {
            padding: 12px 10px;
            color: #475569; /* text-slate-600 */
            border-bottom: 1px solid #e2e8f0; /* border-slate-200 */
        }
        .data-table tr:nth-child(even) {
            background-color: #f8fafc; /* striped rows */
        }
        
        .badge {
            background-color: #e0e7ff; /* bg-indigo-100 */
            color: #4f46e5; /* text-indigo-600 */
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }

        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="header-container text-center">
        <h1 class="brand-title font-black uppercase">POSKY</h1>
        <h2 class="report-title font-bold">Laporan Kinerja Bisnis</h2>
        <p class="report-period">
            Periode: <strong>{{ \Carbon\Carbon::parse($startDate)->translatedFormat('d F Y') }}</strong> hingga <strong>{{ \Carbon\Carbon::parse($endDate)->translatedFormat('d F Y') }}</strong>
        </p>
    </div>

    <div class="section-title">1. Ringkasan Pendapatan</div>
    <table class="summary-table">
        <tr>
            <td class="summary-box">
                <div class="summary-label">Total Pendapatan</div>
                <div class="summary-value">Rp {{ number_format($summary['total_revenue'] ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="summary-box">
                <div class="summary-label">Total Transaksi</div>
                <div class="summary-value">{{ number_format($summary['total_transactions'] ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="summary-box">
                <div class="summary-label">Total Diskon</div>
                <div class="summary-value">Rp {{ number_format($summary['total_discount'] ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="summary-box">
                <div class="summary-label">Rata-rata Trx</div>
                <div class="summary-value">
                    Rp {{ number_format(
                        ($summary['total_transactions'] > 0) 
                        ? ($summary['total_revenue'] / $summary['total_transactions']) 
                        : 0, 0, ',', '.'
                    ) }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section-title">2. Rincian Penjualan Harian</div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="text-left">Tanggal</th>
                <th class="text-right">Jml Trx</th>
                <th class="text-right">Diskon</th>
                <th class="text-right">Pajak</th>
                <th class="text-right">Total Pendapatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($sales as $row)
            <tr>
                <td class="text-left">{{ \Carbon\Carbon::parse($row->date)->translatedFormat('d M Y') }}</td>
                <td class="text-right font-bold">{{ number_format($row->total_transactions, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($row->total_discount, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($row->total_tax, 0, ',', '.') }}</td>
                <td class="text-right font-bold" style="color: #0f172a;">Rp {{ number_format($row->total_revenue, 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="text-center" style="padding: 30px;">Tidak ada data penjualan pada rentang tanggal ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title" style="page-break-before: auto;">3. Performa Produk & Layanan (Top Sellers)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th class="text-left" style="width: 15%;">Tipe</th>
                <th class="text-left" style="width: 45%;">Nama Item</th>
                <th class="text-right" style="width: 15%;">Qty Terjual</th>
                <th class="text-right" style="width: 25%;">Pendapatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($items as $item)
            <tr>
                <td class="text-left"><span class="badge">{{ strtoupper($item['type']) }}</span></td>
                <td class="text-left" style="color: #0f172a; font-weight: 500;">{{ $item['name'] }}</td>
                <td class="text-right font-bold">{{ number_format($item['total_quantity'], 0, ',', '.') }}</td>
                <td class="text-right font-bold" style="color: #059669;">Rp {{ number_format($item['total_revenue'], 0, ',', '.') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" class="text-center" style="padding: 30px;">Tidak ada data produk pada rentang tanggal ini.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        &copy; {{ date('Y') }} POSKY System. Dicetak otomatis pada {{ now()->translatedFormat('d F Y, H:i') }}.
    </div>
</body>
</html>
