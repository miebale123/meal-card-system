import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SessionExpiredError } from '../../core/api';
import { useAuth } from '../../core/auth';
import Button, { TextButton } from '../../core/Button';
import Field from '../../core/Field';
import FormScreen, { FormError, useSubmit } from '../../core/FormScreen';
import { SERVICE_TITLES, SERVICES, type Service } from '../../core/services';
import { colors, fontSize } from '../../core/theme';
import { VerdictScreen } from '../../core/Verdict';
import { listAdmins, registerAdmin, type Admin } from './api';

const MIN_PASSWORD_LENGTH = 8;

export default function AdminScreen() {
  const { session } = useAuth();
  if (!session) return null;
  return <Administration token={session.token} />;
}

function Administration({ token }: { token: string }) {
  const { signOut } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>();
  const [listError, setListError] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Admin | null>(null);

  const loadAdmins = useCallback(() => {
    listAdmins(token).then(
      (list) => {
        setAdmins(list);
        setListError(null);
      },
      (error: Error) => {
        if (error instanceof SessionExpiredError) signOut();
        else setListError(error.message);
      },
    );
  }, [token, signOut]);

  useEffect(loadAdmins, [loadAdmins]);

  function retry() {
    setListError(null);
    loadAdmins();
  }

  if (registered) {
    return (
      <VerdictScreen
        verdict={{
          color: colors.serve,
          title: 'Admin registered',
          note: `${registered.username} can now sign in to ${SERVICE_TITLES[registered.service]}.`,
          action: 'Done',
        }}
        onDone={() => setRegistered(null)}
      />
    );
  }

  return (
    <FormScreen>
      <RegisterForm
        token={token}
        onRegistered={(admin) => {
          setRegistered(admin);
          loadAdmins();
        }}
      />
      <Text accessibilityRole="header" style={[styles.heading, styles.section]}>
        Admins
      </Text>
      <AdminList admins={admins} error={listError} onRetry={retry} />
      <TextButton label="Sign out" onPress={signOut} />
    </FormScreen>
  );
}

// The password stays visible, as in the add-staff script, so the superadmin can pass it on exactly.
function RegisterForm({ token, onRegistered }: { token: string; onRegistered: (admin: Admin) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [service, setService] = useState<Service | null>(null);
  const { saving, error, submit } = useSubmit();
  const ready = username.trim() !== '' && password.length >= MIN_PASSWORD_LENGTH && service !== null;

  function register() {
    if (!service) return;
    submit(async () => onRegistered(await registerAdmin(token, { username: username.trim(), password, service })));
  }

  return (
    <>
      <Text accessibilityRole="header" style={styles.heading}>
        Register an admin
      </Text>
      <Field
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        maxLength={50}
        editable={!saving}
      />
      <Field
        label={`Password (at least ${MIN_PASSWORD_LENGTH} characters)`}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        editable={!saving}
      />
      <ServicePicker value={service} onChange={setService} disabled={saving} />
      <FormError message={error} />
      <Button label={saving ? 'Registering…' : 'Register admin'} onPress={register} disabled={saving || !ready} />
    </>
  );
}

type ServicePickerProps = { value: Service | null; onChange: (service: Service) => void; disabled: boolean };

function ServicePicker({ value, onChange, disabled }: ServicePickerProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Service</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Service" style={styles.options}>
        {SERVICES.map((service) => {
          const selected = service === value;
          return (
            <Pressable
              key={service}
              accessibilityRole="radio"
              // aria-checked, unlike accessibilityState, also reaches screen readers on the web.
              aria-checked={selected}
              disabled={disabled}
              onPress={() => onChange(service)}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.selectedOption : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={[styles.optionLabel, selected ? styles.selectedLabel : null]}>{SERVICE_TITLES[service]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function AdminList({ admins, error, onRetry }: { admins?: Admin[]; error: string | null; onRetry: () => void }) {
  if (error) {
    return (
      <>
        <FormError message={error} />
        <TextButton label="Try again" onPress={onRetry} />
      </>
    );
  }
  if (!admins) return <Text style={styles.note}>Loading admins…</Text>;
  if (admins.length === 0) return <Text style={styles.note}>No admins yet.</Text>;

  return (
    <View>
      {admins.map(({ username, service }) => (
        <View key={username} style={styles.row}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.note}>{SERVICE_TITLES[service]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.ink,
  },
  section: {
    marginTop: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.ink,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.muted,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  selectedOption: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
  optionLabel: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.muted,
  },
  username: {
    flexShrink: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.ink,
  },
  note: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
});
