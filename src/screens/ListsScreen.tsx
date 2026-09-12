import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';

export type MyItemsFilter = 'tested' | 'recommended';

/** Tab „Meine Listen“: Wishlist, getestete Produkte, eigene Recommendations. */
export function ListsScreen({
  wishlistCount,
  testedCount,
  recommendedCount,
  onOpenWishlist,
  onOpenMyItems,
}: {
  wishlistCount: number;
  testedCount: number;
  recommendedCount: number;
  onOpenWishlist: () => void;
  onOpenMyItems: (filter: MyItemsFilter) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const rows = [
    {
      key: 'wishlist',
      emoji: '🤍',
      title: 'Meine Wishlist',
      subtitle: 'Gespeicherte Produkte — aus Empfehlungen und TikTok',
      count: wishlistCount,
      onPress: onOpenWishlist,
    },
    {
      key: 'tested',
      emoji: '✅',
      title: 'Meine getesteten Sachen',
      subtitle: 'Alles, was Du nach 4 Wochen bewertet hast',
      count: testedCount,
      onPress: () => onOpenMyItems('tested'),
    },
    {
      key: 'recommended',
      emoji: '✨',
      title: 'Meine Recommendations',
      subtitle: 'Produkte, die Du weiterempfohlen hast',
      count: recommendedCount,
      onPress: () => onOpenMyItems('recommended'),
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="Meine Listen 📋" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {rows.map((row) => (
          <Pressable key={row.key} onPress={row.onPress}>
            <Card style={styles.rowCard}>
              <Text style={styles.emoji}>{row.emoji}</Text>
              <View style={styles.text}>
                <Text style={styles.title}>{row.title}</Text>
                <Text style={styles.subtitle}>{row.subtitle}</Text>
              </View>
              <View style={styles.countWrap}>
                <Text style={styles.count}>{row.count}</Text>
                <Text style={styles.arrow}>›</Text>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    rowCard: { flexDirection: 'row', alignItems: 'center' },
    emoji: { fontSize: 28 },
    text: { flex: 1, marginLeft: spacing.m },
    title: { fontSize: 16, fontWeight: '700', color: colors.text },
    subtitle: { color: colors.textMuted, marginTop: 2, fontSize: 12 },
    countWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
    count: {
      color: colors.primary,
      fontWeight: '800',
      fontSize: 16,
    },
    arrow: { color: colors.textMuted, fontSize: 22 },
  });
