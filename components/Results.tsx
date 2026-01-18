
import React, { useState, useMemo } from 'react';
import { 
  Download, FileText, RotateCcw, 
  ExternalLink, Table as TableIcon, ListChecks,
  Printer, Copy, Filter, Layers, ArrowDownNarrowWide,
  Check, AlertCircle
} from 'lucide-react';
import { OrderData } from '../types';
import { generateExcel } from '../utils/excel-helper';

interface ResultsProps {
  pdfUrl?: string;
  orders: OrderData[];
  stats?: any;
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({ pdfUrl, orders, stats, onReset }) => {
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // 1. Lấy danh sách SKU duy nhất để hiển thị trong dropdown (Tối ưu bằng useMemo)
  const uniqueSkus = useMemo(() => {
    const skus = new Set<string>();
    orders.forEach(o => o.products.forEach(p => skus.add(p.code)));
    return Array.from(skus).sort();
  }, [orders]);

  const handleExportExcel = () => {
    generateExcel(orders, `Ket_Qua_Don_Hang_${new Date().getTime()}.xlsx`);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.set(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const copyToClipboardText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // 2. Logic Lọc trang theo mã sản phẩm cụ thể
  const skuPagesString = useMemo(() => {
    if (!selectedSku) return '';
    const pages = orders
      .filter(o => o.products.some(p => p.code === selectedSku))
      .flatMap(o => o.pages);
    // Fixed: Explicitly typed sort parameters to ensure they are treated as numbers for the arithmetic operation
    return Array.from(new Set(pages)).sort((a: number, b: number) => a - b).join(',');
  }, [orders, selectedSku]);

  // 3. Logic In gom nhóm theo sản phẩm (Chỉ đơn lẻ) & Sắp xếp theo tần suất giảm dần
  const groupedPagesString = useMemo(() => {
    const singleOrders = orders.filter(o => !o.isMulti);
    const groups: Record<string, number[]> = {};
    
    singleOrders.forEach(o => {
      const sku = o.products[0]?.code;
      if (sku) {
        if (!groups[sku]) groups[sku] = [];
        groups[sku].push(...o.pages);
      }
    });

    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length) // Mã nào nhiều đơn nhất lên đầu
      .flatMap(([_, pages]) => pages)
      .join(',');
  }, [orders]);

  // 4. Logic In ưu tiên tiền tố (TP -> KG -> KU)
  const priorityPagesString = useMemo(() => {
    const getPriority = (sku: string) => {
      if (sku.startsWith('TP')) return 1;
      if (sku.startsWith('KG')) return 2;
      if (sku.startsWith('KU')) return 3;
      return 4;
    };

    const sorted = [...orders].sort((a, b) => {
      // Đơn lẻ lên trước, đơn ghép xuống sau
      if (a.isMulti !== b.isMulti) return a.isMulti ? 1 : -1;
      
      const skuA = a.products[0]?.code || '';
      const skuB = b.products[0]?.code || '';
      
      const priA = getPriority(skuA);
      const priB = getPriority(skuB);
      
      if (priA !== priB) return priA - priB;
      return skuA.localeCompare(skuB); // Cùng tiền tố thì xếp theo alphabet SKU
    });

    return sorted.flatMap(o => o.pages).join(',');
  }, [orders]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-20">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tổng đơn hàng</p>
          <p className="text-2xl font-black text-white">{orders.length || 0}</p>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Đơn hàng lẻ</p>
          <p className="text-2xl font-black text-white">{stats?.singleOrders || 0}</p>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Đơn hàng ghép</p>
          <p className="text-2xl font-black text-white">{stats?.multiOrders || 0}</p>
        </div>
        <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Tổng số trang</p>
          <p className="text-2xl font-black text-white">{stats?.totalPages || 0}</p>
        </div>
      </div>

      {/* TRUNG TÂM ĐIỀU KHIỂN IN ẤN */}
      <div className="bg-slate-800 border-2 border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-indigo-600/10 px-6 py-4 border-b border-indigo-500/20 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg"><Printer className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="font-bold text-white leading-tight">Trung tâm Điều khiển In ấn</h3>
              <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">Tạo chuỗi trang để dán vào hộp thoại In</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700">
             <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Mẹo: Nhấn Ctrl + P và dán chuỗi vào ô "Pages"</span>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Cột 1: Lọc theo SKU */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 space-y-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Lọc in theo mã</span>
            </div>
            <select 
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Chọn mã sản phẩm --</option>
              {uniqueSkus.map(sku => <option key={sku} value={sku}>{sku}</option>)}
            </select>
            <button
              disabled={!selectedSku}
              onClick={() => copyToClipboardText(skuPagesString, 'sku')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:grayscale text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copyStatus === 'sku' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copyStatus === 'sku' ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP CHUỖI TRANG'}
            </button>
          </div>

          {/* Cột 2: Gom nhóm đơn lẻ */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Gom đơn lẻ theo SKU</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed min-h-[48px]">
              Tự động gom các đơn hàng lẻ cùng mã lại với nhau. Mã nào có nhiều đơn nhất sẽ được in trước.
            </div>
            <button
              onClick={() => copyToClipboardText(groupedPagesString, 'grouped')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copyStatus === 'grouped' ? <Check className="w-4 h-4" /> : <ArrowDownNarrowWide className="w-4 h-4" />}
              {copyStatus === 'grouped' ? 'ĐÃ SAO CHÉP' : 'IN GOM NHÓM ĐƠN LẺ'}
            </button>
          </div>

          {/* Cột 3: Ưu tiên tiền tố */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 space-y-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <ListChecks className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">In theo khu vực kho</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed min-h-[48px]">
              Sắp xếp theo thứ tự: Đơn lẻ <span className="text-orange-300 font-bold">TP → KG → KU</span>. Các đơn hàng ghép sẽ được in cuối cùng.
            </div>
            <button
              onClick={() => copyToClipboardText(priorityPagesString, 'priority')}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {copyStatus === 'priority' ? <Check className="w-4 h-4" /> : <ListChecks className="w-4 h-4" />}
              {copyStatus === 'priority' ? 'ĐÃ SAO CHÉP' : 'IN ƯU TIÊN TP > KG > KU'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <div className="flex flex-col lg:flex-row gap-4 justify-center">
          <a
            href={pdfUrl}
            download="HOA_DON_DA_XU_LY.pdf"
            className="flex-1 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-slate-100 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" /> TẢI FILE PDF TỔNG
          </a>
          <button
            onClick={handleExportExcel}
            className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-500 transition-all active:scale-95"
          >
            <TableIcon className="w-5 h-5" /> XUẤT FILE EXCEL
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-8 py-4 bg-slate-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-600 transition-all"
          >
            <ExternalLink className="w-5 h-5" /> XEM TRƯỚC PDF
          </a>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-slate-900/50 rounded-3xl border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <h4 className="font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Xem trước dữ liệu hóa đơn
          </h4>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hiển thị 50 đơn hàng đầu</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 border-b border-slate-700">
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Trang PDF</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Mã Vận Đơn</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Sản Phẩm</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Số lượng</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest">Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.slice(0, 50).map((order, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400 font-bold">{order.pages.join(', ')}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">{order.trackingId}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {order.products.map((p, pIdx) => (
                        <span key={pIdx} className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                          {p.raw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{order.totalQty}</td>
                  <td className="px-6 py-4">
                    {order.isMulti ? (
                      <span className="text-[10px] font-black bg-orange-500/20 text-orange-500 px-2 py-1 rounded uppercase tracking-tighter">Đơn ghép</span>
                    ) : (
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded uppercase tracking-tighter">Đơn lẻ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 bg-slate-900 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors border border-slate-800"
      >
        <RotateCcw className="w-4 h-4" /> Bắt đầu quy trình xử lý mới
      </button>
    </div>
  );
};
