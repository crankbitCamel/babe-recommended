import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing, ThemeColors, useColors } from '../theme';

export type TabKey = 'feed' | 'groups' | 'write' | 'lists';

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'feed', icon: '🏠', label: 'Feed' },
  { key: 'groups', icon: '👯', label: 'Gruppen' },
  { key: 'write', icon: '✍️', label: 'Bewerten' },
  { key: 'lists', icon: '📋', label: 'Listen' },
];

/** Bottom-Navigation mit den vier Haupt-Tabs der App. */
export function TabBar({
  active,
  onPress,
}: {
  active: TabKey;
  onPress: (key: TabKey) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onPress(tab.key)}
            style={styles.item}
          >
            <View style={[styles.iconWrap, isActive && styles.iconActive]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.s,
      paddingBottom: spacing.m,
    },
    item: { flex: 1, alignItems: 'center' },
    iconWrap: {
      paddingHorizontal: spacing.m,
      paddingVertical: 2,
      borderRadius: 999,
    },
    iconActive: { backgroundColor: colors.primarySoft },
    icon: { fontSize: 20 },
    label: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    labelActive: { color: colors.primary, fontWeight: '700' },
  });
