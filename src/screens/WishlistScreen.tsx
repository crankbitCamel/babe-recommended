import React from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header, PrimaryButton } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import { WishlistItem } from '../types';

const SOURCE_LABELS: Record<WishlistItem['source'], string> = {
  tiktok: '🎵 Von TikTok',
  empfehlung: '💖 Aus einer Empfehlung',
  anzeige: '✨ Aus dem Entdecken-Feed',
};

export function WishlistScreen({
  items,
  onBack,
  onOpenTikTokImport,
  onOpenShareImport,
  onRemove,
}: {
  items: WishlistItem[];
  onBack: () => void;
  onOpenTikTokImport: () => void;
  onOpenShareImport: () => void;
  onRemove: (itemId: string) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Header title="Wishlist 🤍" onBack={onBack} />
      <FlatList
        data={[...items].sort((a, b) => b.addedAt - a.addedAt)}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.importWrap}>
            <PrimaryButton
              label="🎵 TikTok-Saves durchgehen"
              onPress={onOpenTikTokImport}
            />
            <Pressable onPress={onOpenShareImport} style={styles.shareLink}>
              <Text style={styles.shareLinkText}>
                📲 Video geteilt bekommen? Transkript auswerten
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Noch leer — speichere Empfehlungen oder importiere Deine
            TikTok-Saves 🤍
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                />
              ) : (
                <View style={[styles.image, styles.imageFallback]}>
                  <Text style={styles.imageEmoji}>🤍</Text>
                </View>
              )}
              <View style={styles.text}>
                <Text style={styles.title}>{item.title}</Text>
                {item.brand ? (
                  <Text style={styles.brand}>{item.brand}</Text>
                ) : null}
                <Text style={styles.source}>
                  {SOURCE_LABELS[item.source]}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              {item.shopLink ? (
                <Pressable
                  onPress={() => Linking.openURL(item.shopLink!)}
                  style={styles.cartButton}
                >
                  <Text style={styles.cartText}>🛒 In den Warenkorb</Text>
                </Pressable>
              ) : (
                <Text style={styles.noLink}>Kein Shop-Link hinterlegt</Text>
              )}
              <Pressable onPress={() => onRemove(item.id)} hitSlop={8}>
                <Text style={styles.remove}>Entfernen</Text>
              </Pressable>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.m },
  importWrap: { marginBottom: spacing.m },
  shareLink: { alignItems: 'center', marginTop: spacing.m },
  shareLinkText: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
    lineHeight: 20,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  image: { width: 56, height: 56, borderRadius: 8 },
  imageFallback: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: { fontSize: 24 },
  text: { flex: 1, marginLeft: spacing.m },
  title: { fontWeight: '700', color: colors.text },
  brand: { color: colors.textMuted, marginTop: 2 },
  source: { color: colors.primary, marginTop: spacing.xs, fontSize: 12 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  cartButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  cartText: { color: colors.primary, fontWeight: '700' },
  noLink: { color: colors.textMuted, fontSize: 12 },
  remove: { color: colors.textMuted, textDecorationLine: 'underline' },
});
