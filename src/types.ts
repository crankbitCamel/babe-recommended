export type Category =
  | 'Skincare'
  | 'Bodycare'
  | 'Make-up'
  | 'Lebensmittel'
  | 'Bücher'
  | 'Sonstiges';

export const CATEGORIES: Category[] = [
  'Skincare',
  'Bodycare',
  'Make-up',
  'Lebensmittel',
  'Bücher',
  'Sonstiges',
];

export const CATEGORY_EMOJI: Record<Category, string> = {
  Skincare: '🧴',
  Bodycare: '🛁',
  'Make-up': '💄',
  Lebensmittel: '🍓',
  Bücher: '📚',
  Sonstiges: '🛍️',
};

export type GroupAddPolicy = 'friends' | 'everyone';

export interface User {
  id: string;
  name: string;
  emoji: string;
  /** Punkte für hilfreiche Empfehlungen. */
  points: number;
  /** Öffentliches Profil — aktives Opt-in, Standard ist privat. */
  isPublic: boolean;
  /** Freundinnen (beidseitig gepflegt). */
  friendIds: string[];
  /** Wer darf mich zu Gruppen hinzufügen? Standard: nur Freundinnen. */
  groupAddPolicy: GroupAddPolicy;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  minPoints: number;
}

/** Badges werden bei Punkteschwellen freigeschaltet — öffentlich sichtbar. */
export const BADGES: Badge[] = [
  { id: 'badge-tipp', name: 'Geheimtipp', emoji: '💫', minPoints: 10 },
  { id: 'badge-trend', name: 'Trendsetterin', emoji: '🌟', minPoints: 30 },
  { id: 'badge-queen', name: 'Empfehlungs-Queen', emoji: '👑', minPoints: 75 },
];

/** Punkte pro „Hilfreich“-Stimme auf eine Empfehlung. */
export const HELPFUL_POINTS = 10;

export function badgesFor(points: number): Badge[] {
  return BADGES.filter((b) => points >= b.minPoints);
}

export function topBadge(points: number): Badge | undefined {
  const earned = badgesFor(points);
  return earned[earned.length - 1];
}

export function nextBadge(points: number): Badge | undefined {
  return BADGES.find((b) => points < b.minPoints);
}

/** Öffentlich posten dürfen alle, die mindestens ein Badge haben. */
export function canPostPublic(points: number): boolean {
  return badgesFor(points).length > 0;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
  /** Öffentliche Gruppe: für alle sichtbar und frei beitretbar.
   *  Nur Nutzerinnen mit öffentlichem Profil können sie erstellen. */
  isPublic?: boolean;
  ownerId?: string;
}

export interface Review {
  liked: boolean;
  rating: number; // 1–5
  recommended: boolean;
  comment?: string;
  createdAt: number;
}

export interface ProductPost {
  id: string;
  groupId: string;
  authorId: string;
  title: string;
  category: Category;
  brand?: string;
  barcode?: string;
  photoUri?: string;
  price?: string;
  shopLink?: string;
  note?: string;
  createdAt: number;
  /** Zeitpunkt des automatischen Check-ins: createdAt + 4 Wochen */
  reviewDueAt: number;
  review?: Review;
  /** Empfehlung auch im öffentlichen Entdecken-Feed sichtbar. */
  isPublic?: boolean;
  /** Wer die Empfehlung als hilfreich markiert hat (gibt Punkte). */
  helpfulUserIds: string[];
}

export type NotificationType =
  | 'review_due'
  | 'recommendation'
  | 'points'
  | 'badge';

export interface WishlistItem {
  id: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  /** Shop-Link, z. B. Amazon — öffnet den Warenkorb/die Produktseite. */
  shopLink?: string;
  source: 'tiktok' | 'empfehlung' | 'anzeige';
  addedAt: number;
}

/** Ein auf TikTok gespeichertes Video mit erkanntem Produkt. */
export interface TikTokSave {
  id: string;
  videoTitle: string;
  creator: string;
  productGuess: string;
  brand?: string;
  imported: boolean;
}

/** Bezahlter Werbeplatz einer Brand — immer als „Anzeige“ gekennzeichnet. */
export interface SponsoredPlacement {
  id: string;
  brand: string;
  productTitle: string;
  tagline: string;
  kind: 'trending' | 'recommended_by';
  shopLink: string;
  imageUrl?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  /** Empfänger:in der Benachrichtigung */
  userId: string;
  postId: string;
  text: string;
  createdAt: number;
  read: boolean;
}

/** 4 Wochen in Millisekunden — der Herzschlag der App. */
export const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;
