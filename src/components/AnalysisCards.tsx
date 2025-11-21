import { useState } from "react";
import { AnalysisSummary, ProductData } from "@/types";

interface AnalysisCardsProps {
  summary: AnalysisSummary;
  products: ProductData[];
}

export default function AnalysisCards({ summary, products }: AnalysisCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
    .slice(0, 5);

  // Get top products by forecast
  const topForecast = [...products]
    .sort((a, b) => b.forecast3 - a.forecast3)
    .slice(0, 5);

  const cards = [
    {
      id: "total",
      title: "Total Produk",
      value: summary.totalProducts,
      icon: "📦",
      color: "bg-blue-500",
      hoverData: products.slice(0, 5).map(p => p.namaBarang),
      hoverTitle: "Sample Produk (5 pertama)",
    },
    {
      id: "needOrder",
      title: "Perlu Order",
      value: summary.productsNeedOrdering,
      icon: "🔁",
      color: "bg-green-500",
      hoverData: productsNeedingOrder.slice(0, 5).map(p => p.namaBarang),
      hoverTitle: "Produk yang Perlu Order",
    },
    {
      id: "totalRec",
      title: "Total Rekomendasi Order",
      value: summary.totalOrderRecommendations.toLocaleString("id-ID"),
      icon: "📊",
      color: "bg-purple-500",
      hoverData: topRecommendations.map(p => 
        `${p.namaBarang.substring(0, 30)}: ${p.rekomendasiOrder.toLocaleString("id-ID")}`
      ),
      hoverTitle: "Top 5 Rekomendasi Tertinggi",
    },
    {
      id: "avgForecast",
      title: "Rata-rata Forecast (3 Bulan)",
      value: summary.averageForecast.toLocaleString("id-ID"),
      icon: "📈",
      color: "bg-indigo-500",
      hoverData: topForecast.map(p => 
        `${p.namaBarang.substring(0, 30)}: ${p.forecast3.toLocaleString("id-ID")}`
      ),
      hoverTitle: "Top 5 Forecast Tertinggi",
    },
    {
      id: "highRisk",
      title: "Produk Risiko Tinggi",
      value: summary.highRiskProducts,
      icon: "⚠️",
      color: "bg-red-500",
      hoverData: highRiskProducts.slice(0, 5).map(p => p.namaBarang),
      hoverTitle: "Produk Risiko Tinggi",
    },
    {
      id: "overload",
      title: "Gudang Overload",
      value: summary.warehouseOverload,
      icon: "🏭",
      color: "bg-orange-500",
      hoverData: warehouseOverloadProducts.slice(0, 5).map(p => p.namaBarang),
      hoverTitle: "Produk Overload di Gudang",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div
              className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}
            >
              {card.icon}
            </div>
          </div>

          {/* Hover Detail Popup */}
          {hoveredCard === card.id && card.hoverData.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 max-w-md">
              <h4 className="text-sm font-bold text-gray-900 mb-2 border-b pb-2">
                {card.hoverTitle}
              </h4>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {card.hoverData.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-gray-700 py-1 px-2 hover:bg-gray-50 rounded"
                  >
                    {idx + 1}. {item}
                  </li>
                ))}
              </ul>
              {card.hoverData.length === 5 && (
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                  Menampilkan 5 dari {card.id === 'total' ? summary.totalProducts : 
                    card.id === 'needOrder' ? summary.productsNeedOrdering :
                    card.id === 'highRisk' ? summary.highRiskProducts :
                    card.id === 'overload' ? summary.warehouseOverload : 5} item
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}