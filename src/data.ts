import {
  AppNotification,
  FOUR_WEEKS_MS,
  Group,
  ProductPost,
  SponsoredPlacement,
  TikTokSave,
  User,
  WishlistItem,
} from './types';

/** In der Prototyp-Phase bist Du immer u1. */
export const CURRENT_USER_ID = 'u1';

export const seedUsers: User[] = [
  { id: 'u1', name: 'Du', emoji: '💖', points: 20 },
  { id: 'u2', name: 'Lisa', emoji: '🌸', points: 40 },
  { id: 'u3', name: 'Mia', emoji: '🦋', points: 5 },
  { id: 'u4', name: 'Emma', emoji: '🍒', points: 10 },
];

export const seedGroups: Group[] = [
  {
    id: 'g1',
    name: 'Skincare-Girls',
    inviteCode: 'GLOW-2026',
    memberIds: ['u1', 'u2', 'u3'],
  },
  {
    id: 'g2',
    name: 'Foodie-Crew',
    inviteCode: 'YUMMY-24',
    memberIds: ['u1', 'u3', 'u4'],
  },
];

const now = Date.now();

export const seedPosts: ProductPost[] = [
  {
    id: 'p1',
    groupId: 'g1',
    authorId: 'u2',
    title: 'Vitamin-C-Serum "Glow Up"',
    category: 'Skincare',
    price: '24,90 €',
    note: 'Riecht super, mal sehen ob die Haut mitspielt!',
    createdAt: now - FOUR_WEEKS_MS - 3 * 24 * 60 * 60 * 1000,
    reviewDueAt: now - 3 * 24 * 60 * 60 * 1000,
    review: {
      liked: true,
      rating: 5,
      recommended: true,
      comment: 'Meine Haut strahlt wirklich — klare Empfehlung!',
      createdAt: now - 2 * 24 * 60 * 60 * 1000,
    },
    isPublic: true,
    helpfulUserIds: ['u3'],
  },
  {
    id: 'p2',
    groupId: 'g1',
    authorId: 'u1',
    title: 'Sheabutter-Bodylotion',
    category: 'Bodycare',
    price: '12,50 €',
    note: 'Winterhaut-Rettung?',
    // Vor gut 4 Wochen gepostet → Check-in ist fällig!
    createdAt: now - FOUR_WEEKS_MS - 60 * 60 * 1000,
    reviewDueAt: now - 60 * 60 * 1000,
    helpfulUserIds: [],
  },
  {
    id: 'p3',
    groupId: 'g2',
    authorId: 'u4',
    title: 'Matcha-Pulver Ceremonial Grade',
    category: 'Lebensmittel',
    price: '19,00 €',
    createdAt: now - 5 * 24 * 60 * 60 * 1000,
    reviewDueAt: now - 5 * 24 * 60 * 60 * 1000 + FOUR_WEEKS_MS,
    helpfulUserIds: [],
  },
];

export const seedWishlist: WishlistItem[] = [
  {
    id: 'w1',
    title: 'Peptide Lip Tint "Cherry"',
    brand: 'GlossyLab',
    shopLink: 'https://www.amazon.de/s?k=peptide+lip+tint',
    source: 'tiktok',
    addedAt: now - 24 * 60 * 60 * 1000,
  },
];

/**
 * Mock der TikTok-Saves. Real gibt es kein öffentliches API für gespeicherte
 * Videos — der Weg auf iOS ist eine Share-Extension („Teilen → babe
 * recommended“) bzw. das Durchgehen der eigenen Saves. Hier simuliert.
 */
export const seedTikTokSaves: TikTokSave[] = [
  {
    id: 't1',
    videoTitle: 'this serum changed my skin 😱 #skintok',
    creator: '@glowwithmaja',
    productGuess: 'Niacinamide 10% + Zink Serum',
    brand: 'The Ordinary',
    imported: false,
  },
  {
    id: 't2',
    videoTitle: 'viral mascara test — hält es was es verspricht?',
    creator: '@beautybybela',
    productGuess: 'Sky High Mascara',
    brand: 'Maybelline',
    imported: false,
  },
  {
    id: 't3',
    videoTitle: 'protein overnight oats 🥣 easy rezept',
    creator: '@fitfoodmimi',
    productGuess: 'Bio Haferflocken Zartblatt',
    imported: false,
  },
];

/** Bezahlte Placements im Entdecken-Feed — klar als Anzeige markiert. */
export const seedSponsored: SponsoredPlacement[] = [
  {
    id: 's1',
    brand: 'GlowLab Berlin',
    productTitle: 'Hyaluron Glow Booster',
    tagline: 'Der Feuchtigkeits-Boost für den Winter ❄️',
    kind: 'trending',
    shopLink: 'https://www.amazon.de/s?k=hyaluron+serum',
  },
  {
    id: 's2',
    brand: 'PureBite',
    productTitle: 'Protein-Riegel Salted Caramel',
    tagline: 'Snacken ohne schlechtes Gewissen',
    kind: 'recommended_by',
    shopLink: 'https://www.amazon.de/s?k=protein+riegel',
  },
];

export const seedNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'recommendation',
    userId: 'u1',
    postId: 'p1',
    text: '✨ Lisa empfiehlt: Vitamin-C-Serum "Glow Up" (5/5) — „Meine Haut strahlt wirklich — klare Empfehlung!“',
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    read: false,
  },
];
