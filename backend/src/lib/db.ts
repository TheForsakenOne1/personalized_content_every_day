/**
 * Database client adapter using better-sqlite3
 * This replaces Prisma Client when it cannot be generated
 */

import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

const dbPath = path.join(__dirname, '../../dev.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * User operations
 */
export const user = {
  create: async (data: {
    data: {
      id?: string;
      email: string;
      username: string;
      passwordHash: string;
      fullName?: string;
      emailVerified?: boolean;
    };
    select?: {
      id?: boolean;
      email?: boolean;
      username?: boolean;
      fullName?: boolean;
      avatarUrl?: boolean;
      emailVerified?: boolean;
      createdAt?: boolean;
    };
  }) => {
    const id = data.data.id || randomUUID();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, username, password_hash, full_name, email_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.email,
      data.data.username,
      data.data.passwordHash,
      data.data.fullName || null,
      data.data.emailVerified ? 1 : 0
    );

    const fullUser = await user.findUnique({ where: { id } });

    // Apply select if provided
    if (data.select && fullUser) {
      const selected: any = {};
      for (const key in data.select) {
        if (data.select[key as keyof typeof data.select]) {
          selected[key] = (fullUser as any)[key];
        }
      }
      return selected;
    }

    return fullUser;
  },

  findUnique: async (query: {
    where: { id?: string; email?: string; username?: string };
    select?: { [key: string]: boolean };
  }) => {
    let stmt;
    let value;

    if (query.where.id) {
      stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      value = query.where.id;
    } else if (query.where.email) {
      stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      value = query.where.email;
    } else if (query.where.username) {
      stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      value = query.where.username;
    } else {
      return null;
    }

    const row = stmt.get(value) as any;
    if (!row) return null;

    const fullUser = {
      id: row.id,
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      emailVerified: Boolean(row.email_verified),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
      isActive: Boolean(row.is_active),
    };

    // Apply select if provided
    if (query.select) {
      const selected: any = {};
      for (const key in query.select) {
        if (query.select[key]) {
          selected[key] = (fullUser as any)[key];
        }
      }
      return selected;
    }

    return fullUser;
  },

  findFirst: async (query: { where: { OR?: Array<{ email?: string; username?: string }> } }) => {
    if (!query.where.OR) return null;

    const conditions: string[] = [];
    const values: string[] = [];

    query.where.OR.forEach(condition => {
      if (condition.email) {
        conditions.push('email = ?');
        values.push(condition.email);
      }
      if (condition.username) {
        conditions.push('username = ?');
        values.push(condition.username);
      }
    });

    const stmt = db.prepare(`SELECT * FROM users WHERE ${conditions.join(' OR ')} LIMIT 1`);
    const row = stmt.get(...values) as any;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      emailVerified: Boolean(row.email_verified),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
      isActive: Boolean(row.is_active),
    };
  },

  update: async (query: {
    where: { id: string };
    data: {
      lastLoginAt?: Date;
      emailVerified?: boolean;
      passwordHash?: string;
    };
  }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (query.data.lastLoginAt !== undefined) {
      updates.push('last_login_at = ?');
      values.push(query.data.lastLoginAt.toISOString());
    }
    if (query.data.emailVerified !== undefined) {
      updates.push('email_verified = ?');
      values.push(query.data.emailVerified ? 1 : 0);
    }
    if (query.data.passwordHash !== undefined) {
      updates.push('password_hash = ?');
      values.push(query.data.passwordHash);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(query.where.id);

    const stmt = db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return user.findUnique({ where: { id: query.where.id } });
  },
};

/**
 * User Preferences operations
 */
