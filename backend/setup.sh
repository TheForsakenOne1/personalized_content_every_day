#!/bin/bash

echo "🚀 Setting up EduHub Backend..."
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

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || cat > .env << EOF
# Server Configuration
NODE_ENV=development
PORT=4000
API_VERSION=v1

# Database Configuration (SQLite for quick development)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production-$(openssl rand -hex 32)
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# App URL
APP_URL=http://localhost:3000

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@eduhub.dev
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🗄️  Setting up database..."

# Generate Prisma Client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running migrations..."
npx prisma migrate dev --name init

# Seed database
echo "Seeding database..."
npx prisma db seed

echo ""
echo "✨ Backend setup complete!"
echo ""
echo "To start the server:"
echo "  npm run dev"
echo ""
echo "Server will run on: http://localhost:4000"
echo ""
