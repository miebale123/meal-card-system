import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: colors.ink, contentStyle: { backgroundColor: colors.card } }}>
        <Stack.Screen name="index" options={{ title: 'Choose a service' }} />
        <Stack.Screen name="meals" options={{ title: 'Meal card' }} />
        <Stack.Screen name="dorm" options={{ title: 'Dormitory' }} />
        <Stack.Screen name="clinic" options={{ title: 'Clinic' }} />
      </Stack>
    </>
  );
}
