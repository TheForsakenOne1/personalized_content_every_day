"use client";

import { use, useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PaperView, PaperData } from "@/components/content/paper-view";
import { ArticleView, ArticleData } from "@/components/content/article-view";
import { VideoView, VideoData } from "@/components/content/video-view";
import { toast } from "sonner";
import { notFound } from "next/navigation";

// Mock data - In production, this would come from your API
const mockContent: Record<string, PaperData | ArticleData | VideoData> = {
  "1": {
    id: "1",
    title: "The James Webb Space Telescope: First Year Discoveries",
    channel: "NASA",
    publishedDate: "2024-01-20",
    duration: 1200,
    description:
      "An in-depth analysis of the groundbreaking discoveries made by JWST in its first year of operation.\n\nThe James Webb Space Telescope has revolutionized our understanding of the universe. In this comprehensive video, we explore:\n\n• The deepest images of the universe ever captured\n• New insights into exoplanet atmospheres\n• Observations of the earliest galaxies\n• Studies of star formation in unprecedented detail\n\nJoin us as we journey through the cosmos and discover what JWST has revealed about our universe.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
    tags: ["space", "telescope", "exoplanets", "astronomy"],
    transcript:
      "Welcome to our exploration of the James Webb Space Telescope's first year discoveries.\n\nThe JWST has exceeded all expectations, providing us with the deepest and most detailed images of the universe ever captured...\n\n[Full transcript would be much longer in production]",
    relatedVideos: [
      {
        id: "5",
        title: "Climate Change Impact on Ocean Currents",
        channel: "National Geographic",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        duration: 900,
      },
    ],
  } as VideoData,
  "2": {
    id: "2",
    title: "Understanding the Russia-Ukraine Conflict: A Geopolitical Analysis",
    author: "Prof. Michael Cohen",
    source: "Foreign Affairs",
    publishedDate: "2024-01-18",
    featuredImage:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    content:
      "<p>The ongoing conflict between Russia and Ukraine represents one of the most significant geopolitical challenges of the 21st century. This comprehensive analysis examines the historical, economic, and strategic factors that have shaped this crisis.</p>\n\n<h3>Historical Context</h3>\n<p>The roots of the current conflict can be traced back centuries, but the modern tensions emerged following the dissolution of the Soviet Union in 1991. Ukraine's independence and its subsequent movement towards Western integration have been sources of friction with Russia.</p>\n\n<h3>Economic Dimensions</h3>\n<p>Energy resources, particularly natural gas, play a crucial role in the conflict dynamics. Ukraine serves as a key transit route for Russian gas exports to Europe, creating complex interdependencies.</p>\n\n<h3>Strategic Considerations</h3>\n<p>NATO expansion and the strategic importance of the Black Sea region are central to understanding Russia's actions and the West's responses.</p>\n\n<h3>Implications for Global Security</h3>\n<p>The conflict has far-reaching implications for international security architecture, nuclear non-proliferation, and the rules-based international order.</p>",
    excerpt:
      "Comprehensive analysis of the historical, economic, and strategic factors driving the ongoing conflict between Russia and Ukraine, with implications for global security.",
    readTime: 12,
    tags: ["conflict", "international-relations", "security", "geopolitics"],
    externalUrl: "https://example.com/geopolitical-analysis",
    relatedArticles: [
      {
        id: "4",
        title: "React 19: What's New in the Latest Release",
        source: "React Blog",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      },
    ],
  } as ArticleData,
  "3": {
    id: "3",
    title: "The Fall of Constantinople: Reassessing Historical Evidence",
    authors: ["Dr. Elena Papadopoulos", "Prof. James Chen"],
    abstract:
      "This paper presents a comprehensive reassessment of the siege and fall of Constantinople in 1453, incorporating recent archaeological findings and newly translated Ottoman documents. Our analysis challenges several long-held assumptions about the siege tactics, the role of artillery, and the final assault on the city walls. Through a combination of archaeological evidence, including recently excavated fortification remnants, and Ottoman administrative records that have only recently been made accessible, we provide new insights into one of history's most pivotal events. The findings suggest that the siege was more complex than traditionally portrayed, with significant implications for our understanding of late medieval warfare and the transition from the Byzantine to the Ottoman Empire.",
    publishedDate: "2024-01-16",
    journal: "Journal of Medieval History",
    doi: "10.1234/jmh.2024.001",
    pdfUrl: "https://example.com/constantinople-fall.pdf",
    citationCount: 47,
    tags: ["medieval", "byzantium", "archaeology", "ottoman-empire"],
    relatedPapers: [
      {
        id: "6",
        title: "Artificial Neural Networks in Medical Diagnosis: A Survey",
        authors: ["Dr. Priya Sharma", "Dr. Robert Lee"],
      },
      {
        id: "quantum-1",
        title:
          "Recent Advances in Byzantine Fortification Architecture: A Comparative Study",
        authors: ["Dr. Thomas Anderson", "Dr. Maria Kowalski"],
      },
    ],
  } as PaperData,
  "4": {
    id: "4",
    title: "React 19: What's New in the Latest Release",
    author: "React Team",
    source: "React Blog",
    publishedDate: "2024-01-19",
    featuredImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    content:
      "<p>React 19 brings exciting new features and improvements that will enhance your development experience and application performance.</p>\n\n<h3>Enhanced Concurrent Rendering</h3>\n<p>React 19 improves concurrent rendering capabilities, making your applications more responsive and smooth. The new architecture allows for better prioritization of updates and more efficient rendering.</p>\n\n<h3>Automatic Batching</h3>\n<p>Automatic batching is now extended to all updates, not just those inside event handlers. This means better performance out of the box with no changes to your code.</p>\n\n<h3>The New 'use' Hook</h3>\n<p>The new 'use' hook provides a unified way to work with promises and context, simplifying asynchronous data fetching patterns.</p>\n\n<code>const data = use(fetchData());</code>\n\n<h3>Server Components Improvements</h3>\n<p>Server Components are now stable and production-ready, offering significant performance benefits for data-heavy applications.</p>\n\n<h3>Migration Guide</h3>\n<p>Most applications can upgrade to React 19 with minimal changes. Check our migration guide for specific breaking changes and how to address them.</p>",
    excerpt:
      "Explore the new features and improvements in React 19, including enhanced concurrent rendering, automatic batching, and the new use hook.",
    readTime: 8,
    tags: ["react", "javascript", "web-development", "frontend"],
    externalUrl: "https://react.dev/blog",
    relatedArticles: [
      {
        id: "2",
        title: "Understanding the Russia-Ukraine Conflict: A Geopolitical Analysis",
        source: "Foreign Affairs",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
      },
    ],
  } as ArticleData,
  "5": {
    id: "5",
    title: "Climate Change Impact on Ocean Currents",
    channel: "National Geographic",
    publishedDate: "2024-01-17",
    duration: 900,
    description:
      "Scientists discuss how global warming is affecting major ocean currents like the Gulf Stream, with potential implications for weather patterns worldwide.\n\nKey topics covered:\n• The role of ocean currents in global climate regulation\n• Recent observations of current weakening\n• Potential tipping points and their consequences\n• What this means for coastal communities\n• Future projections and mitigation strategies",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    tags: ["climate", "oceanography", "environment", "science"],
    transcript:
      "Ocean currents are like the circulatory system of our planet, distributing heat and nutrients around the globe...\n\n[Full transcript would be much longer]",
    relatedVideos: [
      {
        id: "1",
        title: "The James Webb Space Telescope: First Year Discoveries",
        channel: "NASA",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
        duration: 1200,
      },
    ],
  } as VideoData,
  "6": {
    id: "6",
    title: "Artificial Neural Networks in Medical Diagnosis: A Survey",
    authors: ["Dr. Priya Sharma", "Dr. Robert Lee", "Dr. Chen Wei"],
    abstract:
      "This comprehensive survey reviews the application of artificial neural networks (ANNs) in medical diagnosis over the past decade. We examine the major architectures employed, including convolutional neural networks (CNNs) for medical imaging, recurrent neural networks (RNNs) for temporal health data, and transformer models for multi-modal medical data. The survey covers applications across various medical domains including radiology, pathology, cardiology, and oncology. We analyze the performance of these systems compared to human experts and discuss the challenges of clinical deployment, including interpretability, data privacy, and regulatory approval. Our meta-analysis of over 200 studies reveals that while ANNs can match or exceed human performance in specific tasks, significant challenges remain in generalization, bias mitigation, and clinical integration. We conclude with recommendations for future research directions and considerations for responsible AI development in healthcare.",
    publishedDate: "2024-01-14",
    journal: "Medical AI Journal",
    doi: "10.1234/maj.2024.005",
    pdfUrl: "https://example.com/medical-ai.pdf",
    citationCount: 156,
    tags: ["machine-learning", "healthcare", "ai", "deep-learning"],
    relatedPapers: [
      {
        id: "3",
        title: "The Fall of Constantinople: Reassessing Historical Evidence",
        authors: ["Dr. Elena Papadopoulos", "Prof. James Chen"],
      },
      {
        id: "ml-1",
        title:
          "Explainable AI in Clinical Decision Support: A Systematic Review",
        authors: ["Dr. Sarah Johnson", "Dr. Michael Brown"],
      },
    ],
  } as PaperData,
};

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const content = mockContent[id];

  const [isRead, setIsRead] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!content) {
    notFound();
  }

  const handleMarkAsRead = () => {
    setIsRead(true);
    toast.success("Marked as read!");
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from saved" : "Saved successfully!");
  };

  // Determine content type and render appropriate view
  const renderContent = () => {
    if ("authors" in content && "abstract" in content) {
      // Paper
      return (
        <PaperView
          paper={content}
          onMarkAsRead={handleMarkAsRead}
          onSave={handleSave}
          isRead={isRead}
          isSaved={isSaved}
        />
      );
    } else if ("channel" in content && "duration" in content) {
      // Video
      return (
        <VideoView
          video={content}
          onMarkAsRead={handleMarkAsRead}
          onSave={handleSave}
          isRead={isRead}
          isSaved={isSaved}
        />
      );
    } else {
      // Article
      return (
        <ArticleView
          article={content as ArticleData}
          onMarkAsRead={handleMarkAsRead}
          onSave={handleSave}
          isRead={isRead}
          isSaved={isSaved}
        />
      );
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="py-8">{renderContent()}</div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
