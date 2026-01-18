
import * as XLSX from 'xlsx';
import { OrderData } from '../types';

export const generateExcel = (orders: OrderData[], filename: string) => {
  const data = orders.map((order, index) => ({
    'STT': index + 1,
    'Trang PDF': order.pages.join(', '),
    'Mã Vận Đơn': order.trackingId,
    'Sản Phẩm': order.products.map(p => p.raw).join(' | '),
    'Tổng SL': order.totalQty,
    'Loại Đơn': order.isMulti ? 'Đơn Ghép' : 'Đơn Lẻ',
    'Ghi Chú': order.note,
    'File pdf': order.fileName
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DonHang");

  // Định dạng độ rộng cột
  const wscols = [
    {wch: 5}, {wch: 15}, {wch: 20}, {wch: 50}, {wch: 10}, {wch: 15}, {wch: 30}, {wch: 40}
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, filename);
};
