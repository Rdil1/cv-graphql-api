import { PrismaClient } from '@prisma/client';
import { buildProfileSeed } from './seed-data';

const SEED_LOCK_ID = 20251121;

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const data = buildProfileSeed(process.env);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${SEED_LOCK_ID})`;
      await tx.profile.deleteMany({ where: { slug: data.slug } });
      await tx.profile.create({ data });
    });
    console.log(`[seed] profile "${data.slug}" is up to date`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('[seed] failed', error);
  process.exit(1);
});
