'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Image,
  Download,
  Eye,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import JSZip from 'jszip';
import { PptxParsingService, type ParsedSlide } from '@/services/PptxParsingService';

interface ExtractedSlide {
  id: number;
  title: string;
  content: string;
  notes?: string;
  thumbnail?: string;
  extractedText?: string;
  images?: string[];
}

interface SlideExtractorProps {
  file: File | null;
  onSlidesExtracted?: (slides: ExtractedSlide[]) => void;
  className?: string;
}

export default function SlideExtractor({
  file,
  onSlidesExtracted,
  className = ""
}: SlideExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSlides, setExtractedSlides] = useState<ExtractedSlide[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Extract slides from PPTX file
  const extractSlides = async () => {
    if (!file) return;

    // Validate file type
    if (!PptxParsingService.isValidPptxFile(file)) {
      setError("Please upload a valid PowerPoint (.pptx or .ppt) file.");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate processing steps with real progress
      const steps = [
        "Reading PPTX file...",
        "Extracting slide structure...",
        "Processing text content...",
        "Extracting speaker notes...",
        "Finalizing extraction..."
      ];

      // Step 1: Reading file
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2-5: Parse the actual PPTX file
      setProgress(40);
      const parsedSlides = await PptxParsingService.parsePptxFile(file);

      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Convert ParsedSlide to ExtractedSlide format
      const extractedSlides: ExtractedSlide[] = parsedSlides.map(slide => ({
        id: slide.id,
        title: slide.title,
        content: slide.content,
        notes: slide.notes,
        thumbnail: slide.thumbnail,
        extractedText: slide.extractedText,
        images: slide.images
      }));

      setProgress(100);
      setExtractedSlides(extractedSlides);
      onSlidesExtracted?.(extractedSlides);

    } catch (err) {
      console.error('Slide extraction error:', err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to extract slides from PPTX file. Please ensure it's a valid PowerPoint presentation."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadSlideData = () => {
    const dataStr = JSON.stringify(extractedSlides, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name?.replace('.pptx', '')}_slides.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Slide Extraction</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {file && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {!isExtracting && extractedSlides.length === 0 && (
                  <Button onClick={extractSlides}>
                    Extract Slides
                  </Button>
                )}
              </div>

              {/* Progress */}
              {isExtracting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Extracting slides...</span>
                    <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
                      {progress < 20 && "Reading PowerPoint file..."}
                      {progress >= 20 && progress < 40 && "Parsing slide structure..."}
                      {progress >= 40 && progress < 70 && "Extracting text and notes..."}
                      {progress >= 70 && "Finalizing extraction..."}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={extractSlides}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}

              {/* Success & Results */}
              {extractedSlides.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Success Message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">Extraction Complete</span>
                    </div>
                    <p className="text-green-700 mt-1">
                      Successfully extracted {extractedSlides.length} slides from your presentation.
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {extractedSlides.length}
                      </div>
                      <div className="text-sm text-blue-800">Slides</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {extractedSlides.filter(s => s.images && s.images.length > 0).length}
                      </div>
                      <div className="text-sm text-purple-800">With Images</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {extractedSlides.filter(s => s.notes).length}
                      </div>
                      <div className="text-sm text-green-800">With Notes</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(extractedSlides.reduce((acc, slide) =>
                          acc + (slide.content?.length || 0), 0) / extractedSlides.length)}
                      </div>
                      <div className="text-sm text-orange-800">Avg Words</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        Ready for Script Generation
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSlideData}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Could open a preview modal
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* Quick Preview of First Few Slides */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Slide Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                      {extractedSlides.slice(0, 4).map((slide) => (
                        <div
                          key={slide.id}
                          className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {slide.id}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {slide.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {slide.content}
                              </p>
                            </div>
                            {slide.images && slide.images.length > 0 && (
                              <Image className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {extractedSlides.length > 4 && (
                      <p className="text-xs text-gray-500 text-center">
                        And {extractedSlides.length - 4} more slides...
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {!file && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Upload a PPTX file to extract slides and content
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
