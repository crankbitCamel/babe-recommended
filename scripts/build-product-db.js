/**
 * Import-Pipeline: baut eine kuratierte lokale Produktdatenbank aus den
 * offenen Datenbanken (Open Beauty Facts + Open Food Facts), sortiert
 * nach Beliebtheit (Scan-Häufigkeit). Nur Einträge mit Name UND Bild.
 *
 *   node scripts/build-product-db.js            -> je 250 Beauty/Food
 *   PRODUCTS_PER_SOURCE=2500 node scripts/...   -> skaliert bis 5000+
 *
 * Ergebnis: src/data/productDb.json — wird von der App für
 * Sofort-Suchvorschläge und Barcode-Lookups genutzt.
 */

const fs = require('fs');
const path = require('path');

const PER_SOURCE = parseInt(process.env.PRODUCTS_PER_SOURCE || '250', 10);
const PAGE_SIZE = 100;

const SOURCES = [
  { host: 'world.openbeautyfacts.org', cat: 'beauty' },
  { host: 'world.openfoodfacts.org', cat: 'food' },
];

async function fetchPage(host, page) {
  const url =
    `https://${host}/cgi/search.pl?action=process&json=1` +
    `&page_size=${PAGE_SIZE}&page=${page}` +
    `&sort_by=unique_scans_n` +
    `&fields=code,product_name,brands,image_front_small_url`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'babe-recommended-db-builder/1.0' },
  });
  if (!res.ok) throw new Error(`${host} page ${page}: HTTP ${res.status}`);
  const data = await res.json();
  return data.products ?? [];
}

async function collect(source) {
  const items = [];
  const seen = new Set();
  const pages = Math.ceil(PER_SOURCE / PAGE_SIZE);
  for (let page = 1; page <= pages && items.length < PER_SOURCE; page++) {
    let products;
    try {
      products = await fetchPage(source.host, page);
    } catch (e) {
      console.warn(`  WARN ${e.message} — überspringe Seite`);
      continue;
    }
    for (const p of products) {
      const name = p.product_name?.trim();
      const image = p.image_front_small_url;
      const ean = p.code;
      if (!name || !image || !ean || seen.has(ean)) continue;
      seen.add(ean);
      items.push({
        ean,
        name: name.slice(0, 120),
        brand: p.brands?.split(',')[0]?.trim() || undefined,
        image,
        cat: source.cat,
      });
      if (items.length >= PER_SOURCE) break;
    }
    console.log(`  ${source.host}: Seite ${page} -> ${items.length} Produkte`);
  }
  return items;
}

(async () => {
  console.log(`Baue Produkt-DB (${PER_SOURCE} pro Quelle)...`);
  const all = [];
  for (const source of SOURCES) {
    console.log(`Quelle: ${source.host}`);
    all.push(...(await collect(source)));
  }
  const outPath = path.join(__dirname, '..', 'src', 'data', 'productDb.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(all));
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`FERTIG: ${all.length} Produkte -> ${outPath} (${kb} KB)`);
})();
