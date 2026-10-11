// MOCKED — in-memory proxy for database compliant with AI Studio migration guidelines
const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: { data?: unknown }) => d?.data ?? {},
  update: async (d: { data?: unknown }) => d?.data ?? {},
  delete: async () => ({}),
  count: async () => 0,
};

export const prisma = new Proxy({}, {
  get: () => new Proxy({}, { get: () => noOp }),
}) as unknown;

export default prisma;
