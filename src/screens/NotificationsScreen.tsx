import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, Header } from '../components/ui';
import { colors, spacing } from '../theme';
import { AppNotification } from '../types';

export function NotificationsScreen({
  notifications,
  onBack,
}: {
  notifications: AppNotification[];
  onBack: () => void;
}) {
  return (
    <View style={styles.container}>
      <Header title="Benachrichtigungen 🔔" onBack={onBack} />
      <FlatList
        data={[...notifications].sort((a, b) => b.createdAt - a.createdAt)}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Alles ruhig — noch nichts Neues 💤</Text>
        }
        renderItem={({ item }) => (
          <Card style={item.read ? styles.read : undefined}>
            <Text style={styles.type}>
              {item.type === 'recommendation'
                ? 'Neue Empfehlung'
                : 'Check-in fällig'}
            </Text>
            <Text style={styles.text}>{item.text}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString('de-DE')}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.m },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  read: { opacity: 0.6 },
  type: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  text: { color: colors.text, fontSize: 15 },
  date: { color: colors.textMuted, marginTop: spacing.s, fontSize: 12 },
});
