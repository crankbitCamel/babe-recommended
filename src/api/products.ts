import { Category } from '../types';

/**
 * Produktsuche & Barcode-Lookup über Open Beauty Facts (Kosmetik/Pflege),
 * Open Food Facts (Lebensmittel) und Google Books (Bücher via ISBN) —
 * alles kostenlos, ohne API-Key.
 */

export interface ProductHit {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  barcode?: string;
  suggestedCategory: Category;
  source: 'beauty' | 'food' | 'book';
}

export const SOURCE_EMOJI: Record<ProductHit['source'], string> = {
  beauty: '🧴',
  food: '🍓',
  book: '📚',
};

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

interface GoogleBooksResponse {
  items?: {
    id?: string;
    volumeInfo?: {
      title?: string;
      authors?: string[];
      imageLinks?: { thumbnail?: string; smallThumbnail?: string };
      industryIdentifiers?: { type?: string; identifier?: string }[];
    };
  }[];
}

function bookToHit(
  item: NonNullable<GoogleBooksResponse['items']>[number],
  index: number
): ProductHit | null {
  const info = item.volumeInfo;
  const title = info?.title?.trim();
  if (!title) return null;
  const isbn = info?.industryIdentifiers?.find((i) =>
    i.type?.startsWith('ISBN')
  )?.identifier;
  return {
    id: `book-${item.id ?? index}`,
    name: title,
    brand: info?.authors?.[0],
    imageUrl:
      info?.imageLinks?.thumbnail?.replace('http://', 'https://') ||
      info?.imageLinks?.smallThumbnail?.replace('http://', 'https://'),
    barcode: isbn,
    suggestedCategory: 'Bücher',
    source: 'book',
  };
}

interface OpenLibraryResponse {
  docs?: {
    title?: string;
    author_name?: string[];
    cover_i?: number;
    isbn?: string[];
  }[];
}

function openLibraryToHit(
  doc: NonNullable<OpenLibraryResponse['docs']>[number],
  index: number,
  isbn?: string
): ProductHit | null {
  if (!doc.title) return null;
  return {
    id: `book-ol-${doc.cover_i ?? index}`,
    name: doc.title,
    brand: doc.author_name?.[0],
    imageUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : undefined,
    barcode: isbn ?? doc.isbn?.[0],
    suggestedCategory: 'Bücher',
    source: 'book',
  };
}

async function openLibrarySearch(
  query: string,
  limit: number
): Promise<ProductHit[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    query
  )}&fields=title,author_name,cover_i,isbn&limit=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as OpenLibraryResponse;
    return (data.docs ?? [])
      .map((doc, i) => openLibraryToHit(doc, i))
      .filter((h): h is ProductHit => h !== null);
  } catch {
    return [];
  }
}

async function googleBooks(query: string, max: number): Promise<ProductHit[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&maxResults=${max}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as GoogleBooksResponse;
    return (data.items ?? [])
      .map((item, i) => bookToHit(item, i))
      .filter((h): h is ProductHit => h !== null);
  } catch {
    return [];
  }
}

/** Buchsuche: Open Library zuerst (keine Quota), Google Books als Fallback. */
async function searchBooks(query: string): Promise<ProductHit[]> {
  const openLibrary = await openLibrarySearch(query, 5);
  if (openLibrary.length > 0) return openLibrary;
  return googleBooks(query, 5);
}

/** ISBN-Lookup für Bücher (ISBN-10 und ISBN-13). */
export async function lookupIsbn(isbn: string): Promise<ProductHit | null> {
  const openLibrary = await openLibrarySearch(`isbn:${isbn}`, 1);
  if (openLibrary[0]) return { ...openLibrary[0], barcode: isbn };
  const google = await googleBooks(`isbn:${isbn}`, 1);
  return google[0] ? { ...google[0], barcode: isbn } : null;
}

/** Textsuche in allen Datenbanken parallel; Beauty-Treffer zuerst. */
export async function searchProducts(query: string): Promise<ProductHit[]> {
  const [beauty, food, books] = await Promise.all([
    searchOne('world.openbeautyfacts.org', 'beauty', query),
    searchOne('world.openfoodfacts.org', 'food', query),
    searchBooks(query),
  ]);
  return [...beauty, ...food, ...books].slice(0, 15);
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

/**
 * Barcode-Lookup. ISBN-Barcodes (EAN-13 mit Präfix 978/979) sind Bücher —
 * die werden zuerst bei Google Books nachgeschlagen; alles andere läuft
 * über Kosmetik- und Lebensmittel-Datenbank, mit Buch-Fallback.
 */
export async function lookupBarcode(
  barcode: string
): Promise<ProductHit | null> {
  const isIsbn = /^97[89]\d{10}$/.test(barcode) || /^\d{9}[\dX]$/.test(barcode);
  if (isIsbn) {
    const book = await lookupIsbn(barcode);
    if (book) return book;
  }
  return (
    (await lookupOne('world.openbeautyfacts.org', 'beauty', barcode)) ??
    (await lookupOne('world.openfoodfacts.org', 'food', barcode)) ??
    // Open Products Facts: Schwester-Datenbank für alles andere
    (await lookupOne('world.openproductsfacts.org', 'beauty', barcode)) ??
    (isIsbn ? null : await lookupIsbn(barcode))
  );
}
