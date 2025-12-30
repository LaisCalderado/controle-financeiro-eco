import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  trendValue?: string;
  variant?: 'default' | 'success' | 'danger' | 'primary';
}

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export default function StatCard({ title, value, icon: Icon, trend, trendValue, variant = 'default' }: StatCardProps) {
  const variants: Record<string, string> = {
    default: 'bg-white border-slate-200',
    success: 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
    danger: 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200',
    primary: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
  };

  const iconVariants: Record<string, string> = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-600',
    danger: 'bg-rose-100 text-rose-600',
    primary: 'bg-blue-100 text-blue-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow',
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
          {trend && trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            )}>
              <span>{trend === 'up' ? '↑' : '↓'} {trendValue}</span>
              <span className="text-slate-400">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconVariants[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
    </motion.div>
  );
}