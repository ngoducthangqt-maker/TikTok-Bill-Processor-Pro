
export interface ProcessingLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ProductItem {
  code: string;
  qty: number;
  raw: string;
}

export interface OrderData {
  startPage: number;
  pages: number[];
  trackingId: string;
  products: ProductItem[];
  totalQty: number;
  isMulti: boolean;
  note: string;
  fileName: string;
}

export interface ProcessingState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  logs: ProcessingLog[];
  resultPdfUrl?: string;
  orders: OrderData[];
  stats?: {
    totalFiles: number;
    totalPages: number;
    fileNames: string[];
    singleOrders: number;
    multiOrders: number;
    ordersPerFile: Record<string, number>; // Thống kê bill theo file
  };
}
