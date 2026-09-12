/**
 * Produkt-Extraktion aus einem Video-Transkript.
 *
 * Prototyp: einfache Muster-Erkennung über bekannte Produktbegriffe.
 * Produktion: Audio-Transkription (z. B. Whisper / Apple Speech) und
 * LLM-Extraktion, dann Abgleich mit der Produktdatenbank (siehe README).
 */

const PRODUCT_NOUNS = [
  'serum',
  'mascara',
  'lippenstift',
  'lip\\s?tint',
  'lip\\s?oil',
  'gloss',
  'toner',
  'cleanser',
  'moisturizer',
  'creme',
  'cream',
  'öl',
  'oil',
  'foundation',
  'concealer',
  'blush',
  'bronzer',
  'highlighter',
  'shampoo',
  'conditioner',
  'bodylotion',
  'lotion',
  'bodybutter',
  'peeling',
  'maske',
  'sonnencreme',
  'spf\\s?\\d+',
  'parfum',
  'duft',
  'haferflocken',
  'matcha',
  'proteinriegel',
  'protein\\s?riegel',
  'müsli',
  'granola',
  'sirup',
  'tee',
];

const PRODUCT_REGEX = new RegExp(
  `(?:[\\wäöüßÄÖÜ%+-]+\\s+){0,3}(?:${PRODUCT_NOUNS.join('|')})`,
  'gi'
);

/** Füllwörter, die am Anfang eines Treffers abgeschnitten werden. */
const LEADING_NOISE =
  /^(?:das|die|der|ein|eine|einen|mein|meine|dieses|diese|dieser|virale|viralen|neue|neuen|so|halt|dann|noch|auch|echt|voll|mega|richtig|und|mit|oder|aber|weil|morgens|abends|mittags|mal|jetzt|schnell|gerne|immer)\s+/i;

export function extractProductCandidates(transcript: string): string[] {
  const text = transcript.replace(/\s+/g, ' ').trim();
  if (!text) return [];

  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const match of text.matchAll(PRODUCT_REGEX)) {
    let candidate = match[0].trim();
    // Füllwörter vorne wiederholt entfernen
    let prev = '';
    while (prev !== candidate) {
      prev = candidate;
      candidate = candidate.replace(LEADING_NOISE, '');
    }
    const key = candidate.toLowerCase();
    if (candidate.length >= 3 && !seen.has(key)) {
      seen.add(key);
      candidates.push(candidate);
    }
    if (candidates.length >= 5) break;
  }
  return candidates;
}
