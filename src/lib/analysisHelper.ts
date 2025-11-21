import { ProductData, AnalysisSummary } from "@/types";

export const calculateAnalysisSummary = (
  products: ProductData[]
): AnalysisSummary => {
  const totalProducts = products.length;

  const totalOrderRecommendations = products.reduce(
    (sum, p) => sum + (p.rekomendasiOrder || 0),
    0
  );

  const productsNeedOrdering = products.filter(
    (p) =>
      p.orderTidakOrder?.includes("Order") || p.orderTidakOrder?.includes("🔁")
  ).length;

  const averageForecast =
    products.reduce((sum, p) => sum + (p.forecast3 || 0), 0) / totalProducts;

  const highRiskProducts = products.filter(
    (p) =>
      p.kategoriRisiko?.includes("tinggi") || p.kategoriRisiko?.includes("🔝")
  ).length;

  const warehouseOverload = products.filter(
    (p) =>
      p.statusGudang?.includes("Overload") || p.statusGudang?.includes("⚠️")
  ).length;

  return {
    totalProducts,
    totalOrderRecommendations,
    productsNeedOrdering,
    averageForecast: Math.round(averageForecast),
    highRiskProducts,
    warehouseOverload,
  };
};

export const getTopProducts = (products: ProductData[], count: number = 10) => {
  return [...products]
    .sort((a, b) => b.totalQtyOut - a.totalQtyOut)
    .slice(0, count);
};

export const getProductsNeedingOrder = (products: ProductData[]) => {
  return products.filter(
    (p) =>
      p.orderTidakOrder?.includes("Order") || p.orderTidakOrder?.includes("🔁")
  );
};

export const getRiskDistribution = (products: ProductData[]) => {
  const distribution = {
    normal: 0,
    tinggi: 0,
  };

  products.forEach((p) => {
    if (
      p.kategoriRisiko?.includes("tinggi") ||
      p.kategoriRisiko?.includes("🔝")
    ) {
      distribution.tinggi++;
    } else {
      distribution.normal++;
    }
  });

  return [
    { name: "Normal", value: distribution.normal, fill: "#22c55e" },
    { name: "Tinggi", value: distribution.tinggi, fill: "#ef4444" },
  ];
};
