#!/bin/bash

echo "🚀 Setting up EduHub with PostgreSQL..."
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  PostgreSQL Setup Instructions"
echo "=================================="
echo ""
echo "1. Make sure PostgreSQL is running on your system"
echo "2. Create a database:"
echo "   $ createdb eduhub_dev"
echo "   OR using psql:"
echo "   $ psql -U postgres"
echo "   postgres=# CREATE DATABASE eduhub_dev;"
echo ""
echo "3. Update your .env file with the correct DATABASE_URL"
echo "   Example: DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/eduhub_dev?schema=public"
echo ""
echo "4. Run Prisma migrations:"
echo "   $ npm run prisma:migrate"
echo ""
echo "5. Seed the database:"
echo "   $ npm run db:seed"
echo ""
echo "6. Start the server:"
echo "   $ npm run dev"
echo ""
echo "✨ Setup script complete!"
echo ""
echo "📝 Note: If you don't have PostgreSQL installed:"
echo "   - macOS: brew install postgresql@15"
echo "   - Ubuntu: sudo apt install postgresql postgresql-contrib"
echo "   - Windows: Download from https://www.postgresql.org/download/windows/"
echo ""
