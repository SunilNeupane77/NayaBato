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
import { useToast } from "@/components/ui/use-toast";
import { useIssue, useUpdateIssue } from '@/lib/hooks/api';
import { useLanguage } from '@/lib/i18n/language-context';
import { AlertCircle, Calendar, Loader2, MapPin, User, FileText, Image as ImageIcon, Activity, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const IssueLocationMap = dynamic(() => import('@/components/maps/IssueLocationMap'), { ssr: false });

const STATUS_COLORS = { reported: 'bg-orange-500', 'under-review': 'bg-blue-500', 'in-progress': 'bg-yellow-500', resolved: 'bg-green-500', rejected: 'bg-red-500' };

const formatDate = (date, locale ) => new Date(date).toLocaleString(locale === 'ne' ? 'ne-NP' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });

// Use translation function for status and category
const formatStatus = (status, t) => {
  const statusKeyMap = {
    'reported': 'reported',
    'under-review': 'underReview', 
    'in-progress': 'inProgress',
    'resolved': 'resolved',
    'rejected': 'rejected'
  };
  
  const fallbackMap = {
    'reported': 'Reported',
    'under-review': 'Under Review',
    'in-progress': 'In Progress', 
    'resolved': 'Resolved',
    'rejected': 'Rejected'
  };
  
  if (t && typeof t === 'function') {
    const key = statusKeyMap[status];
    if (key) {
      try {
        const translation = t(`issues.statuses.${key}`);
        // Check if translation actually returned a value and not the key itself
        if (translation && !translation.startsWith('issues.statuses.')) {
          return translation;
        }
      } catch (error) {
        console.error('Translation error:', error);
      }
    }
  }
  
  return fallbackMap[status] || status;
};

const formatCategory = (category, t) => {
  if (typeof t === 'function') {
    return t(`issues.categories.${category}`) || category;
  }
  return category;
};

