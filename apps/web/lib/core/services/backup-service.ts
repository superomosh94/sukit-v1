import { prisma } from '@/lib/db/prisma';

const DEFAULT_RETENTION_DAYS = 30;

export async function enforceBackupRetention(
  siteId: string,
  retentionDays = DEFAULT_RETENTION_DAYS
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const result = await prisma.backup.deleteMany({
    where: {
      siteId,
      createdAt: { lt: cutoff },
    },
  });

  return result.count;
}

export async function getBackupStats(siteId: string) {
  const [totalBackups, totalSize, latest] = await Promise.all([
    prisma.backup.count({ where: { siteId } }),
    prisma.backup.aggregate({
      where: { siteId },
      _sum: { size: true },
    }),
    prisma.backup.findFirst({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    totalBackups,
    totalSize: totalSize._sum.size || 0,
    latestBackup: latest?.createdAt || null,
    latestSize: latest?.size || 0,
  };
}
