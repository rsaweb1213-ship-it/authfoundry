import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

function Avatar({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  const [imageError, setImageError] = React.useState(false);

  const initials = fallback
    ? fallback.charAt(0).toUpperCase()
    : alt
    ? alt.charAt(0).toUpperCase()
    : "?";

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {initials}
        </div>
      )}
    </div>
  );
}

export { Avatar };