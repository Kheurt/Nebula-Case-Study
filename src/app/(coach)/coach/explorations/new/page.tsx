import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCoachProgramOptions } from '@/features/explorations/actions/get-coach-program-options';
import { ExplorationForm } from '@/features/explorations/components/ExplorationForm';
import { PageShell } from '@/components/layout/PageShell';

export default async function NewExplorationPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'coach') redirect('/');

  const result = await getCoachProgramOptions();
  const programOptions = result.success ? result.data : [];

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Exploration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create an exploration exercise and link it to one of your programs or sessions.
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <ExplorationForm programOptions={programOptions} />
      </div>
    </PageShell>
  );
}
