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
