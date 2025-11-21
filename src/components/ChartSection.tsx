import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { ProductData } from "@/types";
import { getRiskDistribution, getTopProducts } from "@/lib/analysisHelper";

interface ChartSectionProps {
  products: ProductData[];
  monthColumns: string[];
  forecastMonth: string;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export default function ChartSection({
  products,
  monthColumns,
  forecastMonth,
}: ChartSectionProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products untuk dropdown
  const filteredProductList = useMemo(() => {
    return products
      .filter((p) =>
        p.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 50); // Limit 50 untuk performa
  }, [products, searchTerm]);

  // Data untuk monthly trend dengan filter produk
  const monthlyTrendData = useMemo(() => {
    if (selectedProducts.length === 0) {
      // Jika tidak ada produk dipilih, tampilkan total semua produk
      return monthColumns.map((month, index) => {
        const dataPoint: any = { month };
        const total = products.reduce((sum, product) => {
          const monthKey = Object.keys(product.monthlyData)[index];
          return sum + (product.monthlyData[monthKey] || 0);
        }, 0);
        dataPoint["Total Semua Produk"] = total;
        return dataPoint;
      });
    } else {
      // Tampilkan trend per produk yang dipilih
      return monthColumns.map((month, index) => {
        const dataPoint: any = { month };
        selectedProducts.forEach((productName) => {
          const product = products.find((p) => p.namaBarang === productName);
          if (product) {
            const monthKey = Object.keys(product.monthlyData)[index];
            dataPoint[productName] = product.monthlyData[monthKey] || 0;
          }
        });
        return dataPoint;
      });
    }
  }, [products, monthColumns, selectedProducts]);

  // Top products atau selected products
  const displayProducts = useMemo(() => {
    if (selectedProducts.length > 0) {
      return products.filter((p) => selectedProducts.includes(p.namaBarang));
    }
    return getTopProducts(products, 10);
  }, [products, selectedProducts]);

  const riskDistribution = getRiskDistribution(products);

  // Toggle product selection
  const toggleProduct = (productName: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productName)) {
        return prev.filter((p) => p !== productName);
      } else {
        if (prev.length >= 5) {
          alert("Maksimal 5 produk dapat dipilih");
          return prev;
        }
        return [...prev, productName];
      }
    });
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  // Data untuk Forecast vs Actual
  const forecastVsActualData = useMemo(() => {
    return displayProducts.map((p) => ({
      name: p.namaBarang.substring(0, 30),
      "Forecast 3 Bulan": p.forecast3,
      "Rata-rata Perbulan": p.rataRataKebutuhanPerbulan,
      "Stok Saat Ini": p.stokAccurate,
    }));
  }, [displayProducts]);

  // Data untuk Order Recommendation Analysis
  const orderAnalysisData = useMemo(() => {
    return displayProducts.map((p) => ({
      name: p.namaBarang.substring(0, 30),
      "Rekomendasi Order": p.rekomendasiOrder,
      "Stok Saat Ini": p.stokAccurate,
      "Minimum Stok": p.minimumStok,
    }));
  }, [displayProducts]);

  // Data untuk Warehouse Capacity Analysis
  const warehouseData = useMemo(() => {
    const overload = products.filter(
      (p) =>
        p.statusGudang?.includes("Overload") || p.statusGudang?.includes("⚠️")
    ).length;
    const safe = products.length - overload;

    return [
      { name: "Aman", value: safe, fill: "#22c55e" },
      { name: "Overload", value: overload, fill: "#ef4444" },
    ];
  }, [products]);

  // Data untuk Seasonal Index Radar
  const seasonalRadarData = useMemo(() => {
    const topBySeasonality = [...products]
      .sort((a, b) => b.indeksMusiman - a.indeksMusiman)
      .slice(0, 8);

    return topBySeasonality.map((p) => ({
      product: p.namaBarang.substring(0, 20),
      "Indeks Musiman": p.indeksMusiman,
      Forecast: p.forecast3 / 100, // Normalize untuk visual
    }));
  }, [products]);

  // Data untuk Stock vs Demand Scatter
  const stockDemandScatter = useMemo(() => {
    return products.map((p) => ({
      name: p.namaBarang,
      stok: p.stokAccurate,
      demand: p.rataRataKebutuhanPerbulan,
      rekomendasi: p.rekomendasiOrder,
    }));
  }, [products]);

  // Data untuk Order Status Distribution
  const orderStatusData = useMemo(() => {
    const needOrder = products.filter(
      (p) =>
        p.orderTidakOrder?.includes("Order") ||
        p.orderTidakOrder?.includes("🔁")
    ).length;
    const noOrder = products.length - needOrder;

    return [
      { name: "Perlu Order", value: needOrder, fill: "#3b82f6" },
      { name: "Tidak Perlu Order", value: noOrder, fill: "#94a3b8" },
    ];
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Forecast Info Banner */}
      <div className="bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Forecasting untuk Bulan {forecastMonth}
            </h3>
            <p className="text-blue-100">
              Berdasarkan data penjualan dari {monthColumns[0]} -{" "}
              {monthColumns[monthColumns.length - 1]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Periode Data</p>
            <p className="text-xl font-bold">{monthColumns.length} Bulan</p>
          </div>
        </div>
      </div>

      {/* Product Selection Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Filter Produk untuk Analisis Detail
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Pilih hingga 5 produk untuk melihat trend dan analisis mendalam
            </p>
          </div>
          {selectedProducts.length > 0 && (
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Clear ({selectedProducts.length})
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedProducts.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {name.substring(0, 40)}
                <button
                  onClick={() => toggleProduct(name)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredProductList.map((product) => (
            <div
              key={product.namaBarang}
              onClick={() => toggleProduct(product.namaBarang)}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                selectedProducts.includes(product.namaBarang)
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">
                  {product.namaBarang}
                </span>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.namaBarang)}
                  onChange={() => {}}
                  className="w-4 h-4"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Trend Penjualan Bulanan
          {selectedProducts.length > 0 && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({selectedProducts.length} produk dipilih)
            </span>
          )}
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => value.toLocaleString("id-ID")}
            />
            <Legend />
            {selectedProducts.length === 0 ? (
              <Line
                type="monotone"
                dataKey="Total Semua Produk"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            ) : (
              selectedProducts.map((productName, idx) => (
                <Line
                  key={productName}
                  type="monotone"
                  dataKey={productName}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Performance Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {selectedProducts.length > 0
              ? "Produk Terpilih"
              : "Top 10 Produk Terlaris"}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={displayProducts}
              layout="vertical"
              margin={{ left: 150, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="namaBarang"
                width={140}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => value.toLocaleString("id-ID")}
              />
              <Bar dataKey="totalQtyOut" fill="#8b5cf6" name="Total Terjual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Distribusi Kategori Risiko
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast vs Actual Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Perbandingan Forecast vs Stok Aktual
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={forecastVsActualData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip
              formatter={(value: number) => value.toLocaleString("id-ID")}
            />
            <Legend />
            <Bar dataKey="Forecast 3 Bulan" fill="#3b82f6" />
            <Bar dataKey="Stok Saat Ini" fill="#10b981" />
            <Line
              type="monotone"
              dataKey="Rata-rata Perbulan"
              stroke="#ef4444"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Recommendation Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Analisis Rekomendasi Order
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={orderAnalysisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => value.toLocaleString("id-ID")}
              />
              <Legend />
              <Bar dataKey="Rekomendasi Order" fill="#f59e0b" />
              <Bar dataKey="Stok Saat Ini" fill="#06b6d4" />
              <Bar dataKey="Minimum Stok" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Warehouse Capacity */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Status Kapasitas Gudang
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={warehouseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {warehouseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
