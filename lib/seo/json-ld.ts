import type { FaqPair } from "@/lib/marketing/faq-content";
import {
  SITE_BRAND_TITLE,
  SITE_DESCRIPTION_LONG,
  SITE_SHORT_NAME,
  absoluteUrl,
  getSiteOrigin,
} from "@/lib/seo/site";

type JsonLdThing = Record<string, unknown>;

export function buildOrganizationSchema(): JsonLdThing {
  const origin = getSiteOrigin();
  return {
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: SITE_SHORT_NAME,
    url: origin,
    logo: {
      "@type": "ImageObject",
      url: `${origin}/logo.svg`,
    },
    description: SITE_DESCRIPTION_LONG,
  };
}

export function buildWebSiteSchema(): JsonLdThing {
  const origin = getSiteOrigin();
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: SITE_BRAND_TITLE,
    alternateName: SITE_SHORT_NAME,
    url: origin,
    description: SITE_DESCRIPTION_LONG,
    publisher: { "@id": `${origin}/#organization` },
  };
}

export function buildSoftwareApplicationSchema(): JsonLdThing {
  const origin = getSiteOrigin();
  return {
    "@type": "SoftwareApplication",
    name: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION_LONG,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free trial with starter credits — see Pricing for paid plans.",
    },
  };
}

export function buildFaqPageSchema(items: readonly FaqPair[]): JsonLdThing {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Root graph: Organization + WebSite (global). */
export function buildSiteGraphLdJson(): string {
  const graph = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
  ] satisfies JsonLdThing[];
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
}

export function stringifyJsonLd(schema: JsonLdThing | JsonLdThing[]): string {
  if (Array.isArray(schema)) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": schema,
    });
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    ...schema,
  });
}