export default function IssueDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { issue, isLoading, isError, error, refetch } = useIssue(params.id);
  const updateIssue = useUpdateIssue();
  const { toast } = useToast();
  const { t, locale } = useLanguage();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Image gallery modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  
  // Active tab state for mobile view optimization
  const [activeTab, setActiveTab] = useState('details');

  if (isLoading) return <IssueDetailSkeleton />;
  if (isError || !issue) return (
    <div className="flex h-[60vh] flex-col items-center justify-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold mb-2">{isError ? error?.message : t('issues.issueNotFound') || 'Issue not found'}</h2>
      <Button variant="outline" onClick={() => router.back()}>{t('common.goBack') || 'Go Back'}</Button>
    </div>
  );

  const isAdmin = session?.user.role === 'admin' || session?.user.role === 'official';
  const isOwner = session?.user.id === issue?.reporter?._id;
  const canUpdate = isAdmin || isOwner;

  const onUpdateStatus = async () => {
    if (!newStatus && !newPriority) {
      toast({
        variant: 'destructive',
        title: t('issues.missingUpdate') || 'Missing update',
        description: t('issues.selectStatusOrPriority') || 'Please select a status or priority to update'
      });
      return;
    }
    
    setLoadingUpdate(true);
    try {
      const updateData = { notes };
      if (newStatus) updateData.status = newStatus;
      if (newPriority) updateData.priority = newPriority;
      
      await updateIssue.mutateAsync({ id: issue._id, data: updateData });
      
      toast({
        title: t('common.success') || 'Success',
        description: t('issues.issueUpdateSuccess') || 'Issue updated successfully'
      });
      
      setNewStatus('');
      setNewPriority('');
      setNotes('');
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: t('issues.updateFailed') || 'Update Failed',
        description: (e).message || t('issues.failedToUpdate') || 'Failed to update issue'
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-16">
      {/* Hero section with issue details */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-xl p-6 mb-8 shadow-lg overflow-hidden">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()} 
              className="text-white hover:bg-white/20 hover:text-white"
            >
              &larr; {t('common.back') || 'Back to Issues'}
            </Button>
            <div className="flex items-center gap-2">
              <Badge className={`${STATUS_COLORS[issue.status]} px-3 py-1.5 text-white font-medium rounded-full shadow-sm`}>
                {formatStatus(issue.status, t)}
              </Badge>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full font-mono">
                #{issue?._id ? issue._id.slice(-6).toUpperCase() : '------'}
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 leading-tight">{issue.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-blue-100">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4" /> 
              {formatDate(issue.createdAt, locale)}
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4" /> 
              {issue.reporter?.name || t('common.unknown') || 'Unknown'}
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <MapPin className="h-4 w-4" /> 
              {issue.location?.address ? issue.location.address.substring(0, 60) + (issue.location.address.length > 60 ? '...' : '') : t('issues.noAddressProvided') || 'No address provided'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs 
            defaultValue="details" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="bg-card rounded-lg shadow-sm border"
          >
            <TabsList className="mb-6 grid grid-cols-4 p-1 bg-muted rounded-lg">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('issues.details') || 'Details'}
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('common.images') || 'Images'}
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t('issues.activity') || 'Activity'}
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('issues.comments') || 'Comments'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                    <span className="mr-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">1</span>
                    </span>
                    Description
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">{issue.description}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                    <span className="mr-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">2</span>
                    </span>
                    {t('issues.categoryAndDetails') || 'Category & Details'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">{t('issues.category') || 'Category'}</p>
                      <p className="font-medium text-foreground capitalize">{formatCategory(issue.category, t)}</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">{t('issues.priority') || 'Priority'}</p>
                      <p className="font-medium text-foreground capitalize">{issue.priority || t('common.normal') || 'Normal'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                    <span className="mr-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-medium">3</span>
                    </span>
                    {t('issues.location') || 'Location'}
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    {issue.location?.address ? (
                      <div className="mb-4 flex items-start">
                        <MapPin className="inline-block mr-2 text-primary shrink-0 mt-1" />
                        <span className="text-foreground">{issue.location.address}</span>
                      </div>
                    ) : <div className="text-muted-foreground mb-4">{t('issues.noAddressProvided') || 'No address provided'}</div>}
                    {issue.location?.coordinates ? (
                      <div className="h-80 rounded-lg overflow-hidden border">
                        <IssueLocationMap location={issue.location} />
                      </div>
                    ) : (
                      <div className="h-60 rounded-lg flex items-center justify-center text-muted-foreground bg-muted">
                        {t('issues.mapUnavailable') || 'Map unavailable'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="p-6">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <span>{t('issues.issueImages') || 'Issue Images'}</span>
                  <Badge variant="outline" className="font-normal">
                    {Array.isArray(issue.images) ? issue.images.length : 0} {t('common.images') || 'images'}
                  </Badge>
                </h3>
                {Array.isArray(issue.images) && issue.images.length ? (
                  <>
                    <div className="relative w-full aspect-video border rounded-lg mb-4 bg-card shadow-sm overflow-hidden">
                      <Image 
                        src={issue.images[activeImageIndex]?.url || ''} 
                        alt={`Image ${activeImageIndex+1}`} 
                        fill 
                        className="object-contain" 
                        onClick={() => {
                          setModalImageUrl(issue.images[activeImageIndex]?.url);
                          setShowImageModal(true);
                        }}
                      />
                      <Button 
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setModalImageUrl(issue.images[activeImageIndex]?.url);
                          setShowImageModal(true);
                        }}
                      >
                        {t('issues.viewFullSize') || 'View Full Size'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {issue.images.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={`aspect-video border-2 rounded-md cursor-pointer overflow-hidden shadow-sm transition-transform hover:scale-105 ${idx === activeImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`} 
                          onClick={() => setActiveImageIndex(idx)}
                        >
                          <div className="relative w-full h-full">
                            <Image 
                              src={img.url} 
                              alt={`Thumbnail ${idx+1}`} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-4" />
                    <p>{t('issues.noImagesAttached') || 'No images were attached to this issue'}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="p-6">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">{t('issues.issueTimeline') || 'Issue Timeline'}</h3>
                
                {(Array.isArray(issue.statusHistory) && issue.statusHistory.length > 0) ? (
                  <div className="relative py-4">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-yellow-200 to-green-200"></div>
                    
                    {issue.statusHistory.map((h, i) => (
                      <div key={i} className="pl-12 pb-8 relative">
                        {/* Timeline dot with appropriate status color */}
                        <span 
                          className={`absolute left-2 top-1 w-6 h-6 rounded-full border-4 border-background shadow-md z-10 ${STATUS_COLORS[h.status]} flex items-center justify-center`}
                          style={{ transform: 'translateX(-50%)' }}
                        >
                          <span className="text-white text-xs font-bold">{i+1}</span>
                        </span>
                        
                        <div className={`bg-card p-5 rounded-lg shadow-md border border-l-4 ${h.status === 'resolved' ? 'border-l-green-500' : h.status === 'rejected' ? 'border-l-red-500' : h.status === 'in-progress' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                          <div className="flex flex-wrap items-center justify-between mb-3">
                            <Badge className={`${STATUS_COLORS[h.status]} text-white px-3 py-1 rounded-full`}>
                              {formatStatus(h.status, t)}
                            </Badge>
                            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full font-mono">
                              {formatDate(h.updatedAt, locale)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                            <div className="bg-muted rounded-full p-1">
                              <User className="h-4 w-4 text-foreground" />
                            </div>
                            <span className="font-medium">{h.updatedBy?.name || t('common.system') || 'System'}</span>
                            {h.updatedBy?.role && 
                              <Badge variant="outline" className="font-normal ml-1 text-xs">
                                {h.updatedBy.role}
                              </Badge>
                            }
                          </div>
                          
                          {h.notes ? (
                            <div className="text-foreground bg-muted p-3 rounded-md border text-sm">
                              <p className="italic text-xs text-muted-foreground mb-1">{t('issues.notes') || 'Notes'}:</p>
                              {h.notes}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">{t('issues.noAdditionalNotes') || 'No additional notes provided'}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mb-4" />
                    <p>{t('issues.noActivityHistory') || 'No activity history available'}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <CommentSection issueId={issue._id} />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Card className="border-t-4 border-t-blue-500 shadow-md overflow-hidden">
            <CardHeader className="bg-blue-50/50 pb-3">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <User className="h-5 w-5" /> {t('issues.reportedBy') || 'Reported By'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 rounded-full p-1.5">
                  <User className="h-5 w-5 text-blue-700" />
                </div>
                <span className="font-medium">{issue.reporter?.name || t('common.unknown') || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-1">
                <Calendar className="h-4 w-4 text-gray-500" /> {formatDate(issue.createdAt, locale)}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-t-4 border-t-amber-500 shadow-md overflow-hidden">
              <CardHeader className="bg-amber-50/50 pb-3">
                <CardTitle className="text-amber-800">{t('issues.updateStatus') || 'Update Status'}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md">
                      {t('issues.updateStatus') || 'Update Status'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl">{t('issues.updateIssueStatus') || 'Update Issue Status'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">{t('issues.newStatus') || 'New Status'}</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('issues.selectStatus') || 'Select status'} />
                          </SelectTrigger>
                          <SelectContent>
                            {["under-review","in-progress","resolved","rejected"].map(v =>
                              <SelectItem key={v} value={v}>{formatStatus(v, t)}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">{t('issues.priority') || 'Priority'}</label>
                        <Select value={newPriority} onValueChange={setNewPriority}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('issues.selectPriority') || 'Select priority'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">{t('issues.priorities.low') || 'Low'}</SelectItem>
                            <SelectItem value="medium">{t('issues.priorities.medium') || 'Medium'}</SelectItem>
                            <SelectItem value="high">{t('issues.priorities.high') || 'High'}</SelectItem>
                            <SelectItem value="critical">{t('issues.priorities.critical') || 'Critical'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">{t('issues.notesOptional') || 'Notes (optional)'}</label>
                        <Textarea 
                          placeholder={t('issues.addDetailsPlaceholder') || 'Add details about this update...'} 
                          value={notes} 
                          onChange={e => setNotes(e.target.value)} 
                          rows={3}
                          className="resize-none" 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel') || 'Cancel'}</Button>
                      </DialogClose>
                      <Button 
                        onClick={onUpdateStatus} 
                        disabled={(!newStatus && !newPriority) || loadingUpdate}
                      >
                        {loadingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.update') || 'Update'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {issue.assignedTo && (
            <Card className="border-t-4 border-t-green-500 shadow-md overflow-hidden">
              <CardHeader className="bg-green-50/50 pb-3">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <User className="h-5 w-5" /> {t('issues.assignedTo') || 'Assigned To'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 rounded-full p-1.5">
                    <User className="h-5 w-5 text-green-700" />
                  </div>
                  <span className="font-medium">{issue.assignedTo?.name || t('common.unknown') || 'Unknown'}</span>
                </div>
                {issue.assignedTo?.department && (
                  <div className="ml-10 text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                    <span>{issue.assignedTo.department}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* We're removing the duplicate image gallery since we already have an Images tab */}
      
        {/* Modal for full image view */}
        {showImageModal && (
          <Dialog open={showImageModal} onOpenChange={setShowImageModal} className="z-50">
            <DialogContent className="max-w-4xl bg-background/95 backdrop-blur border">
              <DialogHeader>
                <DialogTitle className="text-foreground">{t('issues.imagePreview') || 'Image Preview'}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center p-2">
                <div className="relative w-full aspect-auto max-h-[75vh] flex items-center justify-center">
                  <Image
                    src={modalImageUrl}
                    alt={t('issues.fullIssueImage') || 'Full Issue Image'}
                    width={1200}
                    height={800}
                    className="rounded-lg object-contain max-h-[75vh]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowImageModal(false)}
                >
                  {t('common.close') || 'Close'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      
    </div>
  );
}
