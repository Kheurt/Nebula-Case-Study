import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
const resolvedUrl = dbUrl.startsWith('file:.')
  ? `file:${path.resolve(process.cwd(), dbUrl.replace('file:', ''))}`
  : dbUrl;
const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ── Permissions ──────────────────────────────────────────────────────────
  const permissionNames = [
    'program:create',
    'program:edit',
    'program:read',
    'cohort:create',
    'cohort:manage',
    'cohort:read',
    'enrollment:create',
    'exploration:create',
    'exploration:read',
    'exploration:submit',
    'admin:read',
    'user:create',
  ];

  const permissionMap: Record<string, string> = {};
  for (const action of permissionNames) {
    const perm = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
    permissionMap[action] = perm.id;
  }

  // ── Profiles ─────────────────────────────────────────────────────────────
  const studentProfile = await prisma.profile.upsert({
    where: { name: 'student' },
    update: {},
    create: { name: 'student' },
  });

  const coachProfile = await prisma.profile.upsert({
    where: { name: 'coach' },
    update: {},
    create: { name: 'coach' },
  });

  const adminProfile = await prisma.profile.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  // ── Profile permissions ───────────────────────────────────────────────────
  const studentPerms = ['enrollment:create', 'exploration:read', 'exploration:submit'];
  const coachPerms = [
    'program:create', 'program:edit', 'program:read',
    'cohort:create', 'cohort:manage', 'cohort:read',
    'exploration:create', 'exploration:read',
  ];
  const adminPerms = ['admin:read', 'user:create'];

  async function linkPerms(profileId: string, actions: string[]) {
    for (const action of actions) {
      await prisma.profilePermission.upsert({
        where: { profileId_permissionId: { profileId, permissionId: permissionMap[action] } },
        update: {},
        create: { profileId, permissionId: permissionMap[action] },
      });
    }
  }

  await linkPerms(studentProfile.id, studentPerms);
  await linkPerms(coachProfile.id, coachPerms);
  await linkPerms(adminProfile.id, adminPerms);

  // ── Seed users ────────────────────────────────────────────────────────────
  const seedPassword = process.env.DEV_SEED_PASSWORD ?? 'devpassword123!';
  const hashedPassword = await bcrypt.hash(seedPassword, 12);

  const seedUsers = [
    { name: 'Alex Student', email: 'student@nebula.dev', profileId: studentProfile.id },
    { name: 'Sam Coach', email: 'coach@nebula.dev', profileId: coachProfile.id },
    { name: 'Dana Admin', email: 'admin@nebula.dev', profileId: adminProfile.id },
  ];

  for (const { name, email, profileId } of seedUsers) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
          userProfile: { create: { profileId } },
        },
      });
      console.log(`Created user: ${email}`);
    }
  }

  // ── Sample seed data (program + cohort + sessions) ───────────────────────
  const coach = await prisma.user.findUnique({ where: { email: 'coach@nebula.dev' } });
  if (!coach) throw new Error('Coach user not found');

  const existingProgram = await prisma.program.findFirst({
    where: { title: 'Finance Fundamentals Immersion' },
  });

  if (!existingProgram) {
    const program = await prisma.program.create({
      data: {
        title: 'Finance Fundamentals Immersion',
        description:
          'A hands-on program designed to give students real-world exposure to core finance concepts through immersive sessions and practical explorations.',
        domain: 'FINANCE',
        targetAudience: 'University students interested in finance careers',
        difficultyLevel: 'BEGINNER',
        sessionCount: 3,
        recommendedCohortSize: 5,
        maxCohortSize: 10,
        learningOutcomes: JSON.stringify([
          'Understand financial statements',
          'Apply DCF valuation basics',
          'Navigate investment banking workflows',
        ]),
        status: 'PUBLISHED',
        coachId: coach.id,
      },
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // starts in 1 week
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 21); // 3-week program

    await prisma.cohort.create({
      data: {
        programId: program.id,
        startDate,
        endDate,
        maxParticipants: 10,
        enrollmentStatus: 'OPEN',
        sessions: {
          create: [
            {
              title: 'Session 1: Financial Statements Deep Dive',
              description: 'Reading and interpreting balance sheets, P&L, and cash flow statements.',
              scheduledAt: new Date(startDate.getTime() + 0),
              durationMinutes: 60,
              orderIndex: 1,
            },
            {
              title: 'Session 2: Valuation Methods',
              description: 'DCF, comps, and precedent transactions — hands-on analysis.',
              scheduledAt: new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000),
              durationMinutes: 60,
              orderIndex: 2,
            },
            {
              title: 'Session 3: Career Panel & Mock Interview',
              description: 'Live Q&A with finance professionals + mock interview practice.',
              scheduledAt: new Date(startDate.getTime() + 20 * 24 * 60 * 60 * 1000),
              durationMinutes: 90,
              orderIndex: 3,
            },
          ],
        },
      },
    });

    console.log('Created sample program with cohort and sessions');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
