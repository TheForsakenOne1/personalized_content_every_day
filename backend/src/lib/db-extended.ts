/**
 * Extended Database client adapter using better-sqlite3
 * Adds Content, Tags, Interactions, and Feed operations
 */

import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

const dbPath = path.join(__dirname, '../../dev.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

/**
 * Content operations
 */
export const content = {
  create: async (data: {
    data: {
      id?: string;
      externalId?: string;
      contentType: string;
      source: string;
      categoryId: string;
      title: string;
      description?: string;
      url: string;
      thumbnailUrl?: string;
      author?: string;
      publishedAt?: Date;
      duration?: number;
      wordCount?: number;
      language?: string;
      metadata?: any;
      qualityScore?: number;
      popularityScore?: number;
    };
    include?: {
      category?: boolean;
      tags?: boolean | { include?: { tag: boolean } };
    };
  }) => {
    const id = data.data.id || randomUUID();
    const stmt = db.prepare(`
      INSERT INTO content (
        id, external_id, content_type, source, category_id, title, description,
        url, thumbnail_url, author, published_at, duration, word_count, language,
        metadata, quality_score, popularity_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.externalId || null,
      data.data.contentType,
      data.data.source,
      data.data.categoryId,
      data.data.title,
      data.data.description || null,
      data.data.url,
      data.data.thumbnailUrl || null,
      data.data.author || null,
      data.data.publishedAt ? data.data.publishedAt.toISOString() : null,
      data.data.duration || null,
      data.data.wordCount || null,
      data.data.language || 'en',
      data.data.metadata ? JSON.stringify(data.data.metadata) : '{}',
      data.data.qualityScore || 0.5,
      data.data.popularityScore || 0
    );

    return content.findUnique({ where: { id }, include: data.include });
  },

  findUnique: async (query: {
    where: { id?: string; externalId_source?: { externalId: string; source: string } };
    include?: {
      category?: boolean;
      tags?: boolean | { include?: { tag: boolean } };
    };
  }) => {
    let stmt;
    let params: any[] = [];

    if (query.where.id) {
      stmt = db.prepare('SELECT * FROM content WHERE id = ?');
      params = [query.where.id];
    } else if (query.where.externalId_source) {
      stmt = db.prepare('SELECT * FROM content WHERE external_id = ? AND source = ?');
      params = [query.where.externalId_source.externalId, query.where.externalId_source.source];
    } else {
      return null;
    }

    const row = stmt.get(...params) as any;
    if (!row) return null;

    const result: any = {
      id: row.id,
      externalId: row.external_id,
      contentType: row.content_type,
      source: row.source,
      categoryId: row.category_id,
      title: row.title,
      description: row.description,
      url: row.url,
      thumbnailUrl: row.thumbnail_url,
      author: row.author,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
      duration: row.duration,
      wordCount: row.word_count,
      language: row.language,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      qualityScore: row.quality_score,
      popularityScore: row.popularity_score,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Include category if requested
    if (query.include?.category) {
      const catStmt = db.prepare('SELECT * FROM categories WHERE id = ?');
      const catRow = catStmt.get(row.category_id) as any;
      if (catRow) {
        result.category = {
          id: catRow.id,
          name: catRow.name,
          slug: catRow.slug,
          description: catRow.description,
          icon: catRow.icon,
          isDefault: Boolean(catRow.is_default),
          createdAt: new Date(catRow.created_at),
        };
      }
    }

    // Include tags if requested
    if (query.include?.tags) {
      const tagsStmt = db.prepare(`
        SELECT ct.*, t.*
        FROM content_tags ct
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE ct.content_id = ?
      `);
      const tagRows = tagsStmt.all(row.id) as any[];

      result.tags = tagRows.map(tagRow => ({
        contentId: tagRow.content_id,
        tagId: tagRow.tag_id,
        tag: {
          id: tagRow.id,
          name: tagRow.name,
          slug: tagRow.slug,
          createdAt: new Date(tagRow.created_at),
        },
      }));
    }

    return result;
  },

  findMany: async (query?: {
    where?: {
      categoryId?: string;
      contentType?: string;
      source?: string;
      OR?: Array<any>;
    };
    include?: {
      category?: boolean;
      tags?: boolean | { include?: { tag: boolean } };
    };
    orderBy?: { [key: string]: 'asc' | 'desc' };
    take?: number;
    skip?: number;
  }) => {
    let sql = 'SELECT * FROM content';
    const values: any[] = [];
    const conditions: string[] = [];

    if (query?.where) {
      if (query.where.categoryId) {
        conditions.push('category_id = ?');
        values.push(query.where.categoryId);
      }
      if (query.where.contentType) {
        conditions.push('content_type = ?');
        values.push(query.where.contentType);
      }
      if (query.where.source) {
        conditions.push('source = ?');
        values.push(query.where.source);
      }
      // Note: OR conditions are complex and would need custom implementation
      // For now, basic OR support is omitted
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    if (query?.orderBy) {
      const orderClauses = Object.entries(query.orderBy).map(([key, direction]) => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} ${direction.toUpperCase()}`;
      });
      sql += ' ORDER BY ' + orderClauses.join(', ');
    }

    if (query?.take) {
      sql += ` LIMIT ${query.take}`;
    }

    if (query?.skip) {
      sql += ` OFFSET ${query.skip}`;
    }

    const stmt = db.prepare(sql);
    const rows = values.length > 0 ? stmt.all(...values) : stmt.all();

    return (rows as any[]).map(row => {
      const result: any = {
        id: row.id,
        externalId: row.external_id,
        contentType: row.content_type,
        source: row.source,
        categoryId: row.category_id,
        title: row.title,
        description: row.description,
        url: row.url,
        thumbnailUrl: row.thumbnail_url,
        author: row.author,
        publishedAt: row.published_at ? new Date(row.published_at) : null,
        duration: row.duration,
        wordCount: row.word_count,
        language: row.language,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
        qualityScore: row.quality_score,
        popularityScore: row.popularity_score,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };

      // Include category if requested
      if (query?.include?.category) {
        const catStmt = db.prepare('SELECT * FROM categories WHERE id = ?');
        const catRow = catStmt.get(row.category_id) as any;
        if (catRow) {
          result.category = {
            id: catRow.id,
            name: catRow.name,
            slug: catRow.slug,
            description: catRow.description,
            icon: catRow.icon,
            isDefault: Boolean(catRow.is_default),
            createdAt: new Date(catRow.created_at),
          };
        }
      }

      // Include tags if requested
      if (query?.include?.tags) {
        const tagsStmt = db.prepare(`
          SELECT ct.*, t.*
          FROM content_tags ct
          LEFT JOIN tags t ON ct.tag_id = t.id
          WHERE ct.content_id = ?
        `);
        const tagRows = tagsStmt.all(row.id) as any[];

        result.tags = tagRows.map(tagRow => ({
          contentId: tagRow.content_id,
          tagId: tagRow.tag_id,
          tag: {
            id: tagRow.id,
            name: tagRow.name,
            slug: tagRow.slug,
            createdAt: new Date(tagRow.created_at),
          },
        }));
      }

      return result;
    });
  },

  update: async (query: {
    where: { id: string };
    data: {
      title?: string;
      description?: string;
      url?: string;
      thumbnailUrl?: string;
      author?: string;
      publishedAt?: Date;
      duration?: number;
      wordCount?: number;
      qualityScore?: number;
      popularityScore?: number;
      metadata?: any;
    };
    include?: {
      category?: boolean;
      tags?: boolean | { include?: { tag: boolean } };
    };
  }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (query.data.title !== undefined) {
      updates.push('title = ?');
      values.push(query.data.title);
    }
    if (query.data.description !== undefined) {
      updates.push('description = ?');
      values.push(query.data.description);
    }
    if (query.data.url !== undefined) {
      updates.push('url = ?');
      values.push(query.data.url);
    }
    if (query.data.thumbnailUrl !== undefined) {
      updates.push('thumbnail_url = ?');
      values.push(query.data.thumbnailUrl);
    }
    if (query.data.author !== undefined) {
      updates.push('author = ?');
      values.push(query.data.author);
    }
    if (query.data.publishedAt !== undefined) {
      updates.push('published_at = ?');
      values.push(query.data.publishedAt ? query.data.publishedAt.toISOString() : null);
    }
    if (query.data.duration !== undefined) {
      updates.push('duration = ?');
      values.push(query.data.duration);
    }
    if (query.data.wordCount !== undefined) {
      updates.push('word_count = ?');
      values.push(query.data.wordCount);
    }
    if (query.data.qualityScore !== undefined) {
      updates.push('quality_score = ?');
      values.push(query.data.qualityScore);
    }
    if (query.data.popularityScore !== undefined) {
      updates.push('popularity_score = ?');
      values.push(query.data.popularityScore);
    }
    if (query.data.metadata !== undefined) {
      updates.push('metadata = ?');
      values.push(JSON.stringify(query.data.metadata));
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(query.where.id);

    const stmt = db.prepare(`
      UPDATE content SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return content.findUnique({ where: { id: query.where.id }, include: query.include });
  },

  delete: async (query: { where: { id: string } }) => {
    const stmt = db.prepare('DELETE FROM content WHERE id = ?');
    stmt.run(query.where.id);
    return { id: query.where.id };
  },

  count: async (query?: {
    where?: {
      categoryId?: string;
      contentType?: string;
    };
  }) => {
    let sql = 'SELECT COUNT(*) as count FROM content';
    const values: any[] = [];
    const conditions: string[] = [];

    if (query?.where) {
      if (query.where.categoryId) {
        conditions.push('category_id = ?');
        values.push(query.where.categoryId);
      }
      if (query.where.contentType) {
        conditions.push('content_type = ?');
        values.push(query.where.contentType);
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const stmt = db.prepare(sql);
    const result = values.length > 0 ? stmt.get(...values) : stmt.get();
    return (result as any).count;
  },
};

/**
 * Tag operations
 */
export const tag = {
  create: async (data: {
    data: {
      name: string;
      slug: string;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)
    `);

    stmt.run(id, data.data.name, data.data.slug);

    return { id, ...data.data, createdAt: new Date() };
  },

  findUnique: async (query: { where: { slug: string } }) => {
    const stmt = db.prepare('SELECT * FROM tags WHERE slug = ?');
    const row = stmt.get(query.where.slug) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdAt: new Date(row.created_at),
    };
  },

  findMany: async (query?: {
    where?: {
      slug?: { in: string[] };
    };
  }) => {
    let sql = 'SELECT * FROM tags';
    const values: any[] = [];

    if (query?.where?.slug?.in && query.where.slug.in.length > 0) {
      const placeholders = query.where.slug.in.map(() => '?').join(',');
      sql += ` WHERE slug IN (${placeholders})`;
      values.push(...query.where.slug.in);
    }

    const stmt = db.prepare(sql);
    const rows = values.length > 0 ? stmt.all(...values) : stmt.all();

    return (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdAt: new Date(row.created_at),
    }));
  },

  upsert: async (query: {
    where: { slug: string };
    create: {
      name: string;
      slug: string;
    };
    update: any;
  }) => {
    const existing = await tag.findUnique({ where: { slug: query.where.slug } });

    if (existing) {
      // For tags, update typically doesn't change anything
      return existing;
    } else {
      return tag.create({ data: query.create });
    }
  },

  deleteMany: async (query?: {
    where?: {
      slug?: { in: string[] };
    };
  }) => {
    if (!query?.where?.slug?.in || query.where.slug.in.length === 0) {
      // Delete all tags if no filter
      const stmt = db.prepare('DELETE FROM tags');
      const result = stmt.run();
      return { count: result.changes };
    }

    const placeholders = query.where.slug.in.map(() => '?').join(',');
    const sql = `DELETE FROM tags WHERE slug IN (${placeholders})`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...query.where.slug.in);
    return { count: result.changes };
  },
};

