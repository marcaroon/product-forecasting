import * as XLSX from "xlsx";
import { ProductData, ParsedResult } from "@/types";

// Mapping nama bulan Indonesia ke index dan nama standar
const MONTH_MAPPING: { [key: string]: { index: number; name: string } } = {
  januari: { index: 0, name: "Januari" },
  jan: { index: 0, name: "Januari" },
  februari: { index: 1, name: "Februari" },
  feb: { index: 1, name: "Februari" },
  maret: { index: 2, name: "Maret" },
  mar: { index: 2, name: "Maret" },
  april: { index: 3, name: "April" },
  apr: { index: 3, name: "April" },
  mei: { index: 4, name: "Mei" },
  juni: { index: 5, name: "Juni" },
  jun: { index: 5, name: "Juni" },
  juli: { index: 6, name: "Juli" },
  jul: { index: 6, name: "Juli" },
  agustus: { index: 7, name: "Agustus" },
  agu: { index: 7, name: "Agustus" },
  ags: { index: 7, name: "Agustus" },
  september: { index: 8, name: "September" },
  sep: { index: 8, name: "September" },
  sept: { index: 8, name: "September" },
  oktober: { index: 9, name: "Oktober" },
  okt: { index: 9, name: "Oktober" },
  oct: { index: 9, name: "Oktober" },
  november: { index: 10, name: "November" },
  nov: { index: 10, name: "November" },
  desember: { index: 11, name: "Desember" },
  des: { index: 11, name: "Desember" },
  dec: { index: 11, name: "Desember" },
};

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Fungsi untuk mendeteksi kolom bulan dari header
const detectMonthColumns = (
  headers: any[]
): {
  indices: number[];
  names: string[];
  monthObjects: Array<{ colIndex: number; monthIndex: number; name: string }>;
} => {
  const monthObjects: Array<{
    colIndex: number;
    monthIndex: number;
    name: string;
  }> = [];

  console.log("Headers yang ditemukan:", headers);

  headers.forEach((header, colIndex) => {
    if (header && typeof header === "string") {
      const normalized = header.toLowerCase().trim();
      console.log(
        `Checking header at column ${colIndex}: "${header}" -> normalized: "${normalized}"`
      );

      if (MONTH_MAPPING.hasOwnProperty(normalized)) {
        const monthInfo = MONTH_MAPPING[normalized];
        monthObjects.push({
          colIndex,
          monthIndex: monthInfo.index,
          name: monthInfo.name,
        });
        console.log(`✓ Found month: ${monthInfo.name} at column ${colIndex}`);
      }
    }
  });

  // Sort by month index untuk memastikan urutan yang benar
  monthObjects.sort((a, b) => a.monthIndex - b.monthIndex);

  const indices = monthObjects.map((m) => m.colIndex);
  const names = monthObjects.map((m) => m.name);

  console.log("Month columns detected:", { indices, names });

  return { indices, names, monthObjects };
};

// Fungsi untuk menentukan bulan forecast (bulan berikutnya)
const calculateForecastMonth = (lastMonthName: string): string => {
  const normalized = lastMonthName.toLowerCase().trim();

  if (MONTH_MAPPING.hasOwnProperty(normalized)) {
    const monthIndex = MONTH_MAPPING[normalized].index;
    const nextMonthIndex = (monthIndex + 1) % 12;
    return MONTH_NAMES[nextMonthIndex];
  }

  return "Unknown";
};

