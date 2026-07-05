import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachPrograms } from '@/features/programs/actions/get-coach-programs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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

export default async function CoachProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const result = await getCoachPrograms();
  const programs = result.success ? result.data : [];

  const statusStyles: Record<string, string> = {
    DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
    PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Programs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your immersion programs and cohorts.</p>
        </div>
        <Link href="/coach/programs/new">
          <Button>
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Program
          </Button>
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-1">No programs yet</p>
          <p className="text-sm text-gray-500 mb-4">Create your first immersion program to get started.</p>
          <Link href="/coach/programs/new">
            <Button size="sm">Create your first program →</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((p) => (
            <Link key={p.id} href={`/coach/programs/${p.id}`} className="group block">
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex">
                  {/* Mini gradient sidebar */}
                  <div className={`w-2 bg-gradient-to-b ${DOMAIN_GRADIENTS[p.domain] ?? 'from-gray-400 to-gray-600'}`} />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${DOMAIN_GRADIENTS[p.domain] ?? 'from-gray-400 to-gray-600'} flex items-center justify-center shadow-sm`}>
                          <span className="text-lg">{DOMAIN_ICONS[p.domain] ?? '📚'}</span>
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</h2>
                          <p className="text-xs text-gray-500">{p.sessionCount} sessions · {p.openCohortCount} open cohort(s)</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusStyles[p.domain] ?? statusStyles.DRAFT}`}>
                        {p.domain}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="blue">{p.domain}</Badge>
                      </div>
                      <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
