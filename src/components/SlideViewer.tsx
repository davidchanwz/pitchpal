'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Grid3X3,
  List
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
}

interface SlideViewerProps {
  slides: Slide[];
  currentSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

// Mock slides data
const mockSlides: Slide[] = [
  { id: 1, title: "Introduction", content: "Welcome to our presentation" },
  { id: 2, title: "Market Analysis", content: "Current market trends and opportunities" },
  { id: 3, title: "Our Solution", content: "Innovative AI-powered platform" },
  { id: 4, title: "Technology Stack", content: "Cutting-edge technologies we use" },
  { id: 5, title: "Implementation", content: "Step-by-step implementation strategy" },
  { id: 6, title: "ROI Projections", content: "Expected return on investment" },
  { id: 7, title: "Case Studies", content: "Success stories from our clients" },
  { id: 8, title: "Timeline", content: "Project timeline and milestones" },
  { id: 9, title: "Team", content: "Meet our expert team" },
  { id: 10, title: "Next Steps", content: "How to get started" },
  { id: 11, title: "Q&A", content: "Questions and answers" },
  { id: 12, title: "Thank You", content: "Thank you for your attention" },
];

export default function SlideViewer({
  slides = mockSlides,
  currentSlide = 0,
  onSlideChange,
  viewMode = 'grid',
  onViewModeChange
}: SlideViewerProps) {
  const [selectedSlide, setSelectedSlide] = useState(currentSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSlideSelect = (index: number) => {
    setSelectedSlide(index);
    if (onSlideChange) onSlideChange(index);
  };

  const handlePrevSlide = () => {
    const newIndex = Math.max(0, selectedSlide - 1);
    handleSlideSelect(newIndex);
  };

  const handleNextSlide = () => {
    const newIndex = Math.min(slides.length - 1, selectedSlide + 1);
    handleSlideSelect(newIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Presentation Slides</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {slides.length} slides
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Slide Preview */}
          <motion.div
            key={selectedSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="p-6">
                <div className="aspect-video flex items-center justify-center bg-white rounded-lg shadow-sm">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {slides[selectedSlide]?.title}
                      </h3>
                      <p className="text-gray-600 mt-2">
                        {slides[selectedSlide]?.content}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">
                    Slide {selectedSlide + 1} of {slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(true)}
                  >
                    <Maximize2 className="h-4 w-4 mr-1" />
                    Fullscreen
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevSlide}
                disabled={selectedSlide === 0}
                className="rounded-full w-8 h-8 p-0 shadow-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNextSlide}
                disabled={selectedSlide === slides.length - 1}
                className="rounded-full w-8 h-8 p-0 shadow-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Slide Thumbnails */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">All Slides</h4>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-3 gap-2' 
                : 'space-y-2'
            } max-h-60 overflow-y-auto`}>
              {slides.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedSlide === index
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => handleSlideSelect(index)}
                  >
                    <CardContent className={`${viewMode === 'grid' ? 'p-2' : 'p-3'}`}>
                      {viewMode === 'grid' ? (
                        <div className="space-y-1">
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium truncate">
                              {slide.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {index + 1}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="h-3 w-3 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {slide.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {slide.content}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg max-w-4xl w-full aspect-video flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-4 p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {slides[selectedSlide]?.title}
                  </h2>
                  <p className="text-gray-600 mt-4 text-lg">
                    {slides[selectedSlide]?.content}
                  </p>
                </div>
                <Button onClick={() => setIsFullscreen(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
