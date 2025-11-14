#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

console.log('📦 Seeding sample content...\n');

// Create database connection
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new Database(dbPath);

// Sample content data
const sampleContent = [
  // Machine Learning
  {
    id: randomUUID(),
    contentType: 'paper',
    source: 'arXiv',
    categoryId: 'cat-machine-learning',
    title: 'Attention Is All You Need: Understanding Transformers',
    description: 'A comprehensive exploration of the transformer architecture that revolutionized natural language processing. This paper introduces the attention mechanism and explains how it enables models like GPT and BERT to achieve state-of-the-art results.',
    url: 'https://arxiv.org/abs/1706.03762',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    author: 'Vaswani et al.',
    publishedAt: new Date('2024-01-10').toISOString(),
    wordCount: 12000,
    language: 'en',
    qualityScore: 0.98,
    popularityScore: 245.5,
  },
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-machine-learning',
    title: 'Neural Networks Explained: From Basics to Deep Learning',
    description: 'An intuitive introduction to neural networks covering perceptrons, backpropagation, and modern deep learning architectures. Perfect for beginners and intermediate learners.',
    url: 'https://youtube.com/watch?v=aircAruvnKk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    author: '3Blue1Brown',
    publishedAt: new Date('2024-01-15').toISOString(),
    duration: 1234,
    language: 'en',
    qualityScore: 0.95,
    popularityScore: 189.3,
  },
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Towards Data Science',
    categoryId: 'cat-machine-learning',
    title: 'Understanding Large Language Models: A Practical Guide',
    description: 'Explore how large language models like GPT-4 work, their training process, and practical applications in real-world scenarios. Includes code examples and best practices.',
    url: 'https://towardsdatascience.com/llm-guide',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=800',
    author: 'Andrew Chen',
    publishedAt: new Date('2024-01-20').toISOString(),
    wordCount: 3500,
    language: 'en',
    qualityScore: 0.89,
    popularityScore: 156.7,
  },

  // Web Development
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Smashing Magazine',
    categoryId: 'cat-web-dev',
    title: 'React Server Components: A Deep Dive',
    description: 'Learn about React Server Components and how they enable zero-bundle-size React components. Understand the benefits and trade-offs of this new paradigm.',
    url: 'https://www.smashingmagazine.com/react-server-components/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    author: 'Sarah Drasner',
    publishedAt: new Date('2024-01-18').toISOString(),
    wordCount: 4200,
    language: 'en',
    qualityScore: 0.92,
    popularityScore: 178.2,
  },
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-web-dev',
    title: 'Next.js 14 Complete Tutorial: App Router and Server Actions',
    description: 'Master the latest Next.js features including the App Router, Server Actions, and streaming. Build a full-stack application from scratch.',
    url: 'https://youtube.com/nextjs-14-tutorial',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?w=800',
    author: 'Fireship',
    publishedAt: new Date('2024-01-12').toISOString(),
    duration: 1845,
    language: 'en',
    qualityScore: 0.94,
    popularityScore: 203.4,
  },
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'CSS-Tricks',
    categoryId: 'cat-web-dev',
    title: 'Modern CSS Layouts: Grid and Flexbox Mastery',
    description: 'Learn advanced CSS Grid and Flexbox techniques to create responsive layouts. Includes practical examples and common patterns.',
    url: 'https://css-tricks.com/modern-layouts/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    author: 'Una Kravets',
    publishedAt: new Date('2024-01-22').toISOString(),
    wordCount: 2800,
    language: 'en',
    qualityScore: 0.87,
    popularityScore: 134.5,
  },

  // Data Science
  {
    id: randomUUID(),
    contentType: 'paper',
    source: 'Journal of Machine Learning Research',
    categoryId: 'cat-data-science',
    title: 'Deep Learning for Time Series Forecasting',
    description: 'A comprehensive survey of deep learning methods for time series prediction, comparing LSTM, GRU, and Transformer approaches.',
    url: 'https://jmlr.org/papers/time-series',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    author: 'Li Zhang et al.',
    publishedAt: new Date('2024-01-08').toISOString(),
    wordCount: 15000,
    language: 'en',
    qualityScore: 0.96,
    popularityScore: 167.8,
  },
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-data-science',
    title: 'Data Visualization with Python: Matplotlib and Seaborn',
    description: 'Learn to create stunning data visualizations using Python. Covers matplotlib, seaborn, and plotly with real-world datasets.',
    url: 'https://youtube.com/data-viz-python',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=800',
    author: 'Corey Schafer',
    publishedAt: new Date('2024-01-14').toISOString(),
    duration: 2100,
    language: 'en',
    qualityScore: 0.91,
    popularityScore: 145.2,
  },
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Kaggle',
    categoryId: 'cat-data-science',
    title: 'Feature Engineering: Advanced Techniques for ML',
    description: 'Master feature engineering with practical examples. Learn encoding, scaling, and creating features that improve model performance.',
    url: 'https://kaggle.com/feature-engineering',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    author: 'Rachael Tatman',
    publishedAt: new Date('2024-01-19').toISOString(),
    wordCount: 3200,
    language: 'en',
    qualityScore: 0.88,
    popularityScore: 142.6,
  },

  // Cybersecurity
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Krebs on Security',
    categoryId: 'cat-security',
    title: 'Understanding Zero Trust Architecture',
    description: 'A comprehensive guide to implementing zero trust security in modern organizations. Covers identity verification, least privilege access, and micro-segmentation.',
    url: 'https://krebsonsecurity.com/zero-trust/',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
    author: 'Brian Krebs',
    publishedAt: new Date('2024-01-17').toISOString(),
    wordCount: 4500,
    language: 'en',
    qualityScore: 0.93,
    popularityScore: 187.4,
  },
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-security',
    title: 'Ethical Hacking: Complete Penetration Testing Course',
    description: 'Learn ethical hacking and penetration testing from scratch. Covers reconnaissance, exploitation, and responsible disclosure.',
    url: 'https://youtube.com/ethical-hacking',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    author: 'NetworkChuck',
    publishedAt: new Date('2024-01-11').toISOString(),
    duration: 3600,
    language: 'en',
    qualityScore: 0.90,
    popularityScore: 198.9,
  },
  {
    id: randomUUID(),
    contentType: 'paper',
    source: 'ACM CCS',
    categoryId: 'cat-security',
    title: 'Modern Cryptography: Post-Quantum Algorithms',
    description: 'An analysis of post-quantum cryptographic algorithms designed to resist attacks from quantum computers. Discusses NIST standards and implementation considerations.',
    url: 'https://dl.acm.org/post-quantum-crypto',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800',
    author: 'Maria Santos et al.',
    publishedAt: new Date('2024-01-09').toISOString(),
    wordCount: 11000,
    language: 'en',
    qualityScore: 0.97,
    popularityScore: 156.3,
  },

  // Cloud Computing
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'AWS Blog',
    categoryId: 'cat-cloud',
    title: 'Serverless Architecture Patterns on AWS',
    description: 'Explore proven serverless architecture patterns using AWS Lambda, API Gateway, and DynamoDB. Includes cost optimization strategies.',
    url: 'https://aws.amazon.com/blogs/serverless-patterns',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    author: 'AWS Architecture Team',
    publishedAt: new Date('2024-01-21').toISOString(),
    wordCount: 3800,
    language: 'en',
    qualityScore: 0.91,
    popularityScore: 173.8,
  },
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-cloud',
    title: 'Kubernetes Crash Course: Complete DevOps Guide',
    description: 'Learn Kubernetes from basics to advanced topics. Covers pods, services, deployments, and real-world production scenarios.',
    url: 'https://youtube.com/kubernetes-course',
    thumbnailUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
    author: 'TechWorld with Nana',
    publishedAt: new Date('2024-01-13').toISOString(),
    duration: 4200,
    language: 'en',
    qualityScore: 0.95,
    popularityScore: 234.7,
  },
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Google Cloud Blog',
    categoryId: 'cat-cloud',
    title: 'Multi-Cloud Strategy: Best Practices and Pitfalls',
    description: 'Navigate the complexities of multi-cloud deployments. Learn when to use multiple cloud providers and how to manage hybrid infrastructure.',
    url: 'https://cloud.google.com/blog/multi-cloud',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
    author: 'Kelsey Hightower',
    publishedAt: new Date('2024-01-16').toISOString(),
    wordCount: 4100,
    language: 'en',
    qualityScore: 0.89,
    popularityScore: 162.4,
  },

  // Mobile Development
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-mobile',
    title: 'React Native vs Flutter: Complete Comparison 2024',
    description: 'An in-depth comparison of React Native and Flutter for cross-platform mobile development. Covers performance, developer experience, and ecosystem.',
    url: 'https://youtube.com/rn-vs-flutter',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    author: 'Academind',
    publishedAt: new Date('2024-01-20').toISOString(),
    duration: 1680,
    language: 'en',
    qualityScore: 0.92,
    popularityScore: 176.5,
  },
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Ray Wenderlich',
    categoryId: 'cat-mobile',
    title: 'SwiftUI: Building Modern iOS Apps',
    description: 'Master SwiftUI with practical examples. Learn to build beautiful iOS apps using Apple\'s declarative framework.',
    url: 'https://raywenderlich.com/swiftui-guide',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
    author: 'Ray Wenderlich',
    publishedAt: new Date('2024-01-18').toISOString(),
    wordCount: 5200,
    language: 'en',
    qualityScore: 0.94,
    popularityScore: 168.9,
  },
  {
    id: randomUUID(),
    contentType: 'article',
    source: 'Android Developers',
    categoryId: 'cat-mobile',
    title: 'Jetpack Compose: Modern Android UI Development',
    description: 'Learn Android\'s modern toolkit for building native UI. Covers state management, navigation, and material design.',
    url: 'https://developer.android.com/jetpack/compose',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800',
    author: 'Android Dev Relations',
    publishedAt: new Date('2024-01-14').toISOString(),
    wordCount: 4600,
    language: 'en',
    qualityScore: 0.93,
    popularityScore: 185.2,
  },

  // Additional diverse content
  {
    id: randomUUID(),
    contentType: 'paper',
    source: 'IEEE',
    categoryId: 'cat-web-dev',
    title: 'Web Performance Optimization: A Systematic Approach',
    description: 'Research on web performance metrics, optimization techniques, and their impact on user experience. Includes case studies from major platforms.',
    url: 'https://ieeexplore.ieee.org/web-performance',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    author: 'Chen Wei et al.',
    publishedAt: new Date('2024-01-07').toISOString(),
    wordCount: 9500,
    language: 'en',
    qualityScore: 0.90,
    popularityScore: 138.7,
  },
  {
    id: randomUUID(),
    contentType: 'video',
    source: 'YouTube',
    categoryId: 'cat-data-science',
    title: 'SQL for Data Analysis: Advanced Techniques',
    description: 'Master advanced SQL for data analysis. Covers window functions, CTEs, and query optimization for large datasets.',
    url: 'https://youtube.com/sql-advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
    author: 'Alex the Analyst',
    publishedAt: new Date('2024-01-10').toISOString(),
    duration: 1920,
    language: 'en',
    qualityScore: 0.88,
    popularityScore: 152.3,
  },
];

