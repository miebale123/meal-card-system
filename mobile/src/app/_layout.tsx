import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
    <Stack screenOptions={{ headerTintColor: colors.ink, contentStyle: { backgroundColor: colors.card } }}>
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
