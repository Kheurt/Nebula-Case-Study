import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant={domainColors[domain] ?? 'default'}>{domain}</Badge>
        <Badge variant={difficultyColors[difficultyLevel] ?? 'default'}>{difficultyLevel}</Badge>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>Coach: {coachName}</span>
        <span>{sessionCount} sessions</span>
        <span>{openCohortCount > 0 ? `${openCohortCount} open cohort(s)` : 'No open cohorts'}</span>
      </div>
      <Link href={`/programs/${id}`}>
        <Button variant="secondary" size="sm" className="w-full">
          View Program →
        </Button>
      </Link>
    </Card>
  );
}
