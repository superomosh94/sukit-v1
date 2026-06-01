import { prisma } from './db';

export async function createForm(
  siteId: string,
  data: { name: string; fields: any[]; settings?: any }
) {
  return prisma.form.create({ data: { siteId, ...data } });
}

export async function listForms(siteId: string) {
  return prisma.form.findMany({
    where: { siteId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { submissions: true } } },
  });
}

export async function getForm(id: string) {
  return prisma.form.findUnique({ where: { id }, include: { fields: true } });
}

export async function updateForm(id: string, data: any) {
  return prisma.form.update({ where: { id }, data });
}

export async function deleteForm(id: string) {
  await prisma.form.delete({ where: { id } });
}

export async function submitForm(
  formId: string,
  data: Record<string, any>,
  userId?: string
) {
  return prisma.formSubmission.create({
    data: {
      formId,
      data,
      submittedById: userId,
    },
  });
}

export async function listSubmissions(formId: string, page = 1, limit = 50) {
  const [items, total] = await Promise.all([
    prisma.formSubmission.findMany({
      where: { formId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.formSubmission.count({ where: { formId } }),
  ]);
  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getSubmission(id: string) {
  return prisma.formSubmission.findUnique({ where: { id } });
}

export async function deleteSubmission(id: string) {
  await prisma.formSubmission.delete({ where: { id } });
}

export async function exportSubmissions(
  formId: string,
  format: 'csv' | 'json' = 'json'
) {
  const submissions = await prisma.formSubmission.findMany({
    where: { formId },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const form = await prisma.form.findUnique({ where: { id: formId } });
    const fields = (form?.fields as any[]) || [];
    const headers = ['id', 'createdAt', ...fields.map((f: any) => f.name)];
    const rows = submissions.map(
      (s: { id: string; createdAt: Date; data: unknown }) => {
        const data = s.data as Record<string, any>;
        return [
          s.id,
          s.createdAt.toISOString(),
          ...fields.map((f: any) => data[f.name] || ''),
        ];
      }
    );
    return [headers, ...rows].map((r) => r.join(',')).join('\n');
  }

  return submissions;
}
