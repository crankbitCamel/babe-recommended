import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Card,
  Header,
  HeartRating,
  Pill,
  PrimaryButton,
} from '../components/ui';
import { colors, spacing } from '../theme';
import { ProductPost, Review } from '../types';

export function ReviewCheckInScreen({
  post,
  onBack,
  onSubmit,
}: {
  post: ProductPost;
  onBack: () => void;
  onSubmit: (review: Omit<Review, 'createdAt'>) => void;
}) {
  const [liked, setLiked] = useState<boolean | undefined>();
  const [rating, setRating] = useState(0);
  const [recommended, setRecommended] = useState<boolean | undefined>();
  const [comment, setComment] = useState('');

  const complete =
    liked !== undefined && rating > 0 && recommended !== undefined;

  return (
    <View style={styles.container}>
      <Header title="4-Wochen-Check-in ⏰" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.productTitle}>{post.title}</Text>
          <Text style={styles.subtitle}>
            Vor 4 Wochen geteilt — Zeit für Dein Fazit!
          </Text>

          <Text style={styles.question}>Magst Du das Produkt?</Text>
          <View style={styles.pills}>
            <Pill
              label="😍 Ja!"
              selected={liked === true}
              onPress={() => setLiked(true)}
            />
            <Pill
              label="😕 Eher nicht"
              selected={liked === false}
              onPress={() => setLiked(false)}
            />
          </View>

          <Text style={styles.question}>Deine Bewertung</Text>
          <HeartRating rating={rating} onChange={setRating} />

          <Text style={styles.question}>Empfiehlst Du es weiter?</Text>
          <View style={styles.pills}>
            <Pill
              label="✨ Ja, Empfehlung!"
              selected={recommended === true}
              onPress={() => setRecommended(true)}
            />
            <Pill
              label="Nein"
              selected={recommended === false}
              onPress={() => setRecommended(false)}
            />
          </View>
          {recommended === true ? (
            <Text style={styles.hint}>
              Deine Gruppe bekommt sofort eine Benachrichtigung 💌
            </Text>
          ) : null}

          <Text style={styles.question}>Kommentar (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Was sollen Deine Freundinnen wissen?"
            placeholderTextColor={colors.textMuted}
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <PrimaryButton
            label="Bewertung abschicken"
            disabled={!complete}
            onPress={() =>
              onSubmit({
                liked: liked!,
                rating,
                recommended: recommended!,
                comment: comment.trim() || undefined,
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
  productTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  question: {
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap' },
  hint: { color: colors.primary, marginTop: spacing.s },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.m,
    minHeight: 72,
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.l,
  },
});
