import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card, Header, Pill, PrimaryButton } from '../components/ui';
import { colors, spacing } from '../theme';
import { CATEGORIES, Category, Group } from '../types';

export interface NewPostInput {
  title: string;
  category: Category;
  photoUri?: string;
  price?: string;
  shopLink?: string;
  note?: string;
}

export function NewPostScreen({
  group,
  onBack,
  onSubmit,
}: {
  group: Group;
  onBack: () => void;
  onSubmit: (input: NewPostInput) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Skincare');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [price, setPrice] = useState('');
  const [shopLink, setShopLink] = useState('');
  const [note, setNote] = useState('');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={`Neu in ${group.name}`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.m },
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
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.s },
  reminder: {
    color: colors.textMuted,
    marginVertical: spacing.m,
    textAlign: 'center',
  },
});
