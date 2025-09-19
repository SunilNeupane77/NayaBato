'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

// Mobile-optimized Input component
export const MobileInput = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "mobile-input w-full bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
MobileInput.displayName = "MobileInput";

// Mobile-optimized Textarea component
export const MobileTextarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "mobile-input w-full min-h-[120px] resize-y bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
MobileTextarea.displayName = "MobileTextarea";

// Mobile-optimized Select component
export const MobileSelect = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "mobile-input w-full bg-white border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==')] bg-no-repeat bg-right-3 bg-center pr-10",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
MobileSelect.displayName = "MobileSelect";

// Mobile-optimized Label component
export const MobileLabel = forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "mobile-form-label",
        className
      )}
      {...props}
    />
  );
});
MobileLabel.displayName = "MobileLabel";

// Mobile-optimized Form Group component
export const MobileFormGroup = ({ children, className, ...props }) => {
  return (
    <div className={cn("mobile-form-group", className)} {...props}>
      {children}
    </div>
  );
};

// Mobile-optimized Form component
export const MobileForm = ({ children, className, ...props }) => {
  return (
    <form className={cn("mobile-form", className)} {...props}>
      {children}
    </form>
  );
};

// Mobile-optimized File Input component
export const MobileFileInput = forwardRef(({ className, multiple = false, accept, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        className={cn(
          "mobile-input w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
MobileFileInput.displayName = "MobileFileInput";

// Mobile-optimized Checkbox component
export const MobileCheckbox = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-5 w-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary touch-target",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
MobileCheckbox.displayName = "MobileCheckbox";

// Mobile-optimized Radio component
export const MobileRadio = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      type="radio"
      className={cn(
        "h-5 w-5 border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary touch-target",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
MobileRadio.displayName = "MobileRadio";

// Mobile-optimized Error Message component
export const MobileErrorMessage = ({ children, className, ...props }) => {
  if (!children) return null;
  
  return (
    <p className={cn("text-sm text-red-600 mt-1", className)} {...props}>
      {children}
    </p>
  );
};

// Mobile-optimized Help Text component
export const MobileHelpText = ({ children, className, ...props }) => {
  if (!children) return null;
  
  return (
    <p className={cn("text-xs text-gray-500 mt-1", className)} {...props}>
      {children}
    </p>
  );
};
