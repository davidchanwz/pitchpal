'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  isProcessing?: boolean;
  progress?: number;
  uploadedFile?: File | null;
  error?: string | null;
}

export default function FileUpload({
  onFileUpload,
  onFileRemove,
  isProcessing = false,
  progress = 0,
  uploadedFile,
  error
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8">
        {!uploadedFile ? (
          <motion.div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300",
              isDragActive 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-gray-300 hover:border-primary hover:bg-gray-50"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isDragActive ? "Drop your PPTX file here" : "Upload your PowerPoint presentation"}
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your .pptx file here, or click to browse
              </p>
              <Badge variant="secondary" className="text-sm">
                .PPTX files only
              </Badge>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isProcessing ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                  </motion.div>
                ) : error ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <button
                  onClick={onFileRemove}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span>Processing presentation...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-md"
                >
                  <p className="text-red-800 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
