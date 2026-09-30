import { useState, type PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionExpiredError, type Student } from './api';
import { useAuth } from './auth';
import { colors, fontSize } from './theme';

// Android resizes the window for the keyboard; iOS needs the scroll view's keyboard insets.
export default function FormScreen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      {children}
    </ScrollView>
  );
}

export function StudentHeading({ student }: { student: Student }) {
  return (
    <View>
      <Text style={styles.name}>{student.name}</Text>
      <Text style={styles.body}>{student.id}</Text>
    </View>
  );
}

export function FormError({ message }: { message: string | null }) {
  return message ? <Text style={styles.error}>{message}</Text> : null;
}

// Runs a save and keeps the form open with the error message if it fails.
export function useSubmit() {
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(save: () => Promise<void>) {
    setSaving(true);
    setError(null);
    try {
      await save();
    } catch (e) {
      if (e instanceof SessionExpiredError) {
        signOut();
        return;
      }
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, setError, submit };
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
  },
  name: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.ink,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
  error: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.refuse,
  },
});
