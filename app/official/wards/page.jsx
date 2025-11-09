'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function OfficialWardPage() {
  const { data: session } = useSession();
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await fetch('/api/official/wards');
        if (response.ok) {
          const data = await response.json();
          setWards(data.wards || []);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'official' || session?.user?.role === 'admin') {
      fetchWards();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ward Management</h1>
        <p className="text-muted-foreground">
          Manage your assigned wards and track issues
        </p>
      </div>

      {wards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Wards Assigned</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any wards assigned to you yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to get ward assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wards.map((ward) => (
            <Card key={ward._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {ward.name}
                  </CardTitle>
                  <Badge variant="outline">Ward {ward.number}</Badge>
                </div>
                <CardDescription>
                  {ward.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ward Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-bold text-blue-600">
                      {ward.issueStats?.total || 0}
                    </div>
                    <div className="text-xs text-blue-600">Total Issues</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-bold text-blue-600">
                      {ward.issueStats?.inProgress || 0}
                    </div>
                    <div className="text-xs text-blue-600">In Progress</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-green-600">
                      {ward.issueStats?.resolved || 0}
                    </div>
                    <div className="text-xs text-green-600">Resolved</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                    <div className="text-lg font-bold text-orange-600">
                      {ward.issueStats?.pending || 0}
                    </div>
                    <div className="text-xs text-orange-600">Pending</div>
                  </div>
                </div>

                {/* Priority Issues Alert */}
                {ward.issueStats?.highPriority > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      {ward.issueStats.highPriority} high priority issues
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/issues?ward=${ward._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Issues
                    </Button>
                  </Link>
                  <Link href={`/official/wards/${ward._id}`} className="flex-1">
                    <Button className="w-full">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
