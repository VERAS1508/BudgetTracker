import { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
};

export default function StatCard({ label, value, icon, trend, variant = 'default' }: Props) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-chart-1/10 text-chart-1',
    warning: 'bg-chart-3/10 text-chart-3',
    danger: 'bg-destructive/10 text-destructive'
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trend.isPositive ? 'text-chart-1' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value} vs last month
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${variantStyles[variant]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
