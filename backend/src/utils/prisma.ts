/**
 * Database client - PostgreSQL with Prisma ORM
 */

import { prisma as dbClient } from '../lib/prisma';

// Export the Prisma database client
export const prisma = dbClient;