export const parseExcelFile = async (file: File): Promise<ParsedResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Ambil sheet pertama
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert ke JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: 0,
          raw: false, // Pastikan semua data dibaca sebagai string terlebih dahulu
        });

        console.log("Total rows:", jsonData.length);

        if (jsonData.length < 2) {
          throw new Error("File tidak memiliki data yang cukup");
        }

        // Header row (index 0)
        const headers = jsonData[0] as any[];
        console.log("First 15 headers:", headers.slice(0, 15));

        // Deteksi kolom bulan dinamis
        const {
          indices: monthIndices,
          names: monthNames,
          monthObjects,
        } = detectMonthColumns(headers);

        if (monthIndices.length === 0) {
          console.error("Tidak ada kolom bulan yang terdeteksi!");
          throw new Error(
            "Tidak ditemukan kolom bulan dalam file Excel. Pastikan header memiliki nama bulan seperti Jan, Februari, Maret, dll."
          );
        }

        console.log(
          `Ditemukan ${monthIndices.length} kolom bulan:`,
          monthNames
        );

        // Tentukan bulan forecast
        const lastMonth = monthNames[monthNames.length - 1];
        const forecastMonth = calculateForecastMonth(lastMonth);

        console.log(
          "Last month:",
          lastMonth,
          "-> Forecast month:",
          forecastMonth
        );

        // Skip header row (index 0)
        const dataRows = jsonData.slice(1) as any[][];

        console.log(`Processing ${dataRows.length} data rows...`);

        const products: ProductData[] = dataRows
          .filter((row, idx) => {
            const hasName = row[0] && String(row[0]).trim() !== "";
            if (!hasName) {
              console.log(`Skipping row ${idx + 2} - no product name`);
            }
            return hasName;
          })
          .map((row, idx) => {
            // Build monthlyData object
            const monthlyData: { [key: string]: number } = {};
            monthObjects.forEach((monthObj) => {
              const value = Number(row[monthObj.colIndex]) || 0;
              monthlyData[monthObj.name] = value;
            });

            // Ambil nilai bulan statis untuk backward compatibility (kolom 1-10)
            const jan = Number(row[1]) || 0;
            const februari = Number(row[2]) || 0;
            const maret = Number(row[3]) || 0;
            const april = Number(row[4]) || 0;
            const mei = Number(row[5]) || 0;
            const juni = Number(row[6]) || 0;
            const juli = Number(row[7]) || 0;
            const agustus = Number(row[8]) || 0;
            const september = Number(row[9]) || 0;
            const oktober = Number(row[10]) || 0;

            const product = {
              namaBarang: String(row[0] || "").trim(),

              // Data bulan dinamis
              monthlyData,
              monthColumns: monthNames,

              // Data bulan statis
              jan,
              februari,
              maret,
              april,
              mei,
              juni,
              juli,
              agustus,
              september,
              oktober,

              totalQtyOut: Number(row[11]) || 0,
              rumusBantuan: Number(row[12]) || 0,
              order: Number(row[13]) || 0,
              rekomendasiOrder: Number(row[14]) || 0,
              stokAccurate: Number(row[15]) || 0,
              pendingan: Number(row[16]) || 0,
              tanggalETA: String(row[17] || ""),
              eta: Number(row[18]) || 0,
              rataRataKebutuhanPerbulan: Number(row[19]) || 0,
              forecast3: Number(row[20]) || 0,
              indeksMusiman: Number(row[21]) || 0,
              kapasitasGudang: Number(row[22]) || 0,
              statusGudang: String(row[23] || ""),
              minimumStok: Number(row[24]) || 0,
              kategoriRisiko: String(row[25] || ""),
              orderOtomatis: Number(row[26]) || 0,
              orderTidakOrder: String(row[27] || ""),
              meeting: String(row[28] || ""),
              kubikasi: Number(row[29]) || 0,
            };

            if (idx === 0) {
              console.log("Sample product:", product.namaBarang);
              console.log("Monthly data:", product.monthlyData);
            }

            return product;
          });

        console.log(`Successfully parsed ${products.length} products`);

        resolve({
          products,
          monthColumns: monthNames,
          forecastMonth,
        });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
};

export const validateExcelStructure = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Validasi minimal ada header dan 1 data
        resolve(jsonData.length > 1);
      } catch {
        resolve(false);
      }
    };

    reader.readAsBinaryString(file);
  });
};
