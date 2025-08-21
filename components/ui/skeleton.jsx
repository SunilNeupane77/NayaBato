import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props} />)
  );
}

function IssueDetailSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function IssueCardSkeleton() {
  return (
    <div className="p-6">
      <div className="flex items-center mb-2">
        <Skeleton className="h-5 w-20 mr-2" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export { IssueCardSkeleton, IssueDetailSkeleton, Skeleton };
