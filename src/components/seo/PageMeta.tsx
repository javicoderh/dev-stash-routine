import { Helmet } from 'react-helmet-async';
import type {
  AiCrawlPolicy,
  CrawlPolicy,
  StructuredDataType,
  TwitterCardType,
} from '@/types/firestore';

type ArticleSchema = {
  headline: string;
  description: string;
  image: string | null;
  datePublished: string;
  dateModified: string;
  author: string;
  keywords?: string[];
};

type Props = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;

  ogTitle?: string | null;
  ogDescription?: string | null;
  twitterCard?: TwitterCardType | null;

  structuredDataType?: StructuredDataType;

  crawlPolicy?: CrawlPolicy;
  aiCrawlPolicy?: AiCrawlPolicy;

  article?: ArticleSchema;
};

const BASE_TITLE = 'Dev Stash';
const BASE_DESC =
  'Tendencias de IA, oportunidades de negocio y señales de automatización — curadas a diario para founders y PyMEs.';
const SITE_URL = 'https://dev-stash-f308c.web.app';
const PUBLISHER_NAME = 'Dev Stash';
const PUBLISHER_LOGO = `${SITE_URL}/og-image.png`;

const AI_BOTS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot'];

export function PageMeta({
  title,
  description,
  ogImage,
  canonical,
  ogTitle,
  ogDescription,
  twitterCard,
  structuredDataType = 'BlogPosting',
  crawlPolicy = 'index',
  aiCrawlPolicy = 'allow',
  article,
}: Props) {
  const fullTitle = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
  const desc = description ?? BASE_DESC;
  const og = ogImage ?? '/og-image.png';

  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || desc;
  const finalTwitterCard = twitterCard || 'summary_large_image';
  const aiBotDirective = aiCrawlPolicy === 'allow' ? 'index' : 'noindex';

  let jsonLd: Record<string, unknown> | null = null;
  if (article) {
    jsonLd = {
      '@context': 'https://schema.org',
      '@type': structuredDataType,
      headline: article.headline,
      description: article.description,
      image: article.image ?? PUBLISHER_LOGO,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      author: { '@type': 'Person', name: article.author },
      publisher: {
        '@type': 'Organization',
        name: PUBLISHER_NAME,
        logo: { '@type': 'ImageObject', url: PUBLISHER_LOGO },
      },
      mainEntityOfPage: canonical ?? SITE_URL,
      ...(article.keywords?.length ? { keywords: article.keywords.join(', ') } : {}),
    };
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={og} />
      <meta property="og:type" content={article ? 'article' : 'website'} />

      <meta name="twitter:card" content={finalTwitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={og} />

      {canonical && <link rel="canonical" href={canonical} />}

      <meta name="robots" content={crawlPolicy} />
      {AI_BOTS.map((bot) => (
        <meta key={bot} name={bot} content={aiBotDirective} />
      ))}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
