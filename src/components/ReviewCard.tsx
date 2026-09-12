import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { spacing, ThemeColors, useColors } from '../theme';
import { CATEGORY_EMOJI, ProductPost, User } from '../types';
import { Card, Stars } from './ui';

/**
 * Kompakte Review-Karte (nach Mockup):
 * oben links Produktbild, daneben Marke + Produkttitel,
 * darunter der kurze Kommentar, unten links die Sternebewertung,
 * unten rechts Avatar + Name der Reviewerin. Tap öffnet die Detailansicht.
 */
export function ReviewCard({
  post,
  author,
  authorBadgeEmoji,
  onPress,
}: {
  post: ProductPost;
  author?: User;
  authorBadgeEmoji?: string;
  onPress: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const review = post.review;
  if (!review) return null;

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.topRow}>
          {post.photoUri ? (
            <Image source={{ uri: post.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <Text style={styles.photoEmoji}>
                {CATEGORY_EMOJI[post.category]}
              </Text>
            </View>
          )}
          <View style={styles.titleBlock}>
            {post.brand ? (
              <Text style={styles.brand} numberOfLines={1}>
                {post.brand.toUpperCase()}
              </Text>
            ) : null}
            <Text style={styles.title} numberOfLines={2}>
              {post.title}
            </Text>
            <Text style={styles.category}>
              {CATEGORY_EMOJI[post.category]} {post.category}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {review.comment ? (
          <Text style={styles.comment} numberOfLines={2}>
            „{review.comment}“
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <View style={styles.ratingBlock}>
            <Stars rating={review.rating} />
            <Text style={styles.ratingText}>{review.rating}/5</Text>
          </View>
          {author ? (
            <View style={styles.authorBlock}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>{author.emoji}</Text>
              </View>
              <Text style={styles.authorName}>
                {author.name}
                {authorBadgeEmoji ? ` ${authorBadgeEmoji}` : ''}
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    topRow: { flexDirection: 'row' },
    photo: { width: 72, height: 72, borderRadius: 12 },
    photoFallback: {
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoEmoji: { fontSize: 28 },
    titleBlock: { flex: 1, marginLeft: spacing.m, justifyContent: 'center' },
    brand: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
    },
    category: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.m,
    },
    comment: {
      color: colors.text,
      fontStyle: 'italic',
      marginBottom: spacing.m,
      lineHeight: 20,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    ratingBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
    ratingText: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
    authorBlock: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.s,
    },
    avatarEmoji: { fontSize: 14 },
    authorName: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  });
