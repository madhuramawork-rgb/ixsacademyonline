const { PrismaClient } = require('@prisma/client');

// A single shared Prisma Client instance for the whole app.
// (Creating a new one per-request would exhaust DB connections.)
const prisma = new PrismaClient();

module.exports = prisma;
