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
  users,
  unreadCount,
  onOpenGroup,
  onOpenNotifications,
  onCreateGroup,
}: {
  groups: Group[];
  users: User[];
  unreadCount: number;
  onOpenGroup: (groupId: string) => void;
  onOpenNotifications: () => void;
  onCreateGroup: (name: string) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
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
