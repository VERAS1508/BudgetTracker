'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';

type ChartEntry = { name: string; amount: number; color: string };

type Props = {
  data: ChartEntry[];
  formatValue?: (value: number) => string;
};

function CustomTooltip({
  active,
  payload,
  label,
  formatValue
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartEntry }>;
  label?: string;
  formatValue?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {formatValue ? formatValue(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
}

export default function ExpenseBarChart({ data, formatValue }: Props) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 8 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat('de-DE', { notation: 'compact' }).format(v)
          }
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
        />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
