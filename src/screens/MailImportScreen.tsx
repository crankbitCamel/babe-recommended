import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  detectShop,
  extractOrderItems,
  MailItem,
} from '../api/mailExtract';
import { Card, Header, Pill, PrimaryButton } from '../components/ui';
import { CURRENT_USER_ID } from '../data';
import { spacing, ThemeColors, useColors } from '../theme';
import { CATEGORY_EMOJI, Group } from '../types';

const SAMPLE_MAIL = `Vielen Dank für Deine Bestellung! 💌
Bestellnummer: 304-58612-77

1× The Ordinary Niacinamide 10% + Zinc Serum   6,80 €
1× Sky High Mascara Waterproof   13,99 €
2× Kneipp Sheabutter Body Butter   8,45 €
1× Matcha Pulver Ceremonial Grade Bio   19,00 €

Zwischensumme: 56,69 €
Lieferung: Standard (2-3 Werktage)`;

/**
 * Simulierter Mail-Import: eine Bestellbestätigung wird an die App geteilt
 * (real: iOS Share-Extension oder Weiterleitungsregel), die Produkte werden
 * on-device erkannt und mit 4-Wochen-Timer in eine Gruppe gepostet —
 * ohne Server, ohne API-Kosten.
 */
export function MailImportScreen({
  groups,
  onBack,
  onImport,
}: {
  groups: Group[];
  onBack: () => void;
  onImport: (groupId: string, items: MailItem[]) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [mailText, setMailText] = useState(SAMPLE_MAIL);
  const [items, setItems] = useState<MailItem[] | null>(null);
  const [shop, setShop] = useState<string | undefined>();
  const [selected, setSelected] = useState<number[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);

  const myGroups = groups.filter((g) =>
    g.memberIds.includes(CURRENT_USER_ID)
  );

  const runExtraction = () => {
    const found = extractOrderItems(mailText);
    setItems(found);
    setShop(detectShop(mailText));
    setSelected(found.map((_, i) => i));
    setGroupId(myGroups[0]?.id ?? null);
  };

  const toggle = (index: number) =>
    setSelected((sel) =>
      sel.includes(index) ? sel.filter((i) => i !== index) : [...sel, index]
    );

  return (
    <View style={styles.container}>
      <Header title="Bestell-Mail 📧" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.label}>Geteilte Bestellbestätigung</Text>
          <Text style={styles.hint}>
            Kommt real per „Teilen → babe recommended“ oder
            Mail-Weiterleitung — hier zum Ausprobieren editierbar. Die
            Auswertung läuft komplett auf dem Handy.
          </Text>
          <TextInput
            style={styles.mail}
            multiline
            value={mailText}
            onChangeText={setMailText}
          />
          <PrimaryButton
            label="🔍 Produkte in der Mail erkennen"
            disabled={!mailText.trim()}
            onPress={runExtraction}
          />
        </Card>

        {items !== null ? (
          <Card>
            <Text style={styles.label}>
              {items.length > 0
                ? `${items.length} Produkt${items.length === 1 ? '' : 'e'} erkannt${
                    shop ? ` · Shop: ${shop}` : ''
                  }`
                : 'Keine Bestellpositionen erkannt 🤔'}
            </Text>

            {items.map((item, index) => {
              const isSelected = selected.includes(index);
              return (
                <Pressable key={index} onPress={() => toggle(index)}>
                  <View
                    style={[
                      styles.itemRow,
                      isSelected && styles.itemSelected,
                    ]}
                  >
                    <Text style={styles.check}>
                      {isSelected ? '💖' : '🤍'}
                    </Text>
                    <View style={styles.itemText}>
                      <Text style={styles.itemTitle}>
                        {item.qty > 1 ? `${item.qty}× ` : ''}
                        {item.title}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {CATEGORY_EMOJI[item.category]} {item.category}
                        {item.price ? ` · ${item.price}` : ''}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {items.length > 0 ? (
              <>
                <Text style={styles.groupLabel}>In welche Gruppe?</Text>
                <View style={styles.pills}>
                  {myGroups.map((g) => (
                    <Pill
                      key={g.id}
                      label={g.name}
                      selected={g.id === groupId}
                      onPress={() => setGroupId(g.id)}
                    />
                  ))}
                </View>
                <Text style={styles.timerHint}>
                  ⏰ Jedes Produkt bekommt automatisch seinen
                  4-Wochen-Check-in.
                </Text>
                <PrimaryButton
                  label={`${selected.length} Produkt${
                    selected.length === 1 ? '' : 'e'
                  } in die Gruppe posten`}
                  disabled={selected.length === 0 || !groupId}
                  onPress={() =>
                    onImport(
                      groupId!,
                      selected
                        .slice()
                        .sort((a, b) => a - b)
                        .map((i) => items[i])
                    )
                  }
                />
              </>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: spacing.m },
    label: {
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    hint: { color: colors.textMuted, marginBottom: spacing.s, fontSize: 12 },
    mail: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.m,
      minHeight: 160,
      textAlignVertical: 'top',
      color: colors.text,
      backgroundColor: colors.background,
      marginBottom: spacing.m,
      fontSize: 13,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: spacing.m,
      marginTop: spacing.s,
    },
    itemSelected: { borderColor: colors.primary, borderWidth: 2 },
    check: { fontSize: 20, marginRight: spacing.m },
    itemText: { flex: 1 },
    itemTitle: { color: colors.text, fontWeight: '600' },
    itemMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    groupLabel: {
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.l,
      marginBottom: spacing.s,
    },
    pills: { flexDirection: 'row', flexWrap: 'wrap' },
    timerHint: {
      color: colors.textMuted,
      marginVertical: spacing.m,
      textAlign: 'center',
      fontSize: 12,
    },
  });
