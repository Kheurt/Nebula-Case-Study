import { CohortRow } from '@/features/admin/services/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateRange } from '@/lib/date-format';
import Link from 'next/link';

interface Props {
  cohorts: CohortRow[];
}

const periodColors: Record<string, 'blue' | 'green' | 'gray'> = {
  UPCOMING: 'blue',
  ACTIVE: 'green',
  PAST: 'gray',
};

const statusColors: Record<string, 'green' | 'gray' | 'yellow'> = {
  OPEN: 'green',
  FULL: 'gray',
  CLOSED: 'yellow',
};

export function CohortTable({ cohorts }: Props) {
  if (cohorts.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No cohorts found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Program</th>
            <th className="py-2 pr-4 font-medium">Coach</th>
            <th className="py-2 pr-4 font-medium">Dates</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Period</th>
            <th className="py-2 font-medium">Participants</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {cohorts.map((c) => (
            <tr key={c.id}>
              <td className="py-2 pr-4">
                <Link href={`/coach/cohorts/${c.id}`} className="text-blue-600 hover:underline">
                  {c.programTitle}
                </Link>
              </td>
              <td className="py-2 pr-4 text-gray-700">{c.coachName}</td>
              <td className="py-2 pr-4 text-gray-500">
                {formatDateRange(c.startDate, c.endDate)}
              </td>
              <td className="py-2 pr-4">
                <Badge variant={statusColors[c.enrollmentStatus] ?? 'default'}>
                  {c.enrollmentStatus}
                </Badge>
              </td>
              <td className="py-2 pr-4">
                <Badge variant={periodColors[c.period] ?? 'default'}>{c.period}</Badge>
              </td>
              <td className="py-2">{c.participantCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
