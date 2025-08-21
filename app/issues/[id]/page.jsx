'use client';

import CommentSection from '@/components/comments/CommentSection';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IssueDetailSkeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIssue, useUpdateIssue } from '@/lib/hooks/api';
import { AlertCircle, Calendar, Loader2, MapPin, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const IssueLocationMap = dynamic(() => import('@/components/maps/IssueLocationMap'), { ssr: false });

const STATUS_COLORS = { reported: 'bg-orange-500', 'under-review': 'bg-blue-500', 'in-progress': 'bg-yellow-500', resolved: 'bg-green-500', rejected: 'bg-red-500' };

const formatDate = (date ) => new Date(date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
const formatStatus = (s) => ({ reported: 'Reported', 'under-review': 'Under Review', 'in-progress': 'In Progress', resolved: 'Resolved', rejected: 'Not Actionable' }[s] ?? s);

export default function IssueDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { issue, isLoading, isError, error } = useIssue(params.id);
  const updateIssue = useUpdateIssue();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Image gallery modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  if (isLoading) return <IssueDetailSkeleton />;
  if (isError || !issue) return (
    <div className="flex h-[60vh] flex-col items-center justify-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">{isError ? error?.message : 'Issue not found'}</h2>
      <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
    </div>
  );

  const isAdmin = session?.user.role === 'admin' || session?.user.role === 'official';
  const isOwner = session?.user.id === issue?.reporter?._id;
  const canUpdate = isAdmin || isOwner;

  const onUpdateStatus = async () => {
    if (!newStatus) return;
    setLoadingUpdate(true);
    try {
      await updateIssue.mutateAsync({ id: issue._id, data: { status: newStatus, notes } });
      setNewStatus('');
      setNotes('');
    } catch (e) {
      console.error(e);
      alert((e ).message || 'Update failed');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>&larr; Back</Button>
        <div className="flex items-center gap-2">
          <Badge className={`${STATUS_COLORS[issue.status]} text-white`}>{formatStatus(issue.status)}</Badge>
          <span className="text-sm text-gray-500">#{issue?._id ? issue._id.slice(-6) : '------'}</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-4">{issue.title}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-6 grid grid-cols-4">
              {['details', 'images', 'activity', 'comments'].map(t => (
                <TabsTrigger key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-wrap">{issue.description}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Category</CardTitle></CardHeader>
                <CardContent><p>{issue.category}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                <CardContent>
                  {issue.location?.address ? (
                    <div><MapPin className="inline-block mr-2 text-gray-500" />{issue.location.address}</div>
                  ) : <div className="text-gray-500">No address provided</div>}
                  {issue.location?.coordinates
                    ? <div className="mt-4 h-60 border"><IssueLocationMap location={issue.location} /></div>
                    : <div className="mt-4 h-60 border flex items-center justify-center text-gray-500">Map unavailable</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card>
                <CardHeader><CardTitle>Images ({Array.isArray(issue.images) ? issue.images.length : 0})</CardTitle></CardHeader>
                <CardContent>
                  {Array.isArray(issue.images) && issue.images.length ? (
                    <>
                      <div className="relative w-full aspect-video border rounded-lg mb-4">
                        <Image src={issue.images[activeImageIndex]?.url || ''} alt={`Image ${activeImageIndex+1}`} fill className="object-contain" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {issue.images.map((img, idx) => (
                          <div key={idx} className={`aspect-video border-2 rounded cursor-pointer overflow-hidden ${idx === activeImageIndex ? 'border-blue-500' : 'border-transparent'}`} onClick={() => setActiveImageIndex(idx)}>
                            <Image src={img.url} alt={`Thumb ${idx+1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <p className="text-gray-500">No images attached</p>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader><CardTitle>Status Timeline</CardTitle></CardHeader>
                <CardContent>
                  {(Array.isArray(issue.statusHistory) ? issue.statusHistory : []).map((h, i) => (
                    <div key={i} className="pl-8 border-l-2 border-gray-200 mb-6 relative">
                      <span className="absolute left-[-8px] top-1 w-4 h-4 rounded-full bg-blue-500"></span>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${STATUS_COLORS[h.status]} text-white`}>{formatStatus(h.status)}</Badge>
                        <span className="text-sm text-gray-500">{formatDate(h.updatedAt)}</span>
                      </div>
                      <div className="text-sm mb-1">
                        <span className="font-semibold">{h.updatedBy?.name || 'System'}</span>
                        {h.updatedBy?.role && <span className="text-gray-500 ml-1">({h.updatedBy.role})</span>}
                      </div>
                      {h.notes && <div className="text-gray-700 bg-gray-50 p-2 rounded">{h.notes}</div>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <CommentSection issueId={issue._id} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Reported By</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <User className="text-gray-500" /> {issue.reporter?.name || 'Unknown'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="inline-block" /> {formatDate(issue.createdAt)}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild><Button className="w-full">Update Status</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label>New Status</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {["under-review","in-progress","resolved","rejected"].map(v =>
                              <SelectItem key={v} value={v}>{formatStatus(v)}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label>Notes (optional)</label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={onUpdateStatus} disabled={!newStatus || loadingUpdate}>
                        {loadingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {issue.assignedTo && (
            <Card>
              <CardHeader><CardTitle>Assigned To</CardTitle></CardHeader>
              <CardContent>
                <div><User className="inline-block mr-2 text-gray-500" />{issue.assignedTo?.name || 'Unknown'}</div>
                {issue.assignedTo?.department && <div className="text-sm text-gray-500">{issue.assignedTo.department}</div>}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      <div className="my-8">
        <h3 className="text-lg font-semibold mb-2">Images</h3>
        {issue.images && issue.images.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {issue.images.map((img, idx) => (
              <div key={img.publicId || idx} className="relative group">
                <Image
                  src={img.url}
                  alt={`Issue image ${idx + 1}`}
                  width={160}
                  height={120}
                  className="rounded-lg shadow cursor-pointer object-cover w-40 h-28"
                  onClick={() => {
                    setModalImageUrl(img.url);
                    setShowImageModal(true);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic">No images provided for this issue.</div>
        )}
        {/* Modal for full image view */}
        {showImageModal && (
          <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center">
                <Image
                  src={modalImageUrl}
                  alt="Full Issue Image"
                  width={600}
                  height={400}
                  className="rounded-lg shadow object-contain max-h-[70vh]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImageModal(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
