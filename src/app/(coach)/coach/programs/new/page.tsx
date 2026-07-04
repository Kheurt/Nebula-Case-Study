import { ProgramForm } from '@/features/programs/components/ProgramForm';

export default function NewProgramPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Program</h1>
        <p className="text-sm text-gray-500 mt-1">Define your immersion program details.</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <ProgramForm />
      </div>
    </div>
  );
}
