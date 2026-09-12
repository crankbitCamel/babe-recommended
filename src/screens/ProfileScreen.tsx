import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header } from '../components/ui';
import {
  AESTHETICS,
  spacing,
  ThemeColors,
  useColors,
} from '../theme';
import {
  BADGES,
  badgesFor,
  canPostPublic,
  GroupAddPolicy,
  HELPFUL_POINTS,
  nextBadge,
  User,
} from '../types';

export function ProfileScreen({
  user,
  friends,
  aestheticId,
  onChangeAesthetic,
  onTogglePublic,
  onSetAddPolicy,
  onBack,
}: {
  user: User;
  friends: User[];
  aestheticId: string;
  onChangeAesthetic: (id: string) => void;
  onTogglePublic: () => void;
  onSetAddPolicy: (policy: GroupAddPolicy) => void;
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const earned = badgesFor(user.points);
  const next = nextBadge(user.points);
  const progress = next ? Math.min(user.points / next.minPoints, 1) : 1;

  return (
    <View style={styles.container}>
      <Header title="Mein Profil 🏅" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.pointsCard}>
          <Text style={styles.avatar}>{user.emoji}</Text>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.points}>{user.points} Punkte</Text>
          {next ? (
            <>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <Text style={styles.nextHint}>
                Noch {next.minPoints - user.points} Punkte bis {next.emoji}{' '}
                {next.name}
              </Text>
            </>
          ) : (
            <Text style={styles.nextHint}>
              Du hast alle Badges — Queen-Status! 👑
            </Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Deine Badges</Text>
        {BADGES.map((badge) => {
          const has = earned.some((b) => b.id === badge.id);
          return (
            <Card
              key={badge.id}
              style={has ? undefined : styles.lockedBadge}
            >
              <View style={styles.badgeRow}>
                <Text style={styles.badgeEmoji}>
                  {has ? badge.emoji : '🔒'}
                </Text>
                <View style={styles.badgeText}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeReq}>
                    ab {badge.minPoints} Punkten
                  </Text>
                </View>
                {has ? <Text style={styles.badgeCheck}>✓</Text> : null}
              </View>
            </Card>
          );
        })}

        <Text style={styles.sectionTitle}>Privatsphäre 🔐</Text>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Öffentliches Profil</Text>
              <Text style={styles.settingHint}>
                {user.isPublic
                  ? 'Aktiv: Du bist über die Suche findbar und kannst öffentliche Gruppen erstellen.'
                  : 'Aus (Standard): Nur Deine Freundinnen und Gruppen sehen Dich.'}
              </Text>
            </View>
            <Pressable
              onPress={onTogglePublic}
              style={[styles.toggle, user.isPublic && styles.toggleOn]}
            >
              <Text style={styles.toggleText}>
                {user.isPublic ? '🌍 An' : 'Aus'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.settingDivider} />

          <Text style={styles.settingTitle}>
            Wer darf Dich zu Gruppen hinzufügen?
          </Text>
          <View style={styles.policyRow}>
            <Pressable
              onPress={() => onSetAddPolicy('friends')}
              style={[
                styles.policyPill,
                user.groupAddPolicy === 'friends' && styles.policyActive,
              ]}
            >
              <Text
                style={[
                  styles.policyText,
                  user.groupAddPolicy === 'friends' &&
                    styles.policyTextActive,
                ]}
              >
                👯 Nur Freundinnen
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSetAddPolicy('everyone')}
              style={[
                styles.policyPill,
                user.groupAddPolicy === 'everyone' && styles.policyActive,
              ]}
            >
              <Text
                style={[
                  styles.policyText,
                  user.groupAddPolicy === 'everyone' &&
                    styles.policyTextActive,
                ]}
              >
                🌍 Alle
              </Text>
            </Pressable>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>
          Meine Freundinnen ({friends.length}) 👯
        </Text>
        <Card>
          {friends.length === 0 ? (
            <Text style={styles.settingHint}>
              Noch keine — finde Freundinnen über die Suche im
              Entdecken-Feed 🔎
            </Text>
          ) : (
            friends.map((friend) => (
              <Text key={friend.id} style={styles.friendRow}>
                {friend.emoji} {friend.name}
                {friend.isPublic ? '  🌍' : ''}
              </Text>
            ))
          )}
        </Card>

        <Text style={styles.sectionTitle}>Aesthetic 🎨</Text>
        <View style={styles.aestheticRow}>
          {AESTHETICS.map((a) => {
            const active = a.id === aestheticId;
            return (
              <Pressable
                key={a.id}
                onPress={() => onChangeAesthetic(a.id)}
                style={[
                  styles.aestheticCard,
                  { backgroundColor: a.colors.background },
                  active && styles.aestheticActive,
                ]}
              >
                <Text style={styles.aestheticEmoji}>{a.emoji}</Text>
                <Text
                  style={[styles.aestheticName, { color: a.colors.text }]}
                >
                  {a.name}
                </Text>
                <View style={styles.dots}>
                  <View
                    style={[styles.dot, { backgroundColor: a.colors.primary }]}
                  />
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: a.colors.primarySoft },
                    ]}
                  />
                  <View
                    style={[styles.dot, { backgroundColor: a.colors.success }]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        <Card>
          <Text style={styles.rulesTitle}>So sammelst Du Punkte</Text>
          <Text style={styles.rule}>
            💖 Eine Freundin markiert Deine Empfehlung als hilfreich: +
            {HELPFUL_POINTS} Punkte
          </Text>
          <Text style={styles.rule}>
            🌍 Mit Deinem ersten Badge kannst Du Empfehlungen öffentlich im
            Entdecken-Feed posten — nicht nur in Deinen privaten Gruppen.
            {canPostPublic(user.points)
              ? ' Freigeschaltet! ✓'
              : ' Noch gesperrt.'}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  pointsCard: { alignItems: 'center' },
  avatar: { fontSize: 48 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  points: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: spacing.s,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
    marginTop: spacing.s,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  nextHint: { color: colors.textMuted, marginTop: spacing.s },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
  },
  lockedBadge: { opacity: 0.5 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  badgeEmoji: { fontSize: 32 },
  badgeText: { flex: 1, marginLeft: spacing.m },
  badgeName: { fontWeight: '700', color: colors.text, fontSize: 16 },
  badgeReq: { color: colors.textMuted, marginTop: 2 },
  badgeCheck: { color: colors.success, fontSize: 22, fontWeight: '800' },
  rulesTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
  },
  rule: { color: colors.textMuted, marginBottom: spacing.s, lineHeight: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  settingText: { flex: 1, marginRight: spacing.m },
  settingTitle: { fontWeight: '700', color: colors.text },
  settingHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  toggle: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  toggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { color: colors.text, fontWeight: '700' },
  settingDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.m,
  },
  policyRow: { flexDirection: 'row', gap: spacing.s, marginTop: spacing.s },
  policyPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.s,
    alignItems: 'center',
  },
  policyActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  policyText: { color: colors.text, fontWeight: '600', fontSize: 12 },
  policyTextActive: { color: '#fff' },
  friendRow: {
    color: colors.text,
    fontWeight: '600',
    paddingVertical: spacing.xs,
  },
  aestheticRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  aestheticCard: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  aestheticActive: { borderColor: colors.primary, borderWidth: 2 },
  aestheticEmoji: { fontSize: 22 },
  aestheticName: { fontWeight: '700', marginTop: spacing.xs, fontSize: 12 },
  dots: { flexDirection: 'row', gap: 4, marginTop: spacing.s },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
