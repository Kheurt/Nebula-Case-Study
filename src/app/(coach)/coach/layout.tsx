import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="coach">{children}</DashboardLayout>;
}
