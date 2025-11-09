'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  Download, 
  Upload, 
  Users, 
  Zap
} from 'lucide-react';
import { useState } from 'react';

export default function BulkWardCreation() {
  const [csvData, setCsvData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const sampleCsv = `name,number,description,address,longitude,latitude,population,area,contactEmail,contactPhone
"Kathmandu Ward 1",1,"Central business district","Durbar Marg, Kathmandu",85.3240,27.7172,15000,2.5,"ward1@ktm.gov.np","+977-1-4200001"
"Kathmandu Ward 2",2,"Residential area","Thamel, Kathmandu",85.3140,27.7072,12000,3.0,"ward2@ktm.gov.np","+977-1-4200002"
"Pokhara Ward 1",3,"Tourist hub","Lakeside, Pokhara",83.9856,28.2096,8000,4.0,"ward1@pkr.gov.np","+977-61-400001"`;

  const processBulkCreation = async () => {
    if (!csvData.trim()) {
      alert('Please enter CSV data');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const wards = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const ward = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          switch (header) {
            case 'number':
            case 'population':
              ward[header] = parseInt(value) || 0;
              break;
            case 'area':
              ward[header] = parseFloat(value) || 5;
              break;
            case 'longitude':
            case 'latitude':
              if (!ward.location) {
                ward.location = {
                  coordinates: {
                    type: 'Point',
                    coordinates: [0, 0]
                  }
                };
              }
              if (header === 'longitude') {
                ward.location.coordinates.coordinates[0] = parseFloat(value);
              } else {
                ward.location.coordinates.coordinates[1] = parseFloat(value);
              }
              break;
            case 'address':
              if (!ward.location) {
                ward.location = { coordinates: { type: 'Point', coordinates: [0, 0] } };
              }
              ward.location.address = value;
              break;
            default:
              ward[header] = value;
          }
        });
        
        return ward;
      });

      const response = await fetch('/api/admin/wards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_create',
          wards,
          options: {
            validateCoverage: true,
            optimizePosition: true
          }
        })
      });

      const data = await response.json();
      setResults(data.results);

    } catch (error) {
      console.error('Error processing bulk creation:', error);
      setResults({
        success: false,
        error: 'Failed to process bulk creation'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ward_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bulk Ward Creation</h2>
        <p className="text-muted-foreground">
          Create multiple wards at once using CSV data with automatic optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CSV Data Input
            </CardTitle>
            <CardDescription>
              Paste your CSV data or download the template to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>

            <Textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Paste your CSV data here..."
              rows={12}
              className="font-mono text-sm"
            />

            <Button 
              onClick={processBulkCreation}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Processing Wards...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Create Wards
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Creation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Zap className="h-8 w-8 animate-pulse mx-auto mb-2" />
                  <p>Processing ward creation with geospatial optimization...</p>
                </div>
                <Progress value={50} className="w-full" />
              </div>
            ) : results ? (
              <div className="space-y-4">
                {results.error ? (
                  <div className="text-red-600">
                    <p className="font-medium">Bulk Creation Failed</p>
                    <p className="text-sm">{results.error}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">{results.total}</p>
                        <p className="text-sm text-blue-600">Total</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">{results.created}</p>
                        <p className="text-sm text-green-600">Created</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                        <p className="text-sm text-red-600">Failed</p>
                      </div>
                    </div>

                    {results.details && results.details.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Creation Details</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {results.details.map((detail, index) => (
                            <div key={index} className={`p-3 rounded border-l-4 ${
                              detail.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                            }`}>
                              <div className="flex items-center gap-2">
                                {detail.success ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Zap className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium">{detail.name}</span>
                              </div>
                              
                              {detail.success ? (
                                <div className="mt-2 text-sm space-y-1">
                                  <p>Ward #{detail.ward.number} created successfully</p>
                                  {detail.analytics?.optimization?.shouldAdjust && (
                                    <p className="text-blue-600">
                                      Position optimized: {detail.analytics.optimization.improvement}
                                    </p>
                                  )}
                                  {detail.analytics?.reassignedIssues?.reassigned > 0 && (
                                    <p className="text-green-600">
                                      {detail.analytics.reassignedIssues.reassigned} issues auto-assigned
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-1 text-sm text-red-600">{detail.error}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Results will appear here after processing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
          <CardDescription>
            Required and optional fields for bulk ward creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Required Fields</h4>
              <ul className="text-sm space-y-1">
                <li><code>name</code> - Ward name</li>
                <li><code>number</code> - Unique ward number</li>
                <li><code>address</code> - Ward office address</li>
                <li><code>longitude</code> - Longitude coordinate</li>
                <li><code>latitude</code> - Latitude coordinate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Fields</h4>
              <ul className="text-sm space-y-1">
                <li><code>description</code> - Ward description</li>
                <li><code>population</code> - Population count</li>
                <li><code>area</code> - Area in sq km</li>
                <li><code>contactEmail</code> - Contact email</li>
                <li><code>contactPhone</code> - Contact phone</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
