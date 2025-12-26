'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  Award,
  Target,
  CheckCircle,
  Heart,
  Zap,
  Globe,
  Star,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Activity,
  BarChart3,
  PieChart,
  TrendingDown,
  Clock,
  MessageCircle,
  ThumbsUp,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Share2,
  Bookmark,
  Flag,
  Shield,
  UserCheck,
  Flame,
  Rocket
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CommunityPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeThisWeek: 0,
    totalReports: 0,
    resolvedIssues: 0,
    topCategories: [],
    recentActivity: [],
    leaderboard: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const handleShareImpact = async () => {
    const shareData = {
      title: 'Community Impact - Nayabato',
      text: `Our community has made amazing progress! 🎉\n\n📊 ${stats.totalMembers} active members\n✅ ${stats.resolvedIssues} issues resolved\n📈 ${stats.totalReports} total reports\n\nJoin us in making a difference! 🌟`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        alert('Community impact stats copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  const fetchCommunityStats = async () => {
    try {
      const response = await fetch('/api/citizen/community');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'under-review': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'in-progress': return <Clock className="w-3 h-3" />;
      case 'under-review': return <Eye className="w-3 h-3" />;
      case 'rejected': return <Flag className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'road-maintenance': <Target className="w-4 h-4" />,
      'public-safety': <Shield className="w-4 h-4" />,
      'utilities': <Zap className="w-4 h-4" />,
      'environment': <Globe className="w-4 h-4" />,
      'infrastructure': <Activity className="w-4 h-4" />
    };
    return icons[category] || <MapPin className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="self-start hover:bg-white/80 backdrop-blur-sm">
              <Link href="/citizen/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Community Hub
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Building stronger communities together
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/50 hover:bg-white dark:bg-gray-800 border-gray-200"
              onClick={fetchCommunityStats}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg" onClick={handleShareImpact}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Impact
            </Button>
          </div>
        </div>

        {/* Enhanced Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Community Members</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Community growing</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeThisWeek}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">Active members</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Rocket className="w-3 h-3 text-purple-500" />
                    <span className="text-xs text-purple-600">Total reports</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-teal-50 border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Issues Resolved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.resolvedIssues}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Sparkles className="w-3 h-3 text-teal-500" />
                    <span className="text-xs text-teal-600">Issues resolved</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg p-1">
            <TabsTrigger
              value="overview"
              className={`flex items-center gap-2 transition-all duration-300 ${activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                  : 'hover:bg-blue-50 text-gray-600'
                }`}
            >
              <PieChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className={`flex items-center gap-2 transition-all duration-300 ${activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg'
                  : 'hover:bg-yellow-50 text-gray-600'
                }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className={`flex items-center gap-2 transition-all duration-300 ${activeTab === 'activity'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'hover:bg-green-50 text-gray-600'
                }`}
            >
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className={`flex items-center gap-2 transition-all duration-300 ${activeTab === 'insights'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                  : 'hover:bg-purple-50 text-gray-600'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Enhanced Top Categories */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="w-5 h-5 text-purple-600" />
                    Most Reported Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topCategories?.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                                  'bg-gradient-to-r from-blue-400 to-purple-500'
                            }`}>
                            {index < 3 ? (
                              <Crown className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-sm font-bold text-white">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category.name)}
                              <span className="font-medium capitalize">{category.name.replace('-', ' ')}</span>
                            </div>
                            <div className="text-xs text-gray-500">Category #{index + 1}</div>
                          </div>
                        </div>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                          {category.count} reports
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Community Leaderboard */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Community Champions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.leaderboard?.map((member, index) => (
                      <div key={member._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                                  'bg-gradient-to-r from-blue-400 to-purple-500'
                            }`}>
                            {index < 3 ? (
                              index === 0 ? <Crown className="w-5 h-5 text-white" /> :
                                <Medal className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-sm font-bold text-white">{index + 1}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-2">
                              {member.name}
                              {index < 3 && <Star className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              {member.reportCount} reports
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-purple-600">{member.impactScore} pts</div>
                          <div className="text-xs text-gray-500">Impact Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Community Champions Hall of Fame
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.leaderboard?.length > 0 ? stats.leaderboard.map((member, index) => (
                    <div key={member._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                                'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}>
                          {index < 3 ? (
                            index === 0 ? <Crown className="w-6 h-6 text-white" /> :
                              <Medal className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-lg font-bold text-white">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-lg flex items-center gap-2">
                            {member.name}
                            {index < 3 && <Star className="w-5 h-5 text-yellow-500" />}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            {member.reportCount} reports • Member since {new Date(member.createdAt).getFullYear()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-purple-600">{member.impactScore}</div>
                        <div className="text-sm text-gray-500">Impact Points</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No leaderboard data available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Community Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Total Members</span>
                      </div>
                      <span className="font-bold text-blue-600">{stats.totalMembers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        <span>Active This Week</span>
                      </div>
                      <span className="font-bold text-green-600">{stats.activeThisWeek || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <span>Total Reports</span>
                      </div>
                      <span className="font-bold text-purple-600">{stats.totalReports || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Resolution Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span>Resolved Issues</span>
                      </div>
                      <span className="font-bold text-emerald-600">{stats.resolvedIssues || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span>Pending Issues</span>
                      </div>
                      <span className="font-bold text-orange-600">{(stats.totalReports - stats.resolvedIssues) || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        <span>Top Categories</span>
                      </div>
                      <span className="font-bold text-blue-600">{stats.topCategories?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 mt-6">
            {/* Enhanced Search and Filter */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search community activity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 bg-white/50 border-gray-200 dark:border-gray-700 focus:bg-white dark:bg-gray-800 transition-colors"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full lg:w-48 h-12 bg-white/50 border-gray-200">
                      <Filter className="w-5 h-5 mr-2 text-gray-500" />
                      <SelectValue placeholder="Filter activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activity</SelectItem>
                      <SelectItem value="resolved">Resolved Issues</SelectItem>
                      <SelectItem value="new">New Reports</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Community Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity?.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                            {activity.title}
                            <Bookmark className="w-4 h-4 text-gray-400" />
                          </h4>
                          <Badge className={`${getStatusColor(activity.status)} border flex items-center gap-1.5 px-3 py-1`}>
                            {getStatusIcon(activity.status)}
                            {activity.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{activity.description}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                            <Users className="w-3 h-3" />
                            {activity.reporter?.name || 'Anonymous'}
                          </span>
                          <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            {formatDate(activity.createdAt)}
                          </span>
                          <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-32">{activity.location?.address || 'Unknown'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <Link href="/issues">
                      <Globe className="w-4 h-4 mr-2" />
                      Explore All Issues
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