/**
 * Content Tag operations
 */
export const contentTag = {
  create: async (data: {
    data: {
      contentId: string;
      tagId: string;
    };
  }) => {
    const stmt = db.prepare(`
      INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)
    `);

    stmt.run(data.data.contentId, data.data.tagId);

    return data.data;
  },

  createMany: async (data: {
    data: Array<{
      contentId: string;
      tagId: string;
    }>;
    skipDuplicates?: boolean;
  }) => {
    if (data.data.length === 0) {
      return { count: 0 };
    }

    const stmt = db.prepare(`
      INSERT ${data.skipDuplicates ? 'OR IGNORE' : ''} INTO content_tags (content_id, tag_id) VALUES (?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        stmt.run(item.contentId, item.tagId);
      }
    });

    insertMany(data.data);

    return { count: data.data.length };
  },

  deleteMany: async (query: {
    where: {
      contentId?: string;
      tagId?: { in: string[] };
    };
  }) => {
    const conditions: string[] = [];
    const values: any[] = [];

    if (query.where.contentId) {
      conditions.push('content_id = ?');
      values.push(query.where.contentId);
    }

    if (query.where.tagId?.in && query.where.tagId.in.length > 0) {
      const placeholders = query.where.tagId.in.map(() => '?').join(',');
      conditions.push(`tag_id IN (${placeholders})`);
      values.push(...query.where.tagId.in);
    }

    if (conditions.length === 0) {
      // Don't delete everything if no conditions
      return { count: 0 };
    }

    const sql = `DELETE FROM content_tags WHERE ${conditions.join(' AND ')}`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    return { count: result.changes };
  },
};

/**
 * User Content Interaction operations
 */
export const userContentInteraction = {
  create: async (data: {
    data: {
      userId: string;
      contentId: string;
      status?: string;
      readAt?: Date;
      readProgress?: number;
      timeSpent?: number;
      rating?: number;
      isSaved?: boolean;
      notes?: string;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO user_content_interaction (
        id, user_id, content_id, status, read_at, read_progress, time_spent, rating, is_saved, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.contentId,
      data.data.status || 'unread',
      data.data.readAt ? data.data.readAt.toISOString() : null,
      data.data.readProgress || 0,
      data.data.timeSpent || null,
      data.data.rating || null,
      data.data.isSaved ? 1 : 0,
      data.data.notes || null
    );

    return { id, ...data.data };
  },

  findUnique: async (query: {
    where: { userId_contentId?: { userId: string; contentId: string } };
  }) => {
    const stmt = db.prepare('SELECT * FROM user_content_interaction WHERE user_id = ? AND content_id = ?');
    const row = stmt.get(
      query.where.userId_contentId!.userId,
      query.where.userId_contentId!.contentId
    ) as any;

    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      contentId: row.content_id,
      status: row.status,
      readAt: row.read_at ? new Date(row.read_at) : null,
      readProgress: row.read_progress,
      timeSpent: row.time_spent,
      rating: row.rating,
      isSaved: Boolean(row.is_saved),
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  },

  findMany: async (query: {
    where: { userId: string; isSaved?: boolean };
    include?: { content: boolean };
  }) => {
    let sql = 'SELECT uci.*';
    if (query.include?.content) {
      sql += ', c.*';
    }
    sql += ' FROM user_content_interaction uci';
    if (query.include?.content) {
      sql += ' LEFT JOIN content c ON uci.content_id = c.id';
    }
    sql += ' WHERE uci.user_id = ?';

    const values: any[] = [query.where.userId];

    if (query.where.isSaved !== undefined) {
      sql += ' AND uci.is_saved = ?';
      values.push(query.where.isSaved ? 1 : 0);
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(...values) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      contentId: row.content_id,
      status: row.status,
      readAt: row.read_at ? new Date(row.read_at) : null,
      readProgress: row.read_progress,
      timeSpent: row.time_spent,
      rating: row.rating,
      isSaved: Boolean(row.is_saved),
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      ...(query.include?.content && row.title && {
        content: {
          id: row.content_id,
          title: row.title,
          description: row.description,
          url: row.url,
          thumbnailUrl: row.thumbnail_url,
          contentType: row.content_type,
          source: row.source,
        },
      }),
    }));
  },

  update: async (query: {
    where: { userId_contentId: { userId: string; contentId: string } };
    data: {
      status?: string;
      readAt?: Date;
      readProgress?: number;
      timeSpent?: number;
      rating?: number;
      isSaved?: boolean;
      notes?: string;
    };
  }) => {
    const updates: string[] = [];
    const values: any[] = [];

    if (query.data.status !== undefined) {
      updates.push('status = ?');
      values.push(query.data.status);
    }
    if (query.data.readAt !== undefined) {
      updates.push('read_at = ?');
      values.push(query.data.readAt ? query.data.readAt.toISOString() : null);
    }
    if (query.data.readProgress !== undefined) {
      updates.push('read_progress = ?');
      values.push(query.data.readProgress);
    }
    if (query.data.timeSpent !== undefined) {
      updates.push('time_spent = ?');
      values.push(query.data.timeSpent);
    }
    if (query.data.rating !== undefined) {
      updates.push('rating = ?');
      values.push(query.data.rating);
    }
    if (query.data.isSaved !== undefined) {
      updates.push('is_saved = ?');
      values.push(query.data.isSaved ? 1 : 0);
    }
    if (query.data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(query.data.notes);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(query.where.userId_contentId.userId);
    values.push(query.where.userId_contentId.contentId);

    const stmt = db.prepare(`
      UPDATE user_content_interaction SET ${updates.join(', ')}
      WHERE user_id = ? AND content_id = ?
    `);

    stmt.run(...values);

    return userContentInteraction.findUnique({ where: { userId_contentId: query.where.userId_contentId } });
  },

  upsert: async (query: {
    where: { userId_contentId: { userId: string; contentId: string } };
    create: {
      userId: string;
      contentId: string;
      status?: string;
      readAt?: Date;
      isSaved?: boolean;
    };
    update: {
      status?: string;
      readAt?: Date;
      isSaved?: boolean;
    };
  }) => {
    const existing = await userContentInteraction.findUnique({ where: query.where });

    if (existing) {
      return userContentInteraction.update({ where: query.where, data: query.update });
    } else {
      return userContentInteraction.create({ data: query.create });
    }
  },

  count: async (query: {
    where: { userId: string; status?: string };
  }) => {
    let sql = 'SELECT COUNT(*) as count FROM user_content_interaction WHERE user_id = ?';
    const values: any[] = [query.where.userId];

    if (query.where.status) {
      sql += ' AND status = ?';
      values.push(query.where.status);
    }

    const stmt = db.prepare(sql);
    const result = stmt.get(...values) as any;
    return result.count;
  },
};

/**
 * Daily Feed operations
 */
export const dailyFeed = {
  createMany: async (data: {
    data: Array<{
      userId: string;
      contentId: string;
      feedDate: Date;
      recommendationScore: number;
      position: number;
      reason?: string;
    }>;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO daily_feeds (id, user_id, content_id, feed_date, recommendation_score, position, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        stmt.run(
          randomUUID(),
          item.userId,
          item.contentId,
          item.feedDate.toISOString().split('T')[0],
          item.recommendationScore,
          item.position,
          item.reason || null
        );
      }
    });

    insertMany(data.data);

    return { count: data.data.length };
  },

  findMany: async (query: {
    where: { userId: string; feedDate: Date };
    include?: { content: boolean };
    orderBy?: { position: 'asc' | 'desc' };
  }) => {
    let sql = 'SELECT df.*';
    if (query.include?.content) {
      sql += ', c.*';
    }
    sql += ' FROM daily_feeds df';
    if (query.include?.content) {
      sql += ' LEFT JOIN content c ON df.content_id = c.id';
    }
    sql += ' WHERE df.user_id = ? AND df.feed_date = ?';

    if (query.orderBy?.position) {
      sql += ` ORDER BY df.position ${query.orderBy.position.toUpperCase()}`;
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(
      query.where.userId,
      query.where.feedDate.toISOString().split('T')[0]
    ) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      contentId: row.content_id,
      feedDate: new Date(row.feed_date),
      recommendationScore: row.recommendation_score,
      position: row.position,
      reason: row.reason,
      createdAt: new Date(row.created_at),
      ...(query.include?.content && row.title && {
        content: {
          id: row.content_id,
          title: row.title,
          description: row.description,
          url: row.url,
          thumbnailUrl: row.thumbnail_url,
          contentType: row.content_type,
          source: row.source,
          categoryId: row.category_id,
        },
      }),
    }));
  },

  deleteMany: async (query: {
    where: { userId: string; feedDate: Date };
  }) => {
    const stmt = db.prepare('DELETE FROM daily_feeds WHERE user_id = ? AND feed_date = ?');
    const result = stmt.run(
      query.where.userId,
      query.where.feedDate.toISOString().split('T')[0]
    );
    return { count: result.changes };
  },
};

/**
 * Search History operations
 */
export const searchHistory = {
  create: async (data: {
    data: {
      userId: string;
      query: string;
      resultsCount: number;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO search_history (id, user_id, query, results_count)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, data.data.userId, data.data.query, data.data.resultsCount);

    return { id, ...data.data };
  },

  findMany: async (query: {
    where: { userId: string };
    orderBy?: { createdAt: 'desc' };
    take?: number;
  }) => {
    let sql = 'SELECT * FROM search_history WHERE user_id = ?';

    if (query.orderBy?.createdAt) {
      sql += ' ORDER BY created_at DESC';
    }

    if (query.take) {
      sql += ` LIMIT ${query.take}`;
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(query.where.userId) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      query: row.query,
      resultsCount: row.results_count,
      createdAt: new Date(row.created_at),
    }));
  },
};

/**
 * User Activity Log operations
 */
export const userActivityLog = {
  create: async (data: {
    data: {
      userId: string;
      activityType: string;
      entityType?: string;
      entityId?: string;
      metadata?: any;
    };
  }) => {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO user_activity_log (id, user_id, activity_type, entity_type, entity_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.data.userId,
      data.data.activityType,
      data.data.entityType || null,
      data.data.entityId || null,
      data.data.metadata ? JSON.stringify(data.data.metadata) : '{}'
    );

    return { id, ...data.data };
  },
};

// Export all extended operations
export const prismaExtended = {
  content,
  tag,
  contentTag,
  userContentInteraction,
  dailyFeed,
  searchHistory,
  userActivityLog,
};

export default prismaExtended;
