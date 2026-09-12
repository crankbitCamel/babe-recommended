import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReviewCard } from '../components/ReviewCard';
import { Card, Header } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import { ProductPost, topBadge, User } from '../types';

/** Öffentliches Profil einer anderen Nutzerin (nur mit Opt-in sichtbar). */
export function PublicProfileScreen({
  user,
  isFriend,
  publicPosts,
  onAddFriend,
  onOpenDetail,
  onBack,
}: {
  user: User;
  isFriend: boolean;
  publicPosts: ProductPost[];
  onAddFriend: () => void;
  onOpenDetail: (postId: string) => void;
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const badge = topBadge(user.points);

  return (
    <View style={styles.container}>
      <Header title="Profil" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.headCard}>
          <Text style={styles.avatar}>{user.emoji}</Text>
          <Text style={styles.name}>{user.name}</Text>
          {badge ? (
            <Text style={styles.badge}>
              {badge.emoji} {badge.name}
            </Text>
          ) : null}
          <Text style={styles.points}>{user.points} Punkte · 🌍 öffentlich</Text>
          {isFriend ? (
            <Text style={styles.friendState}>✓ Ihr seid befreundet</Text>
          ) : (
            <Pressable onPress={onAddFriend} style={styles.friendButton}>
              <Text style={styles.friendButtonText}>
                ➕ Als Freundin hinzufügen
              </Text>
            </Pressable>
          )}
        </Card>

        <Text style={styles.sectionTitle}>
          Öffentliche Empfehlungen ({publicPosts.length})
        </Text>
        {publicPosts.length === 0 ? (
          <Card>
            <Text style={styles.empty}>Noch keine öffentlichen Reviews.</Text>
          </Card>
        ) : (
          publicPosts.map((post) => (
            <ReviewCard
              key={post.id}
              post={post}
              author={user}
              authorBadgeEmoji={badge?.emoji}
              onPress={() => onOpenDetail(post.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    headCard: { alignItems: 'center' },
    avatar: { fontSize: 48 },
    name: { fontSize: 22, fontWeight: '800', color: colors.text },
    badge: { color: colors.primary, fontWeight: '700', marginTop: spacing.xs },
    points: { color: colors.textMuted, marginTop: spacing.xs },
    friendState: {
      color: colors.success,
      fontWeight: '700',
      marginTop: spacing.m,
    },
    friendButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingHorizontal: spacing.l,
      paddingVertical: spacing.s + 2,
      marginTop: spacing.m,
    },
    friendButtonText: { color: '#fff', fontWeight: '700' },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.s,
    },
    empty: { color: colors.textMuted },
  });
