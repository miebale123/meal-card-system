import { useState } from 'react';
import { useAuth } from '../auth';
import Button from '../Button';
import Field from '../Field';
import FormScreen, { FormError } from '../FormScreen';

// Once signed in, the root layout opens the one service this account belongs to.
export default function SignInScreen() {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = username.trim() !== '' && password !== '';

  async function handleSignIn() {
    if (!ready || signingIn) return;
    setSigningIn(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
    } catch (e) {
      setError((e as Error).message);
      setSigningIn(false);
    }
  }

  return (
    <FormScreen>
      <Field
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        editable={!signingIn}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        editable={!signingIn}
        onSubmitEditing={handleSignIn}
      />
      <FormError message={error} />
      <Button label={signingIn ? 'Signing in…' : 'Sign in'} onPress={handleSignIn} disabled={signingIn || !ready} />
    </FormScreen>
  );
}
