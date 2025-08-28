'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, MapPin, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function WardMapPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [ward, setWard] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssues, setShowIssues] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    if (session?.user) {
      fetchWardData();
    }
  }, [session, resolvedParams.id]);

  useEffect(() => {
    if (ward) {
      initMap();
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [ward]);

  useEffect(() => {
    if (mapRef.current && ward) {
      updateIssueMarkers();
    }
  }, [showIssues]);

  const fetchWardData = async () => {
    try {
      const response = await fetch(`/api/wards/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setWard(data.ward);
        setIssues(data.issues || []);
      } else {
        toast({ title: 'Error', description: 'Failed to load ward data', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load ward data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    // Load Leaflet CSS
    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = createMap;
      document.head.appendChild(script);
    } else {
      createMap();
    }
  };

  const createMap = () => {
    if (!ward?.coordinates?.latitude || !ward?.coordinates?.longitude) {
      // Default to Kathmandu if no coordinates
      const lat = 27.7172;
      const lng = 85.3240;
      setupMap(lat, lng);
      return;
    }

    setupMap(ward.coordinates.latitude, ward.coordinates.longitude);
  };

  const setupMap = (lat, lng) => {
    const mapContainer = document.getElementById('ward-map');
    if (!mapContainer || !window.L) return;

    // Remove existing map if it exists
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.log('Map cleanup error:', e);
      }
      mapRef.current = null;
    }

    // Clear container completely
    mapContainer.innerHTML = '';
    mapContainer._leaflet_id = null;

    // Create new map
    const map = window.L.map('ward-map').setView([lat, lng], 15);
    mapRef.current = map;

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add ward marker
    const wardMarker = window.L.marker([lat, lng]).addTo(map);
    wardMarker.bindPopup(`<b>Ward ${ward?.number || 'N/A'}</b><br/>${ward?.name || 'Unknown Ward'}`);

    // Add issue markers initially
    updateIssueMarkers();
  };

  const updateIssueMarkers = () => {
    if (!mapRef.current || !showIssues) return;

    // Remove existing issue markers
    mapRef.current.eachLayer((layer) => {
      if (layer.options && layer.options.isIssue) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add issue markers
    issues.forEach((issue) => {
      if (issue.location?.coordinates?.latitude && issue.location?.coordinates?.longitude) {
        const color = getIssueColor(issue.status);
        
        const issueMarker = window.L.circleMarker(
          [issue.location.coordinates.latitude, issue.location.coordinates.longitude],
          {
            color: 'white',
            fillColor: color,
            fillOpacity: 0.8,
            radius: 8,
            weight: 2,
            isIssue: true
          }
        ).addTo(mapRef.current);

        issueMarker.bindPopup(`
          <div>
            <h4 style="margin: 0 0 5px 0;">${issue.title}</h4>
            <p style="margin: 0 0 5px 0; font-size: 12px;">${issue.description || 'No description'}</p>
            <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
              ${issue.status}
            </span>
          </div>
        `);
      }
    });
  };

  const getIssueColor = (status) => {
    switch (status) {
      case 'resolved': return '#10B981';
      case 'in-progress': return '#3B82F6';
      case 'under-review': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ward) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Ward not found</h3>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ward {ward.number} Map</h1>
            <p className="text-gray-600">{ward.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push(`/admin/wards/${ward._id}`)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>

      {/* Location Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Ward Information</h3>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Ward Number:</span> {ward.number}</div>
                <div><span className="font-medium">Ward Name:</span> {ward.name}</div>
                <div><span className="font-medium">Status:</span> 
                  <Badge variant={ward.isActive ? "default" : "outline"} className="ml-2">
                    {ward.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {ward.description && (
                  <div><span className="font-medium">Description:</span> {ward.description}</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Geographic Data</h3>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Population:</span> {ward.population?.toLocaleString() || 'N/A'}</div>
                <div><span className="font-medium">Area:</span> {ward.area || 'N/A'} km²</div>
                <div><span className="font-medium">Density:</span> {
                  ward.area && ward.population 
                    ? Math.round(ward.population / ward.area).toLocaleString() + ' per km²'
                    : 'N/A'
                }</div>
                {ward.coordinates && (
                  <>
                    <div><span className="font-medium">Latitude:</span> {ward.coordinates.latitude.toFixed(6)}</div>
                    <div><span className="font-medium">Longitude:</span> {ward.coordinates.longitude.toFixed(6)}</div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Address & Contact</h3>
              <div className="space-y-1 text-sm">
                {ward.address && (
                  <>
                    {ward.address.street && <div><span className="font-medium">Street:</span> {ward.address.street}</div>}
                    {ward.address.city && <div><span className="font-medium">City:</span> {ward.address.city}</div>}
                    {ward.address.state && <div><span className="font-medium">State:</span> {ward.address.state}</div>}
                    {ward.address.zipCode && <div><span className="font-medium">ZIP:</span> {ward.address.zipCode}</div>}
                  </>
                )}
                {ward.contactInfo?.phone && (
                  <div><span className="font-medium">Phone:</span> {ward.contactInfo.phone}</div>
                )}
                {ward.contactInfo?.email && (
                  <div><span className="font-medium">Email:</span> {ward.contactInfo.email}</div>
                )}
                {ward.officerInCharge && (
                  <div><span className="font-medium">Officer:</span> {ward.officerInCharge.name}</div>
                )}
              </div>
            </div>
          </div>

          {/* Issue Summary */}
          {issues.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Issue Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{issues.length}</div>
                  <div className="text-sm text-gray-500">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {issues.filter(i => i.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-gray-500">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {issues.filter(i => i.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {issues.filter(i => ['reported', 'under-review'].includes(i.status)).length}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Map Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Ward Info</h3>
              <div className="space-y-1 text-sm">
                <div>Population: {ward.population?.toLocaleString() || 'N/A'}</div>
                <div>Area: {ward.area || 'N/A'} km²</div>
                {ward.coordinates && (
                  <div className="text-xs text-gray-500">
                    {ward.coordinates.latitude.toFixed(4)}, {ward.coordinates.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-issues">Show Issues</Label>
              <Switch
                id="show-issues"
                checked={showIssues}
                onCheckedChange={setShowIssues}
              />
            </div>

            <div>
              <h3 className="font-medium mb-2">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>Ward Center</span>
                </div>
                {showIssues && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Resolved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Under Review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Reported</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div 
              id="ward-map" 
              className="w-full h-96 lg:h-[600px] rounded-lg"
            ></div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues in Ward {ward.number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map((issue) => (
                <div 
                  key={issue._id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/issues/${issue._id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{issue.title}</h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: getIssueColor(issue.status),
                        color: getIssueColor(issue.status)
                      }}
                    >
                      {issue.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {issue.description?.substring(0, 100) || 'No description'}
                    {issue.description?.length > 100 && '...'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
