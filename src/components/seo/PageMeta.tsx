import { Helmet } from 'react-helmet-async';

type Props = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
};

const BASE_TITLE = 'Dev Stash';
const BASE_DESC =
  'Tendencias de IA, oportunidades de negocio y señales de automatización — curadas a diario para founders y PyMEs.';

export function PageMeta({ title, description, ogImage, canonical }: Props) {
  const fullTitle = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
  const desc = description ?? BASE_DESC;
  const og = ogImage ?? '/og-image.png';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={og} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
}
