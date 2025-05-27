'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  onFileUpload?: (file: File, uploadResult?: any) => void;
  onFileRemove?: () => void;
  isProcessing?: boolean;
  progress?: number;
  uploadedFile?: File | null;
  error?: string | null;
}

export default function FileUpload({
  onFileUpload,
  onFileRemove,
  isProcessing: externalProcessing = false,
  progress: externalProgress = 0,
  uploadedFile: externalUploadedFile = null,
  error: externalError = null
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [internalUploadedFile, setInternalUploadedFile] = useState<File | null>(null);
  const [internalIsProcessing, setInternalIsProcessing] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Use external props if provided, otherwise use internal state
  const uploadedFile = externalUploadedFile || internalUploadedFile;
  const isProcessing = externalProcessing || internalIsProcessing;
  const progress = externalProgress || internalProgress;
  const error = externalError || internalError;

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setInternalIsProcessing(true);
    setInternalError(null);
    setInternalProgress(0);
    setUploadResult(null);

    // Simulate progress animation (for the loading bar)
    const progressInterval = setInterval(() => {
      setInternalProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', uuidv4()); // Simulating user_id, replace with actual user ID logic
    
    try {
      const res = await fetch('/api/supabase', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Clear the progress interval and set to 100%
      clearInterval(progressInterval);
      setInternalProgress(100);
      
      // Set the upload result (equivalent to setResult in your reference)
      setUploadResult(data);
      
      // Call the callback with file and result
      onFileUpload?.(file, data);
      
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setInternalError(errorMessage);
      setInternalProgress(0);
      setUploadResult('Upload failed'); // Set result even on error
    } finally {
      setInternalIsProcessing(false);
      
      // Reset progress after a delay
      setTimeout(() => {
        setInternalProgress(0);
      }, 2000);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setInternalUploadedFile(file);
      handleUpload(file);
    }
  }, []);

  const handleRemoveFile = () => {
    setInternalUploadedFile(null);
    setInternalError(null);
    setUploadResult(null);
    setInternalProgress(0);
    onFileRemove?.();
  };

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
    disabled: isProcessing,
  });

  // Get the dropzone props but don't spread them all
  const rootProps = getRootProps();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-8">
        {!uploadedFile ? (
          <motion.div
            onClick={rootProps.onClick}
            onKeyDown={rootProps.onKeyDown}
            onFocus={rootProps.onFocus}
            onBlur={rootProps.onBlur}
            tabIndex={rootProps.tabIndex}
            role={rootProps.role}
            aria-disabled={rootProps['aria-disabled']}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300",
              isDragActive 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-gray-300 hover:border-primary hover:bg-gray-50",
              isProcessing && "pointer-events-none opacity-50"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onDragEnter={() => setIsDragActive(true)}
            onDragLeave={() => setIsDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragActive(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0 && files[0].name.endsWith('.pptx')) {
                onDrop(files as File[]);
              }
            }}
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
                ) : uploadResult ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : null}
                <button
                  onClick={handleRemoveFile}
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
                    <span>Uploading presentation...</span>
                    <span>{Math.round(progress)}%</span>
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

              {uploadResult && !isProcessing && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-green-800 text-sm font-medium">
                      Upload successful!
                    </p>
                  </div>
                  <p className="text-green-700 text-xs mt-1">
                    File ID: {uploadResult.id}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}