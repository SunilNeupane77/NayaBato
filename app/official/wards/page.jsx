'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, FileText, MapPin } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Ward Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your assigned wards and track issues
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {wards.length} ward{wards.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {wards.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Wards Assigned</h3>
            <p className="text-gray-600 mb-4">
              You don't have any wards assigned to you yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator to get ward assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wards.map((ward) => (
            <Card key={ward._id} className="border-gray-200 hover:shadow-sm transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    {ward.name}
                  </CardTitle>
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                    Ward {ward.number}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {ward.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ward Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {ward.issueStats?.total || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total Issues</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {ward.issueStats?.inProgress || 0}
                    </div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <CheckCircle className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {ward.issueStats?.resolved || 0}
                    </div>
                    <div className="text-xs text-gray-600">Resolved</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-lg font-semibold text-gray-900">
                      {ward.issueStats?.pending || 0}
                    </div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </div>

                {/* Priority Issues Alert */}
                {ward.issueStats?.highPriority > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {ward.issueStats.highPriority} high priority issues
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/issues?ward=${ward._id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      View Issues
                    </Button>
                  </Link>
                  <Link href={`/official/wards/${ward._id}`} className="flex-1">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
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
