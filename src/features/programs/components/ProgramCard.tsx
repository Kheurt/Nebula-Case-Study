import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficultyLevel: string;
  sessionCount: number;
  coachName: string;
  openCohortCount: number;
}

const domainColors: Record<string, 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray'> = {
  FINANCE: 'green',
  CONSULTING: 'blue',
  DATA: 'purple',
  PRODUCT: 'yellow',
  SOFTWARE: 'gray',
  MARKETING: 'red',
  ENTREPRENEURSHIP: 'blue',
};

const difficultyColors: Record<string, 'green' | 'yellow' | 'red'> = {
  BEGINNER: 'green',
  INTERMEDIATE: 'yellow',
  ADVANCED: 'red',
};

const DOMAIN_GRADIENTS: Record<string, string> = {
  FINANCE: 'from-emerald-500 to-teal-600',
  CONSULTING: 'from-blue-500 to-cyan-600',
  DATA: 'from-violet-500 to-purple-600',
  PRODUCT: 'from-amber-500 to-orange-600',
  SOFTWARE: 'from-slate-600 to-gray-800',
  MARKETING: 'from-rose-500 to-pink-600',
  ENTREPRENEURSHIP: 'from-indigo-500 to-blue-600',
};

const DOMAIN_ICONS: Record<string, string> = {
  FINANCE: '💹',
  CONSULTING: '🤝',
  DATA: '📊',
  PRODUCT: '🎯',
  SOFTWARE: '💻',
  MARKETING: '📣',
  ENTREPRENEURSHIP: '🚀',
};

export function ProgramCard({
  id,
  title,
  description,
  domain,
  difficultyLevel,
  sessionCount,
  coachName,
  openCohortCount,
}: ProgramCardProps) {
  return (
    <Link href={`/programs/${id}`} className="group block">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Gradient image header */}
        <div className={`relative h-40 bg-gradient-to-br ${DOMAIN_GRADIENTS[domain] ?? 'from-gray-400 to-gray-600'} flex items-center justify-center overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <span className="relative text-5xl group-hover:scale-110 transition-transform duration-300">
            {DOMAIN_ICONS[domain] ?? '📚'}
          </span>
          {/* Cohort badge */}
          {openCohortCount > 0 && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
              {openCohortCount} open cohort{openCohortCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge variant={domainColors[domain] ?? 'default'}>{domain}</Badge>
            <Badge variant={difficultyColors[difficultyLevel] ?? 'default'}>{difficultyLevel}</Badge>
          </div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{description}</p>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                {coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <span className="text-xs text-gray-600 font-medium">{coachName}</span>
            </div>
            <span className="text-xs text-gray-400">{sessionCount} sessions</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
