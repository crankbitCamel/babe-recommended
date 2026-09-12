import { requireOptionalNativeModule } from 'expo-modules-core';

interface ProductCutoutNative {
  isAvailable(): boolean;
  removeBackground(uri: string): Promise<string | null>;
}

/**
 * Freisteller via Apple Vision (Subject Lifting).
 *
 * In Expo Go ist das native Modul nicht enthalten — dann ist
 * isCutoutAvailable() false und die App läuft normal weiter.
 * Im Development/Production-Build (EAS) ist es aktiv (iOS 17+).
 */
const native = requireOptionalNativeModule<ProductCutoutNative>('ProductCutout');

export function isCutoutAvailable(): boolean {
  try {
    return !!native && native.isAvailable();
  } catch {
    return false;
  }
}

/** Entfernt den Hintergrund; liefert die URI des PNG-Freistellers oder null. */
export async function removeBackground(uri: string): Promise<string | null> {
  if (!native) return null;
  try {
    return await native.removeBackground(uri);
  } catch {
    return null;
  }
}
