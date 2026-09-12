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
import { Group, User } from '../types';

export function GroupsScreen({
  groups,
  publicGroups,
  users,
  unreadCount,
  canCreatePublic,
  onOpenGroup,
  onJoinGroup,
  onOpenNotifications,
  onCreateGroup,
}: {
  groups: Group[];
  /** Öffentliche Gruppen, in denen Du noch nicht Mitglied bist. */
  publicGroups: Group[];
  users: User[];
  unreadCount: number;
  /** Öffentliche Gruppen erstellen dürfen nur öffentliche Profile. */
  canCreatePublic: boolean;
  onOpenGroup: (groupId: string) => void;
  onJoinGroup: (groupId: string) => void;
  onOpenNotifications: () => void;
  onCreateGroup: (name: string, isPublic: boolean) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPublic, setNewGroupPublic] = useState(false);

  const memberNames = (group: Group) =>
    group.memberIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => !!u)
      .map((u) => `${u.emoji} ${u.name}`)
      .join('  ');

  return (
    <View style={styles.container}>
      <Header
        title="Meine Gruppen 👯"
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
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenGroup(item.id)}>
            <Card>
              <Text style={styles.groupName}>
                {item.name}
                {item.isPublic ? '  🌍' : ''}
              </Text>
              <Text style={styles.members}>{memberNames(item)}</Text>
              <Text style={styles.invite}>
                Einladungscode: {item.inviteCode}
              </Text>
            </Card>
          </Pressable>
        )}
        ListFooterComponent={
          <>
            {publicGroups.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>
                  Öffentliche Gruppen zum Beitreten 🌍
                </Text>
                {publicGroups.map((group) => (
                  <Card key={group.id}>
                    <View style={styles.publicRow}>
                      <View style={styles.publicText}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.members}>
                          {group.memberIds.length} Mitglieder
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => onJoinGroup(group.id)}
                        style={styles.joinButton}
                      >
                        <Text style={styles.joinText}>Beitreten</Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
              </>
            ) : null}

            <Card>
              <Text style={styles.newGroupLabel}>Neue Gruppe erstellen</Text>
              <TextInput
                style={styles.input}
                placeholder="z. B. Make-up-Mädels"
                placeholderTextColor={colors.textMuted}
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
              {canCreatePublic ? (
                <Pressable
                  onPress={() => setNewGroupPublic(!newGroupPublic)}
                  style={styles.publicToggle}
                >
                  <Text style={styles.publicToggleText}>
                    {newGroupPublic
                      ? '🌍 Öffentliche Gruppe — jede kann beitreten ✓'
                      : '🔒 Private Gruppe (antippen für öffentlich)'}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.publicLockedHint}>
                  🔒 Privat. Öffentliche Gruppen kannst Du erstellen, sobald
                  Dein Profil öffentlich ist (Profil → Privatsphäre).
                </Text>
              )}
              <PrimaryButton
                label="Gruppe erstellen"
                disabled={!newGroupName.trim()}
                onPress={() => {
                  onCreateGroup(
                    newGroupName.trim(),
                    canCreatePublic && newGroupPublic
                  );
                  setNewGroupName('');
                  setNewGroupPublic(false);
                }}
              />
            </Card>
          </>
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.m },
  bell: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
  publicRow: { flexDirection: 'row', alignItems: 'center' },
  publicText: { flex: 1 },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  joinText: { color: '#fff', fontWeight: '700' },
  publicToggle: { marginBottom: spacing.m, alignItems: 'center' },
  publicToggleText: { color: colors.primary, fontWeight: '600' },
  publicLockedHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.m,
    lineHeight: 17,
  },
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
