import { Session } from 'next-auth';
import { logger } from './logger';

export function hasPermission(session: Session | null, action: string): boolean {
  return session?.user?.permissions?.includes(action) ?? false;
}

export function requirePermission(session: Session | null, action: string): void {
  if (!hasPermission(session, action)) {
    logger.warn('Permission denied', { action, userId: session?.user?.id });
    throw new Error(`PERMISSION_DENIED:${action}`);
  }
}
