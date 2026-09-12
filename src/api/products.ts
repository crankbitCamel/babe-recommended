import { Category } from '../types';

/**
 * Produktsuche & Barcode-Lookup über Open Beauty Facts (Kosmetik/Pflege)
 * und Open Food Facts (Lebensmittel) — kostenlos, ohne API-Key.
 */

export interface ProductHit {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  barcode?: string;
  suggestedCategory: Category;
  source: 'beauty' | 'food';
}

const SEARCH_FIELDS = 'code,product_name,brands,image_front_small_url';
const PRODUCT_FIELDS = 'code,product_name,brands,image_front_url';

interface OffSearchResponse {
  products?: OffProduct[];
}

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  image_front_url?: string;
}

interface OffProductResponse {
  status?: number;
  product?: OffProduct;
}

function toHit(
  p: OffProduct,
  source: 'beauty' | 'food',
  index: number
): ProductHit | null {
  const name = p.product_name?.trim();
  if (!name) return null;
  return {
    id: `${source}-${p.code ?? index}`,
    name,
    brand: p.brands?.split(',')[0]?.trim() || undefined,
    imageUrl: p.image_front_small_url || p.image_front_url || undefined,
    barcode: p.code,
    suggestedCategory: source === 'beauty' ? 'Skincare' : 'Lebensmittel',
    source,
  };
}

async function searchOne(
  host: string,
  source: 'beauty' | 'food',
  query: string
): Promise<ProductHit[]> {
  const url =
    `https://${host}/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=8&fields=${SEARCH_FIELDS}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as OffSearchResponse;
    return (data.products ?? [])
      .map((p, i) => toHit(p, source, i))
      .filter((h): h is ProductHit => h !== null);
  } catch {
    return [];
  }
}

/** Textsuche in beiden Datenbanken parallel; Beauty-Treffer zuerst. */
export async function searchProducts(query: string): Promise<ProductHit[]> {
  const [beauty, food] = await Promise.all([
    searchOne('world.openbeautyfacts.org', 'beauty', query),
    searchOne('world.openfoodfacts.org', 'food', query),
  ]);
  return [...beauty, ...food].slice(0, 12);
}

async function lookupOne(
  host: string,
  source: 'beauty' | 'food',
  barcode: string
): Promise<ProductHit | null> {
  const url = `https://${host}/api/v2/product/${encodeURIComponent(
    barcode
  )}.json?fields=${PRODUCT_FIELDS}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as OffProductResponse;
    if (data.status !== 1 || !data.product) return null;
    return toHit(data.product, source, 0);
  } catch {
    return null;
  }
}

/** Barcode-Lookup: erst Kosmetik-Datenbank, dann Lebensmittel. */
export async function lookupBarcode(
  barcode: string
): Promise<ProductHit | null> {
  return (
    (await lookupOne('world.openbeautyfacts.org', 'beauty', barcode)) ??
    (await lookupOne('world.openfoodfacts.org', 'food', barcode))
  );
}
