import { useState } from "react";
import { Package, RefreshCw, BarChart3, TrendingUp, AlertTriangle, Warehouse, X, ChevronRight } from "lucide-react";
import { AnalysisSummary, ProductData } from "@/types";

interface AnalysisCardsProps {
  summary: AnalysisSummary;
  products: ProductData[];
}

interface ModalData {
  title: string;
  icon: any;
  color: string;
  items: Array<{
    name: string;
    value?: string | number;
    details?: string;
  }>;
}

export default function AnalysisCards({ summary, products }: AnalysisCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // Get products needing order
  const productsNeedingOrder = products.filter(
    (p) =>
      p.orderTidakOrder?.includes("Order") || p.orderTidakOrder?.includes("🔁")
  );

  // Get high risk products
  const highRiskProducts = products.filter(
    (p) =>
      p.kategoriRisiko?.includes("tinggi") || p.kategoriRisiko?.includes("🔝")
  );

  // Get warehouse overload products
  const warehouseOverloadProducts = products.filter(
    (p) =>
      p.statusGudang?.includes("Overload") || p.statusGudang?.includes("⚠️")
  );

  // Get top products by recommendation
  const topRecommendations = [...products]
    .sort((a, b) => b.rekomendasiOrder - a.rekomendasiOrder)
    .slice(0, 10);

  // Get top products by forecast
  const topForecast = [...products]
    .sort((a, b) => b.forecast3 - a.forecast3)
    .slice(0, 10);

  const openModal = (cardId: string) => {
    let data: ModalData | null = null;

    switch (cardId) {
      case "total":
        data = {
          title: "Semua Produk",
          icon: Package,
          color: "bg-blue-500",
          items: products.map((p) => ({
            name: p.namaBarang,
            value: `${p.totalQtyOut.toLocaleString("id-ID")} unit`,
            details: `Stok: ${p.stokAccurate.toLocaleString("id-ID")} | Forecast: ${p.forecast3.toLocaleString("id-ID")}`,
          })),
        };
        break;

      case "needOrder":
        data = {
          title: "Produk yang Perlu Order",
          icon: RefreshCw,
          color: "bg-green-500",
          items: productsNeedingOrder.map((p) => ({
            name: p.namaBarang,
            value: `Rekomendasi: ${p.rekomendasiOrder.toLocaleString("id-ID")} unit`,
            details: `Stok: ${p.stokAccurate.toLocaleString("id-ID")} | Minimum: ${p.minimumStok.toLocaleString("id-ID")}`,
          })),
        };
        break;

      case "totalRec":
        data = {
          title: "Top Rekomendasi Order",
          icon: BarChart3,
          color: "bg-purple-500",
          items: topRecommendations.map((p) => ({
            name: p.namaBarang,
            value: `${p.rekomendasiOrder.toLocaleString("id-ID")} unit`,
            details: `Stok: ${p.stokAccurate.toLocaleString("id-ID")} | Forecast: ${p.forecast3.toLocaleString("id-ID")}`,
          })),
        };
        break;

      case "avgForecast":
        data = {
          title: "Top Forecast Tertinggi",
          icon: TrendingUp,
          color: "bg-indigo-500",
          items: topForecast.map((p) => ({
            name: p.namaBarang,
            value: `${p.forecast3.toLocaleString("id-ID")} unit`,
            details: `Rata-rata/bulan: ${p.rataRataKebutuhanPerbulan.toLocaleString("id-ID")} | Indeks Musiman: ${p.indeksMusiman.toFixed(2)}`,
          })),
        };
        break;

      case "highRisk":
        data = {
          title: "Produk Risiko Tinggi",
          icon: AlertTriangle,
          color: "bg-red-500",
          items: highRiskProducts.map((p) => ({
            name: p.namaBarang,
            value: p.kategoriRisiko,
            details: `Stok: ${p.stokAccurate.toLocaleString("id-ID")} | Forecast: ${p.forecast3.toLocaleString("id-ID")} | Min: ${p.minimumStok.toLocaleString("id-ID")}`,
          })),
        };
        break;

      case "overload":
        data = {
          title: "Produk Overload di Gudang",
          icon: Warehouse,
          color: "bg-orange-500",
          items: warehouseOverloadProducts.map((p) => ({
            name: p.namaBarang,
            value: `Kapasitas: ${p.kapasitasGudang.toLocaleString("id-ID")}`,
            details: `Stok: ${p.stokAccurate.toLocaleString("id-ID")} | Status: ${p.statusGudang}`,
          })),
        };
        break;
    }

    if (data && data.items.length === 0) {
      data.items = [{ name: "Tidak ada data", value: "", details: "" }];
    }

    setModalData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  const cards = [
    {
      id: "total",
      title: "Total Produk",
      value: summary.totalProducts,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      id: "needOrder",
      title: "Perlu Order",
      value: summary.productsNeedOrdering,
      icon: RefreshCw,
      color: "bg-green-500",
    },
    {
      id: "totalRec",
      title: "Total Rekomendasi Order",
      value: summary.totalOrderRecommendations.toLocaleString("id-ID"),
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      id: "avgForecast",
      title: "Rata-rata Forecast (3 Bulan)",
      value: summary.averageForecast.toLocaleString("id-ID"),
      icon: TrendingUp,
      color: "bg-indigo-500",
    },
    {
      id: "highRisk",
      title: "Produk Risiko Tinggi",
      value: summary.highRiskProducts,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      id: "overload",
      title: "Gudang Overload",
      value: summary.warehouseOverload,
      icon: Warehouse,
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => openModal(card.id)}
            className="relative bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div
                className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
              >
                <card.icon className="w-6 h-6" />
              </div>
            </div>

            {/* Click indicator */}
            <div className="mt-4 flex items-center text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Lihat detail</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && modalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className={`${modalData.color} text-white px-6 py-4 rounded-t-lg flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <modalData.icon className="w-7 h-7" />
                  <div>
                    <h3 className="text-2xl font-bold">{modalData.title}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Total: {modalData.items.length} item{modalData.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {modalData.items.length > 0 && modalData.items[0].name !== "Tidak ada data" ? (
                  <div className="space-y-3">
                    {modalData.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-base flex-1 pr-4">
                            {index + 1}. {item.name}
                          </h4>
                          {item.value && (
                            <span className={`px-3 py-1 ${modalData.color} text-white text-sm font-medium rounded-full whitespace-nowrap`}>
                              {item.value}
                            </span>
                          )}
                        </div>
                        {item.details && (
                          <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-gray-300">
                            {item.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-3">
                      <Package className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-600 font-medium">Tidak ada data untuk ditampilkan</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {modalData.items.length > 0 && modalData.items[0].name !== "Tidak ada data"
                    ? `Menampilkan semua ${modalData.items.length} produk`
                    : 'Tidak ada produk'}
                </p>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}