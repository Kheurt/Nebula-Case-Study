import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE_STUDENT = path.join(__dirname, '.auth/student.json');
export const STORAGE_STATE_COACH = path.join(__dirname, '.auth/coach.json');
export const STORAGE_STATE_ADMIN = path.join(__dirname, '.auth/admin.json');

async function saveAuthState(
  context: Awaited<ReturnType<(typeof chromium)['launchPersistentContext']>>,
  storePath: string,
) {
  await context.storageState({ path: storePath });
}

async function globalSetup(_config: FullConfig) {
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

  const browser = await chromium.launch();

  // Authenticate as student
  const studentCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();
  await studentPage.goto(`${baseURL}/api/auth/signin`);
  await studentPage.fill('input[name="email"]', 'student@nebula.io');
  await studentPage.fill('input[name="password"]', 'devpassword123!');
  await studentPage.click('button[type="submit"]');
  await studentPage.waitForURL(`${baseURL}/**`, { timeout: 10_000 }).catch(() => null);
  await saveAuthState(studentCtx as never, STORAGE_STATE_STUDENT);
  await studentCtx.close();

  // Authenticate as coach
  const coachCtx = await browser.newContext();
  const coachPage = await coachCtx.newPage();
  await coachPage.goto(`${baseURL}/api/auth/signin`);
  await coachPage.fill('input[name="email"]', 'coach@nebula.io');
  await coachPage.fill('input[name="password"]', 'devpassword123!');
  await coachPage.click('button[type="submit"]');
  await coachPage.waitForURL(`${baseURL}/**`, { timeout: 10_000 }).catch(() => null);
  await saveAuthState(coachCtx as never, STORAGE_STATE_COACH);
  await coachCtx.close();

  // Authenticate as admin
  const adminCtx = await browser.newContext();
  const adminPage = await adminCtx.newPage();
  await adminPage.goto(`${baseURL}/api/auth/signin`);
  await adminPage.fill('input[name="email"]', 'admin@nebula.io');
  await adminPage.fill('input[name="password"]', 'devpassword123!');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForURL(`${baseURL}/**`, { timeout: 10_000 }).catch(() => null);
  await saveAuthState(adminCtx as never, STORAGE_STATE_ADMIN);
  await adminCtx.close();

  await browser.close();
  console.log('[E2E] Auth storage states saved for student, coach, admin');
}

export default globalSetup;
