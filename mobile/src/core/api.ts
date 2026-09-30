import Constants from 'expo-constants';
import { fetch } from 'expo/fetch';
import { Platform } from 'react-native';
import type { Service } from './services';

// Unless overridden, the backend is on the computer serving the app: the page's host, or Expo's dev server on phones.
const host = Platform.OS === 'web' ? window.location.hostname : Constants.expoConfig?.hostUri?.split(':')[0];
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? (host && `http://${host}:3000`);
if (!API_URL) {
  throw new Error('Set EXPO_PUBLIC_API_URL in mobile/.env to the server’s address, for example https://kshs.example.com');
}
const UNREACHABLE_HINT =
  Platform.OS === 'web' ? 'Check that the server is running.' : 'Check that this phone is on the same Wi-Fi as the server.';

export type Session = { token: string; user: { username: string; service: Service | 'superadmin' } };
export type Student = { id: string; name: string };
// What scan and lookup calls resolve to for QR codes that aren't registered.
export type UnknownCard = { result: 'unknown_card' };

// The server no longer accepts this device's sign-in, e.g. because it expired.
export class SessionExpiredError extends Error {}

export async function send<T>(method: string, path: string, token: string | null, body?: object): Promise<T> {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new Error(`Can’t reach the server at ${API_URL}. ${UNREACHABLE_HINT}`);
  }
  if (response.status === 401 && token) throw new SessionExpiredError('Sign in again.');
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error(error ?? `The server couldn’t complete this request (error ${response.status}). Try again.`);
  }
  return response.json();
}

export const login = (username: string, password: string) =>
  send<Session>('POST', '/api/auth/login', null, { username, password });
