"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function UserAvatar({ 
  user, 
  className, 
  size = "default",
  showBorder = false 
}) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12"
  };

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        showBorder && "ring-2 ring-white shadow-lg",
        className
      )}
    >
      {user?.image && (
        <AvatarImage 
          src={user.image} 
          alt={user?.name || 'User avatar'}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
}
