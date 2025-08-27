'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast,
  showLoadingToast,
  showActionToast,
  showUndoToast,
  createFormToastManager,
  toastBatch
} from "@/lib/toast-utils";

export default function ToastDemo() {
  const { toast, dismiss } = useToast();
  const formToast = createFormToastManager(toast);

  const handleSuccessToast = () => {
    showSuccessToast(
      toast, 
      "Success!", 
      "Your issue has been reported successfully and is now being reviewed by local officials."
    );
  };

  const handleErrorToast = () => {
    showErrorToast(
      toast, 
      "Error Occurred", 
      "Failed to submit your issue. Please check your internet connection and try again."
    );
  };

  const handleWarningToast = () => {
    showWarningToast(
      toast, 
      "Warning", 
      "Your session will expire in 5 minutes. Please save your work to avoid losing any changes."
    );
  };

  const handleInfoToast = () => {
    showInfoToast(
      toast, 
      "Information", 
      "New features have been added to Nayabato! Check out the updated dashboard for better issue tracking."
    );
  };

  const handleLoadingToast = () => {
    const loadingToast = showLoadingToast(
      toast, 
      "Processing...", 
      "Uploading images and submitting your issue report. This may take a few moments."
    );

    // Auto-dismiss after 3 seconds for demo
    setTimeout(() => {
      loadingToast.dismiss();
      showSuccessToast(toast, "Complete!", "Your issue has been submitted successfully.");
    }, 3000);
  };

  const handleActionToast = () => {
    showActionToast(toast, {
      variant: 'info',
      title: "New Comment",
      description: "Someone commented on your issue 'Pothole on Main Street'",
      actionLabel: "View",
      onAction: () => {
        showInfoToast(toast, "Navigating", "Taking you to the issue page...");
      }
    });
  };

  const handleUndoToast = () => {
    showUndoToast(
      toast,
      "Issue Deleted",
      "Your issue 'Broken Streetlight' has been deleted.",
      () => {
        showSuccessToast(toast, "Restored", "Your issue has been restored successfully.");
      }
    );
  };

  const handleFormToasts = () => {
    const toasts = [
      { type: 'info', title: 'Starting Process', description: 'Validating your input...' },
      { type: 'success', title: 'Validation Passed', description: 'All fields are valid.' },
      { type: 'info', title: 'Saving', description: 'Saving your changes to the database...' },
      { type: 'success', title: 'Saved Successfully', description: 'Your profile has been updated.' }
    ];

    toastBatch.sequence(toast, toasts, 800);
  };

  const handleClearAll = () => {
    toastBatch.clear(dismiss);
    showInfoToast(toast, "Cleared", "All notifications have been cleared.");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Toast Notification Demo</h1>
        <p className="text-gray-600">
          Test the enhanced toast notification system with improved visibility, animations, and user experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Toast Types */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">Basic Notifications</h3>
          
          <Button 
            onClick={handleSuccessToast}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Success Toast
          </Button>
          
          <Button 
            onClick={handleErrorToast}
            variant="destructive"
            className="w-full"
          >
            Error Toast
          </Button>
          
          <Button 
            onClick={handleWarningToast}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            Warning Toast
          </Button>
          
          <Button 
            onClick={handleInfoToast}
            variant="outline"
            className="w-full"
          >
            Info Toast
          </Button>
        </div>

        {/* Advanced Toast Types */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">Advanced Features</h3>
          
          <Button 
            onClick={handleLoadingToast}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Loading Toast
          </Button>
          
          <Button 
            onClick={handleActionToast}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Action Toast
          </Button>
          
          <Button 
            onClick={handleUndoToast}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            Undo Toast
          </Button>
          
          <Button 
            onClick={handleFormToasts}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Sequence Demo
          </Button>
        </div>

        {/* Form Helper Toasts */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">Form Helpers</h3>
          
          <Button 
            onClick={() => formToast.saved()}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            Saved
          </Button>
          
          <Button 
            onClick={() => formToast.deleted()}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            Deleted
          </Button>
          
          <Button 
            onClick={() => formToast.validationError("Please fill in all required fields")}
            variant="destructive"
            className="w-full"
          >
            Validation Error
          </Button>
          
          <Button 
            onClick={() => formToast.networkError()}
            variant="destructive"
            className="w-full"
          >
            Network Error
          </Button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <Button 
          onClick={handleClearAll}
          variant="outline"
          className="px-6"
        >
          Clear All Toasts
        </Button>
      </div>

      {/* Toast Features Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Enhanced Toast Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Visual Enhancements</h4>
            <ul className="space-y-1">
              <li>• Bounce-in animations with spring effect</li>
              <li>• Color-coded variants with icons</li>
              <li>• Progress bars showing remaining time</li>
              <li>• Hover effects and smooth transitions</li>
              <li>• Backdrop blur for modern appearance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">User Experience</h4>
            <ul className="space-y-1">
              <li>• Appropriate durations per toast type</li>
              <li>• Action buttons for interactive toasts</li>
              <li>• Undo functionality for destructive actions</li>
              <li>• Mobile-responsive positioning</li>
              <li>• Accessibility and reduced motion support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
