import { Category } from '../types';

/**
 * Produkt-Extraktion aus Bestellbestätigungs-Mails — läuft komplett
 * on-device (keine Server, keine API-Kosten).
 *
 * Real kommt die Mail per iOS Share-Extension („Teilen → babe recommended“)
 * oder über eine Weiterleitungsregel in die App; Bestellmails sind stark
 * strukturiert, darum reicht Muster-Erkennung. Für exotische Shops kann
 * später optional ein kleines On-Device-Modell übernehmen.
 */

export interface MailItem {
  qty: number;
  title: string;
  price?: string;
  category: Category;
}

/** Zeilen, die wie Positionen aussehen: „1× Produktname 24,90 €“ */
const ITEM_LINE =
  /^\s*(\d+)\s*[x×]\s+(.{3,80}?)(?:\s+(\d+[.,]\d{2})\s*€)?\s*$/gm;

/** Summen-/Versandzeilen, die keine Produkte sind. */
const NOT_A_PRODUCT =
  /zwischensumme|gesamt|summe|versand|lieferung|rabatt|gutschein|mwst|steuer/i;

const CATEGORY_HINTS: [RegExp, Category][] = [
  [/mascara|lippen|lipgloss|lip\s?tint|foundation|concealer|blush|bronzer|highlighter|eyeliner|palette/i, 'Make-up'],
  [/serum|creme|cream|toner|cleanser|maske|peeling|spf|sonnen|retinol|niacinamide|hyaluron|gesicht/i, 'Skincare'],
  [/lotion|body|butter|dusch|shampoo|conditioner|deo|handcreme|öl\b/i, 'Bodycare'],
  [/matcha|hafer|müsli|granola|riegel|protein|tee|kaffee|schoko|snack|sirup/i, 'Lebensmittel'],
  [/\bbuch\b|roman|taschenbuch|hardcover|isbn|verlag/i, 'Bücher'],
];

export function guessCategory(title: string): Category {
  for (const [pattern, category] of CATEGORY_HINTS) {
    if (pattern.test(title)) return category;
  }
  return 'Sonstiges';
}

export function extractOrderItems(mail: string): MailItem[] {
  const items: MailItem[] = [];
  const seen = new Set<string>();
  for (const match of mail.matchAll(ITEM_LINE)) {
    const title = match[2].trim().replace(/\s{2,}/g, ' ');
    if (NOT_A_PRODUCT.test(title)) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      qty: parseInt(match[1], 10) || 1,
      title,
      price: match[3] ? `${match[3].replace('.', ',')} €` : undefined,
      category: guessCategory(title),
    });
  }
  return items;
}

const SHOP_HINTS: [RegExp, string][] = [
  [/amazon/i, 'Amazon'],
  [/\bdm\b|dm-drogerie|dm\.de/i, 'dm'],
  [/douglas/i, 'Douglas'],
  [/rossmann/i, 'Rossmann'],
  [/zalando/i, 'Zalando'],
  [/flaconi/i, 'Flaconi'],
  [/notino/i, 'Notino'],
];

export function detectShop(mail: string): string | undefined {
  for (const [pattern, shop] of SHOP_HINTS) {
    if (pattern.test(mail)) return shop;
  }
  return undefined;
}
