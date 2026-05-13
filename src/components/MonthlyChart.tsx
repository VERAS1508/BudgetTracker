'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { Expense } from '@/types';

type Props = { expenses: Expense[] };

type ChartEntry = { name: string; amount: number; color: string };

function buildChartData(expenses: Expense[]): ChartEntry[] {
  const map = new Map<string, ChartEntry>();

  for (const e of expenses) {
    const key = e.categories?.name ?? 'Sonstige';
    const color = e.categories?.color ?? '#475569';
    const existing = map.get(key);
    if (existing) {
      existing.amount += Number(e.amount);
    } else {
      map.set(key, { name: key, amount: Number(e.amount), color });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: '#1e293b', color: '#fff' }}>
      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(payload[0].value)}
    </div>
  );
}

export default function MonthlyChart({ expenses }: Props) {
  const data = buildChartData(expenses);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v =>
            new Intl.NumberFormat('de-DE', { notation: 'compact', currency: 'EUR' }).format(v)
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
