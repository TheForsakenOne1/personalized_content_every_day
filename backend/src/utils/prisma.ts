/**
 * Database client - using custom SQLite adapter
 * This replaces Prisma Client since we couldn't generate it due to network restrictions
 */

import { prisma as dbClient } from '../lib/db';

// Export the custom database client
export const prisma = dbClient;
