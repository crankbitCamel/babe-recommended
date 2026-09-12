import React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header, Stars } from '../components/ui';
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import { CATEGORY_EMOJI, ProductPost, topBadge, User } from '../types';

/** Detailansicht einer Review — öffnet sich per Tap auf eine Review-Karte. */
export function ReviewDetailScreen({
  post,
  author,
  onBack,
  onMarkHelpful,
  onAddToWishlist,
  isOnWishlist,
}: {
  post: ProductPost;
  author?: User;
  onBack: () => void;
  onMarkHelpful: (postId: string) => void;
  onAddToWishlist: (post: ProductPost) => void;
  isOnWishlist: boolean;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const review = post.review;
  const badge = author ? topBadge(author.points) : undefined;
  const isOwn = post.authorId === CURRENT_USER_ID;
  const hasVoted = post.helpfulUserIds.includes(CURRENT_USER_ID);

  return (
    <View style={styles.container}>
      <Header title="Review" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          {post.photoUri ? (
            <Image source={{ uri: post.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <Text style={styles.photoEmoji}>
                {CATEGORY_EMOJI[post.category]}
              </Text>
            </View>
          )}
          {post.brand ? (
            <Text style={styles.brand}>{post.brand.toUpperCase()}</Text>
          ) : null}
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {CATEGORY_EMOJI[post.category]} {post.category}
            </Text>
            {post.price ? <Text style={styles.meta}>{post.price}</Text> : null}
          </View>
          <Text style={styles.dates}>
            Gekauft am {new Date(post.createdAt).toLocaleDateString('de-DE')}
            {review
              ? ` · bewertet am ${new Date(review.createdAt).toLocaleDateString(
                  'de-DE'
                )}`
              : ''}
          </Text>
          {post.shopLink ? (
            <Pressable
              onPress={() => Linking.openURL(post.shopLink!)}
              style={styles.cartButton}
            >
              <Text style={styles.cartText}>🛒 Zum Shop / Warenkorb</Text>
            </Pressable>
          ) : null}
        </Card>

        {review ? (
          <Card>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{author?.emoji ?? '❓'}</Text>
              </View>
              <View style={styles.authorText}>
                <Text style={styles.authorName}>
                  {author?.name ?? 'Unbekannt'}
                </Text>
                {badge ? (
                  <Text style={styles.authorBadge}>
                    {badge.emoji} {badge.name}
                  </Text>
                ) : null}
              </View>
              <View style={styles.ratingBlock}>
                <Stars rating={review.rating} size={20} />
                <Text style={styles.ratingText}>{review.rating}/5</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.verdictRow}>
              <Text style={styles.verdictItem}>
                {review.liked ? '😍 Gefällt ihr' : '😕 Eher nicht ihrs'}
              </Text>
              <Text
                style={[
                  styles.verdictItem,
                  review.recommended
                    ? styles.recommended
                    : styles.notRecommended,
                ]}
              >
                {review.recommended ? '✨ Empfehlung!' : 'Keine Empfehlung'}
              </Text>
            </View>

            {review.comment ? (
              <Text style={styles.comment}>„{review.comment}“</Text>
            ) : null}

            {post.helpfulUserIds.length > 0 ? (
              <Text style={styles.helpfulCount}>
                💖 {post.helpfulUserIds.length}× als hilfreich markiert
              </Text>
            ) : null}

            {!isOwn && review.recommended ? (
              <View style={styles.actions}>
                {hasVoted ? (
                  <Text style={styles.voted}>💖 Du fandest das hilfreich</Text>
                ) : (
                  <Pressable
                    onPress={() => onMarkHelpful(post.id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>💖 Hilfreich</Text>
                  </Pressable>
                )}
                {isOnWishlist ? (
                  <Text style={styles.voted}>✓ Auf Deiner Wishlist</Text>
                ) : (
                  <Pressable
                    onPress={() => onAddToWishlist(post)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>🤍 Wishlist</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    photo: {
      width: '100%',
      height: 220,
      borderRadius: 12,
      marginBottom: spacing.m,
    },
    photoFallback: {
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoEmoji: { fontSize: 56 },
    brand: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      marginTop: 2,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.s,
    },
    meta: { color: colors.textMuted },
    dates: { color: colors.textMuted, fontSize: 12, marginTop: spacing.s },
    cartButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: spacing.s + 2,
      alignItems: 'center',
      marginTop: spacing.m,
    },
    cartText: { color: '#fff', fontWeight: '700' },
    authorRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarEmoji: { fontSize: 22 },
    authorText: { flex: 1, marginLeft: spacing.m },
    authorName: { color: colors.text, fontWeight: '700', fontSize: 16 },
    authorBadge: { color: colors.primary, fontSize: 12, marginTop: 2 },
    ratingBlock: { alignItems: 'flex-end' },
    ratingText: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.m,
    },
    verdictRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.m,
    },
    verdictItem: { color: colors.text, fontWeight: '600' },
    recommended: { color: colors.success },
    notRecommended: { color: colors.textMuted },
    comment: {
      color: colors.text,
      fontStyle: 'italic',
      lineHeight: 22,
      marginBottom: spacing.m,
    },
    helpfulCount: {
      color: colors.primary,
      fontWeight: '600',
      marginBottom: spacing.m,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButton: {
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      paddingHorizontal: spacing.l,
      paddingVertical: spacing.s,
    },
    actionText: { color: colors.primary, fontWeight: '700' },
    voted: { color: colors.success, fontWeight: '600' },
  });
