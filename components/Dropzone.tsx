import React, { useState, useCallback } from 'react';
import { FileUp, File as FileIcon, X } from 'lucide-react';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAccepted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Added explicit type to filter callback to resolve 'unknown' type error
    const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type === 'application/pdf');
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Added explicit type to filter callback to resolve 'unknown' type error
      const files = Array.from(e.target.files).filter((f: File) => f.type === 'application/pdf');
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onFilesAccepted(selectedFiles);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 text-center
          ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={onFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <FileUp className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-gray-700">Kéo thả file vào đây</p>
          <p className="text-gray-500">Hoặc click để chọn file từ máy tính (Chỉ PDF)</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-gray-700">Đã chọn {selectedFiles.length} file:</h3>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              Xóa hết
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {selectedFiles.map((file, i) => (
              <div key={`${file.name}-${i}`} className="flex items-center justify-between bg-white border border-gray-100 px-3 py-2 rounded-lg text-sm group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate text-gray-600">{file.name}</span>
                  <span className="text-[10px] text-gray-400">({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                </div>
                <button 
                  onClick={() => removeFile(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-[0.98]"
          >
            Bắt đầu xử lý hóa đơn
          </button>
        </div>
      )}
    </div>
  );
};