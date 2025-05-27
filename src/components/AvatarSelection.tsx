'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  CheckCircle2
} from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  voicePreview?: string;
  gender: 'male' | 'female';
  accent: string;
  specialty: string;
}

interface AvatarSelectionProps {
  avatars: Avatar[];
  selectedAvatarId?: string;
  onAvatarSelect: (avatarId: string) => void;
  isLoading?: boolean;
}

export default function AvatarSelection({
  avatars,
  selectedAvatarId,
  onAvatarSelect,
  isLoading = false
}: AvatarSelectionProps) {
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const handleVoicePreview = (avatarId: string, voicePreview?: string) => {
    if (!voicePreview) return;
    
    if (playingPreview === avatarId) {
      setPlayingPreview(null);
    } else {
      setPlayingPreview(avatarId);
      // Simulate voice preview duration
      setTimeout(() => setPlayingPreview(null), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Choose Your AI Avatar</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select an AI presenter for your presentation
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 max-h-[500px] overflow-y-auto">
            <AnimatePresence>
              {avatars.map((avatar, index) => (
                <motion.div
                  key={avatar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedAvatarId === avatar.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => onAvatarSelect(avatar.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Avatar Image */}
                        <div className="relative">
                          <motion.div
                            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden"
                            whileHover={{ scale: 1.1 }}
                          >
                            {avatar.imageUrl ? (
                              <img 
                                src={avatar.imageUrl} 
                                alt={avatar.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-8 w-8 text-white" />
                            )}
                          </motion.div>
                          {selectedAvatarId === avatar.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
                            >
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>

                        {/* Avatar Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {avatar.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {avatar.gender}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {avatar.description}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>Accent: {avatar.accent}</span>
                            <span>•</span>
                            <span>{avatar.specialty}</span>
                          </div>
                        </div>

                        {/* Voice Preview */}
                        <div className="flex flex-col items-center space-y-2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVoicePreview(avatar.id, avatar.voicePreview);
                              }}
                              disabled={!avatar.voicePreview}
                              className="h-8 w-8 p-0"
                            >
                              {playingPreview === avatar.id ? (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                  <Pause className="h-4 w-4" />
                                </motion.div>
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </motion.div>
                          {avatar.voicePreview ? (
                            <Volume2 className="h-3 w-3 text-gray-400" />
                          ) : (
                            <VolumeX className="h-3 w-3 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-4"
            >
              <div className="flex items-center space-x-2 text-gray-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                />
                <span className="text-sm">Loading avatars...</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
