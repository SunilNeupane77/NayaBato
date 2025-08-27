'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, MapPin, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import LocationPicker from '../maps/LocationPicker';

// Import shadcn components
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

// Import React Query hook
import { useCreateIssue } from '@/lib/hooks/api';

// Define validation schema with Zod
const createIssueSchema = (t) => z.object({
  title: z.string().min(1, { message: t("issues.title") + " " + t("common.required") }).max(100, { message: t("issues.title") + " " + "cannot exceed 100 characters" }),
  description: z.string().min(10, { message: t("issues.description") + " " + "must be at least 10 characters" }).max(1000, { message: t("issues.description") + " " + "cannot exceed 1000 characters" }),
  category: z.string({ required_error: t("issues.category") + " " + t("common.required") }),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function IssueForm({ onSuccess, onError }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Use the createIssue mutation from React Query
  const createIssueMutation = useCreateIssue({
    onSuccess: (data) => {
      try {
        console.log('Issue creation success callback:', data);
        
        // Show success toast
        toast({
          title: t('issues.reportIssue.issueReported'),
          description: t('issues.reportIssue.issueReportedDesc')
        });
        
        // Clear any previous errors
        setSubmitError(null);
        
        // Get the issue ID from the response
        const issueId = data?.issue?._id;
        
        if (!issueId) {
          console.error('Missing issue ID in response:', data);
          toast({
            variant: 'destructive',
            title: t('common.error'),
            description: 'Issue created but could not get issue ID. Please check your issues list.'
          });
          
          // Redirect to issues list if we can't get the ID
          setTimeout(() => router.push('/issues'), 1500);
          return;
        }
        
        // Success! Call the success callback if provided, otherwise redirect
        if (onSuccess) {
          onSuccess(issueId);
        } else {
          // Set a small delay to ensure toast is visible before redirect
          setTimeout(() => {
            console.log(`Redirecting to issue detail page: /issues/${issueId}`);
            router.push(`/issues/${issueId}`);
          }, 1000);
        }
      } catch (err) {
        console.error('Error in success handler:', err);
        // Redirect to issues list as a fallback
        setTimeout(() => router.push('/issues'), 1500);
      }
    },
    onError: (error) => {
      console.error('Error submitting issue:', error);
      const errorMessage = error.message || t('issues.reportIssue.submitError');
      
      // Show error toast
      toast({
        variant: 'destructive',
        title: t('issues.reportIssue.error'),
        description: errorMessage
      });
      
      // Keep local error state for form display
      setSubmitError(errorMessage);

      // Call the error callback if provided
      if (onError) {
        onError(errorMessage);
      }
    }
  });

  // Initialize react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(createIssueSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const { toast } = useToast();
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - images.length;

    if (files.length > remainingSlots) {
      toast({
        variant: 'destructive',
        title: t('issues.reportIssue.imageLimitExceeded'),
        description: t('issues.reportIssue.imageLimitExceededDesc').replace('{count}', remainingSlots)
      });
      e.target.value = ''; // Clear the file input
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: 'destructive',
          title: t('issues.reportIssue.fileSizeExceeded'),
          description: t('issues.reportIssue.fileSizeExceededDesc').replace('{name}', file.name)
        });
        continue; // Skip this file
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    if (validFiles.length < files.length) {
        e.target.value = ''; // Clear file input if some files were invalid
    }

    setImages(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Wrap in useCallback to prevent recreation on each render
  const handleLocationSelect = useCallback((selectedLocation) => {
    // Convert the location to the format expected by MongoDB
    const formattedLocation = {
      address: selectedLocation.address,
      coordinates: {
        type: "Point",
        coordinates: [selectedLocation.lng, selectedLocation.lat] // MongoDB uses [longitude, latitude] format
      }
    };
    setLocation(formattedLocation);
    setLocationError(null);
  }, []);

  const onSubmit = async (values) => {
    try {
      // Reset any previous errors
      setSubmitError(null);
      
      // Validate location
      if (!location) {
        setLocationError(t('issues.reportIssue.missingLocationDesc'));
        toast({
          variant: 'destructive',
          title: t('issues.reportIssue.missingLocation'),
          description: t('issues.reportIssue.missingLocationDesc')
        });
        return;
      }

      // Show loading toast
      toast({
        title: t('issues.reportIssue.submitting') || 'Submitting issue...',
        description: t('issues.reportIssue.submittingDesc') || 'Please wait while we submit your issue.'
      });

      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append('title', values.title);
      formDataToSend.append('description', values.description);
      formDataToSend.append('category', values.category);
      formDataToSend.append('location', JSON.stringify(location));

      // Append images if any
      images.forEach((image, index) => {
        formDataToSend.append(`image-${index}`, image);
      });

      console.log('Submitting issue form with data:', {
        title: values.title,
        description: values.description?.substring(0, 30) + '...',
        category: values.category,
        location: {
          address: location.address,
          coordinates: location.coordinates ? 
            `[${location.coordinates.coordinates[0]}, ${location.coordinates.coordinates[1]}]` : 'N/A'
        },
        imageCount: images.length
      });

      // Use React Query mutation to submit the form
      createIssueMutation.mutate(formDataToSend);
    } catch (error) {
      console.error('Error in form submission:', error);
      
      // Show error toast
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message || t('issues.reportIssue.unexpectedError')
      });
      
      setSubmitError(error.message || t('issues.reportIssue.unexpectedError'));
    }
  };

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  {t('issues.reportIssue.issueTitle')}
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('issues.reportIssue.issueTitlePlaceholder')} {...field} disabled={createIssueMutation.isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  {t('issues.reportIssue.category')}
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={createIssueMutation.isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('issues.reportIssue.selectCategory')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pothole">{t('issues.reportIssue.pothole')}</SelectItem>
                    <SelectItem value="streetlight">{t('issues.reportIssue.streetlight')}</SelectItem>
                    <SelectItem value="garbage">{t('issues.reportIssue.garbage')}</SelectItem>
                    <SelectItem value="water">{t('issues.reportIssue.water')}</SelectItem>
                    <SelectItem value="electricity">{t('issues.reportIssue.electricity')}</SelectItem>
                    <SelectItem value="other">{t('issues.reportIssue.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  {t('issues.reportIssue.description')}
                  <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('issues.reportIssue.descriptionPlaceholder')}
                    rows={4}
                    {...field}
                    disabled={createIssueMutation.isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center">
              <span>{t('issues.reportIssue.selectLocation')}</span>
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('issues.reportIssue.locationInstructions')}
            </p>

            <div className="border rounded-md p-1 bg-gray-50">
              <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            {location && (
              <div className="bg-green-50 p-2 rounded-md border border-green-200">
                <p className="text-sm text-green-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-medium">{t('issues.location') || 'स्थान'}: </span>
                  <span className="ml-1">{location.address}</span>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {t('maps.coordinates') || 'Coordinates'}: [{location.coordinates.coordinates[1].toFixed(6)}, {location.coordinates.coordinates[0].toFixed(6)}]
                </p>
              </div>
            )}

            {locationError && (
              <div className="bg-red-50 p-2 rounded-md border border-red-200">
                <p className="text-sm text-red-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {locationError}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium">
              {t('issues.reportIssue.uploadImages')}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('issues.reportIssue.uploadImagesDesc')}
            </p>

            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="images"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                  "hover:bg-muted/50 hover:border-teal-500",
                  createIssueMutation.isLoading || images.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                {previewUrls.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 p-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative w-24 h-24">
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="object-cover w-full h-full rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault(); // prevent label click
                            handleRemoveImage(i);
                          }}
                          className="absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-full transform -translate-y-1/2 translate-x-1/2"
                          aria-label={t('issues.reportIssue.removeImage')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <div className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg">
                        <Camera className="w-5 h-5 text-muted-foreground" />
                        <p className="text-xs text-center text-muted-foreground mt-1">
                          {t('issues.reportIssue.chooseImages')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">{t('issues.reportIssue.clickToUpload')}</span> {t('issues.reportIssue.dragAndDrop')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('issues.reportIssue.imageFormats')}
                    </p>
                  </div>
                )}
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={createIssueMutation.isLoading || images.length >= 3}
                />
              </Label>
            </div>
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground text-right">
                {images.length}/3 {t('issues.images')}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={createIssueMutation.isLoading}
          >
            {createIssueMutation.isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('issues.reportIssue.submitting')}
              </div>
            ) : (
              t('issues.reportIssue.submit')
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}