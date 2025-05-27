'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Video, 
  VideoOff,
  Mic,
  MicOff,
  Users,
  Clock,
  Activity
} from 'lucide-react';

interface PresentationStatusProps {
  isConnected?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  viewerCount?: number;
  duration?: string;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onEndPresentation?: () => void;
}

export default function PresentationStatus({
  isConnected = false,
  connectionQuality = 'disconnected',
  isVideoEnabled = true,
  isAudioEnabled = true,
  viewerCount = 0,
  duration = "00:00",
  onToggleVideo,
  onToggleAudio,
  onEndPresentation
}: PresentationStatusProps) {
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-red-600" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="bg-white/95 backdrop-blur-md border shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getConnectionIcon()}
                <span className="text-sm font-medium">
                  {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
                </span>
                <div className={`w-2 h-2 rounded-full ${getConnectionColor()} ${isConnected ? 'animate-pulse' : ''}`} />
              </div>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Live" : "Offline"}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-xs text-gray-600">Viewers</div>
                <div className="text-sm font-medium">{viewerCount}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-xs text-gray-600">Duration</div>
                <div className="text-sm font-medium">{duration}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Activity className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-xs text-gray-600">Quality</div>
                <div className="text-sm font-medium">HD</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant={isVideoEnabled ? "default" : "secondary"}
                  size="sm"
                  onClick={onToggleVideo}
                  className="w-8 h-8 p-0"
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant={isAudioEnabled ? "default" : "secondary"}
                  size="sm"
                  onClick={onToggleAudio}
                  className="w-8 h-8 p-0"
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onEndPresentation}
                  className="px-3"
                >
                  End
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
