'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n/language-context';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Bell,
  Camera,
  Users,
  Award,
  Target,
  Zap,
  Activity,
  BarChart3,
  Calendar,
  Star,
  Sparkles,
  ArrowRight,
  Eye,
  MessageCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CitizenDashboard() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    myIssues: 0,
    resolved: 0,
    pending: 0,
    recentIssues: [],
    communityStats: {},
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/citizen/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'under-review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {t('citizen.dashboard.welcomeBack')}, {session?.user?.name}! 
                  </h1>
                  <p className="text-teal-100 text-sm sm:text-base">
                    {t('citizen.dashboard.readyToMakeDifference')} ✨
                  </p>
                </div>
              </div>
            </div>
            <Button asChild className="bg-white dark:bg-gray-800 text-teal-600 hover:bg-gray-50 dark:bg-gray-900 font-semibold shadow-lg w-full sm:w-auto">
              <Link href="/issues/report">
                <Plus className="w-4 h-4 mr-2" />
                {t('citizen.dashboard.reportNewIssue')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-teal-700">{t('citizen.dashboard.myReports')}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-900">{stats.myIssues}</p>
                  <p className="text-xs text-teal-600 mt-1">{t('citizen.dashboard.totalSubmitted')}</p>
                </div>
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-700">{t('citizen.dashboard.resolved')}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">{stats.resolved}</p>
                  <p className="text-xs text-green-600 mt-1">{t('citizen.dashboard.issuesFixed')}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-yellow-700">{t('citizen.dashboard.pending')}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">{stats.pending}</p>
                  <p className="text-xs text-yellow-600 mt-1">{t('citizen.dashboard.inProgress')}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-700">{t('citizen.dashboard.impactScore')}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">{stats.impactScore || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">{t('citizen.dashboard.communityPoints')}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              {t('citizen.dashboard.quickActions')}
              <span className="text-sm font-normal text-gray-500">{t('citizen.dashboard.chooseNextStep')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button asChild variant="outline" className="h-20 sm:h-24 flex-col border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 group">
                <Link href="/issues/report">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-200 transition-colors">
                    <Camera className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{t('citizen.dashboard.reportIssue')}</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 sm:h-24 flex-col border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
                <Link href="/issues">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{t('citizen.dashboard.browseIssues')}</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 sm:h-24 flex-col border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 group">
                <Link href="/citizen/my-reports">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{t('citizen.dashboard.myReports')}</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-20 sm:h-24 flex-col border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300 group">
                <Link href="/citizen/community">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 transition-colors">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{t('citizen.dashboard.community')}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Issues */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                {t('citizen.dashboard.myRecentReports')}
                <span className="text-sm font-normal text-gray-500">{t('citizen.dashboard.latestActivity')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentIssues?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {stats.recentIssues.slice(0, 5).map((issue) => (
                    <div key={issue._id} className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-teal-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base group-hover:text-teal-700 transition-colors">{issue.title}</h4>
                        <Badge className={`${getStatusColor(issue.status)} ml-2 text-xs shadow-sm`}>
                          {issue.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:text-teal-600 transition-colors">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{issue.location?.address || t('citizen.dashboard.unknownLocation')}</span>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full mt-4 border-teal-200 text-teal-700 hover:bg-teal-50">
                    <Link href="/citizen/my-reports" className="flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      {t('citizen.dashboard.viewAllReports')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('citizen.dashboard.noReportsYet')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6">{t('citizen.dashboard.startMakingDifference')}</p>
                  <Button asChild className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                    <Link href="/issues/report" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {t('citizen.dashboard.reportFirstIssue')}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Impact */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                {t('citizen.dashboard.communityImpact')}
                <span className="text-sm font-normal text-gray-500">{t('citizen.dashboard.thisWeek')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-800">{t('citizen.dashboard.issuesResolved')}</span>
                  </div>
                  <span className="font-bold text-green-700 text-lg">{stats.communityStats?.weeklyResolved || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-800">{t('citizen.dashboard.activeMembers')}</span>
                  </div>
                  <span className="font-bold text-blue-700 text-lg">{stats.communityStats?.activeMembers || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-purple-800">{t('citizen.dashboard.totalReports')}</span>
                  </div>
                  <span className="font-bold text-purple-700 text-lg">{stats.communityStats?.totalReports || 0}</span>
                </div>
                
                <Button asChild variant="outline" className="w-full mt-6 border-teal-200 text-teal-700 hover:bg-teal-50">
                  <Link href="/citizen/community" className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('citizen.dashboard.viewCommunityStats')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {stats.achievements?.length > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                {t('citizen.dashboard.yourAchievements')}
                <span className="text-sm font-normal text-gray-500">{t('citizen.dashboard.celebratingImpact')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stats.achievements.map((achievement, index) => (
                  <div key={index} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-yellow-200 hover:border-yellow-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1">{achievement.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
