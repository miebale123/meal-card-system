import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../auth';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}

// Signed out, only sign-in is reachable; signed in, only the account's own service is.
function RootNavigator() {
  const { session } = useAuth();
  if (session === undefined) return null;
  const service = session?.user.service;

  return (
    <Stack
      screenOptions={{ headerTintColor: colors.ink, contentStyle: [styles.content, Platform.OS === 'web' && styles.webColumn] }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" options={{ title: 'Sign in' }} />
      </Stack.Protected>
      <Stack.Protected guard={service === 'meals'}>
        <Stack.Screen name="meals" options={{ title: 'Meal card' }} />
      </Stack.Protected>
      <Stack.Protected guard={service === 'dorm'}>
        <Stack.Screen name="dorm" options={{ title: 'Dormitory' }} />
      </Stack.Protected>
      <Stack.Protected guard={service === 'clinic'}>
        <Stack.Screen name="clinic" options={{ title: 'Clinic' }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.card,
  },
  // The screens are laid out for phones, so wide browser windows get a centered column.
  webColumn: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
});
