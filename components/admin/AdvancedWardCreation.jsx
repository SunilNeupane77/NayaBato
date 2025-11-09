'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  MapPin, 
  Plus, 
  Target, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { useState } from 'react';

export default function AdvancedWardCreation() {
  const [wardData, setWardData] = useState({
    name: '',
    number: '',
    description: '',
    location: {
      address: '',
      coordinates: {
        type: 'Point',
        coordinates: ['', '']
      }
    },
    population: '',
    area: '5',
    contactEmail: '',
    contactPhone: '',
    validateCoverage: true,
    optimizePosition: true
  });

  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [positionAnalysis, setPositionAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'location.coordinates.coordinates.0') {
      setWardData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            coordinates: [value || '', prev.location.coordinates.coordinates[1] || '']
          }
        }
      }));
    } else if (field === 'location.coordinates.coordinates.1') {
      setWardData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            coordinates: [prev.location.coordinates.coordinates[0] || '', value || '']
          }
        }
      }));
    } else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setWardData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value || ''
        }
      }));
    } else {
      setWardData(prev => ({ ...prev, [field]: value || '' }));
    }
  };

  const analyzePosition = async () => {
    const lng = parseFloat(wardData.location.coordinates.coordinates[0]);
    const lat = parseFloat(wardData.location.coordinates.coordinates[1]);
    
    if (!lng || !lat) {
      alert('Please enter valid coordinates first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/admin/wards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_coverage',
          coordinates: [lng, lat],
          area: parseFloat(wardData.area) || 5
        })
      });

      const data = await response.json();
      if (data.success) {
        setPositionAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing position:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createWard = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      const payload = {
        ...wardData,
        number: parseInt(wardData.number),
        population: parseInt(wardData.population) || 0,
        area: parseFloat(wardData.area) || 5,
        location: {
          ...wardData.location,
          coordinates: {
            ...wardData.location.coordinates,
            coordinates: [
              parseFloat(wardData.location.coordinates.coordinates[0]),
              parseFloat(wardData.location.coordinates.coordinates[1])
            ]
          }
        }
      };

      const response = await fetch('/api/admin/wards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Reset form
        setWardData({
          name: '',
          number: '',
          description: '',
          location: {
            address: '',
            coordinates: {
              type: 'Point',
              coordinates: ['', '']
            }
          },
          population: '',
          area: '5',
          contactEmail: '',
          contactPhone: '',
          validateCoverage: true,
          optimizePosition: true
        });
        setPositionAnalysis(null);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return distance >= 1000 ? `${(distance / 1000).toFixed(1)}km` : `${distance}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Advanced Ward Creation</h2>
        <p className="text-muted-foreground">
          Create wards with intelligent geospatial optimization and coverage analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ward Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ward Name *</Label>
                <Input
                  id="name"
                  value={wardData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Kathmandu Ward 1"
                />
              </div>
              <div>
                <Label htmlFor="number">Ward Number *</Label>
                <Input
                  id="number"
                  type="number"
                  value={wardData.number || ''}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="e.g., 1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={wardData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the ward"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={wardData.location.address || ''}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                placeholder="Ward office address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={wardData.location.coordinates.coordinates[0] || ''}
                  onChange={(e) => handleInputChange('location.coordinates.coordinates.0', e.target.value)}
                  placeholder="e.g., 85.3240"
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={wardData.location.coordinates.coordinates[1] || ''}
                  onChange={(e) => handleInputChange('location.coordinates.coordinates.1', e.target.value)}
                  placeholder="e.g., 27.7172"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="population">Population</Label>
                <Input
                  id="population"
                  type="number"
                  value={wardData.population || ''}
                  onChange={(e) => handleInputChange('population', e.target.value)}
                  placeholder="e.g., 15000"
                />
              </div>
              <div>
                <Label htmlFor="area">Area (sq km)</Label>
                <Input
                  id="area"
                  type="number"
                  step="0.1"
                  value={wardData.area || ''}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="e.g., 5.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={wardData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="ward@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={wardData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+977-1-XXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="optimize">Optimize Position</Label>
                <Switch
                  id="optimize"
                  checked={wardData.optimizePosition}
                  onCheckedChange={(checked) => handleInputChange('optimizePosition', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="validate">Validate Coverage</Label>
                <Switch
                  id="validate"
                  checked={wardData.validateCoverage}
                  onCheckedChange={(checked) => handleInputChange('validateCoverage', checked)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={analyzePosition}
                disabled={isAnalyzing}
                variant="outline"
                className="flex-1"
              >
                <Target className="mr-2 h-4 w-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Position'}
              </Button>
              <Button
                onClick={createWard}
                disabled={isCreating}
                className="flex-1"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? 'Creating...' : 'Create Ward'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis & Results */}
        <div className="space-y-6">
          {/* Position Analysis */}
          {positionAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Coverage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Current Wards</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {positionAnalysis.before.totalWards}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm font-medium">After Creation</p>
                    <p className="text-2xl font-bold text-green-600">
                      {positionAnalysis.after.totalWards}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Ward Distance</span>
                    <span className="text-sm font-medium">
                      {formatDistance(positionAnalysis.before.averageDistance)} → {formatDistance(positionAnalysis.after.averageDistance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Distance Reduction</span>
                    <span className="text-sm font-medium text-green-600">
                      -{formatDistance(positionAnalysis.improvement.distanceReduction)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Coverage Quality</span>
                    <span className="text-sm font-medium capitalize">
                      {positionAnalysis.improvement.coverageQuality}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creation Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Zap className="h-5 w-5 text-red-600" />
                  )}
                  Creation Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">{result.message}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Ward Created</p>
                        <p className="text-lg">{result.ward.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ward Number</p>
                        <p className="text-lg">#{result.ward.number}</p>
                      </div>
                    </div>

                    {result.analytics?.optimization?.shouldAdjust && (
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-800">Position Optimized</p>
                        <p className="text-sm text-blue-600">{result.analytics.optimization.reason}</p>
                        <p className="text-sm text-blue-600">{result.analytics.optimization.improvement}</p>
                      </div>
                    )}

                    {result.analytics?.reassignedIssues && (
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium text-green-800">Issues Reassigned</p>
                        <p className="text-sm text-green-600">
                          {result.analytics.reassignedIssues.reassigned} issues automatically assigned to this ward
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="font-medium">Creation Failed</p>
                    <p className="text-sm">{result.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
