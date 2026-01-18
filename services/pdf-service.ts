
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { ProcessingLog, OrderData, ProductItem } from '../types';

// Thiết lập worker cho pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.530/build/pdf.worker.mjs`;

export class PdfEngine {
  private onLog: (log: ProcessingLog) => void;
  private onProgress: (progress: number) => void;

  constructor(onLog: (log: ProcessingLog) => void, onProgress: (progress: number) => void) {
    this.onLog = onLog;
    this.onProgress = onProgress;
  }

  private log(message: string, type: ProcessingLog['type'] = 'info') {
    this.onLog({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    });
  }

  async process(files: File[]): Promise<{ pdfUrl: string, totalPages: number, orders: OrderData[] }> {
    this.log(`Bắt đầu xử lý ${files.length} tệp PDF...`, 'info');
    
    try {
      const masterPdf = await PDFDocument.create();
      const font = await masterPdf.embedFont(StandardFonts.HelveticaBold);
      const orders: OrderData[] = [];
      let globalPageCounter = 1;

      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        this.log(`Đang phân tích: ${file.name}...`);
        
        const arrayBuffer = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer);
        
        // PDF.js để trích xuất text
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdfJsDoc = await loadingTask.promise;

        // BƯỚC 1: Trích xuất dữ liệu text trước (Nhanh)
        let currentOrder: OrderData | null = null;
        for (let pIdx = 0; pIdx < pdfJsDoc.numPages; pIdx++) {
          const page = await pdfJsDoc.getPage(pIdx + 1);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');

          const trackingMatch = textItems.match(/\b(VNGH[A-Z0-9]+)\b/) || textItems.match(/\b(8\d{11,14})\b/);
          const trackingId = trackingMatch ? trackingMatch[0] : null;

          const skuRegex = /([A-Z0-9]+\*[A-Z0-9]+)/g;
          const skus: string[] = [];
          let sMatch;
          while ((sMatch = skuRegex.exec(textItems)) !== null) {
            if (sMatch[0].length > 4) skus.push(sMatch[0]);
          }

          const pageProducts: ProductItem[] = skus.map(sku => ({
            code: sku.split('*')[0],
            qty: parseInt(sku.split('*')[1] || '1', 10),
            raw: sku
          }));

          if (trackingId) {
            if (currentOrder) orders.push(currentOrder);
            currentOrder = {
              trackingId,
              products: pageProducts,
              fileName: file.name,
              isMulti: false,
              totalQty: pageProducts.reduce((acc, curr) => acc + curr.qty, 0),
              pages: [globalPageCounter + pIdx],
              note: '',
              startPage: globalPageCounter + pIdx
            };
          } else if (currentOrder && pageProducts.length > 0) {
            currentOrder.pages.push(globalPageCounter + pIdx);
            currentOrder.products.push(...pageProducts);
            currentOrder.totalQty = currentOrder.products.reduce((acc, curr) => acc + curr.qty, 0);
          }
        }
        if (currentOrder) orders.push(currentOrder);

        // BƯỚC 2: Ghép toàn bộ trang của file này vào masterPdf (Tối ưu hiệu năng)
        // Thay vì gọi copyPages trong vòng lặp pIdx, gọi 1 lần cho cả file
        const pageIndices = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
        const copiedPages = await masterPdf.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(page => masterPdf.addPage(page));

        globalPageCounter += srcDoc.getPageCount();
        this.onProgress(((fIdx + 1) / files.length) * 90);
      }

      // Hậu xử lý dữ liệu
      orders.forEach(order => {
        const uniqueCodes = new Set(order.products.map(p => p.code));
        order.isMulti = uniqueCodes.size >= 2 || order.totalQty > 1;
        order.note = order.isMulti ? `Đơn ghép (${order.totalQty} món)` : '';
      });

      // Đánh số trang (Chỉ thực hiện 1 lần cuối cùng)
      this.log("Đang hoàn tất file PDF tổng...");
      const finalPages = masterPdf.getPages();
      const totalFinalPages = finalPages.length;
      for (let i = 0; i < totalFinalPages; i++) {
        const page = finalPages[i];
        const { width } = page.getSize();
        const pageNumText = `${i + 1}/${totalFinalPages}`;
        page.drawText(pageNumText, {
          x: width / 2 - 15,
          y: 20,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      const pdfBytes = await masterPdf.save();
      const pdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      
      this.onProgress(100);
      this.log("Xử lý hoàn tất!", 'success');
      return { pdfUrl, totalPages: totalFinalPages, orders };
    } catch (error) {
      this.log(`Lỗi hệ thống: ${String(error)}`, 'error');
      throw error;
    }
  }
}
