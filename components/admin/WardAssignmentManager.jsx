'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, RefreshCw, Target } from 'lucide-react';
import { useState } from 'react';

export default function WardAssignmentManager() {
  const [testCoords, setTestCoords] = useState({ longitude: '', latitude: '' });
  const [testResult, setTestResult] = useState(null);
  const [isTestingAssignment, setIsTestingAssignment] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignResult, setReassignResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const testWardAssignment = async () => {
    if (!testCoords.longitude || !testCoords.latitude) {
      alert('Please enter both longitude and latitude');
      return;
    }

    setIsTestingAssignment(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/wards/assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [parseFloat(testCoords.longitude), parseFloat(testCoords.latitude)]
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error testing ward assignment:', error);
      setTestResult({
        success: false,
        assignment: { message: 'Error testing assignment' }
      });
    } finally {
      setIsTestingAssignment(false);
    }
  };

  const bulkReassignWards = async () => {
    setIsReassigning(true);
    setReassignResult(null);

    try {
      const response = await fetch('/api/admin/issues/reassign-wards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onlyUnassigned: true,
          limit: 100
        }),
      });

      const data = await response.json();
      setReassignResult(data);
    } catch (error) {
      console.error('Error reassigning wards:', error);
      setReassignResult({
        success: false,
        message: 'Error during bulk reassignment'
      });
    } finally {
      setIsReassigning(false);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('/api/wards/assignment');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ward Assignment Manager</h2>
        <p className="text-muted-foreground">
          Test and manage automatic ward assignment using Haversine algorithm
        </p>
      </div>

      {/* Test Ward Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Test Ward Assignment
          </CardTitle>
          <CardDescription>
            Test ward assignment for specific coordinates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g., 85.3240"
                value={testCoords.longitude}
                onChange={(e) => setTestCoords(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
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
                <MapPin className="mr-2 h-4 w-4" />
                Test Assignment
              </>
            )}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Test Result:</h4>
              {testResult.success ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Status:</strong> {testResult.assignment.success ? 'Success' : 'Failed'}
                  </p>
                  {testResult.assignment.ward && (
                    <>
                      <p className="text-sm">
                        <strong>Ward:</strong> {testResult.assignment.ward.name} (#{testResult.assignment.ward.number})
                      </p>
                      <p className="text-sm">
                        <strong>Distance:</strong> {testResult.assignment.distance}m
                      </p>
                      <p className="text-sm">
                        <strong>Method:</strong> {testResult.assignment.method}
                      </p>
                    </>
                  )}
                  <p className="text-sm">
                    <strong>Message:</strong> {testResult.assignment.message}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-600">Error: {testResult.assignment?.message || 'Unknown error'}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Bulk Reassignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Bulk Ward Reassignment
          </CardTitle>
          <CardDescription>
            Reassign wards to existing issues using Haversine algorithm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={bulkReassignWards} 
            disabled={isReassigning}
            variant="outline"
            className="w-full"
          >
            {isReassigning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reassigning Wards...
              </>
            ) : (
              'Reassign Unassigned Issues'
            )}
          </Button>

          {reassignResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Reassignment Result:</h4>
              {reassignResult.success ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Total Issues:</strong> {reassignResult.results.total}
                  </p>
                  <p className="text-sm text-green-600">
                    <strong>Successfully Assigned:</strong> {reassignResult.results.assigned}
                  </p>
                  <p className="text-sm text-red-600">
                    <strong>Failed:</strong> {reassignResult.results.failed}
                  </p>
                  
                  {reassignResult.results.details.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Details:</h5>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {reassignResult.results.details.slice(0, 10).map((detail, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                            <strong>{detail.title}</strong>
                            {detail.success ? (
                              <span className="text-green-600 ml-2">
                                → {detail.wardName} ({detail.distance}m, {detail.method})
                              </span>
                            ) : (
                              <span className="text-red-600 ml-2">
                                → {detail.error}
                              </span>
                            )}
                          </div>
                        ))}
                        {reassignResult.results.details.length > 10 && (
                          <p className="text-xs text-gray-500">
                            ... and {reassignResult.results.details.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-600">Error: {reassignResult.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Statistics</CardTitle>
          <CardDescription>
            View current ward assignment statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadStats} 
            disabled={isLoadingStats}
            variant="outline"
            className="mb-4"
          >
            {isLoadingStats ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading Stats...
              </>
            ) : (
              'Load Statistics'
            )}
          </Button>

          {stats && (
            <div className="space-y-4">
              {stats.assignmentStats && (
                <div>
                  <h4 className="font-semibold mb-2">Issue Assignment Status:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.assignmentStats.map((stat, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium capitalize">{stat._id.hasWard}</p>
                        <p className="text-2xl font-bold">{stat.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.wardStats && (
                <div>
                  <h4 className="font-semibold mb-2">Ward Issue Distribution:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {stats.wardStats.slice(0, 10).map((ward, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          {ward.name} (#{ward.number})
                        </span>
                        <span className="font-semibold">{ward.issueCount} issues</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
