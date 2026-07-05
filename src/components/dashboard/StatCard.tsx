interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: string; positive: boolean };
  color?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend.positive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            <svg
              className={`h-3 w-3 ${trend.positive ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
