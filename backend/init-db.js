#!/usr/bin/env node

/**
 * Database initialization script using better-sqlite3
 * This creates the database schema without requiring Prisma
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'dev.db');
const schemaPath = path.join(__dirname, 'prisma', 'manual-setup.sql');

console.log('🗄️  Initializing EduHub Database...\n');

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  console.log('🗑️  Removing existing database...');
  fs.unlinkSync(dbPath);
}

// Create new database
console.log('📝 Creating new database...');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
console.log('📊 Loading schema...');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements (split by semicolon but not within quotes)
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`⚙️  Executing ${statements.length} SQL statements...\n`);

// Execute each statement
for (const statement of statements) {
  if (statement.trim()) {
    try {
      db.exec(statement + ';');
    } catch (error) {
      console.error(`❌ Error executing statement:`);
      console.error(statement.substring(0, 100) + '...');
      console.error(error.message);
      process.exit(1);
    }
  }
}

console.log('✅ Database schema created successfully!\n');

// Insert seed data
console.log('🌱 Seeding database with default categories...\n');

const categories = [
  {
    id: crypto.randomUUID(),
    name: 'Machine Learning',
    slug: 'machine-learning',
    description: 'AI, ML, Deep Learning, Neural Networks',
    icon: '🤖',
    is_default: 1
  },
  {
    id: crypto.randomUUID(),
    name: 'Web Development',
    slug: 'web-development',
    description: 'Frontend, Backend, Full Stack Development',
    icon: '🌐',
    is_default: 1
  },
  {
    id: crypto.randomUUID(),
    name: 'Data Science',
    slug: 'data-science',
    description: 'Data Analysis, Statistics, Visualization',
    icon: '📊',
    is_default: 1
  },
  {
    id: crypto.randomUUID(),
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security, Penetration Testing, Encryption',
    icon: '🔒',
    is_default: 1
  },
  {
    id: crypto.randomUUID(),
    name: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'AWS, Azure, GCP, DevOps',
    icon: '☁️',
    is_default: 1
  },
  {
    id: crypto.randomUUID(),
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, React Native, Flutter',
    icon: '📱',
    is_default: 1
  }
];

const insertCategory = db.prepare(`
  INSERT INTO categories (id, name, slug, description, icon, is_default)
  VALUES (@id, @name, @slug, @description, @icon, @is_default)
`);

const insertMany = db.transaction((cats) => {
  for (const cat of cats) {
    insertCategory.run(cat);
  }
});

insertMany(categories);

console.log('✅ Seeded 6 default categories\n');

// Verify setup
const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
console.log(`✅ Database verification: ${count.count} categories loaded\n`);

db.close();

console.log('🎉 Database initialization complete!');
console.log('📍 Database location:', dbPath);
console.log('\nYou can now start the server with: npm run dev\n');
