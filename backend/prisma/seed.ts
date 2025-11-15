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

  // Create sample content
  const sampleContent = [
    {
      title: 'The James Webb Space Telescope: First Year Discoveries',
      description: 'An in-depth analysis of the groundbreaking discoveries made by JWST in its first year of operation, including exoplanet atmospheres and early universe observations.',
      url: 'https://example.com/jwst-discoveries',
      thumbnailUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
      contentType: 'video',
      source: 'NASA',
      author: 'Dr. Michelle Thaller',
      categorySlug: 'astronomy',
      tags: ['documentary', 'research'],
      publishedAt: new Date('2024-01-20'),
      duration: 1200,
      qualityScore: 0.95,
    },
    {
      title: 'Understanding the Russia-Ukraine Conflict: A Geopolitical Analysis',
      description: 'Comprehensive analysis of the historical, economic, and strategic factors driving the ongoing conflict between Russia and Ukraine.',
      url: 'https://example.com/geopolitical-analysis',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800',
      contentType: 'article',
      source: 'Foreign Affairs',
      author: 'Prof. Michael Cohen',
      categorySlug: 'geopolitics',
      tags: ['analysis', 'news'],
      publishedAt: new Date('2024-01-18'),
      qualityScore: 0.92,
    },
    {
      title: 'The Fall of Constantinople: Reassessing Historical Evidence',
      description: 'New archaeological findings and document analysis provide fresh insights into the siege and fall of Constantinople in 1453.',
      url: 'https://example.com/constantinople-fall',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800',
      contentType: 'paper',
      source: 'Journal of Medieval History',
      author: 'Dr. Elena Papadopoulos',
      categorySlug: 'history',
      tags: ['research', 'advanced'],
      publishedAt: new Date('2024-01-16'),
      qualityScore: 0.89,
    },
    {
      title: 'React 19: What\'s New in the Latest Release',
      description: 'Explore the new features and improvements in React 19, including enhanced concurrent rendering and automatic batching.',
      url: 'https://example.com/react-19',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      contentType: 'article',
      source: 'React Blog',
      author: 'React Team',
      categorySlug: 'software',
      tags: ['tutorial', 'beginner-friendly'],
      publishedAt: new Date('2024-01-19'),
      qualityScore: 0.88,
    },
    {
      title: 'Climate Change Impact on Ocean Currents',
      description: 'Scientists discuss how global warming is affecting major ocean currents like the Gulf Stream.',
      url: 'https://example.com/ocean-currents',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      contentType: 'video',
      source: 'National Geographic',
      author: 'Dr. Robert Thompson',
      categorySlug: 'geography',
      tags: ['documentary', 'research'],
      publishedAt: new Date('2024-01-17'),
      duration: 900,
      qualityScore: 0.91,
    },
    {
      title: 'Artificial Neural Networks in Medical Diagnosis',
      description: 'Comprehensive review of machine learning applications in medical imaging and diagnosis.',
      url: 'https://example.com/medical-ai',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
      contentType: 'paper',
      source: 'Medical AI Journal',
      author: 'Dr. Priya Sharma',
      categorySlug: 'software',
      tags: ['research', 'advanced'],
      publishedAt: new Date('2024-01-14'),
      qualityScore: 0.94,
    },
  ];

  console.log('Creating sample content...');
  for (const item of sampleContent) {
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });

    if (!category) continue;

    const content = await prisma.content.create({
      data: {
        title: item.title,
        description: item.description,
        url: item.url,
        thumbnailUrl: item.thumbnailUrl,
        contentType: item.contentType,
        source: item.source,
        author: item.author,
        categoryId: category.id,
        publishedAt: item.publishedAt,
        duration: item.duration,
        qualityScore: item.qualityScore,
      },
    });

    // Add tags to content
    for (const tagName of item.tags) {
      const tag = await prisma.tag.findUnique({
        where: { slug: tagName },
      });

      if (tag) {
        await prisma.contentTag.create({
          data: {
            contentId: content.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  console.log(`✅ Created ${sampleContent.length} content items`);

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
