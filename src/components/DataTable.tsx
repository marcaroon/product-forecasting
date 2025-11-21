import { useState } from "react";
import { ProductData } from "@/types";

interface DataTableProps {
  products: ProductData[];
}

export default function DataTable({ products }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "order" | "noorder">(
    "all"
  );

  const itemsPerPage = 20;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchSearch = product.namaBarang
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "order" &&
        (product.orderTidakOrder?.includes("Order") ||
          product.orderTidakOrder?.includes("🔁"))) ||
      (filterStatus === "noorder" &&
        (product.orderTidakOrder?.includes("Tidak") ||
          product.orderTidakOrder?.includes("❗")));

    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Detail Data Produk
        </h3>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Cari nama produk..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="order">Perlu Order</option>
            <option value="noorder">Tidak Perlu Order</option>
          </select>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Menampilkan {startIndex + 1}-
          {Math.min(endIndex, filteredProducts.length)} dari{" "}
          {filteredProducts.length} produk
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Nama Barang
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stok
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Forecast
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Rekomendasi
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Risiko
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {product.namaBarang}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {product.totalQtyOut.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {product.stokAccurate.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-700">
                  {product.forecast3.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                  {product.rekomendasiOrder.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.orderTidakOrder?.includes("Order") ||
                      product.orderTidakOrder?.includes("🔁")
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.orderTidakOrder}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.kategoriRisiko?.includes("tinggi") ||
                      product.kategoriRisiko?.includes("🔝")
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {product.kategoriRisiko}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
