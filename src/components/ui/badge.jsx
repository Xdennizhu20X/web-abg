import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/80',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80',
  destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/80',
  outline: 'text-gray-950 border border-gray-200',
  success: 'bg-green-500 text-gray-50 hover:bg-green-500/80',
  warning: 'bg-yellow-500 text-gray-50 hover:bg-yellow-500/80',
  info: 'bg-blue-500 text-gray-50 hover:bg-blue-500/80',
};

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };