import React from 'react';

const statusConfig = {
  PENDING: {
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  PROCESSING: {
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Processing',
  },
  SHIPPED: {
    bg: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
    label: 'Shipped',
  },
  DELIVERED: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Delivered',
  },
  CANCELLED: {
    bg: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    label: 'Cancelled',
  },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};
