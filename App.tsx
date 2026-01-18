
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { Results } from './components/Results';
import { PdfEngine } from './services/pdf-service';
import { ProcessingState } from './types';
import { Terminal, FileStack, CheckCircle } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    logs: [],
    orders: []
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.logs]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setState(prev => ({ ...prev, status: 'processing', progress: 0, logs: [], orders: [] }));

    const engine = new PdfEngine(
      (log) => setState(prev => ({ ...prev, logs: [...prev.logs, log].slice(-50) })),
      (progress) => setState(prev => ({ ...prev, progress }))
    );

    try {
      const result = await engine.process(files);
      
      const ordersPerFile: Record<string, number> = {};
      result.orders.forEach(order => {
        ordersPerFile[order.fileName] = (ordersPerFile[order.fileName] || 0) + 1;
      });

      setState(prev => ({
        ...prev,
        status: 'completed',
        resultPdfUrl: result.pdfUrl,
        orders: result.orders,
        stats: {
          totalFiles: files.length,
          totalPages: result.totalPages,
          fileNames: files.map(f => f.name),
          singleOrders: result.orders.filter(o => !o.isMulti).length,
          multiOrders: result.orders.filter(o => o.isMulti).length,
          ordersPerFile
        }
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        logs: [...prev.logs, { id: 'err', timestamp: '!', message: String(error), type: 'error' }] 
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-10">
        {state.status === 'idle' && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4 text-white">Xử lý Hóa đơn TikTok</h2>
                <p className="text-slate-400 mb-8 text-sm">Công cụ chuyên nghiệp để ghép file và xuất báo cáo tự động.</p>
                <Dropzone onFilesAccepted={handleFiles} />
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-indigo-900/20 p-6 rounded-2xl border border-indigo-500/30">
                <FileStack className="w-8 h-8 text-indigo-400 mb-4" />
                <h3 className="font-bold text-lg text-white mb-2">Quy trình chuyên nghiệp</h3>
                <ul className="text-xs text-slate-400 space-y-3">
                  <li className="flex gap-2"><span><CheckCircle className="w-3 h-3 text-emerald-500" /></span> Tự động gộp đơn hàng nhiều trang.</li>
                  <li className="flex gap-2"><span><CheckCircle className="w-3 h-3 text-emerald-500" /></span> Đánh số trang định dạng X/Y.</li>
                  <li className="flex gap-2"><span><CheckCircle className="w-3 h-3 text-emerald-500" /></span> Tốc độ xử lý cực nhanh tại trình duyệt.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {state.status === 'processing' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              <div className="bg-slate-800 px-6 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Engine Output</span>
                </div>
              </div>
              <div className="p-6 font-mono text-sm h-80 overflow-y-auto custom-scrollbar bg-black/40">
                {state.logs.map(log => (
                  <div key={log.id} className="flex gap-3 mb-1.5">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-rose-400' : 'text-blue-400'}>
                      {log.message}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
              <div className="p-6 bg-slate-800/50">
                <div className="flex justify-between text-xs mb-2 font-bold text-slate-400">
                  <span>TIẾN ĐỘ</span>
                  <span>{Math.round(state.progress)}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${state.progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {state.status === 'completed' && (
          <div className="space-y-8">
            <Results 
              pdfUrl={state.resultPdfUrl}
              orders={state.orders}
              stats={state.stats}
              onReset={() => setState({ status: 'idle', progress: 0, logs: [], orders: [] })} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
