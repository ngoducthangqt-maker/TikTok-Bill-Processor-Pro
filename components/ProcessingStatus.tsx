
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  progress: number;
  message: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ progress, message }) => {
  return (
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <Loader2 className="w-full h-full text-blue-600 animate-spin absolute top-0 left-0" />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-blue-600">
          {Math.round(progress)}%
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">Đang xử lý dữ liệu...</h3>
      <p className="text-gray-500 font-medium">{message}</p>
      
      <div className="w-full max-w-md mx-auto mt-8 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="mt-12 text-sm text-gray-400 italic">
        "Vui lòng không đóng tab này cho đến khi quy trình hoàn tất."
      </p>
    </div>
  );
};
