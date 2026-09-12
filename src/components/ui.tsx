import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { spacing, ThemeColors, useColors } from '../theme';

function useStyles() {
  const colors = useColors();
  return React.useMemo(() => createStyles(colors), [colors]);
}

export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function HeartRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (rating: number) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.hearts}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Pressable
          key={value}
          disabled={!onChange}
          onPress={() => onChange?.(value)}
          hitSlop={6}
        >
          <Text style={styles.heart}>{value <= rating ? '💗' : '🤍'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  backButton: { width: 32 },
  backText: { fontSize: 32, color: colors.primary, lineHeight: 32 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  headerRight: { width: 32, alignItems: 'flex-end' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  pill: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.s,
    marginBottom: spacing.s,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: { color: colors.text },
  pillTextSelected: { color: '#fff', fontWeight: '600' },
  hearts: { flexDirection: 'row', gap: spacing.s },
  heart: { fontSize: 28 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
