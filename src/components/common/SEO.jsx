import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Joy Spark Toys';
const SITE_URL = 'https://joysparktoys.in';
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;
const DEFAULT_DESCRIPTION =
  'Shop the best educational, fun & safe toys for kids online in India. Huge collection of toy cars, dolls, building blocks, board games & more with fast delivery across India.';
const DEFAULT_KEYWORDS =
  'buy toys online india, kids toys india, online toy store india, educational toys india, baby toys india, toy shop india, best toys for kids, joy spark toys, toys for children, safe toys india';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords,
  jsonLd,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Buy Kids Toys Online in India`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'} />
      <link rel="canonical" href={url} />
      <meta name="author" content={SITE_NAME} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (Array.isArray(jsonLd)
        ? jsonLd.map((ld, i) => <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>)
        : <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
