'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WardDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [ward, setWard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWard = async () => {
      if (!id) {
        setError('Invalid ward ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/wards/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.ward) {
          setWard(result.ward);
        } else {
          setError(result.message || 'Ward not found');
        }
      } catch (err) {
        console.error('Error fetching ward:', err);
        setError(err.message || 'Failed to fetch ward details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWard();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-lg text-gray-500">Loading ward details...</span>
      </div>
    );
  }

  if (error || !ward) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <span className="text-red-500 text-lg mb-4">{error || 'Ward not found'}</span>
        <Button variant="outline" onClick={() => router.push('/admin/wards')}>Back to Wards</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {ward.name}
            <Badge variant="outline">Ward #{ward.number}</Badge>
          </CardTitle>
          <CardDescription>{ward.location?.address}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">
            <strong>Coordinates:</strong> {ward.location?.coordinates?.coordinates[1]}, {ward.location?.coordinates?.coordinates[0]}
          </p>
          {ward.officerInCharge && (
            <p className="text-sm mb-2">
              <strong>Officer in Charge:</strong> {ward.officerInCharge.name} ({ward.officerInCharge.email})
            </p>
          )}
          {ward.description && (
            <p className="text-sm mb-2">
              <strong>Description:</strong> {ward.description}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.push('/admin/wards')}>Back to Wards</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
