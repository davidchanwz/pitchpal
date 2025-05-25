'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingNavbar from "@/components/FloatingNavbar";
import FileUpload from "@/components/FileUpload";
import ScriptPreview from "@/components/ScriptPreview";
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
  Wand2
} from "lucide-react";

// Mock data - replace with actual API calls
const mockAvatars = [
  {
    id: "henry",
    name: "Henry",
    description: "Professional business presenter with a confident tone. Perfect for corporate presentations and executive briefings.",
    imageUrl: "/avatars/henry.png",
    voicePreview: "sample-voice-1.mp3",
    gender: "male" as const,
    accent: "American",
    specialty: "Business & Corporate"
  },
  {
    id: "jessie",
    name: "Jessie",
    description: "Friendly and approachable presenter ideal for educational content and training sessions.",
    imageUrl: "/avatars/jessie.png",
    voicePreview: "sample-voice-2.mp3",
    gender: "female" as const,
    accent: "British",
    specialty: "Education & Training"
  },
  {
    id: "kenji",
    name: "Kenji",
    description: "Tech-savvy presenter perfect for technical demonstrations and product launches.",
    imageUrl: "/avatars/kenji.png",
    voicePreview: "sample-voice-3.mp3",
    gender: "male" as const,
    accent: "American",
    specialty: "Technology & Innovation"
  },
  {
    id: "martha",
    name: "Martha",
    description: "Experienced and authoritative presenter for academic and research presentations.",
    imageUrl: "/avatars/martha.png",
    voicePreview: "sample-voice-4.mp3",
    gender: "female" as const,
    accent: "American",
    specialty: "Academic & Research"
  }
];

const mockScript = `Welcome to today's presentation! 

I'm excited to share with you our latest insights and findings. In this presentation, we'll cover three main areas:

First, we'll explore the current market landscape and identify key opportunities for growth. Our research shows significant potential in emerging markets, with a projected 25% increase in demand over the next 18 months.

Second, we'll dive into our innovative solution and how it addresses the current challenges in the industry. Our platform leverages cutting-edge AI technology to streamline processes and improve efficiency by up to 40%.

Finally, we'll discuss our implementation strategy and the expected outcomes. We've developed a phased approach that minimizes risk while maximizing impact, with projected ROI of 300% within the first year.

Let's begin with our market analysis...`;

function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedSlides, setExtractedSlides] = useState<any[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [recentPresentations] = useState([
    { id: 1, title: "Q4 Sales Review", date: "2 hours ago", duration: "8 min" },
    { id: 2, title: "Product Launch Strategy", date: "Yesterday", duration: "12 min" },
    { id: 3, title: "Team Training Session", date: "3 days ago", duration: "15 min" },
  ]);

  // Simulate file processing
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingFile(true);
    setUploadProgress(0);
    setUploadError(null);

    // Simulate processing with progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsProcessingFile(false);
          // Auto advance to script generation
          setTimeout(() => {
            setActiveTab("script");
            generateScript();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setIsProcessingFile(false);
    setUploadProgress(0);
    setUploadError(null);
    setGeneratedScript("");
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
    
    // Simulate starting presentation
    alert(`Starting presentation with ${mockAvatars.find(a => a.id === selectedAvatarId)?.name}!`);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* nav bar */}
      <FloatingNavbar 
        userName="Demo User"
        isProcessing={isProcessingFile || isGeneratingScript}
      />

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
              <br />AI Avatar Presentations
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload your PPTX files and watch as AI creates engaging presentations with realistic avatars. 
              Perfect for training, demos, and professional presentations.
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
              { icon: Presentation, label: "Presentations Created", value: "2,847" },
              { icon: Clock, label: "Hours Saved", value: "1,234" },
              { icon: Users, label: "Active Users", value: "892" },
              { icon: TrendingUp, label: "Success Rate", value: "98.5%" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <TabsList className="grid w-full grid-cols-4 lg:w-[800px] mx-auto">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>1. Upload</span>
              </TabsTrigger>
              <TabsTrigger value="script" className="flex items-center space-x-2">
                <Wand2 className="h-4 w-4" />
                <span>2. Script</span>
              </TabsTrigger>
              <TabsTrigger value="avatar" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>3. Avatar</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>4. Analytics</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

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
                      onSlidesExtracted={(slides) => {
                        setExtractedSlides(slides);
                        if (slides.length > 0) {
                          setActiveTab("script");
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
                      <CardTitle className="text-lg">Recent Presentations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentPresentations.map((presentation) => (
                        <motion.div
                          key={presentation.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div>
                            <p className="font-medium text-sm">{presentation.title}</p>
                            <p className="text-xs text-gray-600">{presentation.date}</p>
                          </div>
                          <Badge variant="secondary">{presentation.duration}</Badge>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="script" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <ScriptGenerator
                    slides={extractedSlides}
                    onScriptGenerated={(script) => {
                      setGeneratedScript(script);
                      if (script) {
                        setActiveTab("avatar");
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-6">
                  <ScriptPreview
                    script={generatedScript}
                    onScriptUpdate={handleScriptUpdate}
                    onStartPresentation={handleStartPresentation}
                    isGenerating={isGeneratingScript}
                    slideCount={extractedSlides.length || 0}
                    estimatedDuration={`${Math.ceil((generatedScript.split(' ').length || 0) / 150)} min${Math.ceil((generatedScript.split(' ').length || 0) / 150) !== 1 ? 's' : ''}`}
                  />
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
                        <p>Keep sentences clear and concise for better avatar pronunciation</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>Add natural pauses with commas and periods</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>Use conversational language to engage your audience</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p>Include transitions between slides for smooth flow</p>
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
                      <CardTitle className="text-lg">Presentation Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedAvatarId && (
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
                            {mockAvatars.find(a => a.id === selectedAvatarId)?.imageUrl ? (
                              <img 
                                src={mockAvatars.find(a => a.id === selectedAvatarId)?.imageUrl} 
                                alt="Selected Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="h-12 w-12 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {mockAvatars.find(a => a.id === selectedAvatarId)?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {mockAvatars.find(a => a.id === selectedAvatarId)?.specialty}
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