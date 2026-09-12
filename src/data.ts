import {
  AppNotification,
  FOUR_WEEKS_MS,
  Group,
  ProductPost,
  User,
} from './types';

/** In der Prototyp-Phase bist Du immer u1. */
export const CURRENT_USER_ID = 'u1';

export const seedUsers: User[] = [
  { id: 'u1', name: 'Du', emoji: '💖' },
  { id: 'u2', name: 'Lisa', emoji: '🌸' },
  { id: 'u3', name: 'Mia', emoji: '🦋' },
  { id: 'u4', name: 'Emma', emoji: '🍒' },
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
