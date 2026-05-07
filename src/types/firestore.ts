import type { Timestamp } from 'firebase/firestore';

export type NewsItem = {
  imageUrl: string;
  title: string;
  summary: string;
  source: string;
  url: string;
};

export type DeepRead = {
  title: string;
  author: string;
  url: string;
  readingTime: string;
  summary: string;
};

export type Briefing = {
  date: string;
  news: NewsItem[];
  deepRead: DeepRead;
  generatedAt: Timestamp;
};

export type RustTaskFormatType =
  | 'patron'
  | 'teoria'
  | 'aplicacion_real'
  | 'caso_real'
  | 'ecosistema';

export type ItemStatus = 'pending' | 'read';

export type RustTask = {
  id: string;
  date: string;
  formatType: RustTaskFormatType;
  title: string;
  content: string;
  codeSnippet: string | null;
  sources: string[];
  status: ItemStatus;
  readAt: Timestamp | null;
  createdAt: Timestamp;
};

export type RustReading = {
  id: string;
  date: string;
  title: string;
  content: string;
  sources: string[];
  status: ItemStatus;
  readAt: Timestamp | null;
  createdAt: Timestamp;
};

export type BriefingWithId = Briefing;

export type FlatNewsItem = NewsItem & {
  briefingDate: string;
  indexInBriefing: number;
};

export type AgentItemType = 'news' | 'changelog' | 'pattern';

export type AgentItem = {
  id: string;
  date: string;
  agentName: string;
  type: AgentItemType;
  title: string;
  content: string;
  codeSnippet: string | null;
  version: string | null;
  sources: string[];
  status: ItemStatus;
  readAt: Timestamp | null;
  createdAt: Timestamp;
};

export type BusinessIdea = {
  id: string;
  date: string;
  title: string;
  worldContext: string;
  problem: string;
  solution: string;
  market: string;
  sources: string[];
  createdAt: Timestamp;
};

export type AiTipCategory =
  | 'productividad'
  | 'escritura'
  | 'estudio'
  | 'trabajo'
  | 'vida_diaria'
  | 'investigacion';

export type ArticleCategory =
  | 'mvp'
  | 'automatizacion'
  | 'contratacion'
  | 'ia-aplicada'
  | 'estrategia'
  | 'craft'
  | 'cultura';

export type ArticleRelatedService =
  | 'diagnostico'
  | 'mvp'
  | 'automatizacion-ia'
  | null;

export type ArticleTarget =
  | 'founders_pymes'
  | 'emprendedores'
  | 'trabajadores'
  | 'freelancers'
  | 'personas_general'
  | 'estudiantes'
  | 'developers';

export type StructuredDataType =
  | 'BlogPosting'
  | 'TechArticle'
  | 'OpinionPiece'
  | 'NewsArticle';

export type CrawlPolicy = 'index' | 'noindex';
export type AiCrawlPolicy = 'allow' | 'disallow';
export type TwitterCardType = 'summary' | 'summary_large_image';

export type Article = {
  // Core
  slug: string;
  title: string;
  metaDescription: string;
  ogImage: string | null;
  content: string;
  category: ArticleCategory;
  target: ArticleTarget;
  keywords: string[];
  publishedAt: Timestamp;
  updatedAt: Timestamp;
  author: string;
  readingTime: string;
  relatedServiceId: ArticleRelatedService;
  published: boolean;

  // SEO core
  focusKeyword: string;
  seoTitle: string | null;

  // Open Graph / social
  ogTitle: string | null;
  ogDescription: string | null;
  twitterCard: TwitterCardType | null;

  // Schema.org
  structuredDataType: StructuredDataType;

  // Crawler diplomacy
  crawlPolicy: CrawlPolicy;
  aiCrawlPolicy: AiCrawlPolicy;

  // Internal discovery
  internalTags: string[];
  relatedSlugs: string[];
  searchTokens: string[];

  // Content management
  contentHash: string;
  contentVersion: number;
};

export type AiTip = {
  id: string;
  date: string;
  title: string;
  content: string;
  toolName: string;
  category: AiTipCategory;
  sources: string[];
  status: ItemStatus;
  readAt: Timestamp | null;
  createdAt: Timestamp;
};
