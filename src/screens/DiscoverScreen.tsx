import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Card, Header, HeartRating } from '../components/ui';
import { colors, spacing } from '../theme';
import { CATEGORY_EMOJI, ProductPost, topBadge, User } from '../types';

/** Öffentlicher Feed: Empfehlungen, die mit Badge öffentlich geteilt wurden. */
export function DiscoverScreen({
  posts,
  users,
  onBack,
}: {
  posts: ProductPost[];
  users: User[];
  onBack: () => void;
}) {
  const publicPosts = posts
    .filter((p) => p.isPublic && p.review?.recommended)
    .sort(
      (a, b) => (b.review?.createdAt ?? 0) - (a.review?.createdAt ?? 0)
    );

  const authorLine = (post: ProductPost) => {
    const author = users.find((u) => u.id === post.authorId);
    if (!author) return '❓';
    const badge = topBadge(author.points);
    return `${author.emoji} ${author.name}${
      badge ? `  ${badge.emoji} ${badge.name}` : ''
    }`;
  };

  return (
    <View style={styles.container}>
      <Header title="Entdecken 🌍" onBack={onBack} />
      <FlatList
        data={publicPosts}
        keyExtractor={(p) => p.id}
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
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.author}>{authorLine(item)}</Text>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.photo} />
            ) : null}
            <Text style={styles.title}>
              {CATEGORY_EMOJI[item.category]} {item.title}
            </Text>
            {item.brand ? (
              <Text style={styles.brand}>{item.brand}</Text>
            ) : null}
            {item.review ? (
              <View style={styles.reviewBox}>
                <HeartRating rating={item.review.rating} />
                {item.review.comment ? (
                  <Text style={styles.comment}>„{item.review.comment}“</Text>
                ) : null}
              </View>
            ) : null}
            {item.helpfulUserIds.length > 0 ? (
              <Text style={styles.helpful}>
                💖 {item.helpfulUserIds.length}× als hilfreich markiert
              </Text>
            ) : null}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
