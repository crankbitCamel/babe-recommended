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
import { Card, Header, HeartRating } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import {
  CATEGORY_EMOJI,
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
  wishlistTitles,
  onAddToWishlist,
  onBack,
}: {
  posts: ProductPost[];
  users: User[];
  sponsored: SponsoredPlacement[];
  wishlistTitles: string[];
  onAddToWishlist: (post: ProductPost) => void;
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

  const authorLine = (post: ProductPost) => {
    const author = users.find((u) => u.id === post.authorId);
    if (!author) return '❓';
    const badge = topBadge(author.points);
    return `${author.emoji} ${author.name}${
      badge ? `  ${badge.emoji} ${badge.name}` : ''
    }`;
  };

  const onWishlist = (post: ProductPost) =>
    wishlistTitles.includes(post.title.toLowerCase());

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
        renderItem={({ item }) =>
          item.kind === 'sponsored' ? (
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
                  style={styles.photo}
                />
              ) : null}
              <Text style={styles.title}>{item.placement.productTitle}</Text>
              <Text style={styles.brand}>{item.placement.brand}</Text>
              <Text style={styles.tagline}>{item.placement.tagline}</Text>
              <Pressable
                onPress={() => Linking.openURL(item.placement.shopLink)}
                style={styles.cartButton}
              >
                <Text style={styles.cartText}>🛒 Zum Shop</Text>
              </Pressable>
            </Card>
          ) : (
            <Card>
              <Text style={styles.author}>{authorLine(item.post)}</Text>
              {item.post.photoUri ? (
                <Image
                  source={{ uri: item.post.photoUri }}
                  style={styles.photo}
                />
              ) : null}
              <Text style={styles.title}>
                {CATEGORY_EMOJI[item.post.category]} {item.post.title}
              </Text>
              {item.post.brand ? (
                <Text style={styles.brand}>{item.post.brand}</Text>
              ) : null}
              {item.post.review ? (
                <View style={styles.reviewBox}>
                  <HeartRating rating={item.post.review.rating} />
                  {item.post.review.comment ? (
                    <Text style={styles.comment}>
                      „{item.post.review.comment}“
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {item.post.helpfulUserIds.length > 0 ? (
                <Text style={styles.helpful}>
                  💖 {item.post.helpfulUserIds.length}× als hilfreich markiert
                </Text>
              ) : null}
              <View style={styles.actions}>
                {onWishlist(item.post) ? (
                  <Text style={styles.onWishlist}>✓ Auf Deiner Wishlist</Text>
                ) : (
                  <Pressable
                    onPress={() => onAddToWishlist(item.post)}
                    style={styles.wishlistButton}
                  >
                    <Text style={styles.wishlistText}>🤍 Auf die Wishlist</Text>
                  </Pressable>
                )}
                {item.post.shopLink ? (
                  <Pressable
                    onPress={() => Linking.openURL(item.post.shopLink!)}
                    style={styles.cartButtonSmall}
                  >
                    <Text style={styles.wishlistText}>🛒</Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          )
        }
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
  author: { fontWeight: '700', color: colors.text, marginBottom: spacing.s },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  brand: { color: colors.textMuted, marginTop: 2 },
  reviewBox: { marginTop: spacing.s, gap: spacing.s },
  comment: { color: colors.textMuted, fontStyle: 'italic' },
  helpful: { color: colors.primary, marginTop: spacing.s, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  wishlistButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  wishlistText: { color: colors.primary, fontWeight: '700' },
  onWishlist: { color: colors.success, fontWeight: '600' },
  cartButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: spacing.s,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  cartButtonSmall: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  cartText: { color: '#fff', fontWeight: '700' },
  // Anzeige
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
  tagline: { color: colors.textMuted, marginTop: spacing.s },
});
