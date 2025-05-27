'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Eye,
  ThumbsUp,
  MessageSquare,
  Download,
  Calendar,
  Globe,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface AnalyticsData {
  totalPresentations: number;
  totalViews: number;
  averageEngagement: number;
  totalWatchTime: string;
  topPerformingSlides: Array<{
    slideNumber: number;
    title: string;
    engagementScore: number;
    averageViewTime: string;
  }>;
  audienceGeography: Array<{
    country: string;
    percentage: number;
    views: number;
  }>;
  presentationMetrics: Array<{
    id: string;
    title: string;
    date: string;
    views: number;
    engagement: number;
    duration: string;
    avatar: string;
  }>;
  realtimeData: {
    activeViewers: number;
    currentPresentations: number;
    todayViews: number;
  };
}

interface PresentationAnalyticsProps {
  className?: string;
}

export default function PresentationAnalytics({ className = "" }: PresentationAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: AnalyticsData = {
        totalPresentations: 47,
        totalViews: 2847,
        averageEngagement: 78.5,
        totalWatchTime: "1,234 hours",
        topPerformingSlides: [
          {
            slideNumber: 3,
            title: "Our Solution Overview",
            engagementScore: 92,
            averageViewTime: "2m 34s"
          },
          {
            slideNumber: 7,
            title: "ROI Projections",
            engagementScore: 89,
            averageViewTime: "2m 18s"
          },
          {
            slideNumber: 1,
            title: "Introduction",
            engagementScore: 85,
            averageViewTime: "1m 56s"
          },
          {
            slideNumber: 11,
            title: "Next Steps",
            engagementScore: 83,
            averageViewTime: "2m 12s"
          }
        ],
        audienceGeography: [
          { country: "United States", percentage: 45, views: 1281 },
          { country: "United Kingdom", percentage: 18, views: 512 },
          { country: "Canada", percentage: 12, views: 341 },
          { country: "Germany", percentage: 10, views: 285 },
          { country: "Australia", percentage: 8, views: 228 },
          { country: "Other", percentage: 7, views: 200 }
        ],
        presentationMetrics: [
          {
            id: "pres-001",
            title: "Q4 Business Review",
            date: "2024-01-15",
            views: 324,
            engagement: 85,
            duration: "18m 32s",
            avatar: "Henry"
          },
          {
            id: "pres-002", 
            title: "Product Launch Strategy",
            date: "2024-01-12",
            views: 287,
            engagement: 92,
            duration: "22m 15s",
            avatar: "Jessie"
          },
          {
            id: "pres-003",
            title: "Market Analysis 2024",
            date: "2024-01-10",
            views: 445,
            engagement: 78,
            duration: "15m 48s",
            avatar: "Kenji"
          },
          {
            id: "pres-004",
            title: "Training: New Processes",
            date: "2024-01-08",
            views: 156,
            engagement: 88,
            duration: "25m 12s",
            avatar: "Martha"
          }
        ],
        realtimeData: {
          activeViewers: 23,
          currentPresentations: 3,
          todayViews: 127
        }
      };
      
      setAnalyticsData(mockData);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-6 ${className}`}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Presentation Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!analyticsData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Presentation Analytics</h2>
          <p className="text-gray-600">Track performance and engagement across all your AI avatar presentations</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="border rounded-md px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-green-600" />
            <span>Live Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {analyticsData.realtimeData.activeViewers}
              </div>
              <div className="text-sm text-green-800">Active Viewers</div>
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs text-green-700">Live</span>
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {analyticsData.realtimeData.currentPresentations}
              </div>
              <div className="text-sm text-blue-800">Active Presentations</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {analyticsData.realtimeData.todayViews}
              </div>
              <div className="text-sm text-purple-800">Today's Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalViews.toLocaleString()}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+12.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Presentations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalPresentations}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ThumbsUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.averageEngagement}%
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+3.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Watch Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalWatchTime}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+15.7%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Slides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Top Performing Slides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPerformingSlides.map((slide, index) => (
              <motion.div
                key={slide.slideNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {slide.slideNumber}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{slide.title}</p>
                    <p className="text-sm text-gray-600">
                      Avg. view time: {slide.averageViewTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {slide.engagementScore}% engagement
                    </div>
                    <Progress 
                      value={slide.engagementScore} 
                      className="w-24 h-2 mt-1" 
                    />
                  </div>
                  <Badge 
                    variant={slide.engagementScore > 90 ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {slide.engagementScore > 90 ? "Excellent" : 
                     slide.engagementScore > 80 ? "Good" : "Average"}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geography and Recent Presentations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Geography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span>Audience Geography</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.audienceGeography.map((location, index) => (
                <motion.div
                  key={location.country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {location.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20">
                      <Progress value={location.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {location.percentage}%
                    </span>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {location.views} views
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Presentations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Recent Presentations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.presentationMetrics.map((presentation, index) => (
                <motion.div
                  key={presentation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {presentation.title}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(presentation.date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {presentation.avatar}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {presentation.views} views
                    </div>
                    <div className="text-xs text-gray-500">
                      {presentation.engagement}% engagement
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
