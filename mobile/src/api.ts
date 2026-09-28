import { fetch } from 'expo/fetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('Set EXPO_PUBLIC_API_URL in mobile/.env, for example http://192.168.1.20:3000');
}

export type Service = 'meals' | 'dorm' | 'clinic';
export type Session = { token: string; user: { username: string; service: Service } };
export type Student = { id: string; name: string };
export type DormAssignment = { room: string; bed: string; itemCount: number };
export type UnknownCard = { result: 'unknown_card' };
export type MealScan = { result: 'ticked' | 'already_ticked'; student: Student; tickedAt: string } | UnknownCard;
export type DormStudent = { result: 'found'; student: Student; assignment: DormAssignment | null };
export type DormSave = { result: 'saved'; assignment: DormAssignment } | { result: 'bed_taken'; holder: Student };
export type ClinicStudent = { result: 'found'; student: Student };

// The server no longer accepts this phone's sign-in, e.g. because it expired.
export class SessionExpiredError extends Error {}

async function send<T>(method: string, path: string, token: string | null, body: object): Promise<T> {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(`Can’t reach the server at ${API_URL}. Check that this phone is on the same Wi-Fi as the server.`);
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

// Scan and lookup calls resolve to { result: 'unknown_card' } for QR codes that aren't registered.
export const scanMealCard = (token: string, qrToken: string) =>
  send<MealScan>('POST', '/api/meals/scan', token, { qrToken });

export const lookupDorm = (token: string, qrToken: string) =>
  send<DormStudent | UnknownCard>('POST', '/api/dorm/lookup', token, { qrToken });

export const saveDorm = (token: string, qrToken: string, assignment: DormAssignment) =>
  send<DormSave>('PUT', '/api/dorm/assignment', token, { qrToken, ...assignment });

export const lookupClinicStudent = (token: string, qrToken: string) =>
  send<ClinicStudent | UnknownCard>('POST', '/api/clinic/lookup', token, { qrToken });

export const addClinicVisit = (token: string, qrToken: string, visit: { diagnosis: string; prescription: string }) =>
  send<{ result: 'saved' }>('POST', '/api/clinic/visits', token, { qrToken, ...visit });
