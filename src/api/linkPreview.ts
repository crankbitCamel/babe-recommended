/**
 * Link-Import: Produktdetails aus einer Shop-Seite lesen.
 *
 * Die App lädt die Seite und liest die Open-Graph-/Meta-Tags aus, die
 * praktisch jeder Shop pflegt (og:title, og:image, Preis). Läuft direkt
 * in der nativen App (React Native kennt kein CORS) — kein Server nötig.
 * In der Web-Vorschau ist externes Laden blockiert; dort greift der Fallback.
 */

export interface LinkPreview {
  title?: string;
  imageUrl?: string;
  siteName?: string;
  price?: string;
}

export function looksLikeUrl(text: string): boolean {
  const t = text.trim();
  return /^https?:\/\/\S+$/i.test(t) || /^[\w-]+(\.[\w-]+)+\/?\S*$/i.test(t);
}

export function normalizeUrl(text: string): string {
  const t = text.trim();
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function metaContent(html: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1].trim());
  }
  return undefined;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

const META = (property: string) => [
  new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  ),
  new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  ),
];

export async function fetchLinkPreview(
  url: string
): Promise<LinkPreview | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/html' },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    // Nur den Kopf der Seite lesen — Meta-Tags stehen im <head>
    const html = (await res.text()).slice(0, 200_000);

    const title =
      metaContent(html, META('og:title')) ??
      metaContent(html, [/<title[^>]*>([^<]+)<\/title>/i]);
    const imageUrl = metaContent(html, META('og:image'));
    const siteName = metaContent(html, META('og:site_name'));
    const amount = metaContent(html, [
      ...META('product:price:amount'),
      ...META('og:price:amount'),
      /"price"\s*:\s*"?(\d+[.,]\d{2})"?/i,
    ]);

    if (!title) return null;
    return {
      title,
      imageUrl,
      siteName,
      price: amount ? `${amount.replace('.', ',')} €` : undefined,
    };
  } catch {
    return null;
  }
}
