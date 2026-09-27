import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScannerScreen from './src/ScannerScreen';
import SignInScreen from './src/SignInScreen';

const STAFF_KEY_ITEM = 'staffKey';

export default function App() {
  // undefined while secure storage loads, null when signed out.
  const [staffKey, setStaffKey] = useState(undefined);

  useEffect(() => {
    SecureStore.getItemAsync(STAFF_KEY_ITEM).then(setStaffKey);
  }, []);

  async function signIn(key) {
    await SecureStore.setItemAsync(STAFF_KEY_ITEM, key);
    setStaffKey(key);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(STAFF_KEY_ITEM);
    setStaffKey(null);
  }

  if (staffKey === undefined) return null;

  return (
    <SafeAreaProvider>
      {staffKey ? <ScannerScreen staffKey={staffKey} onSignOut={signOut} /> : <SignInScreen onSignIn={signIn} />}
    </SafeAreaProvider>
  );
}
