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
