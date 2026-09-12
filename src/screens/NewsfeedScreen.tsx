import React, { useState } from 'react';
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
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import {
  CATEGORY_EMOJI,
  Group,
  ProductPost,
  SponsoredPlacement,
  topBadge,
  User,
} from '../types';

type Segment = 'friends' | 'discover';

type Row =
  | { kind: 'post'; post: ProductPost }
  | { kind: 'sponsored'; placement: SponsoredPlacement };

/**
 * Startscreen: der Newsfeed. „Freunde“ zeigt alles aus Deinen Gruppen,
 * „Entdecken“ die öffentlichen Empfehlungen (+ gekennzeichnete Anzeigen).
 */
export function NewsfeedScreen({
  posts,
  groups,
  users,
  sponsored,
  unreadCount,
  onOpenDetail,
  onOpenGroup,
  onOpenNotifications,
  onOpenProfile,
}: {
  posts: ProductPost[];
  groups: Group[];
  users: User[];
  sponsored: SponsoredPlacement[];
  unreadCount: number;
  onOpenDetail: (postId: string) => void;
  onOpenGroup: (groupId: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [segment, setSegment] = useState<Segment>('friends');

  const myGroupIds = groups
    .filter((g) => g.memberIds.includes(CURRENT_USER_ID))
    .map((g) => g.id);

  const friendRows: Row[] = posts
    .filter((p) => myGroupIds.includes(p.groupId))
    .sort(
      (a, b) =>
        (b.review?.createdAt ?? b.createdAt) -
        (a.review?.createdAt ?? a.createdAt)
    )
    .map((post) => ({ kind: 'post' as const, post }));

  const publicPosts = posts
    .filter((p) => p.isPublic && p.review?.recommended)
    .sort((a, b) => (b.review?.createdAt ?? 0) - (a.review?.createdAt ?? 0));

  const discoverRows: Row[] = [];
  let adIndex = 0;
  publicPosts.forEach((post, i) => {
    discoverRows.push({ kind: 'post', post });
    if ((i + 1) % 2 === 0 && adIndex < sponsored.length) {
      discoverRows.push({ kind: 'sponsored', placement: sponsored[adIndex++] });
    }
  });
  while (adIndex < sponsored.length) {
    discoverRows.push({ kind: 'sponsored', placement: sponsored[adIndex++] });
  }

  const rows = segment === 'friends' ? friendRows : discoverRows;

  const groupName = (post: ProductPost) =>
    groups.find((g) => g.id === post.groupId)?.name ?? '';

  return (
    <View style={styles.container}>
      <Header
        title="babe recommended 💖"
        right={
          <View style={styles.headerIcons}>
            <Pressable onPress={onOpenProfile} hitSlop={8}>
              <Text style={styles.headerIcon}>🏅</Text>
            </Pressable>
            <Pressable onPress={onOpenNotifications} hitSlop={8}>
              <Text style={styles.headerIcon}>
                🔔{unreadCount > 0 ? unreadCount : ''}
              </Text>
            </Pressable>
          </View>
        }
      />

      <View style={styles.segments}>
        <Pressable
          onPress={() => setSegment('friends')}
          style={[
            styles.segment,
            segment === 'friends' && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              segment === 'friends' && styles.segmentTextActive,
            ]}
          >
            👯 Freunde
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('discover')}
          style={[
            styles.segment,
            segment === 'discover' && styles.segmentActive,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              segment === 'discover' && styles.segmentTextActive,
            ]}
          >
            🌍 Entdecken
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(row) =>
          row.kind === 'post' ? row.post.id : row.placement.id
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {segment === 'friends'
              ? 'Noch nichts los — teile das erste Produkt! 🛍️'
              : 'Noch keine öffentlichen Empfehlungen — sei die Erste! 🌟'}
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

          const post = item.post;
          const author = users.find((u) => u.id === post.authorId);

          if (post.review) {
            return (
              <View>
                {segment === 'friends' ? (
                  <Text style={styles.groupTag}>📍 {groupName(post)}</Text>
                ) : null}
                <ReviewCard
                  post={post}
                  author={author}
                  authorBadgeEmoji={
                    author ? topBadge(author.points)?.emoji : undefined
                  }
                  onPress={() => onOpenDetail(post.id)}
                />
              </View>
            );
          }

          // Frisch gekauft, noch keine Review — kompakter Eintrag
          return (
            <Pressable onPress={() => onOpenGroup(post.groupId)}>
              <Card style={styles.newBuyCard}>
                {post.photoUri ? (
                  <Image
                    source={{ uri: post.photoUri }}
                    style={styles.newBuyImage}
                  />
                ) : (
                  <View style={[styles.newBuyImage, styles.newBuyFallback]}>
                    <Text style={styles.newBuyEmoji}>
                      {CATEGORY_EMOJI[post.category]}
                    </Text>
                  </View>
                )}
                <View style={styles.newBuyText}>
                  <Text style={styles.newBuyLine} numberOfLines={2}>
                    <Text style={styles.newBuyName}>
                      {author ? `${author.emoji} ${author.name}` : '❓'}
                    </Text>{' '}
                    hat sich {post.title} gekauft 🛍️
                  </Text>
                  <Text style={styles.newBuyMeta}>
                    📍 {groupName(post)} · Review am{' '}
                    {new Date(post.reviewDueAt).toLocaleDateString('de-DE')}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerIcons: { flexDirection: 'row', gap: spacing.m },
    headerIcon: { fontSize: 18, color: colors.primary, fontWeight: '700' },
    segments: {
      flexDirection: 'row',
      marginHorizontal: spacing.m,
      marginBottom: spacing.s,
      backgroundColor: colors.card,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 3,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.s,
      borderRadius: 999,
    },
    segmentActive: { backgroundColor: colors.primary },
    segmentText: { color: colors.textMuted, fontWeight: '600' },
    segmentTextActive: { color: '#fff' },
    list: { padding: spacing.m, paddingTop: spacing.s },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: spacing.xl,
    },
    groupTag: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: spacing.xs,
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
    newBuyCard: { flexDirection: 'row', alignItems: 'center' },
    newBuyImage: { width: 48, height: 48, borderRadius: 8 },
    newBuyFallback: {
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    newBuyEmoji: { fontSize: 20 },
    newBuyText: { flex: 1, marginLeft: spacing.m },
    newBuyLine: { color: colors.text, lineHeight: 20 },
    newBuyName: { fontWeight: '700' },
    newBuyMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  });
