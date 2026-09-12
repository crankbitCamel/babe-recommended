import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card, Header, PrimaryButton } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import { Group, topBadge, User } from '../types';

export function GroupsScreen({
  groups,
  users,
  currentUser,
  unreadCount,
  onOpenGroup,
  onOpenNotifications,
  onOpenDiscover,
  onOpenProfile,
  onOpenWishlist,
  wishlistCount,
  onCreateGroup,
}: {
  groups: Group[];
  users: User[];
  currentUser: User;
  unreadCount: number;
  onOpenGroup: (groupId: string) => void;
  onOpenNotifications: () => void;
  onOpenDiscover: () => void;
  onOpenProfile: () => void;
  onOpenWishlist: () => void;
  wishlistCount: number;
  onCreateGroup: (name: string) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const badge = topBadge(currentUser.points);
  const [newGroupName, setNewGroupName] = useState('');

  const memberNames = (group: Group) =>
    group.memberIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => !!u)
      .map((u) => `${u.emoji} ${u.name}`)
      .join('  ');

  return (
    <View style={styles.container}>
      <Header
        title="babe recommended 💖"
        right={
          <Pressable onPress={onOpenNotifications} hitSlop={12}>
            <Text style={styles.bell}>
              🔔{unreadCount > 0 ? ` ${unreadCount}` : ''}
            </Text>
          </Pressable>
        }
      />
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.navRow}>
            <Pressable onPress={onOpenDiscover} style={styles.navCard}>
              <Text style={styles.navEmoji}>🌍</Text>
              <Text style={styles.navLabel}>Entdecken</Text>
            </Pressable>
            <Pressable onPress={onOpenWishlist} style={styles.navCard}>
              <Text style={styles.navEmoji}>🤍</Text>
              <Text style={styles.navLabel}>
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
              </Text>
            </Pressable>
            <Pressable onPress={onOpenProfile} style={styles.navCard}>
              <Text style={styles.navEmoji}>{badge ? badge.emoji : '🏅'}</Text>
              <Text style={styles.navLabel}>
                {currentUser.points} Punkte
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenGroup(item.id)}>
            <Card>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.members}>{memberNames(item)}</Text>
              <Text style={styles.invite}>
                Einladungscode: {item.inviteCode}
              </Text>
            </Card>
          </Pressable>
        )}
        ListFooterComponent={
          <Card>
            <Text style={styles.newGroupLabel}>Neue Gruppe erstellen</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. Make-up-Mädels"
              placeholderTextColor={colors.textMuted}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <PrimaryButton
              label="Gruppe erstellen"
              disabled={!newGroupName.trim()}
              onPress={() => {
                onCreateGroup(newGroupName.trim());
                setNewGroupName('');
              }}
            />
          </Card>
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.m },
  navRow: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.m,
  },
  navCard: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  navEmoji: { fontSize: 24 },
  navLabel: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  bell: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  groupName: { fontSize: 18, fontWeight: '700', color: colors.text },
  members: { marginTop: spacing.s, color: colors.textMuted },
  invite: { marginTop: spacing.s, color: colors.primary, fontWeight: '600' },
  newGroupLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.m,
    color: colors.text,
    backgroundColor: colors.background,
  },
});
