import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReviewCard } from '../components/ReviewCard';
import { Card, Header, PrimaryButton } from '../components/ui';
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import {
  CATEGORY_EMOJI,
  Group,
  ProductPost,
  topBadge,
  User,
} from '../types';

export function GroupFeedScreen({
  group,
  posts,
  users,
  onBack,
  onNewPost,
  onOpenReview,
  onOpenDetail,
  onOpenMembers,
  onSimulateFourWeeks,
}: {
  group: Group;
  posts: ProductPost[];
  users: User[];
  onBack: () => void;
  onNewPost: () => void;
  onOpenReview: (postId: string) => void;
  onOpenDetail: (postId: string) => void;
  onOpenMembers: () => void;
  onSimulateFourWeeks: (postId: string) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const findAuthor = (post: ProductPost) =>
    users.find((u) => u.id === post.authorId);

  const isDue = (post: ProductPost) =>
    !post.review && post.reviewDueAt <= Date.now();

  return (
    <View style={styles.container}>
      <Header
        title={group.name}
        onBack={onBack}
        right={
          <Pressable onPress={onOpenMembers} hitSlop={12}>
            <Text style={styles.membersIcon}>👥</Text>
          </Pressable>
        }
      />
      {/* Fest verankert (nicht Teil der Liste), damit der Button nie wegscrollen kann */}
      <View style={styles.newPostWrap}>
        <PrimaryButton label="+ Produkt teilen" onPress={onNewPost} />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Noch keine Produkte — teile das erste! 🛍️
          </Text>
        }
        renderItem={({ item }) => {
          const author = findAuthor(item);

          // Bewertete Produkte: kompakte Review-Karte, Tap öffnet Details
          if (item.review) {
            return (
              <ReviewCard
                post={item}
                author={author}
                authorBadgeEmoji={
                  author ? topBadge(author.points)?.emoji : undefined
                }
                onPress={() => onOpenDetail(item.id)}
              />
            );
          }

          // Noch unbewertet: Produkt-Post mit Check-in-Status
          return (
            <Card>
              <View style={styles.postHeader}>
                <Text style={styles.author}>
                  {author ? `${author.emoji} ${author.name}` : '❓'}
                </Text>
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
              {item.note ? (
                <Text style={styles.note}>„{item.note}“</Text>
              ) : null}

              {isDue(item) && item.authorId === CURRENT_USER_ID ? (
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
                      <Text style={styles.simulate}>
                        ⏩ 4 Wochen simulieren
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </Card>
          );
        }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.m, paddingTop: 0 },
    newPostWrap: {
      paddingHorizontal: spacing.m,
      paddingBottom: spacing.m,
    },
    membersIcon: { fontSize: 20 },
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
    note: {
      color: colors.textMuted,
      marginTop: spacing.s,
      fontStyle: 'italic',
    },
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
  });
