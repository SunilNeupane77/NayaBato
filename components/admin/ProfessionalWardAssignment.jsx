'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  BarChart3, 
  CheckCircle, 
  MapPin, 
  RefreshCw, 
  Target, 
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfessionalWardAssignment() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Test assignment state
  const [testCoords, setTestCoords] = useState({ longitude: '', latitude: '' });
  const [testResult, setTestResult] = useState(null);
  const [isTestingAssignment, setIsTestingAssignment] = useState(false);
  
  // Bulk reassignment state
  const [bulkOptions, setBulkOptions] = useState({
    onlyUnassigned: true,
    limit: 100,
    maxDistance: 10000
  });
  const [bulkResult, setBulkResult] = useState(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Load analytics on component mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const response = await fetch('/api/admin/ward-assignment');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to load analytics:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const testWardAssignment = async () => {
    if (!testCoords.longitude || !testCoords.latitude) {
      alert('Please enter both longitude and latitude');
      return;
    }

    setIsTestingAssignment(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/ward-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          coordinates: [parseFloat(testCoords.longitude), parseFloat(testCoords.latitude)],
          maxDistance: 15000
        }),
      });

      const data = await response.json();
      setTestResult(data.test);
    } catch (error) {
      console.error('Error testing assignment:', error);
      setTestResult({
        success: false,
        error: 'Network error during test'
      });
    } finally {
      setIsTestingAssignment(false);
    }
  };

  const runBulkReassignment = async () => {
    setIsBulkProcessing(true);
    setBulkResult(null);

    try {
      const response = await fetch('/api/admin/ward-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_reassign',
          ...bulkOptions
        }),
      });

      const data = await response.json();
      setBulkResult(data.bulkReassignment);
      
      // Refresh analytics after bulk operation
      if (data.success) {
        setTimeout(loadAnalytics, 1000);
      }
    } catch (error) {
      console.error('Error in bulk reassignment:', error);
      setBulkResult({
        success: false,
        error: 'Network error during bulk reassignment'
      });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const clearCache = async () => {
    try {
      await fetch('/api/admin/ward-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_cache' }),
      });
      
      // Refresh analytics
      loadAnalytics();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'Unknown';
    return distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`;
  };

  const getStatusColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Professional Ward Assignment</h2>
          <p className="text-muted-foreground">
            Advanced geospatial analysis and automated ward assignment using Haversine algorithm
          </p>
        </div>
        <Button onClick={loadAnalytics} disabled={isLoadingAnalytics} variant="outline">
          {isLoadingAnalytics ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="test">Test Assignment</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : analytics ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Wards</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.overview.totalWards}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assignment Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getStatusColor(analytics.overview.assignmentRate)}`}>
                      {analytics.overview.assignmentRate.toFixed(1)}%
                    </div>
                    <Progress value={analytics.overview.assignmentRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assigned Issues</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.overview.assignedIssues}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      of {analytics.overview.totalIssues} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {analytics.overview.unassignedIssues}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coverage Analysis */}
              {analytics.coverage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Coverage Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Average Ward Distance</p>
                        <p className="text-2xl font-bold">
                          {formatDistance(analytics.coverage.averageWardDistance)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Recommended Search Radius</p>
                        <p className="text-2xl font-bold">
                          {formatDistance(analytics.coverage.recommendedSearchRadius)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Coverage Quality</p>
                        <p className="text-2xl font-bold capitalize">
                          {Object.entries(analytics.coverage.coverage).find(([_, value]) => value)?.[0] || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ward Distribution */}
              {analytics.wardDistribution && analytics.wardDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Ward Issue Distribution
                    </CardTitle>
                    <CardDescription>
                      Top wards by number of assigned issues
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.wardDistribution.slice(0, 10).map((ward, index) => (
                        <div key={ward._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium">{ward.wardName}</p>
                              <p className="text-sm text-gray-500">Ward #{ward.wardNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{ward.issueCount}</p>
                            <p className="text-xs text-gray-500">issues</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {analytics.recommendations && analytics.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.recommendations.map((rec, index) => (
                        <div key={index} className={`p-4 border-l-4 ${
                          rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                          rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          <p className="text-sm font-medium mt-2">Action: {rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Failed to load analytics</p>
                <Button onClick={loadAnalytics} className="mt-4">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Assignment Tab */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Test Ward Assignment
              </CardTitle>
              <CardDescription>
                Test the Haversine-based ward assignment for specific coordinates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-longitude">Longitude</Label>
                  <Input
                    id="test-longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 85.3240"
                    value={testCoords.longitude}
                    onChange={(e) => setTestCoords(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="test-latitude">Latitude</Label>
                  <Input
                    id="test-latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 27.7172"
                    value={testCoords.latitude}
                    onChange={(e) => setTestCoords(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button 
                onClick={testWardAssignment} 
                disabled={isTestingAssignment}
                className="w-full"
              >
                {isTestingAssignment ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing Assignment...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Test Assignment
                  </>
                )}
              </Button>

              {testResult && (
                <div className="mt-6 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Test Result</h4>
                  {testResult.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Assignment Successful</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium">Ward</p>
                          <p className="text-lg">{testResult.ward.name} (#{testResult.ward.number})</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Distance</p>
                          <p className="text-lg">{formatDistance(testResult.distance)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Method</p>
                          <p className="text-lg capitalize">{testResult.method.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Search Radius</p>
                          <p className="text-lg">{formatDistance(testResult.searchRadius)}</p>
                        </div>
                      </div>
                      {testResult.alternatives && testResult.alternatives.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Alternative Wards</p>
                          <div className="space-y-1">
                            {testResult.alternatives.map((alt, index) => (
                              <p key={index} className="text-sm text-gray-600">
                                {alt.ward.name} - {formatDistance(alt.distance)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Assignment Failed: {testResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Bulk Ward Reassignment
              </CardTitle>
              <CardDescription>
                Reassign wards to existing issues using the professional Haversine algorithm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bulk-limit">Limit</Label>
                  <Input
                    id="bulk-limit"
                    type="number"
                    value={bulkOptions.limit}
                    onChange={(e) => setBulkOptions(prev => ({ ...prev, limit: parseInt(e.target.value) || 100 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-distance">Max Distance (m)</Label>
                  <Input
                    id="bulk-distance"
                    type="number"
                    value={bulkOptions.maxDistance}
                    onChange={(e) => setBulkOptions(prev => ({ ...prev, maxDistance: parseInt(e.target.value) || 10000 }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={runBulkReassignment} 
                    disabled={isBulkProcessing}
                    className="w-full"
                  >
                    {isBulkProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Bulk Reassignment'
                    )}
                  </Button>
                </div>
              </div>

              {bulkResult && (
                <div className="mt-6 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Bulk Reassignment Result</h4>
                  {bulkResult.success ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-2xl font-bold text-blue-600">{bulkResult.stats.total}</p>
                          <p className="text-sm text-blue-600">Total</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-2xl font-bold text-green-600">{bulkResult.stats.assigned}</p>
                          <p className="text-sm text-green-600">Assigned</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded">
                          <p className="text-2xl font-bold text-red-600">{bulkResult.stats.failed}</p>
                          <p className="text-sm text-red-600">Failed</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-2xl font-bold text-gray-600">{bulkResult.stats.skipped}</p>
                          <p className="text-sm text-gray-600">Skipped</p>
                        </div>
                      </div>
                      
                      {bulkResult.stats.details && bulkResult.stats.details.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Recent Results</h5>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {bulkResult.stats.details.slice(0, 10).map((detail, index) => (
                              <div key={index} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                                <span className="truncate">{detail.title}</span>
                                {detail.success ? (
                                  <span className="text-green-600 ml-2">
                                    {detail.wardName} ({formatDistance(detail.distance)})
                                  </span>
                                ) : (
                                  <span className="text-red-600 ml-2">{detail.error}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Bulk operation failed: {bulkResult.error}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>
                Clear the ward assignment service cache to force fresh data loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={clearCache} variant="outline">
                Clear Cache
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
