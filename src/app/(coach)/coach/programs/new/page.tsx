import { PageShell } from '@/components/layout/PageShell';
import { ProgramForm } from '@/features/programs/components/ProgramForm';

export default function NewProgramPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Program</h1>
      <ProgramForm />
    </PageShell>
  );
}
