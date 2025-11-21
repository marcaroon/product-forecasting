export interface ProductData {
    namaBarang: string;
    
    // Data bulan dinamis
    monthlyData: { [key: string]: number };
    monthColumns: string[];
    
    // Data bulan statis (backward compatibility)
    jan: number;
    februari: number;
    maret: number;
    april: number;
    mei: number;
    juni: number;
    juli: number;
    agustus: number;
    september: number;
    oktober: number;
    
    totalQtyOut: number;
    rumusBantuan: number;
    order: number;
    rekomendasiOrder: number;
    stokAccurate: number;
    pendingan: number;
    tanggalETA: string;
    eta: number;
    rataRataKebutuhanPerbulan: number;
    forecast3: number;
    indeksMusiman: number;
    kapasitasGudang: number;
    statusGudang: string;
    minimumStok: number;
    kategoriRisiko: string;
    orderOtomatis: number;
    orderTidakOrder: string;
    meeting: string;
    kubikasi: number;
  }
  
  export interface AnalysisSummary {
    totalProducts: number;
    totalOrderRecommendations: number;
    productsNeedOrdering: number;
    averageForecast: number;
    highRiskProducts: number;
    warehouseOverload: number;
  }
  
  export interface ParsedResult {
    products: ProductData[];
    monthColumns: string[];
    forecastMonth: string;
  }