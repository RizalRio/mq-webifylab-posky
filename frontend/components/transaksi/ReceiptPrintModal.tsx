"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Store, QrCode, CheckCircle2 } from "lucide-react";
import type { BackendTransaction } from "@/lib/api/transactions";

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BackendTransaction | null;
  cashAmount?: number;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ReceiptPrintModal({
  isOpen,
  onClose,
  transaction,
  cashAmount,
}: ReceiptPrintModalProps) {
  const [paperSize, setPaperSize] = useState<"58mm" | "80mm">("58mm");

  if (!transaction) return null;

  const paidAmount = cashAmount ?? (transaction.payment_method === "cash" ? transaction.total_amount : transaction.total_amount);
  const changeAmount = transaction.payment_method === "cash" && paidAmount > transaction.total_amount
    ? paidAmount - transaction.total_amount
    : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Printer className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Cetak Struk Kasir
            </DialogTitle>
            {/* Paper size toggle selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaperSize("58mm")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  paperSize === "58mm"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("80mm")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  paperSize === "80mm"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                80mm
              </button>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Pratinjau fisik struk printer thermal & opsi cetak faktur PDF.
          </DialogDescription>
        </DialogHeader>

        {/* CONTAINER VIEW RECEIPT */}
        <div className="max-h-[60vh] overflow-y-auto my-3 p-2 bg-slate-100 dark:bg-slate-950/60 rounded-xl flex justify-center">
          {/* STRUK RECEIPT PRINT AREA */}
          <div
            id="thermal-receipt-printable-area"
            style={{
              width: paperSize === "58mm" ? "260px" : "320px",
            }}
            className="bg-white text-black p-4 rounded-md shadow-sm font-mono text-[11px] leading-tight space-y-3 transition-all my-2 border border-slate-200"
          >
            {/* HEADER TOKO */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-400">
              <p className="font-bold text-sm uppercase tracking-wide">POSKY STORE</p>
              <p className="text-[10px] text-slate-700">Jl. Teknologi No. 88, Jakarta</p>
              <p className="text-[10px] text-slate-700">Telp: 0812-3456-7890</p>
            </div>

            {/* METADATA TRANSAKSI */}
            <div className="space-y-0.5 text-[10px] text-slate-800 pb-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>No. Faktur:</span>
                <span className="font-bold">TRX-{transaction.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.cashier?.name || "Kasir POS"}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{transaction.customer?.name || "Walk-in Customer"}</span>
              </div>
            </div>

            {/* LIST ITEMS */}
            <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-400">
              {transaction.items?.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <p className="font-semibold">{item.itemable?.name || `Item (${item.itemable_id.slice(0, 6)})`}</p>
                  <div className="flex justify-between text-[10px] text-slate-700">
                    <span>
                      {item.quantity} x {formatRupiah(Number(item.unit_price) || 0)}
                    </span>
                    <span className="font-bold text-black">{formatRupiah(Number(item.subtotal) || 0)}</span>
                  </div>
                  {item.rentalBooking && (
                    <p className="text-[9px] text-slate-600 italic">
                      Sewa: {item.rentalBooking.start_date} s/d {item.rentalBooking.end_date}
                    </p>
                  )}
                  {item.serviceSchedule && (
                    <p className="text-[9px] text-slate-600 italic">
                      Jasa: {formatDate(item.serviceSchedule.scheduled_start)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* PERHITUNGAN TOTAL */}
            <div className="space-y-1 text-[10px] pb-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatRupiah(Number(transaction.subtotal) || 0)}</span>
              </div>
              {Number(transaction.discount) > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(Number(transaction.discount))}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>PPN (11%):</span>
                <span>{formatRupiah(Number(transaction.tax) || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-[12px] pt-1 text-black">
                <span>TOTAL:</span>
                <span>{formatRupiah(Number(transaction.total_amount) || 0)}</span>
              </div>
            </div>

            {/* RINCIAN PEMBAYARAN */}
            <div className="space-y-0.5 text-[10px] text-slate-800 pb-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span className="uppercase font-semibold">{transaction.payment_method}</span>
              </div>
              {transaction.payment_method === "cash" && (
                <>
                  <div className="flex justify-between">
                    <span>Diterima:</span>
                    <span>{formatRupiah(paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(changeAmount)}</span>
                  </div>
                </>
              )}
            </div>

            {/* FOOTER & QR SIMULATION */}
            <div className="text-center pt-1 space-y-1 text-[9px] text-slate-700">
              <div className="flex justify-center my-1">
                <QrCode className="h-10 w-10 text-slate-800" />
              </div>
              <p className="font-semibold">*** TERIMA KASIH ***</p>
              <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
              <p className="text-[8px] opacity-70">Powered by POSKY Omnichannel</p>
            </div>
          </div>
        </div>

        {/* TOMBOL AKSI MODAL */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Tutup
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="h-4 w-4" /> Cetak (Thermal {paperSize})
          </Button>
        </div>

        {/* CSS INJECTION UNTUK @MEDIA PRINT CLEAN ISOLATION */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #thermal-receipt-printable-area,
            #thermal-receipt-printable-area * {
              visibility: visible !important;
            }
            #thermal-receipt-printable-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 10px !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
