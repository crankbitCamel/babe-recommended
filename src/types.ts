export type Category =
  | 'Skincare'
  | 'Bodycare'
  | 'Make-up'
  | 'Lebensmittel'
  | 'Sonstiges';

export const CATEGORIES: Category[] = [
  'Skincare',
  'Bodycare',
  'Make-up',
  'Lebensmittel',
  'Sonstiges',
];

export const CATEGORY_EMOJI: Record<Category, string> = {
  Skincare: '🧴',
  Bodycare: '🛁',
  'Make-up': '💄',
  Lebensmittel: '🍓',
  Sonstiges: '🛍️',
};

export interface User {
  id: string;
  name: string;
  emoji: string;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
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
  photoUri?: string;
  price?: string;
  shopLink?: string;
  note?: string;
  createdAt: number;
  /** Zeitpunkt des automatischen Check-ins: createdAt + 4 Wochen */
  reviewDueAt: number;
  review?: Review;
}

export type NotificationType = 'review_due' | 'recommendation';

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