try {
  console.log(`Inserting ${sampleContent.length} content items...\n`);

  const stmt = db.prepare(`
    INSERT INTO content (
      id, content_type, source, category_id, title, description,
      url, thumbnail_url, author, published_at, duration, word_count,
      language, quality_score, popularity_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(
        item.id,
        item.contentType,
        item.source,
        item.categoryId,
        item.title,
        item.description,
        item.url,
        item.thumbnailUrl,
        item.author,
        item.publishedAt,
        item.duration || null,
        item.wordCount || null,
        item.language,
        item.qualityScore,
        item.popularityScore
      );
    }
  });

  insertMany(sampleContent);

  console.log('✅ Sample content seeded successfully!\n');

  // Show summary
  const summary = db.prepare(`
    SELECT
      c.name as category,
      co.content_type as type,
      COUNT(*) as count
    FROM content co
    JOIN categories c ON co.category_id = c.id
    GROUP BY c.name, co.content_type
    ORDER BY c.name, co.content_type
  `).all();

  console.log('📊 Content Summary:\n');
  summary.forEach(row => {
    console.log(`   ${row.category} - ${row.type}: ${row.count} items`);
  });

  const total = db.prepare('SELECT COUNT(*) as count FROM content').get();
  console.log(`\n   Total: ${total.count} content items\n`);

} catch (error) {
  console.error('❌ Error seeding content:', error);
  process.exit(1);
} finally {
  db.close();
}
