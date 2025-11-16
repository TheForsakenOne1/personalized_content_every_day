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

  findFirst: async (query: {
    where: {
      OR?: Array<{ email?: string; username?: string }>;
      email?: string;
      username?: string;
      NOT?: { id: string };
    };
  }) => {
    const conditions: string[] = [];
    const values: any[] = [];

    if (query.where.OR) {
      const orConditions: string[] = [];
      query.where.OR.forEach(condition => {
        if (condition.email) {
          orConditions.push('email = ?');
          values.push(condition.email);
        }
        if (condition.username) {
          orConditions.push('username = ?');
          values.push(condition.username);
        }
      });
      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
    }

    if (query.where.email) {
      conditions.push('email = ?');
      values.push(query.where.email);
    }

    if (query.where.username) {
      conditions.push('username = ?');
      values.push(query.where.username);
    }

    if (query.where.NOT?.id) {
      conditions.push('id != ?');
      values.push(query.where.NOT.id);
    }

    if (conditions.length === 0) {
      return null;
    }

    const stmt = db.prepare(`SELECT * FROM users WHERE ${conditions.join(' AND ')} LIMIT 1`);
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
      fullName?: string;
      avatarUrl?: string;
      email?: string;
      username?: string;
    };
    select?: { [key: string]: boolean };
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
    if (query.data.fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(query.data.fullName);
    }
    if (query.data.avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(query.data.avatarUrl);
    }
    if (query.data.email !== undefined) {
      updates.push('email = ?');
      values.push(query.data.email);
    }
    if (query.data.username !== undefined) {
      updates.push('username = ?');
      values.push(query.data.username);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(query.where.id);

    const stmt = db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return user.findUnique({ where: { id: query.where.id }, select: query.select });
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
      preferredContentTypes?: string[];
      notificationEnabled?: boolean;
      emailDigest?: boolean;
      theme?: string;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO user_preferences (id, user_id, content_frequency, preferred_content_types, notification_enabled, email_digest, theme)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.contentFrequency || 'daily',
      data.data.preferredContentTypes ? JSON.stringify(data.data.preferredContentTypes) : '["video", "article", "paper", "blog"]',
      data.data.notificationEnabled !== false ? 1 : 0,
      data.data.emailDigest !== false ? 1 : 0,
      data.data.theme || 'light'
    );

    return userPreferences.findUnique({ where: { userId: data.data.userId } });
  },

  findUnique: async (query: { where: { userId: string } }) => {
    const stmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?');
    const row = stmt.get(query.where.userId) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      contentFrequency: row.content_frequency,
      preferredContentTypes: row.preferred_content_types ? JSON.parse(row.preferred_content_types) : [],
      notificationEnabled: Boolean(row.notification_enabled),
      emailDigest: Boolean(row.email_digest),
      theme: row.theme,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  },

  update: async (query: {
    where: { userId: string };
    data: {
      contentFrequency?: string;
      preferredContentTypes?: string[];
      notificationEnabled?: boolean;
      emailDigest?: boolean;
      theme?: string;
    };
  }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (query.data.contentFrequency !== undefined) {
      updates.push('content_frequency = ?');
      values.push(query.data.contentFrequency);
    }
    if (query.data.preferredContentTypes !== undefined) {
      updates.push('preferred_content_types = ?');
      values.push(JSON.stringify(query.data.preferredContentTypes));
    }
    if (query.data.notificationEnabled !== undefined) {
      updates.push('notification_enabled = ?');
      values.push(query.data.notificationEnabled ? 1 : 0);
    }
    if (query.data.emailDigest !== undefined) {
      updates.push('email_digest = ?');
      values.push(query.data.emailDigest ? 1 : 0);
    }
    if (query.data.theme !== undefined) {
      updates.push('theme = ?');
      values.push(query.data.theme);
    }

    if (updates.length === 0) {
      return userPreferences.findUnique({ where: { userId: query.where.userId } });
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(query.where.userId);

    const stmt = db.prepare(`
      UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?
    `);

    stmt.run(...values);

    return userPreferences.findUnique({ where: { userId: query.where.userId } });
  },

  upsert: async (query: {
    where: { userId: string };
    create: {
      userId: string;
      contentFrequency?: string;
      preferredContentTypes?: string[];
      notificationEnabled?: boolean;
      emailDigest?: boolean;
      theme?: string;
    };
    update: {
      contentFrequency?: string;
      preferredContentTypes?: string[];
      notificationEnabled?: boolean;
      emailDigest?: boolean;
      theme?: string;
    };
  }) => {
    const existing = await userPreferences.findUnique({ where: { userId: query.where.userId } });

    if (existing) {
      return userPreferences.update({ where: { userId: query.where.userId }, data: query.update });
    } else {
      return userPreferences.create({ data: query.create });
    }
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
  findMany: async (query?: {
    orderBy?: Array<{ [key: string]: 'asc' | 'desc' }>;
  }) => {
    let sql = 'SELECT * FROM categories';

    if (query?.orderBy && query.orderBy.length > 0) {
      const orderClauses = query.orderBy.map(orderItem => {
        const [key, direction] = Object.entries(orderItem)[0];
        const dbKey = key === 'isDefault' ? 'is_default' : key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} ${direction.toUpperCase()}`;
      });
      sql += ' ORDER BY ' + orderClauses.join(', ');
    } else {
      sql += ' ORDER BY name';
    }

    const stmt = db.prepare(sql);
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

  findUnique: async (query: { where: { id?: string; slug?: string } }) => {
    let stmt;
    let value;

    if (query.where.id) {
      stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
      value = query.where.id;
    } else if (query.where.slug) {
      stmt = db.prepare('SELECT * FROM categories WHERE slug = ?');
      value = query.where.slug;
    } else {
      return null;
    }

    const row = stmt.get(value) as any;
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

  create: async (data: {
    data: {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      isDefault?: boolean;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, slug, description, icon, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.name,
      data.data.slug,
      data.data.description || null,
      data.data.icon || null,
      data.data.isDefault ? 1 : 0
    );

    return category.findUnique({ where: { id } });
  },

  update: async (query: {
    where: { id: string };
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
      isDefault?: boolean;
    };
  }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (query.data.name !== undefined) {
      updates.push('name = ?');
      values.push(query.data.name);
    }
    if (query.data.slug !== undefined) {
      updates.push('slug = ?');
      values.push(query.data.slug);
    }
    if (query.data.description !== undefined) {
      updates.push('description = ?');
      values.push(query.data.description);
    }
    if (query.data.icon !== undefined) {
      updates.push('icon = ?');
      values.push(query.data.icon);
    }
    if (query.data.isDefault !== undefined) {
      updates.push('is_default = ?');
      values.push(query.data.isDefault ? 1 : 0);
    }

    if (updates.length === 0) {
      return category.findUnique({ where: { id: query.where.id } });
    }

    values.push(query.where.id);

    const stmt = db.prepare(`
      UPDATE categories SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return category.findUnique({ where: { id: query.where.id } });
  },

  delete: async (query: { where: { id: string } }) => {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(query.where.id);
    return { id: query.where.id };
  },
};

/**
 * User Category operations
 */
export const userCategory = {
  create: async (data: {
    data: {
      userId: string;
      categoryId: string;
      priority?: number;
      isActive?: boolean;
    };
    include?: { category: boolean };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO user_categories (id, user_id, category_id, priority, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.categoryId,
      data.data.priority !== undefined ? data.data.priority : 5,
      data.data.isActive !== undefined ? (data.data.isActive ? 1 : 0) : 1
    );

    if (data.include?.category) {
      return userCategory.findFirst({
        where: { id, userId: data.data.userId },
        include: { category: true }
      });
    }

    return userCategory.findFirst({ where: { id, userId: data.data.userId } });
  },

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

  findFirst: async (query: {
    where: {
      id?: string;
      userId?: string;
      categoryId?: string;
      userId_categoryId?: {
        userId: string;
        categoryId: string;
      };
    };
    include?: { category: boolean };
  }) => {
    let sql = 'SELECT uc.*';
    if (query.include?.category) {
      sql += ', c.*';
    }
    sql += ' FROM user_categories uc';
    if (query.include?.category) {
      sql += ' LEFT JOIN categories c ON uc.category_id = c.id';
    }

    const conditions: string[] = [];
    const values: any[] = [];

    if (query.where.id) {
      conditions.push('uc.id = ?');
      values.push(query.where.id);
    }
    if (query.where.userId) {
      conditions.push('uc.user_id = ?');
      values.push(query.where.userId);
    }
    if (query.where.categoryId) {
      conditions.push('uc.category_id = ?');
      values.push(query.where.categoryId);
    }
    if (query.where.userId_categoryId) {
      conditions.push('uc.user_id = ?');
      values.push(query.where.userId_categoryId.userId);
      conditions.push('uc.category_id = ?');
      values.push(query.where.userId_categoryId.categoryId);
    }

    if (conditions.length === 0) {
      return null;
    }

    sql += ' WHERE ' + conditions.join(' AND ') + ' LIMIT 1';

    const stmt = db.prepare(sql);
    const row = stmt.get(...values) as any;

    if (!row) return null;

    const result: any = {
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      priority: row.priority,
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
    };

    if (query.include?.category && row.name) {
      result.category = {
        id: row.category_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        icon: row.icon,
        isDefault: Boolean(row.is_default),
        createdAt: new Date(row.created_at),
      };
    }

    return result;
  },

  findMany: async (query: {
    where: { userId: string; isActive?: boolean };
    include?: { category: boolean };
    orderBy?: Array<{ [key: string]: 'asc' | 'desc' | { [key: string]: 'asc' | 'desc' } }>;
  }) => {
    let sql = 'SELECT uc.*';
    if (query.include?.category) {
      sql += ', c.id as cat_id, c.name, c.slug, c.description, c.icon, c.is_default, c.created_at as cat_created_at';
    }
    sql += ' FROM user_categories uc';
    if (query.include?.category) {
      sql += ' LEFT JOIN categories c ON uc.category_id = c.id';
    }

    const conditions: string[] = ['uc.user_id = ?'];
    const values: any[] = [query.where.userId];

    if (query.where.isActive !== undefined) {
      conditions.push('uc.is_active = ?');
      values.push(query.where.isActive ? 1 : 0);
    }

    sql += ' WHERE ' + conditions.join(' AND ');

    if (query.orderBy && query.orderBy.length > 0) {
      const orderClauses = query.orderBy.map(orderItem => {
        const [key, direction] = Object.entries(orderItem)[0];

        // Handle nested orderBy for relations (e.g., { category: { name: 'asc' } })
        if (typeof direction === 'object') {
          if (key === 'category') {
            const [nestedKey, nestedDirection] = Object.entries(direction)[0];
            return `c.${nestedKey} ${nestedDirection.toUpperCase()}`;
          }
          return '';
        }

        // Handle direct orderBy
        if (key === 'category') {
          return `c.name ${direction.toUpperCase()}`;
        }
        const dbKey = key === 'isActive' ? 'is_active' : key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `uc.${dbKey} ${direction.toUpperCase()}`;
      }).filter(clause => clause !== '');

      if (orderClauses.length > 0) {
        sql += ' ORDER BY ' + orderClauses.join(', ');
      }
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(...values) as any[];

    return rows.map(row => {
      const result: any = {
        id: row.id,
        userId: row.user_id,
        categoryId: row.category_id,
        priority: row.priority,
        isActive: Boolean(row.is_active),
        createdAt: new Date(row.created_at),
      };

      if (query.include?.category && row.name) {
        result.category = {
          id: row.cat_id || row.category_id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          icon: row.icon,
          isDefault: Boolean(row.is_default),
          createdAt: new Date(row.cat_created_at),
        };
      }

      return result;
    });
  },

  update: async (query: {
    where: { id: string };
    data: { priority?: number; isActive?: boolean };
    include?: { category: boolean };
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

    if (updates.length === 0) {
      return userCategory.findFirst({
        where: { id: query.where.id },
        include: query.include
      });
    }

    values.push(query.where.id);

    const stmt = db.prepare(`
      UPDATE user_categories SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return userCategory.findFirst({
      where: { id: query.where.id },
      include: query.include
    });
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

  upsert: async (query: {
    where: {
      userId_categoryId: {
        userId: string;
        categoryId: string;
      };
    };
    create: {
      userId: string;
      categoryId: string;
      priority?: number;
      isActive?: boolean;
    };
    update: {
      priority?: number;
      isActive?: boolean;
    };
    include?: { category: boolean };
  }) => {
    const existing = await userCategory.findFirst({
      where: {
        userId_categoryId: query.where.userId_categoryId,
      },
    });

    if (existing) {
      return userCategory.update({
        where: { id: existing.id },
        data: query.update,
        include: query.include,
      });
    } else {
      return userCategory.create({
        data: query.create,
        include: query.include,
      });
    }
  },

  count: async (query: {
    where: {
      userId?: string;
      categoryId?: string;
      isActive?: boolean;
    };
  }) => {
    let sql = 'SELECT COUNT(*) as count FROM user_categories';
    const conditions: string[] = [];
    const values: any[] = [];

    if (query.where.userId) {
      conditions.push('user_id = ?');
      values.push(query.where.userId);
    }
    if (query.where.categoryId) {
      conditions.push('category_id = ?');
      values.push(query.where.categoryId);
    }
    if (query.where.isActive !== undefined) {
      conditions.push('is_active = ?');
      values.push(query.where.isActive ? 1 : 0);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const stmt = db.prepare(sql);
    const result = values.length > 0 ? stmt.get(...values) : stmt.get();
    return (result as any).count;
  },

  delete: async (query: { where: { id: string } }) => {
    const stmt = db.prepare('DELETE FROM user_categories WHERE id = ?');
    stmt.run(query.where.id);
    return { id: query.where.id };
  },

  deleteMany: async (query: { where: { userId: string; categoryId?: string } }) => {
    let sql = 'DELETE FROM user_categories WHERE user_id = ?';
    const values: any[] = [query.where.userId];

    if (query.where.categoryId) {
      sql += ' AND category_id = ?';
      values.push(query.where.categoryId);
    }

    const stmt = db.prepare(sql);
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

/**
 * Raw query support
 */
const $queryRaw = (strings: TemplateStringsArray, ...values: any[]) => {
  // Build the SQL query from template strings and values
  let query = strings[0];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    // Replace template placeholder with actual value
    if (value instanceof Date) {
      query += `'${value.toISOString()}'`;
    } else if (typeof value === 'string') {
      query += `'${value.replace(/'/g, "''")}'`; // Escape single quotes
    } else if (value === null || value === undefined) {
      query += 'NULL';
    } else {
      query += value;
    }
    query += strings[i + 1];
  }

  const stmt = db.prepare(query);
  return stmt.all();
};

// Import extended operations
import {
  content,
  tag,
  contentTag,
  userContentInteraction,
  dailyFeed,
  searchHistory,
  userActivityLog,
} from './db-extended';

// Export a prisma-like client with all operations
export const prisma = {
  user,
  userPreferences,
  refreshToken,
  passwordResetToken,
  emailVerificationToken,
  category,
  userCategory,
  content,
  tag,
  contentTag,
  userContentInteraction,
  dailyFeed,
  searchHistory,
  userActivityLog,
  $transaction,
  $queryRaw,
};

export default prisma;
