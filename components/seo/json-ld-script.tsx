/** Injects `<script type="application/ld+json">` safely for structured data (schema.org). */
export function JsonLdScript({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is static per request; hydration mismatch is suppressed.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
