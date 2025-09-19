'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';
import { Calendar, MapPin, MessageCircle, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const STATUS_COLORS = {
  'reported': 'bg-orange-500 text-white',
  'under-review': 'bg-blue-500 text-white',
  'in-progress': 'bg-yellow-500 text-white',
  'resolved': 'bg-green-500 text-white',
  'closed': 'bg-gray-500 text-white',
};

const PRIORITY_COLORS = {
  'low': 'bg-green-100 text-green-800 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'high': 'bg-red-100 text-red-800 border-red-200',
  'urgent': 'bg-red-200 text-red-900 border-red-300',
};

export default function MobileIssueCard({ issue, showActions = true }) {
  const { t, locale } = useLanguage();

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(
      locale === 'ne' ? 'ne-NP' : 'en-US', 
      options
    );
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="mobile-card hover:shadow-md transition-all duration-200 active:scale-[0.98] touch-manipulation">
      <CardContent className="p-0">
        {/* Image Section */}
        {issue.images && issue.images.length > 0 && (
          <div className="relative h-48 xs:h-52 sm:h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={issue.images[0]}
              alt={issue.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {issue.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                +{issue.images.length - 1}
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Header with Status and Priority */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge className={`text-xs px-2 py-1 ${STATUS_COLORS[issue.status] || STATUS_COLORS.reported}`}>
                {t(`issues.status.${issue.status}`) || issue.status}
              </Badge>
              {issue.priority && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-1 ${PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.medium}`}
                >
                  {t(`issues.priority.${issue.priority}`) || issue.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="mobile-subheading line-clamp-2 leading-tight">
            {issue.title}
          </h3>

          {/* Description */}
          <p className="mobile-text text-gray-600 line-clamp-3">
            {truncateText(issue.description, 120)}
          </p>

          {/* Category */}
          {issue.category && (
            <div className="inline-block">
              <Badge variant="secondary" className="text-xs">
                {t(`issues.categories.${issue.category}`) || issue.category}
              </Badge>
            </div>
          )}

          {/* Meta Information */}
          <div className="space-y-2 text-xs text-gray-500">
            {/* Location */}
            {issue.location?.address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{issue.location.address}</span>
              </div>
            )}

            {/* Reporter and Date */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {issue.reportedBy?.name || t('common.anonymous')}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(issue.createdAt)}</span>
              </div>
            </div>

            {/* Comments Count */}
            {issue.commentsCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>
                  {issue.commentsCount} {issue.commentsCount === 1 ? t('common.comment') : t('common.comments')}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="pt-2 border-t border-gray-100">
              <Button 
                asChild 
                className="w-full touch-button text-sm"
                size="sm"
              >
                <Link href={`/issues/${issue._id}`}>
                  {t('issues.viewDetails')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton component for loading states
export function MobileIssueCardSkeleton() {
  return (
    <Card className="mobile-card">
      <CardContent className="p-0">
        {/* Image skeleton */}
        <div className="h-48 xs:h-52 sm:h-48 bg-gray-200 animate-pulse rounded-t-lg" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Badges skeleton */}
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-full" />
            <div className="h-5 w-12 bg-gray-200 animate-pulse rounded-full" />
          </div>
          
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded" />
            <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
          </div>
          
          {/* Meta skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
            <div className="flex justify-between">
              <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-1/4 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
          
          {/* Button skeleton */}
          <div className="pt-2 border-t border-gray-100">
            <div className="h-9 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
