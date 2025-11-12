import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  const categories = [
    {
      name: 'Astronomy',
      slug: 'astronomy',
      description: 'Space, planets, stars, and the universe',
      icon: 'telescope',
      isDefault: true,
    },
    {
      name: 'Geopolitics',
      slug: 'geopolitics',
      description: 'International relations, politics, and global affairs',
      icon: 'globe',
      isDefault: true,
    },
    {
      name: 'History',
      slug: 'history',
      description: 'Historical events, civilizations, and cultures',
      icon: 'book',
      isDefault: true,
    },
    {
      name: 'Geography',
      slug: 'geography',
      description: 'Earth sciences, landscapes, and natural phenomena',
      icon: 'map',
      isDefault: true,
    },
    {
      name: 'Software',
      slug: 'software',
      description: 'Programming, development, and technology',
      icon: 'code',
      isDefault: true,
    },
    {
      name: 'Science',
      slug: 'science',
      description: 'General science, research, and discoveries',
      icon: 'flask',
      isDefault: false,
    },
    {
      name: 'Mathematics',
      slug: 'mathematics',
      description: 'Math concepts, theories, and applications',
      icon: 'calculator',
      isDefault: false,
    },
    {
      name: 'Philosophy',
      slug: 'philosophy',
      description: 'Philosophical thought, ethics, and logic',
      icon: 'brain',
      isDefault: false,
    },
  ];

  console.log('Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Create some sample tags
  const tags = [
    'beginner-friendly',
    'advanced',
    'tutorial',
    'research',
    'news',
    'analysis',
    'guide',
    'interview',
    'documentary',
    'lecture',
  ];

  console.log('Creating tags...');
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { slug: tagName },
      update: {},
      create: {
        name: tagName,
        slug: tagName,
      },
    });
  }

  console.log(`✅ Created ${tags.length} tags`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
