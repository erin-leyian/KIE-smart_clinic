import React from 'react';

/**
 * Skeleton Loader Component
 * Use for showing loading states with smooth animations
 */
export function Skeleton({ className = '', count = 1, circle = false }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 animate-pulse rounded ${circle ? 'rounded-full' : ''} ${className}`}
        />
      ))}
    </>
  );
}

/**
 * Doctor Card Skeleton
 */
export function DoctorCardSkeleton() {
  return (
    <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-16 h-16" circle={true} />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex space-x-2 mt-4">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

/**
 * Appointment Card Skeleton
 */
export function AppointmentCardSkeleton() {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="w-20 h-8" />
      </div>
    </div>
  );
}

/**
 * Patient Record Skeleton
 */
export function RecordCardSkeleton() {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center">
        <div className="text-center px-6 border-r border-gray-100">
          <Skeleton className="h-3 w-12 mb-2" />
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="flex-1 px-8">
          <Skeleton className="h-3 w-1/3 mb-2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  );
}

/**
 * Dashboard Banner Skeleton
 */
export function BannerSkeleton() {
  return (
    <div className="relative bg-gray-200 rounded-2xl overflow-hidden p-8 h-[240px] animate-pulse" />
  );
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizes[size]} border-gray-300 border-t-teal-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-gray-500 text-sm font-medium">{text}</p>
      )}
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon: Icon,
  title = 'No data available',
  description = 'Please try again later',
  action = null
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <Icon className="w-16 h-16 text-gray-300 mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Page Loading Skeleton (full page)
 */
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <BannerSkeleton />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <RecordCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
