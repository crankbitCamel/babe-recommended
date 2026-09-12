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
import { Card, Header, HeartRating, PrimaryButton } from '../components/ui';
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import { CATEGORY_EMOJI, Group, ProductPost, User } from '../types';

export function GroupFeedScreen({
  group,
  posts,
  users,
  onBack,
  onNewPost,
  onOpenReview,
  onSimulateFourWeeks,
  onMarkHelpful,
  onAddToWishlist,
  wishlistTitles,
}: {
  group: Group;
  posts: ProductPost[];
  users: User[];
  onBack: () => void;
  onNewPost: () => void;
  onOpenReview: (postId: string) => void;
  onSimulateFourWeeks: (postId: string) => void;
  onMarkHelpful: (postId: string) => void;
  onAddToWishlist: (post: ProductPost) => void;
  wishlistTitles: string[];
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const authorName = (post: ProductPost) => {
    const author = users.find((u) => u.id === post.authorId);
    return author ? `${author.emoji} ${author.name}` : '❓';
  };

  const isDue = (post: ProductPost) =>
    !post.review && post.reviewDueAt <= Date.now();

  return (
    <View style={styles.container}>
      <Header title={group.name} onBack={onBack} />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.newPostWrap}>
            <PrimaryButton label="+ Produkt teilen" onPress={onNewPost} />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Noch keine Produkte — teile das erste! 🛍️
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.postHeader}>
              <Text style={styles.author}>{authorName(item)}</Text>
              <Text style={styles.category}>
                {CATEGORY_EMOJI[item.category]} {item.category}
              </Text>
            </View>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.photo} />
            ) : null}
            <Text style={styles.title}>{item.title}</Text>
            {item.brand ? (
              <Text style={styles.brand}>{item.brand}</Text>
            ) : null}
            {item.price ? (
              <Text style={styles.price}>{item.price}</Text>
            ) : null}
            {item.note ? <Text style={styles.note}>„{item.note}“</Text> : null}

            {item.review ? (
              <View style={styles.reviewBox}>
                <HeartRating rating={item.review.rating} />
                <Text
                  style={[
                    styles.verdict,
                    item.review.recommended
                      ? styles.recommended
                      : styles.notRecommended,
                  ]}
                >
                  {item.review.recommended
                    ? '✨ Empfohlen!'
                    : 'Keine Empfehlung'}
                </Text>
                {item.review.comment ? (
                  <Text style={styles.note}>„{item.review.comment}“</Text>
                ) : null}
                {item.review.recommended ? (
                  item.authorId === CURRENT_USER_ID ? (
                    item.helpfulUserIds.length > 0 ? (
                      <Text style={styles.helpfulCount}>
                        💖 {item.helpfulUserIds.length}× hilfreich — danke!
                      </Text>
                    ) : null
                  ) : item.helpfulUserIds.includes(CURRENT_USER_ID) ? (
                    <Text style={styles.helpfulCount}>
                      💖 Du fandest das hilfreich
                    </Text>
                  ) : (
                    <Pressable
                      onPress={() => onMarkHelpful(item.id)}
                      style={styles.helpfulButton}
                    >
                      <Text style={styles.helpfulButtonText}>
                        💖 Hilfreich — danke für den Tipp!
                      </Text>
                    </Pressable>
                  )
                ) : null}
                {item.review.recommended &&
                item.authorId !== CURRENT_USER_ID ? (
                  <View style={styles.wishlistRow}>
                    {wishlistTitles.includes(item.title.toLowerCase()) ? (
                      <Text style={styles.onWishlist}>
                        ✓ Auf Deiner Wishlist
                      </Text>
                    ) : (
                      <Pressable
                        onPress={() => onAddToWishlist(item)}
                        hitSlop={8}
                      >
                        <Text style={styles.wishlistLink}>
                          🤍 Auf die Wishlist
                        </Text>
                      </Pressable>
                    )}
                    {item.shopLink ? (
                      <Pressable
                        onPress={() => Linking.openURL(item.shopLink!)}
                        hitSlop={8}
                      >
                        <Text style={styles.wishlistLink}>
                          🛒 In den Warenkorb
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : isDue(item) && item.authorId === CURRENT_USER_ID ? (
              <View style={styles.dueBox}>
                <Text style={styles.dueText}>
                  ⏰ 4 Wochen sind um — wie findest Du es?
                </Text>
                <PrimaryButton
                  label="Jetzt bewerten"
                  onPress={() => onOpenReview(item.id)}
                />
              </View>
            ) : (
              <View style={styles.pendingRow}>
                <Text style={styles.pending}>
                  ⏳ Check-in am{' '}
                  {new Date(item.reviewDueAt).toLocaleDateString('de-DE')}
                </Text>
                {item.authorId === CURRENT_USER_ID ? (
                  <Pressable
                    onPress={() => onSimulateFourWeeks(item.id)}
                    hitSlop={8}
                  >
                    <Text style={styles.simulate}>⏩ 4 Wochen simulieren</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
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
  newPostWrap: { marginBottom: spacing.m },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.s,
  },
  author: { fontWeight: '700', color: colors.text },
  category: { color: colors.textMuted },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  brand: { color: colors.textMuted, marginTop: 2 },
  price: { color: colors.primary, fontWeight: '600', marginTop: spacing.xs },
  note: { color: colors.textMuted, marginTop: spacing.s, fontStyle: 'italic' },
  reviewBox: {
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.s,
  },
  verdict: { fontWeight: '700' },
  recommended: { color: colors.success },
  notRecommended: { color: colors.textMuted },
  dueBox: {
    marginTop: spacing.m,
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: spacing.m,
    gap: spacing.m,
  },
  dueText: { color: colors.text, fontWeight: '600' },
  pendingRow: {
    marginTop: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pending: { color: colors.textMuted },
  simulate: { color: colors.primary, fontWeight: '600' },
  helpfulCount: { color: colors.primary, fontWeight: '600' },
  helpfulButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingVertical: spacing.s,
    alignItems: 'center',
  },
  helpfulButtonText: { color: colors.primary, fontWeight: '700' },
  wishlistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistLink: { color: colors.primary, fontWeight: '600' },
  onWishlist: { color: colors.success, fontWeight: '600' },
});
