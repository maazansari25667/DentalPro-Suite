'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}: SkeletonProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  );
}

// Preset skeleton components for common use cases
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="space-y-4">
        <Skeleton height="24px" width="60%" />
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="80%" />
        <div className="flex space-x-3 pt-4">
          <Skeleton height="32px" width="80px" rounded="sm" />
          <Skeleton height="32px" width="80px" rounded="sm" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="20px" width="80%" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="16px" width="70%" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <Skeleton className={sizes[size]} rounded="full" />
  );
}

export function SkeletonText({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          height="16px" 
          width={i === lines - 1 ? '75%' : '100%'} 
        />
      ))}
    </div>
  );
}

export function SkeletonQueueCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <SkeletonAvatar size="sm" />
          <div>
            <Skeleton height="18px" width="120px" />
            <Skeleton height="14px" width="80px" className="mt-1" />
          </div>
        </div>
        <Skeleton height="20px" width="60px" rounded="sm" />
      </div>
      
      <div className="space-y-2">
        <Skeleton height="14px" width="100%" />
        <div className="flex justify-between items-center">
          <Skeleton height="12px" width="60px" />
          <Skeleton height="12px" width="40px" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRoomMatrix({ rows = 8, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="grid border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900" style={{ gridTemplateColumns: `repeat(${columns + 1}, 1fr)` }}>
        <div className="p-4">
          <Skeleton height="16px" width="40px" />
        </div>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="p-4 text-center">
            <Skeleton height="16px" width="60px" className="mx-auto" />
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: `repeat(${columns + 1}, 1fr)` }}>
          <div className="p-2">
            <Skeleton height="14px" width="35px" />
          </div>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="p-1">
              {Math.random() > 0.7 && (
                <Skeleton height="40px" width="100%" rounded="sm" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}