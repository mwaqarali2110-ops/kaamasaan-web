'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/ui/SafeImage.tsx.
 *
 * Product images come from Supabase Storage and are frequently missing or
 * broken, so a fallback is essential. `unoptimized` is set because the source
 * URLs carry a `?v=<updated_at>` cache-buster (see next.config.ts) and the
 * catalog is small enough that Next's optimizer adds little.
 */
export const SafeImage = ({
  src,
  alt,
  fallback,
  className,
  sizes,
  priority
}: {
  src?: string | null;
  alt: string;
  fallback?: ReactNode;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        {fallback ?? <span className="text-xs font-extrabold text-kaam-muted">{alt}</span>}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes ?? '(max-width: 768px) 50vw, 300px'}
      className={cn('object-contain', className)}
      onError={() => setFailed(true)}
    />
  );
};
