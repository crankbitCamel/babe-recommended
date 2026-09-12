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
import { ReviewCard } from '../components/ReviewCard';
import { Card, Header } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import {
  ProductPost,
  SponsoredPlacement,
  topBadge,
  User,
} from '../types';

type Row =
  | { kind: 'post'; post: ProductPost }
  | { kind: 'sponsored'; placement: SponsoredPlacement };

/** Öffentlicher Feed: Empfehlungen mit Badge + klar markierte Anzeigen. */
export function DiscoverScreen({
  posts,
  users,
  sponsored,
  onOpenDetail,
  onBack,
}: {
  posts: ProductPost[];
  users: User[];
  sponsored: SponsoredPlacement[];
  onOpenDetail: (postId: string) => void;
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const publicPosts = posts
    .filter((p) => p.isPublic && p.review?.recommended)
    .sort((a, b) => (b.review?.createdAt ?? 0) - (a.review?.createdAt ?? 0));

  // Anzeigen einstreuen: nach jedem 2. Post ein Placement
  const rows: Row[] = [];
  let adIndex = 0;
  publicPosts.forEach((post, i) => {
    rows.push({ kind: 'post', post });
    if ((i + 1) % 2 === 0 && adIndex < sponsored.length) {
      rows.push({ kind: 'sponsored', placement: sponsored[adIndex++] });
    }
  });
  while (adIndex < sponsored.length) {
    rows.push({ kind: 'sponsored', placement: sponsored[adIndex++] });
  }

  return (
    <View style={styles.container}>
      <Header title="Entdecken 🌍" onBack={onBack} />
      <FlatList
        data={rows}
        keyExtractor={(row) =>
          row.kind === 'post' ? row.post.id : row.placement.id
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.intro}>
            Öffentliche Empfehlungen von Nutzerinnen mit Badge ✨
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Noch keine öffentlichen Empfehlungen — sei die Erste! 🌟
          </Text>
        }
        renderItem={({ item }) => {
          if (item.kind === 'sponsored') {
            return (
              <Card style={styles.adCard}>
                <View style={styles.adHeader}>
                  <Text style={styles.adKind}>
                    {item.placement.kind === 'trending'
                      ? '🔥 Product Trending'
                      : `🤝 Recommended by ${item.placement.brand}`}
                  </Text>
                  <Text style={styles.adLabel}>ANZEIGE</Text>
                </View>
                {item.placement.imageUrl ? (
                  <Image
                    source={{ uri: item.placement.imageUrl }}
                    style={styles.adPhoto}
                  />
                ) : null}
                <Text style={styles.adTitle}>
                  {item.placement.productTitle}
                </Text>
                <Text style={styles.adBrand}>{item.placement.brand}</Text>
                <Text style={styles.tagline}>{item.placement.tagline}</Text>
                <Pressable
                  onPress={() => Linking.openURL(item.placement.shopLink)}
                  style={styles.cartButton}
                >
                  <Text style={styles.cartText}>🛒 Zum Shop</Text>
                </Pressable>
              </Card>
            );
          }

          const author = users.find((u) => u.id === item.post.authorId);
          return (
            <ReviewCard
              post={item.post}
              author={author}
              authorBadgeEmoji={
                author ? topBadge(author.points)?.emoji : undefined
              }
              onPress={() => onOpenDetail(item.post.id)}
            />
          );
        }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.m },
    intro: {
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.m,
    },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: spacing.xl,
    },
    adCard: { borderColor: colors.primary, borderWidth: 1.5 },
    adHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.s,
    },
    adKind: { fontWeight: '700', color: colors.primary },
    adLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMuted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    adPhoto: {
      width: '100%',
      height: 180,
      borderRadius: 12,
      marginBottom: spacing.s,
    },
    adTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    adBrand: { color: colors.textMuted, marginTop: 2 },
    tagline: { color: colors.textMuted, marginTop: spacing.s },
    cartButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: spacing.s,
      alignItems: 'center',
      marginTop: spacing.m,
    },
    cartText: { color: '#fff', fontWeight: '700' },
  });
