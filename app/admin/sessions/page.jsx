'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import RealTimeStats from '@/components/admin/RealTimeStats';
import { Monitor, Smartphone, Globe, Clock, Users, Activity, MoreHorizontal, Search, Trash2, Database, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function SessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Selection & Actions
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [editingSession, setEditingSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchSessions();
  }, [filter, page, debouncedSearch, sortBy, sortOrder]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: '20',
        search: debouncedSearch,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/sessions?${params}`);
      const data = await response.json();
      setSessions(data.sessions || []);
      setStats(data.stats || {});
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to desc for new column
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      userId: session.userId?._id || '',
      sessionId: session.sessionId,
      ipAddress: session.ipAddress || '',
      userAgent: session.userAgent || '',
      device: session.device || { browser: '', os: '', isMobile: false },
      location: session.location || { country: '', city: '', region: '' },
      isActive: session.isActive
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      const response = await fetch(`/api/admin/sessions/${editingSession.sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditModal(false);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to terminate this session?')) return;

    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to terminate ${selectedSessions.length} sessions?`)) return;

    try {
      // Assuming backend supports bulk delete or we loop
      // For now, let's loop as the API might not support bulk array yet
      // Ideally, update API to accept array of IDs
      await Promise.all(selectedSessions.map(id =>
        fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' })
      ));

      setSelectedSessions([]);
      fetchSessions();
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  };

  const handleCleanupInactive = async () => {
    if (!confirm('Delete all inactive sessions from database? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/sessions/cleanup', {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully deleted ${data.deletedCount} inactive sessions`);
        fetchSessions();
      }
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      alert('Error cleaning up sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSessions(sessions.map(s => s.sessionId));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectSession = (sessionId, checked) => {
    if (checked) {
      setSelectedSessions(prev => [...prev, sessionId]);
    } else {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
    }
  };

  const getDeviceIcon = (device) => {
    return device?.isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Sessions</h1>
          <p className="text-muted-foreground">Manage and monitor active user sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleCleanupInactive}
            disabled={loading}
          >
            <Database className="mr-2 h-4 w-4" />
            Cleanup Inactive
          </Button>
        </div>
      </div>

      <RealTimeStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgSessionDuration)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, IP, browser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="active">Active Sessions</SelectItem>
              <SelectItem value="inactive">Inactive Sessions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedSessions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedSessions.length} selected</span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Terminate Selected
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedSessions.length === sessions.length && sessions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('user')}>
                <div className="flex items-center">User <ArrowUpDown className="ml-2 h-4 w-4" /></div>
              </TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('loginTime')}>
                <div className="flex items-center">Login Time <ArrowUpDown className="ml-2 h-4 w-4" /></div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('sessionDuration')}>
                <div className="flex items-center">Duration <ArrowUpDown className="ml-2 h-4 w-4" /></div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading sessions...
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSessions.includes(session.sessionId)}
                      onCheckedChange={(checked) => handleSelectSession(session.sessionId, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{session.userId?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{session.userId?.email}</span>
                      <span className="text-xs text-muted-foreground font-mono">{session.ipAddress}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      <div className="flex flex-col">
                        <span className="text-sm">{session.device?.browser || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{session.device?.os}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm">{session.location?.city || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{session.location?.country}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.loginTime), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    {formatDuration(session.sessionDuration)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.isActive ? "success" : "secondary"}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(session)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(session.sessionId)}
                        >
                          Terminate Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sessionId" className="text-right">
                  Session ID
                </Label>
                <Input
                  id="sessionId"
                  value={formData.sessionId || ''}
                  onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ipAddress" className="text-right">
                  IP Address
                </Label>
                <Input
                  id="ipAddress"
                  value={formData.ipAddress || ''}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="browser" className="text-right">
                  Browser
                </Label>
                <Input
                  id="browser"
                  value={formData.device?.browser || ''}
                  onChange={(e) => setFormData({ ...formData, device: { ...formData.device, browser: e.target.value } })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Status
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active Session
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
