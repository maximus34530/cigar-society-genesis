import { Helmet } from "react-helmet-async";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

export type SeoProps = {
  title: string;
  description: string;
  /** Route path, e.g. `/contact` or `/` */
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
};

export const Seo = ({
  title,
  description,
  path = "/",
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
}: SeoProps) => {
  const canonical = absoluteUrl(path);
  const pageTitle = title.includes("Cigar Society") ? title : `${title} | Cigar Society`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Cigar Society — premium cigar lounge" />
      <meta property="og:site_name" content="Cigar Society" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
    </Helmet>
  );
};
