'use client';

import { cn } from '@/lib/utils';
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, X } from 'lucide-react';
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

// Import React Query hook
import { useCreateIssue } from '@/lib/hooks/api';

// Define validation schema with Zod
const issueSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(100, { message: "Title cannot exceed 100 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(1000, { message: "Description cannot exceed 1000 characters" }),
  category: z.string({ required_error: "Please select a category" }),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function IssueForm({ onSuccess, onError }) {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Use the createIssue mutation from React Query
  const createIssueMutation = useCreateIssue({
    onSuccess: (data) => {
      // Success! Call the success callback if provided, otherwise redirect
      if (onSuccess) {
        onSuccess(data.issue._id);
      } else {
        router.push(`/issues/${data.issue._id}`);
      }
    },
    onError: (error) => {
      console.error('Error submitting issue:', error);
      const errorMessage = error.message || 'Failed to submit issue. Please try again.';
      setSubmitError(errorMessage);

      // Call the error callback if provided
      if (onError) {
        onError(errorMessage);
      }
    }
  });

  // Initialize react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - images.length;

    if (files.length > remainingSlots) {
      alert(`You can only upload up to 3 images. You can add ${remainingSlots} more.`);
      e.target.value = ''; // Clear the file input
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" exceeds the 5MB size limit.`);
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
    setLocation(selectedLocation);
    setLocationError(null);
  }, []);

  const onSubmit = async (values) => {
    // Validate location
    if (!location) {
      setLocationError("Please select a location on the map");
      return;
    }

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

    // Use React Query mutation to submit the form
    createIssueMutation.mutate(formDataToSend);
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
                <FormLabel>Issue Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of the issue" {...field} disabled={createIssueMutation.isLoading} />
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
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={createIssueMutation.isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pothole">Road/Pothole</SelectItem>
                    <SelectItem value="streetlight">Streetlight</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="water">Water Issue</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide details about the issue"
                    rows={4}
                    {...field}
                    disabled={createIssueMutation.isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Issue Location</Label>
            <p className="text-xs text-muted-foreground">
              Click on the map to select the issue location
            </p>

            <LocationPicker onLocationSelect={handleLocationSelect} />

            {location && (
              <p className="text-sm text-muted-foreground">
                Selected: {location.address}
              </p>
            )}

            {locationError && (
              <p className="text-sm text-destructive">{locationError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="images" className="text-sm font-medium">
              Upload Images (Max 3)
            </Label>

            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="images"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  "hover:bg-muted/50",
                  createIssueMutation.isLoading || images.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                {previewUrls.length > 0 ? (
                  <div className="flex items-center space-x-2 p-2">
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
                          aria-label="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or WEBP (MAX. 5MB each)
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
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createIssueMutation.isLoading}
          >
            {createIssueMutation.isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Issue Report"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}