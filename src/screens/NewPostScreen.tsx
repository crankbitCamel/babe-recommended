import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  fetchLinkPreview,
  looksLikeUrl,
  normalizeUrl,
} from '../api/linkPreview';
import {
  lookupBarcode,
  ProductHit,
  searchProducts,
  SOURCE_EMOJI,
} from '../api/products';
import { Card, Header, Pill, PrimaryButton } from '../components/ui';
import { spacing, ThemeColors, useColors } from '../theme';
import { CATEGORIES, Category, Group } from '../types';

export interface NewPostInput {
  title: string;
  category: Category;
  brand?: string;
  barcode?: string;
  photoUri?: string;
  price?: string;
  shopLink?: string;
  note?: string;
}

type Mode = 'pick' | 'scan' | 'form';

export function NewPostScreen({
  group,
  onBack,
  onSubmit,
}: {
  group: Group;
  onBack: () => void;
  onSubmit: (input: NewPostInput) => void;
}) {
  const colors = useColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [mode, setMode] = useState<Mode>('pick');

  // Suche
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scanner
  const [permission, requestPermission] = useCameraPermissions();
  const [scanError, setScanError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const handledBarcode = useRef<string | null>(null);

  // Formular
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState<string | undefined>();
  const [category, setCategory] = useState<Category>('Skincare');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [price, setPrice] = useState('');
  const [shopLink, setShopLink] = useState('');
  const [note, setNote] = useState('');

  // Link-Import
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const isUrl = looksLikeUrl(query);

  // Live-Vorschläge beim Tippen (debounced) gegen Beauty/Food/Books
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setLinkError(null);
    if (isUrl || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const hits = await searchProducts(query.trim());
      setResults(hits);
      setSearching(false);
    }, 250);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query, isUrl]);

  const importFromLink = async () => {
    const url = normalizeUrl(query);
    setLinkLoading(true);
    setLinkError(null);
    const preview = await fetchLinkPreview(url);
    setLinkLoading(false);
    if (preview) {
      setTitle(preview.title ?? '');
      setBrand(preview.siteName ?? '');
      setPhotoUri(preview.imageUrl);
      setPrice(preview.price ?? '');
      setShopLink(url);
      setMode('form');
    } else {
      // Fallback: Link übernehmen, Details manuell ergänzen
      setShopLink(url);
      setLinkError(
        'Konnte die Seite nicht auslesen — der Link wird übernommen, Details bitte kurz ergänzen.'
      );
      setMode('form');
    }
  };

  const applyHit = (hit: ProductHit) => {
    setTitle(hit.name);
    setBrand(hit.brand ?? '');
    setBarcode(hit.barcode);
    setCategory(hit.suggestedCategory);
    setPhotoUri(hit.imageUrl);
    setMode('form');
  };

  const startScan = async () => {
    setScanError(null);
    handledBarcode.current = null;
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setScanError('Kamerazugriff wurde nicht erlaubt.');
        return;
      }
    }
    setMode('scan');
  };

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (handledBarcode.current === data || looking) return;
    handledBarcode.current = data;
    setLooking(true);
    const hit = await lookupBarcode(data);
    setLooking(false);
    if (hit) {
      applyHit(hit);
    } else {
      // Unbekannter Barcode: Formular öffnen, Code übernehmen und erklären
      setBarcode(data);
      setScanError(null);
      setLinkError(
        `Barcode ${data} erkannt, aber in den Produktdatenbanken noch nicht hinterlegt — Details bitte kurz manuell ergänzen. (Kommt bei Drogerie-Eigenmarken öfter vor.)`
      );
      setMode('form');
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // ── Modus: Scanner ────────────────────────────────────────────────
  if (mode === 'scan') {
    return (
      <View style={styles.container}>
        <Header title="Barcode scannen" onBack={() => setMode('pick')} />
        <View style={styles.scannerWrap}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
            }}
            onBarcodeScanned={onBarcodeScanned}
          />
          <View style={styles.scanOverlay}>
            {looking ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={styles.scanHint}>
                Richte die Kamera auf den Barcode 📷
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── Modus: Produkt finden (Suche / Scan / manuell) ────────────────
  if (mode === 'pick') {
    return (
      <View style={styles.container}>
        <Header
          title={`Neu in ${group.name}`}
          onBack={() => {
            Keyboard.dismiss();
            onBack();
          }}
        />
        <View style={styles.pickBody}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔎 Suchen oder Shop-Link einfügen…"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {isUrl ? (
            <Pressable
              onPress={importFromLink}
              disabled={linkLoading}
              style={styles.linkButton}
            >
              <Text style={styles.linkButtonText}>
                {linkLoading
                  ? '⏳ Seite wird gelesen…'
                  : '🔗 Details von der Seite übernehmen'}
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.pickActions}>
            <Pressable onPress={startScan} style={styles.scanButton}>
              <Text style={styles.scanButtonText}>📷 Barcode scannen</Text>
            </Pressable>
            <Pressable onPress={() => setMode('form')} hitSlop={8}>
              <Text style={styles.manualLink}>Manuell eingeben</Text>
            </Pressable>
          </View>
          {scanError ? <Text style={styles.error}>{scanError}</Text> : null}
          {searching ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.searchSpinner}
            />
          ) : null}
          <FlatList
            data={results}
            keyExtractor={(h) => h.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !searching && query.trim().length >= 2 ? (
                <Text style={styles.empty}>
                  Nichts gefunden — Du kannst es manuell eingeben.
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => applyHit(item)}>
                <Card style={styles.hitCard}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.hitImage}
                    />
                  ) : (
                    <View style={[styles.hitImage, styles.hitImageFallback]}>
                      <Text style={styles.hitImageEmoji}>
                        {SOURCE_EMOJI[item.source]}
                      </Text>
                    </View>
                  )}
                  <View style={styles.hitText}>
                    <Text style={styles.hitName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.brand ? (
                      <Text style={styles.hitBrand}>{item.brand}</Text>
                    ) : null}
                  </View>
                </Card>
              </Pressable>
            )}
          />
        </View>
      </View>
    );
  }

  // ── Modus: Formular ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header title={`Neu in ${group.name}`} onBack={() => setMode('pick')} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          {linkError ? <Text style={styles.error}>{linkError}</Text> : null}
          <Pressable onPress={pickPhoto} style={styles.photoPicker}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <Text style={styles.photoHint}>📷 Foto hinzufügen</Text>
            )}
          </Pressable>

          <Text style={styles.label}>Produkt *</Text>
          <TextInput
            style={styles.input}
            placeholder="z. B. Vitamin-C-Serum"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Marke</Text>
          <TextInput
            style={styles.input}
            placeholder="z. B. The Ordinary"
            placeholderTextColor={colors.textMuted}
            value={brand}
            onChangeText={setBrand}
          />

          {barcode ? (
            <Text style={styles.barcode}>Barcode: {barcode}</Text>
          ) : null}

          <Text style={styles.label}>Kategorie</Text>
          <View style={styles.pills}>
            {CATEGORIES.map((c) => (
              <Pill
                key={c}
                label={c}
                selected={c === category}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>

          <Text style={styles.label}>Preis</Text>
          <TextInput
            style={styles.input}
            placeholder="z. B. 24,90 €"
            placeholderTextColor={colors.textMuted}
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>Shop-Link</Text>
          <TextInput
            style={styles.input}
            placeholder="https://…"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            value={shopLink}
            onChangeText={setShopLink}
          />

          <Text style={styles.label}>Erster Eindruck</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Warum hast Du es gekauft?"
            placeholderTextColor={colors.textMuted}
            multiline
            value={note}
            onChangeText={setNote}
          />

          <Text style={styles.reminder}>
            ⏰ In 4 Wochen fragen wir Dich automatisch, wie Du es findest.
          </Text>

          <PrimaryButton
            label="Mit der Gruppe teilen"
            disabled={!title.trim()}
            onPress={() =>
              onSubmit({
                title: title.trim(),
                category,
                brand: brand.trim() || undefined,
                barcode,
                photoUri,
                price: price.trim() || undefined,
                shopLink: shopLink.trim() || undefined,
                note: note.trim() || undefined,
              })
            }
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
  // Scanner
  scannerWrap: { flex: 1, margin: spacing.m, borderRadius: 16, overflow: 'hidden' },
  camera: { flex: 1 },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  scanHint: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 999,
    overflow: 'hidden',
  },
  // Suche
  pickBody: { flex: 1, paddingHorizontal: spacing.m },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.m,
    color: colors.text,
    backgroundColor: colors.card,
    fontSize: 16,
  },
  pickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  scanButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  scanButtonText: { color: colors.primary, fontWeight: '700' },
  linkButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.s,
  },
  linkButtonText: { color: colors.primary, fontWeight: '700' },
  manualLink: { color: colors.textMuted, textDecorationLine: 'underline' },
  error: { color: colors.danger, marginBottom: spacing.s },
  searchSpinner: { marginVertical: spacing.m },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.l,
  },
  hitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
    marginBottom: spacing.s,
  },
  hitImage: { width: 56, height: 56, borderRadius: 8 },
  hitImageFallback: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitImageEmoji: { fontSize: 24 },
  hitText: { flex: 1, marginLeft: spacing.m },
  hitName: { fontWeight: '600', color: colors.text },
  hitBrand: { color: colors.textMuted, marginTop: 2 },
  // Formular
  photoPicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photo: { width: '100%', height: '100%' },
  photoHint: { color: colors.textMuted, fontSize: 16 },
  label: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.s,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.m,
    marginBottom: spacing.s,
    color: colors.text,
    backgroundColor: colors.background,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  barcode: { color: colors.textMuted, marginBottom: spacing.s, fontSize: 12 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.s },
  reminder: {
    color: colors.textMuted,
    marginVertical: spacing.m,
    textAlign: 'center',
  },
});
