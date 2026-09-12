import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Header, PrimaryButton } from '../components/ui';
import { colors, spacing } from '../theme';
import { TikTokSave } from '../types';

/**
 * Simulierter TikTok-Import: gespeicherte Videos durchgehen und erkannte
 * Produkte auf die Wishlist übernehmen. (Real: iOS Share-Extension, da
 * TikTok kein öffentliches API für Saves anbietet — siehe README.)
 */
export function TikTokImportScreen({
  saves,
  onBack,
  onImport,
}: {
  saves: TikTokSave[];
  onBack: () => void;
  onImport: (saveIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const pending = saves.filter((s) => !s.imported);

  const toggle = (id: string) =>
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );

  return (
    <View style={styles.container}>
      <Header title="TikTok-Saves 🎵" onBack={onBack} />
      <FlatList
        data={pending}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.intro}>
            In Deinen gespeicherten Videos erkannte Produkte — wähle aus, was
            auf die Wishlist soll:
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Alles importiert — nichts Neues in Deinen Saves ✨
          </Text>
        }
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <Pressable onPress={() => toggle(item.id)}>
              <Card style={isSelected ? styles.selectedCard : undefined}>
                <View style={styles.row}>
                  <Text style={styles.check}>{isSelected ? '💖' : '🤍'}</Text>
                  <View style={styles.text}>
                    <Text style={styles.product}>
                      {item.productGuess}
                      {item.brand ? ` · ${item.brand}` : ''}
                    </Text>
                    <Text style={styles.video} numberOfLines={1}>
                      „{item.videoTitle}“
                    </Text>
                    <Text style={styles.creator}>{item.creator}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListFooterComponent={
          pending.length > 0 ? (
            <View style={styles.footer}>
              <PrimaryButton
                label={`${selected.length} Produkt${
                  selected.length === 1 ? '' : 'e'
                } auf die Wishlist 🤍`}
                disabled={selected.length === 0}
                onPress={() => onImport(selected)}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.m },
  intro: { color: colors.textMuted, marginBottom: spacing.m, lineHeight: 20 },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  selectedCard: { borderColor: colors.primary, borderWidth: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  check: { fontSize: 24, marginRight: spacing.m },
  text: { flex: 1 },
  product: { fontWeight: '700', color: colors.text },
  video: { color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  creator: { color: colors.primary, marginTop: 2, fontSize: 12 },
  footer: { marginTop: spacing.s },
});
