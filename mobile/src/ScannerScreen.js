import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scanMealCard, StaffKeyRejectedError } from './api';
import Button from './Button';
import { colors, fontSize } from './theme';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function toVerdict({ result, student, tickedAt }) {
  if (result === 'ticked') {
    return { color: colors.serve, title: 'Meal ticked', student, action: 'Scan next card' };
  }
  if (result === 'already_ticked') {
    return {
      color: colors.refuse,
      title: 'Already ate today',
      student,
      note: `Ticked at ${timeFormat.format(new Date(tickedAt))}`,
      action: 'Scan next card',
    };
  }
  return {
    color: colors.refuse,
    title: 'Card not recognized',
    note: 'This QR code isn’t a registered meal card.',
    action: 'Scan next card',
  };
}

export default function ScannerScreen({ staffKey, onSignOut }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [checking, setChecking] = useState(false);
  const [verdict, setVerdict] = useState(null);
  // The camera reports the same code on every frame; the ref blocks repeats before state updates land.
  const scanLock = useRef(false);

  async function handleScan({ data }) {
    if (scanLock.current) return;
    scanLock.current = true;
    setChecking(true);
    try {
      setVerdict(toVerdict(await scanMealCard(staffKey, data)));
    } catch (error) {
      if (error instanceof StaffKeyRejectedError) {
        onSignOut();
        return;
      }
      setVerdict({ color: colors.caution, title: 'Card not checked', note: error.message, action: 'Scan again' });
    } finally {
      setChecking(false);
    }
  }

  function scanNext() {
    setVerdict(null);
    scanLock.current = false;
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={[styles.permission, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <StatusBar style="dark" />
        <Text style={styles.title}>Allow camera access</Text>
        <Text style={styles.body}>The camera is only used to scan students’ meal cards.</Text>
        {permission.canAskAgain ? (
          <Button label="Allow camera" onPress={requestPermission} />
        ) : (
          <Button label="Open settings" onPress={() => Linking.openSettings()} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={checking || verdict ? undefined : handleScan}
      />
      <View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + 24 },
          verdict ? { backgroundColor: verdict.color } : null,
        ]}
      >
        {verdict ? (
          <>
            <Text style={[styles.title, styles.onColor]}>{verdict.title}</Text>
            {verdict.student ? (
              <View>
                <Text style={[styles.name, styles.onColor]}>{verdict.student.name}</Text>
                <Text style={[styles.body, styles.onColor]}>{verdict.student.id}</Text>
              </View>
            ) : null}
            {verdict.note ? <Text style={[styles.body, styles.onColor]}>{verdict.note}</Text> : null}
            <Button label={verdict.action} onPress={scanNext} color={colors.card} labelColor={verdict.color} />
          </>
        ) : (
          <View style={styles.idle}>
            <Text style={[styles.body, styles.idleText]}>
              {checking ? 'Checking card…' : 'Point the camera at a student’s meal card.'}
            </Text>
            <Pressable accessibilityRole="button" hitSlop={12} onPress={onSignOut}>
              <Text style={styles.signOut}>Sign out</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  permission: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: colors.card,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 16,
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderCurve: 'continuous',
  },
  idle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  idleText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: '700',
    color: colors.ink,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.ink,
  },
  body: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
  onColor: {
    color: colors.card,
  },
  signOut: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.ink,
  },
});
