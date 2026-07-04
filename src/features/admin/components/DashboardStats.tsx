import { DashboardStats } from '@/features/admin/services/types';
import { Card } from '@/components/ui/Card';

interface Props {
  stats: DashboardStats;
}

export function DashboardStatsGrid({ stats }: Props) {
  const metrics = [
    { label: 'Total Programs', value: stats.totalPrograms },
    { label: 'Published Programs', value: stats.publishedPrograms },
    { label: 'Active Cohorts', value: stats.activeCohorts },
    { label: 'Total Enrollments', value: stats.totalEnrollments },
    { label: 'Total Students', value: stats.totalStudents },
    { label: 'Total Coaches', value: stats.totalCoaches },
    { label: 'Upcoming Sessions', value: stats.upcomingSessions },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="text-center py-4">
            <p className="text-3xl font-bold text-blue-600">{m.value}</p>
            <p className="text-sm text-gray-500 mt-1">{m.label}</p>
          </Card>
        ))}
      </div>

      {stats.latestEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Enrollments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Program</th>
                  <th className="py-2 font-medium">Enrolled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.latestEnrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 pr-4">{e.studentName}</td>
                    <td className="py-2 pr-4">{e.programTitle}</td>
                    <td className="py-2 text-gray-500">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
