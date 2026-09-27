import { useRef, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StaffKeyRejectedError } from './api';
import Button, { TextButton } from './Button';
import { colors, fontSize } from './theme';
import Verdict, { notChecked, unknownCard } from './Verdict';

// Scans student QR codes. onScan(qrToken) resolves to a verdict to show, or null once the screen moves on.
export default function QrScanner({ prompt, onScan, onSignOut }) {
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
      setVerdict(await onScan(data));
    } catch (error) {
      if (error instanceof StaffKeyRejectedError) {
        onSignOut();
        return;
      }
      setVerdict(notChecked(error.message));
    } finally {
      setChecking(false);
    }
  }

  function scanAgain() {
    setVerdict(null);
    scanLock.current = false;
  }

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={[styles.permission, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>Allow camera access</Text>
        <Text style={styles.body}>The camera is only used to scan students’ QR codes.</Text>
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
          <Verdict verdict={verdict} onDone={scanAgain} />
        ) : (
          <View style={styles.idle}>
            <Text style={[styles.body, styles.idleText]}>{checking ? 'Checking card…' : prompt}</Text>
            <TextButton label="Sign out" onPress={onSignOut} />
          </View>
        )}
      </View>
    </View>
  );
}

// Looks up each scanned card with lookup(staffKey, qrToken), then renders children(card, scanNext) for the student.
export function ScanStudent({ staffKey, lookup, onSignOut, children }) {
  const [card, setCard] = useState(null);

  if (card) return children(card, () => setCard(null));

  return (
    <QrScanner
      prompt="Point the camera at a student’s QR code."
      onScan={async (qrToken) => {
        const found = await lookup(staffKey, qrToken);
        if (found.result === 'unknown_card') return unknownCard;
        setCard({ ...found, qrToken });
        return null;
      }}
      onSignOut={onSignOut}
    />
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
  body: {
    fontSize: fontSize.body,
    color: colors.muted,
  },
});
