'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PresentationStatus from './PresentationStatus';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Square,
  Settings,
  Wand2
} from 'lucide-react';
import { AIPresentationOrchestrator, PresentationConfig, PresentationState } from '@/services/AIPresentationOrchestrator';
import { ScriptParser } from '@/services/ScriptParser';

interface AIAvatarPresentationProps {
  script: string;
  avatar: any;
  slides: any[];
  onClose?: () => void;
}

export default function AIAvatarPresentation({ 
  script, 
  avatar, 
  slides, 
  onClose 
}: AIAvatarPresentationProps) {
  const [orchestrator, setOrchestrator] = useState<AIPresentationOrchestrator | null>(null);
  const [presentationState, setPresentationState] = useState<PresentationState>({
    isPlaying: false,
    currentSegment: 0,
    currentSlide: 0,
    elapsedTime: 0,
    status: 'idle'
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState({
    autoAdvance: true,
    pauseBetweenSlides: 1.5,
    speechRate: 1.0
  });

  // Initialize orchestrator
  useEffect(() => {
    // Mock TTS service - replace with actual implementation
    const mockTTSService = {
      async synthesizeSpeech(text: string, voiceId: string): Promise<AudioBuffer> {
        // This would be replaced with actual TTS API call
        const audioContext = new AudioContext();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
        return buffer;
      }
    };

    const presentationConfig: PresentationConfig = {
      script,
      avatar,
      slides,
      autoAdvance: config.autoAdvance,
      pauseBetweenSlides: config.pauseBetweenSlides
    };

    const orch = new AIPresentationOrchestrator(
      presentationConfig,
      mockTTSService,
      setPresentationState,
      setCurrentSlideIndex
    );

    setOrchestrator(orch);

    return () => {
      orch.stopPresentation();
    };
  }, [script, avatar, slides, config]);

  const handlePlayPause = useCallback(() => {
    if (!orchestrator) return;

    if (presentationState.isPlaying) {
      orchestrator.pausePresentation();
    } else if (presentationState.status === 'paused') {
      orchestrator.resumePresentation();
    } else {
      orchestrator.startPresentation();
    }
  }, [orchestrator, presentationState]);

  const handleStop = useCallback(() => {
    if (!orchestrator) return;
    orchestrator.stopPresentation();
  }, [orchestrator]);

  const handleSlideNavigation = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(slides.length - 1, currentSlideIndex + 1)
      : Math.max(0, currentSlideIndex - 1);
    setCurrentSlideIndex(newIndex);
  }, [slides.length, currentSlideIndex]);

  const progress = orchestrator ? orchestrator.getProgress() : { current: 0, total: 0, percentage: 0 };
  const parsedScript = ScriptParser.parseScript(script);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Main Content Container */}
      <div className="relative w-full h-full">
        {/* Avatar Video Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            {/* Avatar Display */}
            <div className="w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
              {avatar?.imageUrl ? (
                <img 
                  src={avatar.imageUrl} 
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-6xl font-bold">
                  {avatar?.name?.[0] || 'A'}
                </div>
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
                {avatar?.name || 'AI Avatar'}
              </Badge>
            </motion.div>
          </motion.div>
        </div>

        {/* Slide Preview (Picture-in-Picture) */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-6 w-80 h-60"
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">
                  Slide {currentSlideIndex + 1} of {slides.length}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(((currentSlideIndex + 1) / slides.length) * 100)}%
                </Badge>
              </div>
              
              <div className="flex-1 bg-white rounded p-4 flex flex-col items-center justify-center">
                {slides[currentSlideIndex] ? (
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">
                      {slides[currentSlideIndex].title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {slides[currentSlideIndex].content}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No slide content</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Script Display */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6"
        >
          <Card className="bg-black/50 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="text-white text-center space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Segment {progress.current} of {progress.total}</span>
                    <span>{Math.round(progress.percentage)}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>
                
                {/* Current Text */}
                <p className="text-lg leading-relaxed">
                  {parsedScript.segments[presentationState.currentSegment]?.text || 
                   "Preparing presentation..."}
                </p>
                
                {/* Status Indicator */}
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    presentationState.status === 'playing' ? 'bg-green-500 animate-pulse' :
                    presentationState.status === 'paused' ? 'bg-yellow-500' :
                    presentationState.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm capitalize">
                    {presentationState.status === 'idle' ? 'Ready' : presentationState.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Presentation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4"
        >
          {/* Manual slide navigation */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSlideNavigation('prev')}
            disabled={currentSlideIndex === 0}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {/* Main play/pause button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayPause}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 w-16 h-16 rounded-full"
          >
            {presentationState.isPlaying ? 
              <Pause className="h-6 w-6" /> : 
              <Play className="h-6 w-6 ml-1" />
            }
          </Button>

          {/* Stop button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStop}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <Square className="h-4 w-4" />
          </Button>

          {/* Manual slide navigation */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSlideNavigation('next')}
            disabled={currentSlideIndex === slides.length - 1}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Audio toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* Settings */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-6 left-6 w-80"
            >
              <Card className="bg-black/80 backdrop-blur-md border-white/20">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-white font-medium flex items-center space-x-2">
                    <Wand2 className="h-4 w-4" />
                    <span>AI Presentation Settings</span>
                  </h3>
                  
                  <div className="space-y-3 text-white text-sm">
                    <div className="flex items-center justify-between">
                      <label>Auto-advance slides</label>
                      <input
                        type="checkbox"
                        checked={config.autoAdvance}
                        onChange={(e) => setConfig(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label>Pause between slides (seconds)</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={config.pauseBetweenSlides}
                        onChange={(e) => setConfig(prev => ({ ...prev, pauseBetweenSlides: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-300">{config.pauseBetweenSlides}s</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label>Speech rate</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={config.speechRate}
                        onChange={(e) => setConfig(prev => ({ ...prev, speechRate: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-300">{config.speechRate}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Panel */}
      <PresentationStatus
        isConnected={true}
        connectionQuality="excellent"
        isVideoEnabled={true}
        isAudioEnabled={isAudioEnabled}
        viewerCount={1}
        duration={`${Math.floor(presentationState.elapsedTime / 60)}:${(presentationState.elapsedTime % 60).toString().padStart(2, '0')}`}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
        onEndPresentation={onClose}
      />
    </motion.div>
  );
}
