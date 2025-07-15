import { cn } from "@/lib/utils"

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

export { Skeleton, IssueCardSkeleton, IssueDetailSkeleton }