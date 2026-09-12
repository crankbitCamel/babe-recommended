import { createContext, useContext } from 'react';

export interface ThemeColors {
  background: string;
  card: string;
  primary: string;
  primarySoft: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  danger: string;
}

export interface Aesthetic {
  id: string;
  name: string;
  emoji: string;
  colors: ThemeColors;
}

/**
 * Die wählbaren Aesthetics der App. „Babe Pink“ ist der Default,
 * dazu vier Stimmungen: Clean, Summer, Elegant, Nature.
 */
export const AESTHETICS: Aesthetic[] = [
  {
    id: 'babe',
    name: 'Babe Pink',
    emoji: '💖',
    colors: {
      background: '#FFF5F7',
      card: '#FFFFFF',
      primary: '#E75480',
      primarySoft: '#FBD3E0',
      text: '#3D2530',
      textMuted: '#9B7A88',
      border: '#F3D9E2',
      success: '#4CAF7D',
      danger: '#D9534F',
    },
  },
  {
    id: 'clean',
    name: 'Clean',
    emoji: '🤍',
    colors: {
      background: '#FFFFFF',
      card: '#FAFAFA',
      primary: '#1A1A1A',
      primarySoft: '#EDEDED',
      text: '#1A1A1A',
      textMuted: '#8A8A8A',
      border: '#E4E4E4',
      success: '#3D8361',
      danger: '#C0392B',
    },
  },
  {
    id: 'summer',
    name: 'Summer',
    emoji: '🌞',
    colors: {
      background: '#FFFAEB',
      card: '#FFFFFF',
      primary: '#F2790F',
      primarySoft: '#FFE9C0',
      text: '#3A2C18',
      textMuted: '#A68A5B',
      border: '#F7E3B5',
      success: '#14B8A6',
      danger: '#E4572E',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    emoji: '🍷',
    colors: {
      background: '#FBF7E8',
      card: '#FFFFFF',
      primary: '#6D1F35',
      primarySoft: '#D8E6F2',
      text: '#33262B',
      textMuted: '#8A8264',
      border: '#E6DFC6',
      success: '#7A8450',
      danger: '#A62639',
    },
  },
  {
    id: 'nature',
    name: 'Nature',
    emoji: '🌿',
    colors: {
      background: '#F3EFE6',
      card: '#FFFFFF',
      primary: '#6F8F6B',
      primarySoft: '#DFE7D6',
      text: '#333B2F',
      textMuted: '#94907F',
      border: '#E2DECF',
      success: '#5F7D57',
      danger: '#B3563E',
    },
  },
];

export const DEFAULT_AESTHETIC_ID = 'babe';

export const ThemeContext = createContext<ThemeColors>(AESTHETICS[0].colors);

/** Aktuelle Theme-Farben — reagiert auf den Aesthetic-Wechsel. */
export function useColors(): ThemeColors {
  return useContext(ThemeContext);
}

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};
