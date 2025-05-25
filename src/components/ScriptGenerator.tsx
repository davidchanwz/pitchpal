'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  RefreshCw, 
  Download, 
  Copy, 
  Check,
  Settings,
  Clock,
  FileText,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface ScriptGeneratorProps {
  slides?: any[];
  onScriptGenerated?: (script: string) => void;
  className?: string;
}

interface GenerationSettings {
  tone: 'professional' | 'casual' | 'enthusiastic' | 'academic';
  length: 'concise' | 'detailed' | 'comprehensive';
  focusAreas: string[];
  targetAudience: 'general' | 'technical' | 'executive' | 'sales';
}

const defaultSettings: GenerationSettings = {
  tone: 'professional',
  length: 'detailed',
  focusAreas: ['key_points', 'transitions', 'engagement'],
  targetAudience: 'general'
};

export default function ScriptGenerator({ 
  slides = [], 
  onScriptGenerated,
  className = "" 
}: ScriptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [progress, setProgress] = useState(0);
  const [settings, setSettings] = useState<GenerationSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Calculate estimated duration and word count
  useEffect(() => {
    if (generatedScript) {
      const words = generatedScript.split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      
      // Estimate speaking time (average 150 words per minute)
      const minutes = Math.ceil(words / 150);
      setEstimatedDuration(`${minutes} min${minutes !== 1 ? 's' : ''}`);
    }
  }, [generatedScript]);

  // Simulate AI script generation
  const generateScript = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate generation steps
      const steps = [
        "Analyzing slide content...",
        "Understanding presentation flow...",
        "Generating narrative structure...",
        "Creating smooth transitions...",
        "Adding engagement elements...",
        "Finalizing script..."
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Generate script based on slides and settings
      const script = generateScriptContent();
      setGeneratedScript(script);
      onScriptGenerated?.(script);

    } catch (error) {
      console.error('Script generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateScriptContent = () => {
    const { tone, length, targetAudience } = settings;
    
    // Base script template that adapts based on settings
    let script = "";

    // Introduction
    if (tone === 'enthusiastic') {
      script += "Hello everyone, and welcome to what I believe will be an exciting and transformative presentation! ";
    } else if (tone === 'casual') {
      script += "Hi there! Thanks for joining me today. I'm excited to share some insights with you. ";
    } else if (tone === 'academic') {
      script += "Good day. Today we will examine and analyze the key findings and methodologies presented in this research. ";
    } else {
      script += "Good morning, and thank you for your time today. I'm pleased to present our findings and recommendations. ";
    }

    // Main content based on slides
    if (slides.length > 0) {
      slides.forEach((slide, index) => {
        if (length === 'comprehensive') {
          script += `\n\nLet's move to slide ${index + 1}, where we explore ${slide.title}. ${slide.content} `;
          
          if (targetAudience === 'technical') {
            script += "From a technical perspective, this involves several key components and considerations that are crucial for implementation. ";
          } else if (targetAudience === 'executive') {
            script += "The business impact of this cannot be overstated, with direct implications for our strategic objectives. ";
          } else if (targetAudience === 'sales') {
            script += "This represents a significant opportunity for our clients to achieve measurable results and competitive advantage. ";
          } else {
            script += "This is important because it directly affects how we approach our goals and measure success. ";
          }
          
        } else if (length === 'detailed') {
          script += `\n\nOn slide ${index + 1}, we see ${slide.title}. ${slide.content} `;
          script += "This is a crucial point that ties into our overall strategy and objectives. ";
        } else {
          script += `\n\n${slide.title}: ${slide.content.substring(0, 100)}... `;
        }

        // Add transitions
        if (index < slides.length - 1) {
          if (tone === 'enthusiastic') {
            script += "Now, this leads us beautifully to our next exciting point! ";
          } else if (tone === 'casual') {
            script += "So, moving on to what's next... ";
          } else {
            script += "This brings us to our next consideration. ";
          }
        }
      });
    } else {
      // Default content when no slides provided
      script += `\n\nIn today's presentation, we'll cover three main areas that are critical to our success.

First, we'll examine the current landscape and identify key opportunities for growth and innovation. Our analysis shows significant potential in emerging markets and technologies.

Second, we'll dive deep into our proposed solution and how it addresses the challenges we've identified. This approach leverages cutting-edge methodologies to deliver measurable results.

Finally, we'll discuss implementation strategies and expected outcomes, including timelines, resource requirements, and success metrics.`;
    }

    // Conclusion
    if (tone === 'enthusiastic') {
      script += "\n\nI'm genuinely excited about these opportunities and what they mean for our future! Thank you for your attention, and I look forward to our discussion.";
    } else if (tone === 'casual') {
      script += "\n\nSo that's a wrap! I hope this has been helpful. Happy to answer any questions you might have.";
    } else if (tone === 'academic') {
      script += "\n\nIn conclusion, the evidence presented supports our hypothesis and methodology. I welcome questions and further discussion on these findings.";
    } else {
      script += "\n\nTo summarize, we've outlined a clear path forward with defined objectives and measurable outcomes. I welcome your questions and feedback.";
    }

    return script;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadScript = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-script.txt';
    a.click();
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              <span>AI Script Generator</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              {!isGenerating && (
                <Button onClick={generateScript}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Script
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="font-medium text-gray-900">Generation Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Tone
                    </label>
                    <select
                      value={settings.tone}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        tone: e.target.value as GenerationSettings['tone'] 
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="academic">Academic</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Length
                    </label>
                    <select
                      value={settings.length}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        length: e.target.value as GenerationSettings['length'] 
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="concise">Concise</option>
                      <option value="detailed">Detailed</option>
                      <option value="comprehensive">Comprehensive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Target Audience
                    </label>
                    <select
                      value={settings.targetAudience}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        targetAudience: e.target.value as GenerationSettings['targetAudience'] 
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="general">General Audience</option>
                      <option value="technical">Technical Team</option>
                      <option value="executive">Executive Level</option>
                      <option value="sales">Sales & Marketing</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide Information */}
          {slides.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Using {slides.length} slides for script generation
                </span>
              </div>
              <p className="text-blue-800 text-sm mt-1">
                The AI will create a narrative that flows through all your slides with smooth transitions.
              </p>
            </div>
          )}

          {slides.length === 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-900">No slides detected</span>
              </div>
              <p className="text-orange-800 text-sm mt-1">
                Upload and extract slides first for a more tailored script, or generate a generic template.
              </p>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating your script...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is analyzing your content and creating a compelling narrative</span>
              </div>
            </motion.div>
          )}

          {/* Generated Script */}
          {generatedScript && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Script Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{wordCount}</div>
                  <div className="text-sm text-green-800">Words</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{estimatedDuration}</div>
                  <div className="text-sm text-blue-800">Duration</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{slides.length || 'N/A'}</div>
                  <div className="text-sm text-purple-800">Slides</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 capitalize">{settings.tone}</div>
                  <div className="text-sm text-orange-800">Tone</div>
                </div>
              </div>

              {/* Script Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Generated Script</h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadScript}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateScript}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Your generated script will appear here..."
                />

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Estimated reading time: {estimatedDuration} at normal speaking pace</span>
                </div>
              </div>

              {/* Script Tips */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Script Tips</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Practice reading the script aloud to ensure natural flow</li>
                  <li>• Mark key emphasis points and pause locations</li>
                  <li>• Customize the script to match your personal speaking style</li>
                  <li>• Consider your audience and adjust technical language as needed</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!generatedScript && !isGenerating && (
            <div className="text-center py-8">
              <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                Click "Generate Script" to create an AI-powered presentation script
              </p>
              <p className="text-sm text-gray-400">
                {slides.length > 0 
                  ? `Based on your ${slides.length} slides` 
                  : 'Generic template will be used'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
