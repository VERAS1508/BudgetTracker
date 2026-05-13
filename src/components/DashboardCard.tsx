import { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DashboardCard({
  title,
  description,
  icon,
  action,
  children,
  className = ''
}: Props) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground text-base">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
