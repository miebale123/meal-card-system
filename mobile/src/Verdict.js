import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from './Button';
import { colors, fontSize } from './theme';

export const unknownCard = {
  color: colors.refuse,
  title: 'Card not recognized',
  note: 'This QR code isn’t a registered student card.',
  action: 'Scan again',
};

export const notChecked = (message) => ({ color: colors.caution, title: 'Card not checked', note: message, action: 'Scan again' });

// A result on a solid color: headline, the student it's about, an optional note, and one button.
export default function Verdict({ verdict, onDone }) {
  return (
    <>
      <Text style={styles.title}>{verdict.title}</Text>
      {verdict.student ? (
        <View>
          <Text style={styles.name}>{verdict.student.name}</Text>
          <Text style={styles.body}>{verdict.student.id}</Text>
        </View>
      ) : null}
      {verdict.note ? <Text style={styles.body}>{verdict.note}</Text> : null}
      <Button label={verdict.action} onPress={onDone} color={colors.card} labelColor={verdict.color} />
    </>
  );
}

export function VerdictScreen({ verdict, onDone }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { backgroundColor: verdict.color, paddingBottom: insets.bottom + 24 }]}>
      <Verdict verdict={verdict} onDone={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.card,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.card,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.card,
  },
});
