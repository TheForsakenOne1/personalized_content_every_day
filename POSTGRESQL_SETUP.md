# PostgreSQL Setup Guide

This project uses PostgreSQL as its database for both development and production.

## Prerequisites

### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

## Quick Start

### 1. Create Database

```bash
# Using createdb command
createdb eduhub_dev

# OR using psql
psql -U postgres
postgres=# CREATE DATABASE eduhub_dev;
postgres=# \q
```

### 2. Configure Environment

Update `backend/.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/eduhub_dev?schema=public
```

### 3. Run Setup Script

```bash
cd backend
./setup-postgres.sh
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

## Database Commands

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset
```

### Prisma Studio

Launch a visual database editor:

```bash
npx prisma studio
```

### Seeding

```bash
# Run seed script
npm run db:seed
```

## Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/eduhub_dev?schema=public
```

## Production Setup

### Environment Variables

For production, use a managed PostgreSQL service:

**Example (Railway):**
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Example (Supabase):**
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**Example (Neon):**
```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
```

### Managed PostgreSQL Providers

1. **Railway** - [https://railway.app/](https://railway.app/)
   - Free tier available
   - Easy deployment
   - Automatic backups

2. **Supabase** - [https://supabase.com/](https://supabase.com/)
   - Free tier available
   - PostgreSQL + Auth + Storage
   - Real-time features

3. **Neon** - [https://neon.tech/](https://neon.tech/)
   - Serverless PostgreSQL
   - Free tier available
   - Auto-scaling

4. **Amazon RDS** - [https://aws.amazon.com/rds/](https://aws.amazon.com/rds/)
   - Fully managed
   - High availability
   - Automated backups

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS
brew services start postgresql@15

# Ubuntu
sudo systemctl start postgresql
```

### Authentication Failed

**Error:** `password authentication failed for user "postgres"`

**Solution:**
1. Reset PostgreSQL password:
```bash
# macOS/Linux
sudo -u postgres psql
postgres=# ALTER USER postgres PASSWORD 'newpassword';
postgres=# \q
```

2. Update `DATABASE_URL` in `.env`

### Database Does Not Exist

**Error:** `database "eduhub_dev" does not exist`

**Solution:**
```bash
createdb eduhub_dev
```

### Migration Errors

**Error:** Migration conflicts or version mismatch

**Solution:**
```bash
# Reset database and rerun migrations
npx prisma migrate reset

# If in production, manually resolve conflicts
npx prisma migrate resolve
```

## Database Schema

The project includes 15 models:

- **User Management:** User, UserPreferences, RefreshToken, PasswordResetToken, EmailVerificationToken
- **Content:** Content, Tag, ContentTag, ContentSource
- **Categories:** Category, UserCategory
- **Interactions:** UserContentInteraction, DailyFeed
- **Tracking:** SearchHistory, UserActivityLog

## Performance Tips

### Indexes

All critical fields are indexed. Check `prisma/schema.prisma` for index definitions.

### Connection Pooling

For production, consider using PgBouncer or Prisma Accelerate for connection pooling:

```env
# With PgBouncer
DATABASE_URL=postgresql://user:password@pooler.example.com:6543/database

# With Prisma Accelerate
DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY
```

### Query Optimization

- Use `select` to fetch only needed fields
- Use `include` judiciously for relations
- Implement pagination for large datasets
- Monitor slow queries with Prisma query logs

## Backup & Restore

### Backup

```bash
# Backup entire database
pg_dump -U postgres eduhub_dev > backup.sql

# Backup schema only
pg_dump -U postgres --schema-only eduhub_dev > schema.sql

# Backup data only
pg_dump -U postgres --data-only eduhub_dev > data.sql
```

### Restore

```bash
# Restore from backup
psql -U postgres eduhub_dev < backup.sql
```

## Security Best Practices

1. **Never commit `.env` files** with real credentials
2. **Use strong passwords** for database users
3. **Enable SSL** in production:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   ```
4. **Restrict network access** to database
5. **Regular backups** - automate daily backups
6. **Monitor connections** - set connection limits
7. **Update regularly** - keep PostgreSQL version current

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Need Help?**
- Check Prisma logs: `npx prisma db push --help`
- View PostgreSQL logs: `tail -f /usr/local/var/log/postgresql@15.log`
- Join Prisma Discord: [https://pris.ly/discord](https://pris.ly/discord)
