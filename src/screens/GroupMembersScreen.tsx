import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header } from '../components/ui';
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import { Group, topBadge, User } from '../types';

/**
 * Mitglieder einer Gruppe verwalten. Hinzugefügt werden können nur
 * Deine Freundinnen — und nur, wenn deren Privacy-Einstellung
 * („Wer darf mich zu Gruppen hinzufügen?“) das erlaubt.
 */
export function GroupMembersScreen({
  group,
  users,
  currentUser,
  onAddMember,
  onBack,
}: {
  group: Group;
  users: User[];
  currentUser: User;
  onAddMember: (userId: string) => void;
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const members = group.memberIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => !!u);

  // Kandidatinnen: Freundinnen, die noch nicht in der Gruppe sind
  const candidates = currentUser.friendIds
    .filter((id) => !group.memberIds.includes(id))
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => !!u);

  return (
    <View style={styles.container}>
      <Header title={`${group.name} 👥`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {group.isPublic ? (
          <Text style={styles.publicNote}>
            🌍 Öffentliche Gruppe — jede kann beitreten
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>
          Mitglieder ({members.length})
        </Text>
        {members.map((member) => {
          const badge = topBadge(member.points);
          return (
            <Card key={member.id} style={styles.row}>
              <Text style={styles.rowEmoji}>{member.emoji}</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowName}>
                  {member.name}
                  {member.id === group.ownerId ? ' · Gründerin' : ''}
                </Text>
                {badge ? (
                  <Text style={styles.rowMeta}>
                    {badge.emoji} {badge.name}
                  </Text>
                ) : null}
              </View>
              {member.id === CURRENT_USER_ID ? (
                <Text style={styles.you}>Du</Text>
              ) : null}
            </Card>
          );
        })}

        <Text style={styles.sectionTitle}>Freundinnen hinzufügen</Text>
        {candidates.length === 0 ? (
          <Card>
            <Text style={styles.empty}>
              Alle Deine Freundinnen sind schon dabei — neue findest Du über
              die Suche im Entdecken-Feed 🔎
            </Text>
          </Card>
        ) : (
          candidates.map((friend) => (
            <Card key={friend.id} style={styles.row}>
              <Text style={styles.rowEmoji}>{friend.emoji}</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowName}>{friend.name}</Text>
              </View>
              <Pressable
                onPress={() => onAddMember(friend.id)}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>➕ Hinzufügen</Text>
              </Pressable>
            </Card>
          ))
        )}

        <Text style={styles.inviteNote}>
          Oder teile den Einladungscode: {group.inviteCode}
        </Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    publicNote: {
      color: colors.primary,
      fontWeight: '600',
      marginBottom: spacing.m,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.s,
      marginTop: spacing.s,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    rowEmoji: { fontSize: 26 },
    rowText: { flex: 1, marginLeft: spacing.m },
    rowName: { fontWeight: '700', color: colors.text },
    rowMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    you: { color: colors.textMuted, fontWeight: '600' },
    addButton: {
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
    },
    addButtonText: { color: colors.primary, fontWeight: '700' },
    empty: { color: colors.textMuted, lineHeight: 20 },
    inviteNote: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.m,
      fontSize: 12,
    },
  });
