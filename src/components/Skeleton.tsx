
import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`bg-slate-200 dark:bg-slate-700/80 rounded-md animate-pulse-fast ${className}`} />
    );
};

export const SkeletonCard: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft dark:shadow-soft-dark p-5 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
    </div>
);

export const SkeletonList: React.FC<{ count?: number, className?: string }> = ({ count = 3, className }) => (
    <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft dark:shadow-soft-dark p-4 flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);


export default Skeleton;