export const userPreferences = {
  create: async (data: {
    data: {
      userId: string;
      contentFrequency?: string;
      notificationEnabled?: boolean;
      emailDigest?: boolean;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO user_preferences (id, user_id, content_frequency, notification_enabled, email_digest)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.contentFrequency || 'daily',
      data.data.notificationEnabled !== false ? 1 : 0,
      data.data.emailDigest !== false ? 1 : 0
    );

    return { id, ...data.data };
  },
};

/**
 * Refresh Token operations
 */
export const refreshToken = {
  create: async (data: {
    data: {
      id?: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    };
  }) => {
    const id = data.data.id || randomUUID();
    const stmt = db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.tokenHash,
      data.data.expiresAt.toISOString()
    );

    return { id, ...data.data };
  },

  findFirst: async (query: {
    where: {
      id?: string;
      tokenHash?: string;
      revokedAt?: null;
      expiresAt?: { gt: Date };
    };
    include?: {
      user: boolean;
    };
  }) => {
    const conditions: string[] = [];
    const values: any[] = [];

    if (query.where.id) {
      conditions.push('rt.id = ?');
      values.push(query.where.id);
    }

    if (query.where.tokenHash) {
      conditions.push('rt.token_hash = ?');
      values.push(query.where.tokenHash);
    }

    if (query.where.revokedAt === null) {
      conditions.push('rt.revoked_at IS NULL');
    }

    if (query.where.expiresAt?.gt) {
      conditions.push('rt.expires_at > ?');
      values.push(query.where.expiresAt.gt.toISOString());
    }

    let sql = 'SELECT rt.*';
    if (query.include?.user) {
      sql += ', u.*';
    }
    sql += ' FROM refresh_tokens rt';
    if (query.include?.user) {
      sql += ' LEFT JOIN users u ON rt.user_id = u.id';
    }
    sql += ` WHERE ${conditions.join(' AND ')} LIMIT 1`;

    const stmt = db.prepare(sql);
    const row = stmt.get(...values) as any;

    if (!row) return null;

    const result: any = {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    };

    if (query.include?.user && row.email) {
      result.user = {
        id: row.user_id,
        email: row.email,
        username: row.username,
        passwordHash: row.password_hash,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        emailVerified: Boolean(row.email_verified),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
        isActive: Boolean(row.is_active),
      };
    }

    return result;
  },

  update: async (query: {
    where: { id: string };
    data: { revokedAt: Date };
  }) => {
    const stmt = db.prepare(`
      UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?
    `);

    stmt.run(query.data.revokedAt.toISOString(), query.where.id);

    return { id: query.where.id, revokedAt: query.data.revokedAt };
  },

  updateMany: async (query: {
    where: {
      id?: string;
      userId?: string;
      revokedAt?: null;
    };
    data: {
      revokedAt: Date;
    };
  }) => {
    const conditions: string[] = [];
    const values: any[] = [query.data.revokedAt.toISOString()];

    if (query.where.id) {
      conditions.push('id = ?');
      values.push(query.where.id);
    }

    if (query.where.userId) {
      conditions.push('user_id = ?');
      values.push(query.where.userId);
    }

    if (query.where.revokedAt === null) {
      conditions.push('revoked_at IS NULL');
    }

    const stmt = db.prepare(`
      UPDATE refresh_tokens SET revoked_at = ? WHERE ${conditions.join(' AND ')}
    `);

    const result = stmt.run(...values);
    return { count: result.changes };
  },

  deleteMany: async (query: { where: { userId: string } }) => {
    const stmt = db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?');
    const result = stmt.run(query.where.userId);
    return { count: result.changes };
  },
};

/**
 * Category operations
 */
export const category = {
  findMany: async () => {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      icon: row.icon,
      isDefault: Boolean(row.is_default),
      createdAt: new Date(row.created_at),
    }));
  },

  findUnique: async (query: { where: { id: string } }) => {
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
    const row = stmt.get(query.where.id) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      icon: row.icon,
      isDefault: Boolean(row.is_default),
      createdAt: new Date(row.created_at),
    };
  },
};

/**
 * User Category operations
 */
export const userCategory = {
  createMany: async (data: {
    data: Array<{
      userId: string;
      categoryId: string;
      priority: number;
      isActive: boolean;
    }>;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO user_categories (id, user_id, category_id, priority, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        stmt.run(
          randomUUID(),
          item.userId,
          item.categoryId,
          item.priority,
          item.isActive ? 1 : 0
        );
      }
    });

    insertMany(data.data);

    return { count: data.data.length };
  },

  findMany: async (query: {
    where: { userId: string };
    include?: { category: boolean };
  }) => {
    let sql = 'SELECT uc.*, c.* FROM user_categories uc';

    if (query.include?.category) {
      sql += ' LEFT JOIN categories c ON uc.category_id = c.id';
    }

    sql += ' WHERE uc.user_id = ?';

    const stmt = db.prepare(sql);
    const rows = stmt.all(query.where.userId) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      priority: row.priority,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      ...(query.include?.category && {
        category: {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          icon: row.icon,
        },
      }),
    }));
  },

  updateMany: async (query: {
    where: { userId: string; categoryId: string };
    data: { priority?: number; isActive?: boolean };
  }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (query.data.priority !== undefined) {
      updates.push('priority = ?');
      values.push(query.data.priority);
    }
    if (query.data.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(query.data.isActive ? 1 : 0);
    }

    values.push(query.where.userId);
    values.push(query.where.categoryId);

    const stmt = db.prepare(`
      UPDATE user_categories SET ${updates.join(', ')}
      WHERE user_id = ? AND category_id = ?
    `);

    const result = stmt.run(...values);
    return { count: result.changes };
  },
};

