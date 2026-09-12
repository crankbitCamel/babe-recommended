import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header, PrimaryButton } from '../components/ui';
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import { CATEGORY_EMOJI, Group, ProductPost } from '../types';

/**
 * Tab „Bewerten“: fällige 4-Wochen-Check-ins abarbeiten
 * und neue Produkte in eine Gruppe posten.
 */
export function WriteReviewScreen({
  posts,
  groups,
  onOpenReview,
  onSimulateFourWeeks,
  onShareToGroup,
}: {
  posts: ProductPost[];
  groups: Group[];
  onOpenReview: (postId: string) => void;
  onSimulateFourWeeks: (postId: string) => void;
  onShareToGroup: (groupId: string) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const now = Date.now();
  const own = posts.filter((p) => p.authorId === CURRENT_USER_ID);
  const due = own.filter((p) => !p.review && p.reviewDueAt <= now);
  const upcoming = own
    .filter((p) => !p.review && p.reviewDueAt > now)
    .sort((a, b) => a.reviewDueAt - b.reviewDueAt);
  const myGroups = groups.filter((g) =>
    g.memberIds.includes(CURRENT_USER_ID)
  );

  return (
    <View style={styles.container}>
      <Header title="Bewerten ✍️" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Fällige Check-ins ⏰</Text>
        {due.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              Nichts fällig — alle Produkte sind bewertet oder noch in der
              4-Wochen-Testphase ✨
            </Text>
          </Card>
        ) : (
          due.map((post) => (
            <Card key={post.id}>
              <Text style={styles.productTitle}>
                {CATEGORY_EMOJI[post.category]} {post.title}
              </Text>
              <Text style={styles.meta}>
                Gekauft am{' '}
                {new Date(post.createdAt).toLocaleDateString('de-DE')} — 4
                Wochen sind um!
              </Text>
              <PrimaryButton
                label="Jetzt bewerten"
                onPress={() => onOpenReview(post.id)}
              />
            </Card>
          ))
        )}

        {upcoming.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>In der Testphase ⏳</Text>
            {upcoming.map((post) => (
              <Card key={post.id}>
                <Text style={styles.productTitle}>
                  {CATEGORY_EMOJI[post.category]} {post.title}
                </Text>
                <View style={styles.upcomingRow}>
                  <Text style={styles.meta}>
                    Check-in am{' '}
                    {new Date(post.reviewDueAt).toLocaleDateString('de-DE')}
                  </Text>
                  <Pressable
                    onPress={() => onSimulateFourWeeks(post.id)}
                    hitSlop={8}
                  >
                    <Text style={styles.simulate}>⏩ simulieren</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Neues Produkt teilen 🛍️</Text>
        <Card>
          <Text style={styles.meta}>In welche Gruppe soll es?</Text>
          {myGroups.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => onShareToGroup(group.id)}
              style={styles.groupButton}
            >
              <Text style={styles.groupButtonText}>{group.name}</Text>
              <Text style={styles.groupArrow}>›</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.s,
      marginTop: spacing.s,
    },
    emptyText: { color: colors.textMuted, lineHeight: 20 },
    productTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    meta: { color: colors.textMuted, marginBottom: spacing.m },
    upcomingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    simulate: { color: colors.primary, fontWeight: '600' },
    groupButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderRadius: 12,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.m,
      marginTop: spacing.s,
    },
    groupButtonText: { color: colors.primary, fontWeight: '700' },
    groupArrow: { color: colors.primary, fontSize: 20, fontWeight: '700' },
  });
