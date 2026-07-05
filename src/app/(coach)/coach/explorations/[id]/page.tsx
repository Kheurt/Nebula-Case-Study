import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExplorationDetail } from '@/features/explorations/actions/get-exploration-detail';
import { FeedbackForm } from '@/features/explorations/components/FeedbackForm';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/date-format';
import Link from 'next/link';

export default async function CoachExplorationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.profileName !== 'coach') redirect('/');

  const { id } = await params;
  const result = await getExplorationDetail(id);

  if (!result.success) {
    if (result.code === 'NOT_FOUND' || result.code === 'FORBIDDEN') notFound();
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-red-700 text-sm">{result.error}</p>
      </div>
    );
  }

  const exploration = result.data;
  const reviewedCount = exploration.submissions.filter((s) => s.coachFeedback).length;
  const pendingCount = exploration.submissions.length - reviewedCount;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/coach/explorations"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Explorations
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{exploration.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{exploration.description}</p>
        <div className="flex items-center gap-3 mt-3">
          {exploration.programTitle && <Badge variant="blue">Program: {exploration.programTitle}</Badge>}
          {exploration.sessionTitle && <Badge variant="default">Session: {exploration.sessionTitle}</Badge>}
          {exploration.dueDate && (
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              Due: {formatDate(exploration.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{exploration.submissions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Submissions</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{reviewedCount}</p>
          <p className="text-xs text-green-600 mt-1">Reviewed</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-1">Pending Review</p>
        </div>
      </div>

      {/* Submissions */}
      {exploration.submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No submissions yet.</p>
          <p className="text-xs text-gray-400 mt-1">Students will appear here once they submit their responses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Student Submissions</h2>
          {exploration.submissions.map((sub) => (
            <div
              key={sub.id}
              className={`rounded-xl border bg-white shadow-sm overflow-hidden ${
                sub.coachFeedback ? 'border-green-200' : 'border-amber-200'
              }`}
            >
              {/* Student header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {sub.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.studentName}</p>
                    <p className="text-xs text-gray-400">{sub.studentEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{formatDate(sub.createdAt)}</span>
                  <Badge variant={sub.coachFeedback ? 'green' : 'yellow'}>
                    {sub.coachFeedback ? 'Reviewed' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Student response */}
              <div className="px-5 py-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Student Response</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                  {sub.responseText}
                </p>
              </div>

              {/* Feedback section */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Coach Feedback</h3>
                <FeedbackForm submissionId={sub.id} existingFeedback={sub.coachFeedback} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
