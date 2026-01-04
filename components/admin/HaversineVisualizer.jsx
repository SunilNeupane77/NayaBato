'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HaversineVisualizer() {
  const [coords, setCoords] = useState({ longitude: '', latitude: '' });
  const [wards, setWards] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(true);

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    setIsLoadingWards(true);
    try {
      const response = await fetch('/api/admin/wards?limit=100');
      if (response.ok) {
        const data = await response.json();
        const wardsWithCoords = data.wards.filter(ward => 
          ward.location?.coordinates?.coordinates && 
          ward.location.coordinates.coordinates.length === 2
        );
        setWards(wardsWithCoords);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
    } finally {
      setIsLoadingWards(false);
    }
  };

  const calculateHaversineDistance = (coords1, coords2) => {
    const R = 6371000; // Earth's radius in meters
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;
    
    const radLat1 = (Math.PI * lat1) / 180;
    const radLat2 = (Math.PI * lat2) / 180;
    const radDeltaLat = (Math.PI * (lat2 - lat1)) / 180;
    const radDeltaLon = (Math.PI * (lon2 - lon1)) / 180;
    
    const a = 
      Math.sin(radDeltaLat / 2) * Math.sin(radDeltaLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * 
      Math.sin(radDeltaLon / 2) * Math.sin(radDeltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  };

  const runHaversineCalculation = async () => {
    if (!coords.longitude || !coords.latitude) return;
    
    setIsCalculating(true);
    const inputCoords = [parseFloat(coords.longitude), parseFloat(coords.latitude)];
    
    // Calculate distances to all wards
    const wardCalculations = wards
      .filter(ward => ward.location?.coordinates?.coordinates)
      .map(ward => {
        const wardCoords = ward.location.coordinates.coordinates;
        const distance = calculateHaversineDistance(inputCoords, wardCoords);
        
        return {
          ward,
          distance: Math.round(distance),
          coordinates: wardCoords,
          isWithinRange: distance <= 10000 // 10km limit
        };
      })
      .sort((a, b) => a.distance - b.distance);

    setCalculations(wardCalculations);
    
    // Find the best ward (closest within range)
    const bestWard = wardCalculations.find(calc => calc.isWithinRange);
    setSelectedWard(bestWard || null);
    
    setIsCalculating(false);
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(2)}km`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Haversine Algorithm Visualizer
            {!isLoadingWards && (
              <Badge variant="secondary" className="ml-2">
                {wards.length} wards loaded
              </Badge>
            )}
          </CardTitle>
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
                value={coords.longitude}
                onChange={(e) => setCoords(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g., 27.7172"
                value={coords.latitude}
                onChange={(e) => setCoords(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex gap-2 text-xs text-gray-600 flex-wrap">
            {wards.slice(0, 6).map((ward, index) => (
              <Button 
                key={ward._id}
                variant="outline" 
                size="sm"
                onClick={() => setCoords({ 
                  longitude: ward.location.coordinates.coordinates[0].toString(), 
                  latitude: ward.location.coordinates.coordinates[1].toString() 
                })}
              >
                {ward.name}
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={runHaversineCalculation}
            disabled={!coords.longitude || !coords.latitude || isCalculating || isLoadingWards || wards.length === 0}
            className="w-full"
          >
            {isLoadingWards ? (
              <>Loading Wards...</>
            ) : isCalculating ? (
              <>Calculating Distances...</>
            ) : wards.length === 0 ? (
              <>No Wards Available</>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Calculate Best Ward Assignment
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {selectedWard && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Selected Ward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Ward:</span>
                <span>{selectedWard.ward.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Distance:</span>
                <span className="text-green-700 font-semibold">{formatDistance(selectedWard.distance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Coordinates:</span>
                <span className="text-sm text-gray-600">
                  [{selectedWard.coordinates[0].toFixed(4)}, {selectedWard.coordinates[1].toFixed(4)}]
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Distance Calculations ({calculations.length} wards)
            </CardTitle>
            <div className="text-sm text-gray-600">
              Using Haversine formula: d = 2r × arcsin(√(sin²(Δφ/2) + cos φ₁ × cos φ₂ × sin²(Δλ/2)))
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {calculations.map((calc, index) => (
                <div 
                  key={calc.ward._id}
                  className={`p-3 rounded-lg border ${
                    calc === selectedWard 
                      ? 'border-green-300 bg-green-50' 
                      : calc.isWithinRange 
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Ward {calc.ward.number} - {calc.ward.name}</span>
                        {calc === selectedWard && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Selected by Algorithm
                          </Badge>
                        )}
                        {!calc.isWithinRange && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
                            Beyond 10km Range
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Real Coords: [{calc.coordinates[0].toFixed(6)}, {calc.coordinates[1].toFixed(6)}]
                      </div>
                      {calc.ward.officerInCharge && (
                        <div className="text-xs text-gray-500">
                          Officer: {calc.ward.officerInCharge.name}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        calc === selectedWard 
                          ? 'text-green-700' 
                          : calc.isWithinRange 
                            ? 'text-blue-700'
                            : 'text-red-700'
                      }`}>
                        {formatDistance(calc.distance)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Rank #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {calculations.length > 0 && !selectedWard && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-800">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">No Ward Found</p>
              <p className="text-sm">No wards are within the 10km assignment range.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
