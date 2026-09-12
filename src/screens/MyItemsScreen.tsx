import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ReviewCard } from '../components/ReviewCard';
import { Header } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import { ProductPost, topBadge, User } from '../types';

/** Gefilterte eigene Produkte: getestet oder empfohlen. */
export function MyItemsScreen({
  title,
  posts,
  users,
  onOpenDetail,
  onBack,
}: {
  title: string;
  posts: ProductPost[];
  users: User[];
  onOpenDetail: (postId: string) => void;
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Header title={title} onBack={onBack} />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Hier ist noch nichts — dranbleiben ✨</Text>
        }
        renderItem={({ item }) => {
          const author = users.find((u) => u.id === item.authorId);
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
        }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.m },
    empty: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: spacing.xl,
    },
  });
