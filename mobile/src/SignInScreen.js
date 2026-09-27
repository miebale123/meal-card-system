import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { checkStaffKey } from './api';
import Button from './Button';
import Field from './Field';
import FormScreen, { FormError } from './FormScreen';
import { colors, fontSize } from './theme';

export default function SignInScreen({ service, label, onSignIn }) {
  const [staffKey, setStaffKey] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const key = staffKey.trim();

  async function handleSignIn() {
    if (!key || checking) return;
    setChecking(true);
    setError(null);
    try {
      await checkStaffKey(service, key);
      await onSignIn(key);
    } catch (e) {
      setError(e.message);
      setChecking(false);
    }
  }

  return (
    <FormScreen>
      <Text style={styles.body}>
        Enter the {label} staff key. You only need to do this once on this phone.
      </Text>
      <Field
        label="Staff key"
        value={staffKey}
        onChangeText={setStaffKey}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!checking}
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
      />
      <FormError message={error} />
      <Button label={checking ? 'Checking…' : 'Sign in'} onPress={handleSignIn} disabled={checking || !key} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
});
