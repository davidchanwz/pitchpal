'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  Wand2,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ScriptPreviewProps {
  script: string;
  onScriptUpdate: (newScript: string) => void;
  onStartPresentation: () => void;
  isGenerating?: boolean;
  slideCount?: number;
  estimatedDuration?: string;
}

export default function ScriptPreview({
  script,
  onScriptUpdate,
  onStartPresentation,
  isGenerating = false,
  slideCount = 0,
  estimatedDuration = "5-7 minutes"
}: ScriptPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(script);

  const handleSave = () => {
    onScriptUpdate(editedScript);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedScript(script);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Generated Script</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isGenerating ? (
                <Badge variant="secondary" className="animate-pulse">
                  <Wand2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </Badge>
              ) : (
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isGenerating}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Script Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{slideCount} slides</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedDuration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>{script.split(' ').length} words</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Wand2 className="h-8 w-8 text-blue-600" />
                </motion.div>
                <div className="text-center">
                  <p className="font-medium">AI is crafting your presentation script...</p>
                  <p className="text-sm text-gray-600">This usually takes 30-60 seconds</p>
                </div>
              </motion.div>
            ) : isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  className="min-h-[400px] resize-none"
                  placeholder="Edit your presentation script..."
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {script || "Your generated script will appear here..."}
                  </pre>
                </div>
                
                {script && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button 
                      onClick={onStartPresentation}
                      className="w-full"
                      size="lg"
                    >
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Wand2 className="h-5 w-5" />
                        <span>Start AI Avatar Presentation</span>
                      </motion.div>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
