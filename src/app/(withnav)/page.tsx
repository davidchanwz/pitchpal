"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingNavbar from "@/components/FloatingNavbar";
import FileUpload from "@/components/FileUpload";
import AvatarSelection from "@/components/AvatarSelection";
import SlideExtractor from "@/components/SlideExtractor";
import ScriptGenerator from "@/components/ScriptGenerator";
import PresentationAnalytics from "@/components/PresentationAnalytics";
import {
  Presentation,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { scenarios } from "@/config/scenarios";
import { UploadService } from "@/services/UploadService";

// Mock data - replace with actual API calls
const mockAvatars = [
  {
    id: "henry",
    name: "Henry",
    description:
      "Professional business presenter with a confident tone. Perfect for corporate presentations and executive briefings.",
    imageUrl: "/avatars/henry.png",
    voicePreview: "sample-voice-1.mp3",
    gender: "male" as const,
    accent: "American",
    specialty: "Business & Corporate",
  },
  {
    id: "jessie",
    name: "Jessie",
    description:
      "Friendly and approachable presenter ideal for educational content and training sessions.",
    imageUrl: "/avatars/jessie.png",
    voicePreview: "sample-voice-2.mp3",
    gender: "female" as const,
    accent: "British",
    specialty: "Education & Training",
  },
  {
    id: "kenji",
    name: "Kenji",
    description:
      "Tech-savvy presenter perfect for technical demonstrations and product launches.",
    imageUrl: "/avatars/kenji.png",
    voicePreview: "sample-voice-3.mp3",
    gender: "male" as const,
    accent: "American",
    specialty: "Technology & Innovation",
  },
  {
    id: "martha",
    name: "Martha",
    description:
      "Experienced and authoritative presenter for academic and research presentations.",
    imageUrl: "/avatars/martha.png",
    voicePreview: "sample-voice-4.mp3",
    gender: "female" as const,
    accent: "American",
    specialty: "Academic & Research",
  },
  {
    id: "michelle",
    name: "Michelle",
    description: "Dynamic and engaging presenter for marketing and sales pitches.",
    imageUrl: "/avatars/michelle.png",
    voicePreview: "sample-voice-5.mp3",
    gender: "female" as const,
    accent: "American",
    specialty: "Marketing & Sales",
  },
];

const mockScript = `Welcome to today's presentation! 

I'm excited to share with you our latest insights and findings. In this presentation, we'll cover three main areas:

First, we'll explore the current market landscape and identify key opportunities for growth. Our research shows significant potential in emerging markets, with a projected 25% increase in demand over the next 18 months.

Second, we'll dive into our innovative solution and how it addresses the current challenges in the industry. Our platform leverages cutting-edge AI technology to streamline processes and improve efficiency by up to 40%.

Finally, we'll discuss our implementation strategy and the expected outcomes. We've developed a phased approach that minimizes risk while maximizing impact, with projected ROI of 300% within the first year.

Let's begin with our market analysis...`;

function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [slideId, setSlideId] = useState<string | null>(null);
  const [extractedSlides, setExtractedSlides] = useState<any[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [showNextStepNotification, setShowNextStepNotification] = useState<string | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [recentPresentations] = useState([
    { id: 1, title: "Q4 Sales Review", date: "2 hours ago", duration: "8 min" },
    {
      id: 2,
      title: "Product Launch Strategy",
      date: "Yesterday",
      duration: "12 min",
    },
    {
      id: 3,
      title: "Team Training Session",
      date: "3 days ago",
      duration: "15 min",
    },
  ]);

  // Helper function to show notifications with proper timeout management
  const showNotification = (message: string, duration = 5000) => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setShowNextStepNotification(message);
    
    // Set new timeout
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNextStepNotification(null);
      notificationTimeoutRef.current = null;
    }, duration);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Verify database schema on component mount
  useEffect(() => {
    const verifySchema = async () => {
      console.log('🔍 [Dashboard] Verifying database schema...');
      try {
        const result = await UploadService.verifyDatabaseSchema();
        if (result.success) {
          console.log('✅ [Dashboard] Database schema verification completed:', result.data);
        } else {
          console.error('❌ [Dashboard] Database schema verification failed:', result.error);
        }
      } catch (error) {
        console.error('❌ [Dashboard] Schema verification error:', error);
      }
    };

    verifySchema();
  }, []);

  // Handle file upload to Supabase
  const handleFileUpload = async (file: File) => {
    console.log('📤 [Page.handleFileUpload] Starting file upload process...');
    console.log('📤 [Page.handleFileUpload] File:', file.name, 'Size:', file.size);

    setUploadedFile(file);
    setIsProcessingFile(true);
    setUploadProgress(0);
    setUploadError(null);
    setSlideId(null);

    try {
      // Upload file to Supabase
      setUploadProgress(30);
      console.log('☁️ [Page.handleFileUpload] Calling UploadService.uploadSlide...');

      const uploadResult = await UploadService.uploadSlide(file);

      console.log('☁️ [Page.handleFileUpload] Upload result:', uploadResult);

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      console.log('✅ [Page.handleFileUpload] File uploaded successfully');
      console.log('✅ [Page.handleFileUpload] slideId:', uploadResult.data.slideId);
      console.log('✅ [Page.handleFileUpload] path:', uploadResult.data.path);

      setSlideId(uploadResult.data.slideId);
      setUploadProgress(100);
      setIsProcessingFile(false);

      // File uploaded successfully - user can now extract slides
      showNotification("✅ File uploaded successfully! Now extract your slides by clicking the 'Extract Slides' button below.");

    } catch (error) {
      console.error('❌ [Page.handleFileUpload] File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setIsProcessingFile(false);
      setUploadProgress(0);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setSlideId(null);
    setIsProcessingFile(false);
    setUploadProgress(0);
    setUploadError(null);
    setGeneratedScript("");
    setExtractedSlides([]);
    setShowNextStepNotification(null);
    
    // Clear notification timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
  };

  // Simulate script generation
  const generateScript = async () => {
    setIsGeneratingScript(true);

    // Simulate API call delay
    setTimeout(() => {
      setGeneratedScript(mockScript);
      setIsGeneratingScript(false);
    }, 3000);
  };

  const handleScriptUpdate = (newScript: string) => {
    setGeneratedScript(newScript);
  };

  const handleStartPresentation = () => {
    if (!selectedAvatarId) {
      setActiveTab("avatar");
      return;
    }
    // Find the scenario for the selected avatar
    const scenario = scenarios.find(
      (s: any) => s.avatar === selectedAvatarId && s.href === '/presentation'
    );
    if (scenario) {
      router.push(`/presentation?scenario=${scenario.id}`);
    } else {
      alert("No scenario found for this avatar.");
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    if (avatarId) {
      const selectedAvatar = mockAvatars.find(a => a.id === avatarId);
      showNotification(`👤 ${selectedAvatar?.name} selected! You're ready to start your presentation.`, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* nav bar */}
      {/* <FloatingNavbar 
        userName="Demo User"
        isProcessing={isProcessingFile || isGeneratingScript}
      /> */}

      {/* Hero Section */}
      <motion.div
        className="pt-24 pb-8 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center mt-20">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Presentations</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Transform Your PowerPoint into
              <br />
              AI Avatar Presentations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your PPTX files and watch as AI creates engaging
              presentations with realistic avatars. Perfect for training, demos,
              and professional presentations.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              {
                icon: Presentation,
                label: "Presentations Created",
                value: "2,847",
              },
              { icon: Clock, label: "Hours Saved", value: "1,234" },
              { icon: Users, label: "Active Users", value: "892" },
              { icon: TrendingUp, label: "Success Rate", value: "98.5%" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs
          value={activeTab}
          onValueChange={(newTab) => {
            const oldTab = activeTab;
            setActiveTab(newTab);
            
            // Clear context-specific notifications when switching tabs
            if (showNextStepNotification) {
              // Clear upload notifications when leaving upload tab
              if (oldTab === "upload" && showNextStepNotification.includes("uploaded")) {
                setShowNextStepNotification(null);
                if (notificationTimeoutRef.current) {
                  clearTimeout(notificationTimeoutRef.current);
                  notificationTimeoutRef.current = null;
                }
              }
              // Clear script notifications when leaving script tab
              else if (oldTab === "script" && showNextStepNotification.includes("script")) {
                setShowNextStepNotification(null);
                if (notificationTimeoutRef.current) {
                  clearTimeout(notificationTimeoutRef.current);
                  notificationTimeoutRef.current = null;
                }
              }
              // Keep avatar notifications visible across tabs since they're global success messages
            }
          }}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-[800px] mx-auto">
              <TabsTrigger
                value="upload"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>1. Upload</span>
                {uploadedFile && (
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="script"
                className="flex items-center space-x-2 relative"
                disabled={extractedSlides.length === 0}
                title={extractedSlides.length === 0 ? "Extract slides first" : "Generate AI script"}
              >
                <Wand2 className="h-4 w-4" />
                <span>2. Script</span>
                {generatedScript && (
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
                )}
                {extractedSlides.length === 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">!</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="avatar"
                className="flex items-center space-x-2 relative"
                disabled={!generatedScript}
                title={!generatedScript ? "Generate script first" : "Select your AI avatar"}
              >
                <Users className="h-4 w-4" />
                <span>3. Avatar</span>
                {selectedAvatarId && (
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />
                )}
                {!generatedScript && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">!</span>
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>4. Analytics</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Workflow Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className={`flex items-center space-x-2 ${uploadedFile ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${uploadedFile ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>File Uploaded</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 mx-4" />
              <div className={`flex items-center space-x-2 ${extractedSlides.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${extractedSlides.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Slides Extracted</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 mx-4" />
              <div className={`flex items-center space-x-2 ${generatedScript ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${generatedScript ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Script Generated</span>
              </div>
              <div className="flex-1 h-px bg-gray-200 mx-4" />
              <div className={`flex items-center space-x-2 ${selectedAvatarId ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full ${selectedAvatarId ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Avatar Selected</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Notification Banner */}
          <AnimatePresence>
            {showNextStepNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-blue-700">{showNextStepNotification}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        onClick={() => {
                          setShowNextStepNotification(null);
                          // Clear the timeout when manually dismissed
                          if (notificationTimeoutRef.current) {
                            clearTimeout(notificationTimeoutRef.current);
                            notificationTimeoutRef.current = null;
                          }
                        }}
                        className="inline-flex rounded-md bg-blue-50 p-1.5 text-blue-500 hover:bg-blue-100 transition-colors"
                      >
                        <span className="sr-only">Dismiss</span>
                        <span className="text-lg">×</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    isProcessing={isProcessingFile}
                    progress={uploadProgress}
                    uploadedFile={uploadedFile}
                    error={uploadError}
                  />

                  {uploadedFile && (
                    <SlideExtractor
                      file={uploadedFile}
                      onSlidesExtracted={async (slides) => {
                        console.log('🎯 [Page.onSlidesExtracted] Received extracted slides');
                        console.log('🎯 [Page.onSlidesExtracted] slideId:', slideId);
                        console.log('🎯 [Page.onSlidesExtracted] slides count:', slides.length);
                        console.log('🎯 [Page.onSlidesExtracted] slides preview:', slides.slice(0, 2));

                        setExtractedSlides(slides);

                        // Save extracted slides to database if we have a slideId
                        if (slideId && slides.length > 0) {
                          console.log('🗄️ [Page.onSlidesExtracted] Attempting to save extracted slides to database...');
                          try {
                            const result = await UploadService.updateSlideWithExtractedContent(slideId, slides);
                            if (result.success) {
                              console.log('✅ [Page.onSlidesExtracted] Extracted slides saved to database successfully');
                            } else {
                              console.error('❌ [Page.onSlidesExtracted] Failed to save extracted slides:', result.error);
                            }
                          } catch (error) {
                            console.error('❌ [Page.onSlidesExtracted] Unexpected error saving extracted slides:', error);
                          }
                        } else {
                          console.warn('⚠️ [Page.onSlidesExtracted] Skipping save - missing slideId or no slides');
                          console.log('⚠️ [Page.onSlidesExtracted] slideId:', slideId);
                          console.log('⚠️ [Page.onSlidesExtracted] slides count:', slides.length);
                        }

                        // Slides extracted successfully - user can now proceed to script generation
                        if (slides.length > 0) {
                          showNotification(`🎯 Successfully extracted ${slides.length} slides! Click the 'Script' tab to generate your AI script.`, 6000);
                        }
                      }}
                    />
                  )}
                </div>

                {/* Recent Presentations Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Recent Presentations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentPresentations.map((presentation) => (
                        <motion.div
                          key={presentation.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {presentation.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {presentation.date}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {presentation.duration}
                          </Badge>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="script" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ScriptGenerator
                    slides={extractedSlides}
                    slideId={slideId || undefined}
                    onScriptGenerated={(script) => {
                      console.log('🤖 [Page.onScriptGenerated] Script generation completed');
                      console.log('🤖 [Page.onScriptGenerated] script length:', script.length);
                      console.log('🤖 [Page.onScriptGenerated] script preview:', script.substring(0, 100) + '...');

                      setGeneratedScript(script);
                      // Script generated successfully - user can now proceed to avatar selection or edit the script
                      if (script) {
                        showNotification("🤖 AI script generated successfully! You can edit it above or click the 'Avatar' tab to select your presenter.", 6000);
                      }
                    }}
                  />
                </div>

                {/* Action Panel */}
                <div className="space-y-6">
                  {generatedScript && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Wand2 className="h-5 w-5 text-purple-600" />
                            <span>Next Steps</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                              Your AI script is ready! You can continue editing it or proceed to select an avatar presenter.
                            </p>
                            
                            <Button 
                              onClick={handleStartPresentation}
                              className="w-full"
                              size="lg"
                            >
                              <Users className="h-5 w-5 mr-2" />
                              Choose Avatar & Start
                            </Button>
                            
                            <div className="text-center">
                              <Button
                                variant="outline"
                                onClick={() => setActiveTab("avatar")}
                                className="w-full"
                              >
                                Go to Avatar Selection
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Script Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Script Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>
                          Keep sentences clear and concise for better avatar
                          pronunciation
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>Add natural pauses with commas and periods</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>
                          Use conversational language to engage your audience
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>
                          Include transitions between slides for smooth flow
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="avatar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AvatarSelection
                    avatars={mockAvatars}
                    selectedAvatarId={selectedAvatarId}
                    onAvatarSelect={handleAvatarSelect}
                  />
                </div>

                {/* Presentation Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Presentation Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedAvatarId && (
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
                            {mockAvatars.find((a) => a.id === selectedAvatarId)
                              ?.imageUrl ? (
                              <img
                                src={
                                  mockAvatars.find(
                                    (a) => a.id === selectedAvatarId
                                  )?.imageUrl
                                }
                                alt="Selected Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="h-12 w-12 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {
                                mockAvatars.find(
                                  (a) => a.id === selectedAvatarId
                                )?.name
                              }
                            </p>
                            <p className="text-sm text-gray-600">
                              {
                                mockAvatars.find(
                                  (a) => a.id === selectedAvatarId
                                )?.specialty
                              }
                            </p>
                          </div>
                          <Button
                            onClick={handleStartPresentation}
                            className="w-full"
                            size="lg"
                          >
                            Start Presentation
                          </Button>
                        </div>
                      )}

                      {!selectedAvatarId && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>Select an avatar to preview</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <PresentationAnalytics />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;
