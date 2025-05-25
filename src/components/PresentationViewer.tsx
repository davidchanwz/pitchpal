'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PresentationStatus from './PresentationStatus';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Maximize,
  Monitor,
  Users
} from 'lucide-react';

interface PresentationViewerProps {
  selectedAvatar?: any;
  script: string;
  slides?: any[];
  onClose?: () => void;
}

export default function PresentationViewer({
  selectedAvatar,
  script,
  slides = [],
  onClose
}: PresentationViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('excellent');
  const [viewerCount, setViewerCount] = useState(1);
  const [duration, setDuration] = useState("00:00");
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTime = useRef<number>(Date.now());

  // Simulate WebRTC connection and presentation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    // Simulate connection quality changes
    const qualityInterval = setInterval(() => {
      const qualities: ('excellent' | 'good' | 'poor')[] = ['excellent', 'good', 'poor'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);

    // Simulate viewer count changes
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(qualityInterval);
      clearInterval(viewerInterval);
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Here you would integrate with your WebRTC and avatar API
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Here you would toggle the WebRTC audio stream
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Here you would toggle the WebRTC video stream
  };

  const handleEndPresentation = () => {
    setIsPlaying(false);
    if (onClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Main Video Container */}
      <div className="relative w-full h-full">
        {/* Avatar Video Stream */}
        <div className="absolute inset-0 flex items-center justify-center">
          {selectedAvatar ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              {/* Placeholder for WebRTC video stream */}
              <div className="w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
                {selectedAvatar.imageUrl ? (
                  <img 
                    src={selectedAvatar.imageUrl} 
                    alt={selectedAvatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="h-48 w-48 text-white" />
                )}
              </div>
              
              {/* Avatar Name Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
              >
                <Badge className="bg-black/80 text-white border-white/20">
                  {selectedAvatar.name}
                </Badge>
              </motion.div>
            </motion.div>
          ) : (
            <div className="text-white text-center">
              <Monitor className="h-24 w-24 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Loading Avatar...</p>
            </div>
          )}
        </div>

        {/* Slide Preview (Picture-in-Picture) */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-6 w-64 h-48"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">
                  Slide {currentSlide + 1} of {slides.length || 12}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(((currentSlide + 1) / (slides.length || 12)) * 100)}%
                </Badge>
              </div>
              <div className="flex-1 bg-white rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">Slide Content</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Script Display */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6"
        >
          <Card className="bg-black/50 backdrop-blur-md border-white/20">
            <div className="p-6">
              <div className="text-white text-center">
                <p className="text-lg leading-relaxed">
                  {script.split('\n')[0] || "Welcome to today's presentation..."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Presentation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayPause}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 w-16 h-16 rounded-full"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNextSlide}
            disabled={currentSlide === (slides.length || 12) - 1}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleAudio}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </motion.div>
      </div>

      {/* Status Panel */}
      <PresentationStatus
        isConnected={true}
        connectionQuality={connectionQuality}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        viewerCount={viewerCount}
        duration={duration}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onEndPresentation={handleEndPresentation}
      />
    </motion.div>
  );
}
