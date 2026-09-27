import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import SignInScreen from './SignInScreen';

// Asks for this service's staff key once, then renders children({ staffKey, signOut }).
export default function StaffGate({ service, label, children }) {
  const storageKey = `staffKey.${service}`;
  // undefined while secure storage loads, null when signed out.
  const [staffKey, setStaffKey] = useState(undefined);

  useEffect(() => {
    SecureStore.getItemAsync(storageKey).then(setStaffKey);
  }, [storageKey]);

  async function signIn(key) {
    await SecureStore.setItemAsync(storageKey, key);
    setStaffKey(key);
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(storageKey);
    setStaffKey(null);
  }

  if (staffKey === undefined) return null;
  if (!staffKey) return <SignInScreen service={service} label={label} onSignIn={signIn} />;
  return children({ staffKey, signOut });
}
