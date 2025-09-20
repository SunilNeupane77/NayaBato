'use client';

import { ArrowLeft, Save, User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    location: '',
    department: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phoneNumber: session.user.phoneNumber || '',
        bio: session.user.bio || '',
        location: session.user.location || '',
        department: session.user.department || ''
      });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update(updatedUser);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated."
        });
        router.push('/profile');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-gray-600">Update your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
            </div>

            {session?.user?.role === 'official' && (
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Water & Sanitation</SelectItem>
                    <SelectItem value="roads">Roads & Infrastructure</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="sanitation">Waste Management</SelectItem>
                    <SelectItem value="general">General Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
