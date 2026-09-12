import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Card, Header } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import { AppNotification, NotificationType } from '../types';

const TYPE_LABELS: Record<NotificationType, string> = {
  review_due: 'Check-in fällig',
  recommendation: 'Neue Empfehlung',
  points: 'Punkte erhalten',
  badge: 'Neues Badge',
};

export function NotificationsScreen({
  notifications,
  onBack,
}: {
  notifications: AppNotification[];
  onBack: () => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
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
            <Text style={styles.type}>{TYPE_LABELS[item.type]}</Text>
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
