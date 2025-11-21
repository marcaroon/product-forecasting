'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import AnalysisCards from '@/components/AnalysisCards';
import ChartSection from '@/components/ChartSection';
import DataTable from '@/components/DataTable';
import { ProductData, AnalysisSummary } from '@/types';
import { parseExcelFile } from '@/lib/excelParser';
import { calculateAnalysisSummary } from '@/lib/analysisHelper';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [monthColumns, setMonthColumns] = useState<string[]>([]);
  const [forecastMonth, setForecastMonth] = useState<string>('');
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      // Parse Excel file
      const { products: parsedData, monthColumns: months, forecastMonth: forecast } = await parseExcelFile(file);
      
      if (parsedData.length === 0) {
        throw new Error('File Excel tidak mengandung data yang valid');
      }
      
      // Set data
      setProducts(parsedData);
      setMonthColumns(months);
      setForecastMonth(forecast);
      
      // Calculate summary
      const analysisSummary = calculateAnalysisSummary(parsedData);
      setSummary(analysisSummary);
      
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file');
      setProducts([]);
      setMonthColumns([]);
      setForecastMonth('');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProducts([]);
    setMonthColumns([]);
    setForecastMonth('');
    setSummary(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Sistem Forecasting Pembelian
              </h1>
              <p className="text-gray-600 mt-1">
                Analisis dan prediksi kebutuhan pembelian produk gudang
              </p>
              {forecastMonth && (
                <p className="text-sm text-blue-600 font-medium mt-2">
                  🎯 Target Forecast: <span className="font-bold">{forecastMonth}</span>
                </p>
              )}
            </div>
            {products.length > 0 && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="py-12">
            <FileUpload onFileSelect={handleFileSelect} loading={loading} />
            
            {error && (
              <div className="mt-6 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-500 text-xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-red-800 font-semibold">Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Instructions */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  🎯 Cara Menggunakan
                </h2>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-3">1.</span>
                    <span>Siapkan file Excel (.xlsx) dengan format sesuai template</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-3">2.</span>
                    <span>Upload file dengan drag & drop atau klik tombol pilih file</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-3">3.</span>
                    <span>Sistem akan otomatis menganalisis data dan menampilkan visualisasi</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-blue-600 mr-3">4.</span>
                    <span>Review rekomendasi pembelian dan analisis risiko</span>
                  </li>
                </ol>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>💡 Tip:</strong> File harus memiliki kolom standar seperti Nama Barang, 
                    data penjualan per bulan, Total Qty Out, Stok Accurate, 
                    Forecast, Rekomendasi Order, Status Gudang, dan Kategori Risiko.
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>📅 Kolom Bulan Dinamis:</strong> Sistem akan otomatis mendeteksi bulan apa saja 
                    yang ada di file Excel Anda (misalnya Januari-November) dan menentukan bulan forecast 
                    (bulan berikutnya, misalnya Desember).
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            {summary && <AnalysisCards summary={summary} products={products} />}
            
            {/* Charts */}
            <ChartSection 
              products={products} 
              monthColumns={monthColumns}
              forecastMonth={forecastMonth}
            />
            
            {/* Data Table */}
            <DataTable products={products} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2025 Sistem Forecasting Pembelian. Built with Next.js & Recharts.
          </p>
        </div>
      </footer>
    </div>
  );
}