
import React from 'react';
import { Box, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              BILL PROCESSOR <span className="bg-blue-500 text-[10px] px-1.5 py-0.5 rounded text-white">PRO</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-2 h-2 text-amber-400" /> Powered by Client-Side Engine
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
          <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Cloud Sync</a>
          <a href="#" className="text-white bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">v2.5.0</a>
        </div>
      </div>
    </header>
  );
};