/**
 * Password Reset Token operations
 */
export const passwordResetToken = {
  create: async (data: {
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.tokenHash,
      data.data.expiresAt.toISOString()
    );

    return { id, ...data.data };
  },

  findFirst: async (query: {
    where: {
      tokenHash: string;
      usedAt: null;
      expiresAt: { gt: Date };
    };
    include?: { user: boolean };
  }) => {
    let sql = 'SELECT prt.*';
    if (query.include?.user) {
      sql += ', u.*';
    }
    sql += ' FROM password_reset_tokens prt';
    if (query.include?.user) {
      sql += ' LEFT JOIN users u ON prt.user_id = u.id';
    }
    sql += ' WHERE prt.token_hash = ? AND prt.used_at IS NULL AND prt.expires_at > ? LIMIT 1';

    const stmt = db.prepare(sql);
    const row = stmt.get(
      query.where.tokenHash,
      query.where.expiresAt.gt.toISOString()
    ) as any;

    if (!row) return null;

    const result: any = {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
    };

    if (query.include?.user && row.email) {
      result.user = {
        id: row.user_id,
        email: row.email,
        username: row.username,
        passwordHash: row.password_hash,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        emailVerified: Boolean(row.email_verified),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
        isActive: Boolean(row.is_active),
      };
    }

    return result;
  },

  update: async (query: {
    where: { id: string };
    data: { usedAt: Date };
  }) => {
    const stmt = db.prepare(`
      UPDATE password_reset_tokens SET used_at = ? WHERE id = ?
    `);

    stmt.run(query.data.usedAt.toISOString(), query.where.id);

    return { id: query.where.id, usedAt: query.data.usedAt };
  },
};

/**
 * Email Verification Token operations
 */
export const emailVerificationToken = {
  create: async (data: {
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.tokenHash,
      data.data.expiresAt.toISOString()
    );

    return { id, ...data.data };
  },

  findFirst: async (query: {
    where: {
      tokenHash: string;
      usedAt: null;
      expiresAt: { gt: Date };
    };
    include?: { user: boolean };
  }) => {
    let sql = 'SELECT evt.*';
    if (query.include?.user) {
      sql += ', u.*';
    }
    sql += ' FROM email_verification_tokens evt';
    if (query.include?.user) {
      sql += ' LEFT JOIN users u ON evt.user_id = u.id';
    }
    sql += ' WHERE evt.token_hash = ? AND evt.used_at IS NULL AND evt.expires_at > ? LIMIT 1';

    const stmt = db.prepare(sql);
    const row = stmt.get(
      query.where.tokenHash,
      query.where.expiresAt.gt.toISOString()
    ) as any;

    if (!row) return null;

    const result: any = {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      usedAt: row.used_at ? new Date(row.used_at) : null,
    };

    if (query.include?.user && row.email) {
      result.user = {
        id: row.user_id,
        email: row.email,
        username: row.username,
        passwordHash: row.password_hash,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        emailVerified: Boolean(row.email_verified),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : null,
        isActive: Boolean(row.is_active),
      };
    }

    return result;
  },

  update: async (query: {
    where: { id: string };
    data: { usedAt: Date };
  }) => {
    const stmt = db.prepare(`
      UPDATE email_verification_tokens SET used_at = ? WHERE id = ?
    `);

    stmt.run(query.data.usedAt.toISOString(), query.where.id);

    return { id: query.where.id, usedAt: query.data.usedAt };
  },
};

/**
 * Transaction support
 */
const $transaction = async (operations: any[]) => {
  const transaction = db.transaction(() => {
    const results: any[] = [];
    for (const op of operations) {
      results.push(op);
    }
    return results;
  });

  return transaction();
};

// Export a prisma-like client
export const prisma = {
  user,
  userPreferences,
  refreshToken,
  passwordResetToken,
  emailVerificationToken,
  category,
  userCategory,
  $transaction,
};

export default prisma;
