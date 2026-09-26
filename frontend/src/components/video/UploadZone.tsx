import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Image as ImageIcon, Video } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

interface UploadZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  className?: string;
}

export function UploadZone({ 
  onFile, 
  accept = "image/*,video/*", 
  maxSize = 50 * 1024 * 1024, // 50MB default
  label = "Upload file",
  description = "Drag & drop or click to browse",
  className
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Max size is ${formatBytes(maxSize)}`);
      return;
    }
    
    // Check type if accept is specific
    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return selectedFile.type.startsWith(type.replace('/*', ''));
        }
        return selectedFile.type === type || selectedFile.name.endsWith(type);
      });
      
      if (!isAccepted) {
        setError("File type not supported");
        return;
      }
    }

    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
    
    onFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={className}>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleChange}
        accept={accept}
        className="hidden" 
      />
      
      <div 
        onClick={() => !file && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 text-center overflow-hidden",
          !file ? "cursor-pointer min-h-[200px]" : "bg-slate-900 border-slate-700",
          isDragging && !file ? "border-violet-500 bg-violet-500/5 scale-[1.02]" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50",
          error && "border-red-500/50 bg-red-500/5"
        )}
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex items-center justify-between p-2"
            >
              <div className="flex items-center gap-4 text-left overflow-hidden">
                <div className="w-16 h-16 shrink-0 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  ) : file.type.startsWith('video/') ? (
                    <Video className="text-violet-400" />
                  ) : (
                    <FileIcon className="text-slate-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <button 
                  onClick={clearFile}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center pointer-events-none"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                isDragging ? "bg-violet-500/20 text-violet-400" : "bg-slate-800 text-slate-400"
              )}>
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{label}</h3>
              <p className="text-sm text-slate-400 max-w-[250px]">{description}</p>
              <p className="text-xs text-slate-500 mt-4">Max size: {formatBytes(maxSize)}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-sm text-red-400 mt-2"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
