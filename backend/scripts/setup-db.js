#!/usr/bin/env node
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

console.log('📦 Setting up SQLite database...\n');

// Create database connection
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

// Read SQL setup file
const sqlPath = path.join(__dirname, '..', 'prisma', 'manual-setup.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Split by semicolon and execute each statement
const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

console.log(`✅ Executing ${statements.length} SQL statements...\n`);

try {
  // Execute all statements in a transaction
  const runSetup = db.transaction(() => {
    statements.forEach((statement, index) => {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          db.prepare(trimmed).run();
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error(`❌ Error in statement ${index + 1}:`, error.message);
          }
        }
      }
    });
  });

  runSetup();

  // Verify tables were created
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('✅ Database tables created:');
  tables.forEach(table => {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
    console.log(`   - ${table.name} (${count.count} rows)`);
  });

  console.log('\n✨ Database setup complete!');
  console.log(`📍 Database location: ${dbPath}\n`);

} catch (error) {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
} finally {
  db.close();
}
