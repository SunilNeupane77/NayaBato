'use client';

import { cn } from '@/lib/utils';

// Mobile-first container component
export function MobileContainer({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile-responsive grid component
export function MobileGrid({ children, className, cols = { base: 1, sm: 2, lg: 3, xl: 4 }, ...props }) {
  const gridClasses = `grid grid-cols-${cols.base} sm:grid-cols-${cols.sm} lg:grid-cols-${cols.lg} xl:grid-cols-${cols.xl} gap-4 sm:gap-6`;
  
  return (
    <div 
      className={cn(gridClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile-responsive card component
export function MobileCard({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-4 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile-responsive heading component
export function MobileHeading({ children, level = 1, className, ...props }) {
  const Component = `h${level}`;
  const sizeClasses = {
    1: "text-2xl sm:text-3xl lg:text-4xl",
    2: "text-xl sm:text-2xl lg:text-3xl",
    3: "text-lg sm:text-xl lg:text-2xl",
    4: "text-base sm:text-lg lg:text-xl",
    5: "text-sm sm:text-base lg:text-lg",
    6: "text-xs sm:text-sm lg:text-base"
  };
  
  return (
    <Component 
      className={cn(
        "font-semibold text-gray-900",
        sizeClasses[level],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// Mobile-responsive text component
export function MobileText({ children, size = "base", className, ...props }) {
  const sizeClasses = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-sm sm:text-base lg:text-lg",
    lg: "text-base sm:text-lg lg:text-xl",
    xl: "text-lg sm:text-xl lg:text-2xl"
  };
  
  return (
    <p 
      className={cn(
        "text-gray-600",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Mobile-responsive button wrapper
export function MobileButton({ children, className, ...props }) {
  return (
    <button 
      className={cn(
        "mobile-button touch-target",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile-responsive form field wrapper
export function MobileFormField({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "space-y-2 sm:space-y-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Mobile-responsive input wrapper
export function MobileInput({ className, ...props }) {
  return (
    <input 
      className={cn(
        "mobile-text touch-target w-full",
        className
      )}
      {...props}
    />
  );
}

// Mobile-responsive modal/dialog wrapper
export function MobileModal({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4",
        className
      )}
      {...props}
    >
      <div className="bg-white dark:bg-gray-800 w-full sm:w-auto sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto safe-area-bottom">
        {children}
      </div>
    </div>
  );
}

// Mobile-responsive navigation wrapper
export function MobileNav({ children, className, ...props }) {
  return (
    <nav 
      className={cn(
        "flex flex-col lg:flex-row space-y-1 lg:space-y-0 lg:space-x-6",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

// Mobile-responsive table wrapper
export function MobileTable({ children, className, ...props }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table 
          className={cn(
            "min-w-full divide-y divide-gray-200",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  );
}
