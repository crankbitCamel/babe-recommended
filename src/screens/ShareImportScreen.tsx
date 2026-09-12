import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { extractProductCandidates } from '../api/extract';
import { ProductHit, searchProducts, SOURCE_EMOJI } from '../api/products';
import { Card, Header, Pill, PrimaryButton } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';

const SAMPLE_TRANSCRIPT =
  'okay girls, ich hab jetzt zwei Wochen das virale Niacinamide Serum von ' +
  'The Ordinary getestet und ich bin OBSESSED, meine Poren sind wie ' +
  'wegretuschiert… danach noch schnell die Sky High Mascara drüber und ' +
  'zack, Wimpern für die Götter 😍';

/**
 * Simulierte iOS Share-Extension: ein TikTok-Video wird an die App geteilt,
 * das Transkript ausgewertet und erkannte Produkte auf die Wishlist gelegt.
 * (Real: Video-Link via Share-Sheet, Audio-Transkription serverseitig,
 * LLM-Extraktion — siehe README.)
 */
export function ShareImportScreen({
  onBack,
  onAdd,
}: {
  onBack: () => void;
  onAdd: (item: { title: string; brand?: string; imageUrl?: string }) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);

  const runExtraction = () => {
    setSelected(null);
    setHits([]);
    setCandidates(extractProductCandidates(transcript));
  };

  const pickCandidate = async (candidate: string) => {
    setSelected(candidate);
    setLoading(true);
    setHits(await searchProducts(candidate));
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Geteiltes Video 🎵" onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.label}>Video-Transkript</Text>
          <Text style={styles.hint}>
            Kommt real automatisch mit dem geteilten Video — hier zum
            Ausprobieren editierbar:
          </Text>
          <TextInput
            style={styles.transcript}
            multiline
            value={transcript}
            onChangeText={setTranscript}
          />
          <PrimaryButton
            label="🔍 Produkte im Transkript erkennen"
            disabled={!transcript.trim()}
            onPress={runExtraction}
          />
        </Card>

        {candidates !== null ? (
          <Card>
            <Text style={styles.label}>
              {candidates.length > 0
                ? 'Erkannte Produkte — tippe zum Abgleichen:'
                : 'Kein Produkt im Transkript erkannt 🤔'}
            </Text>
            <View style={styles.pills}>
              {candidates.map((c) => (
                <Pill
                  key={c}
                  label={c}
                  selected={c === selected}
                  onPress={() => pickCandidate(c)}
                />
              ))}
            </View>

            {loading ? (
              <ActivityIndicator
                color={colors.primary}
                style={styles.spinner}
              />
            ) : null}

            {selected && !loading ? (
              <>
                {hits.map((hit) => (
                  <Pressable
                    key={hit.id}
                    onPress={() =>
                      onAdd({
                        title: hit.name,
                        brand: hit.brand,
                        imageUrl: hit.imageUrl,
                      })
                    }
                  >
                    <Card style={styles.hitCard}>
                      {hit.imageUrl ? (
                        <Image
                          source={{ uri: hit.imageUrl }}
                          style={styles.hitImage}
                        />
                      ) : (
                        <View
                          style={[styles.hitImage, styles.hitImageFallback]}
                        >
                          <Text style={styles.hitEmoji}>
                            {SOURCE_EMOJI[hit.source]}
                          </Text>
                        </View>
                      )}
                      <View style={styles.hitText}>
                        <Text style={styles.hitName} numberOfLines={2}>
                          {hit.name}
                        </Text>
                        {hit.brand ? (
                          <Text style={styles.hitBrand}>{hit.brand}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.hitAdd}>🤍</Text>
                    </Card>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => onAdd({ title: selected })}
                  style={styles.rawButton}
                >
                  <Text style={styles.rawButtonText}>
                    „{selected}“ direkt auf die Wishlist
                  </Text>
                </Pressable>
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
  label: { fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  hint: { color: colors.textMuted, marginBottom: spacing.s, fontSize: 12 },
  transcript: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.m,
    minHeight: 110,
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.m,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  spinner: { marginVertical: spacing.m },
  hitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  hitImage: { width: 48, height: 48, borderRadius: 8 },
  hitImageFallback: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitEmoji: { fontSize: 20 },
  hitText: { flex: 1, marginLeft: spacing.m },
  hitName: { fontWeight: '600', color: colors.text },
  hitBrand: { color: colors.textMuted, marginTop: 2 },
  hitAdd: { fontSize: 20, marginLeft: spacing.s },
  rawButton: { marginTop: spacing.s, alignItems: 'center' },
  rawButtonText: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
