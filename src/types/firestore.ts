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

export type ArticleRating = 1 | 2 | 3 | 4 | 5;

export type CrmPageType = 'home' | 'blog_archive' | 'blog_post' | 'services' | 'login' | 'other';

export type CrmEventType =
  | 'page_view'
  | 'article_view'
  | 'article_card_click'
  | 'article_rating'
  | 'article_active_time_flush'
  | 'article_scroll_depth_update'
  | 'cta_click'
  | 'email_capture_click'
  | 'email_capture_submit'
  | 'services_page_view';

export type LeadLifecycleStage = 'cold' | 'aware' | 'engaged' | 'warm' | 'hot';

export type CrmJourneyOutcome =
  | 'solo_lectura'
  | 'exploracion'
  | 'intencion'
  | 'salto_a_servicios';

export type CrmSegmentId =
  | 'scanner'
  | 'reader'
  | 'engaged_reader'
  | 'high_intent_reader'
  | 'topic_clustered'
  | 'returning_evaluator'
  | 'warm_lead'
  | 'hot_lead';

export type ArticleEngagement = {
  id: string;
  visitorId: string;
  articleSlug: string;
  sessionId: string;
  viewCount: number;
  activeSeconds: number;
  rating: ArticleRating | null;
  ratedAt: Timestamp | null;
  firstViewedAt: Timestamp;
  lastViewedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  maxScrollDepth?: number;
  ctaClicks?: number;
  cardClicks?: number;
  lastCardClickSource?: string | null;
  lastCardClickedAt?: Timestamp | null;
  lastCtaServiceId?: ArticleRelatedService;
  lastCtaClickedAt?: Timestamp | null;
  source?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  email?: string | null;
};

export type CrmEvent = {
  eventId: string;
  eventType: CrmEventType;
  visitorId: string;
  sessionId: string;
  articleSlug?: string | null;
  pagePath: string;
  pageType: CrmPageType;
  source?: string | null;
  componentId?: string | null;
  relatedServiceId?: ArticleRelatedService;
  value?: number | null;
  occurredAt: Timestamp;
};

export type LeadProfile = {
  id: string;
  visitorId: string;
  email: string | null;
  firstSeenAt: Timestamp;
  lastSeenAt: Timestamp;
  visitCount: number;
  sessionCount: number;
  totalActiveSeconds: number;
  articlesReadCount: number;
  ctaClicks: number;
  avgRatingGiven: number | null;
  strongestTopicAffinity: string | null;
  strongestCommercialIntent: string | null;
  leadScore: number;
  lifecycleStage: LeadLifecycleStage;
};

export type JourneySummary = {
  id: string;
  visitorId: string;
  sessionId: string;
  landingPath: string;
  articleSlugs: string[];
  pagesVisited: string[];
  ctaClicks: number;
  servicesTouched: string[];
  startedAt: Timestamp;
  endedAt: Timestamp;
};
