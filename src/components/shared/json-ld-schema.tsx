import type { Organization, WithContext } from "schema-dts";
import { getServerPublicSettings } from "@/lib/server/settings";

const SITE_URL = "https://www.dresspalli.com";

export async function OrganizationSchema() {
  const settings = await getServerPublicSettings();

  if (!settings) return null;

  const schema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.title,
    description: settings.description,
    url: SITE_URL,
    logo: settings.logo,
    image: settings.logo,
    email: settings.email,
    telephone: settings.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "BD",
    },
    sameAs: [settings.facebook, settings.instagram].filter(Boolean) as string[],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function WebSiteSchema() {
  const settings = await getServerPublicSettings();

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.title || "Dress Palli",
    description:
      settings?.description ||
      "Dress Palli is an online platform for buying and selling dresses for all occasions",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
