export interface DashboardStats {
  totalPrograms: number;
  publishedPrograms: number;
  activeCohorts: number;
  totalEnrollments: number;
  totalStudents: number;
  totalCoaches: number;
  upcomingSessions: number;
  latestEnrollments: {
    id: string;
    studentName: string;
    programTitle: string;
    enrolledAt: Date;
  }[];
}

export type CohortPeriod = 'UPCOMING' | 'ACTIVE' | 'PAST';

export interface CohortRow {
  id: string;
  programTitle: string;
  coachName: string;
  startDate: Date;
  endDate: Date;
  enrollmentStatus: string;
  participantCount: number;
  period: CohortPeriod;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  profileName: string;
  createdAt: Date;
}

export function classifyPeriod(startDate: Date, endDate: Date): CohortPeriod {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (endDate < today) return 'PAST';
  if (startDate > today) return 'UPCOMING';
  return 'ACTIVE';
}
