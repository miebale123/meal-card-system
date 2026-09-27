import { fetch } from 'expo/fetch';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error('Set EXPO_PUBLIC_API_URL in mobile/.env, for example http://192.168.1.20:3000');
}

export class StaffKeyRejectedError extends Error {}

async function request(path, staffKey, init = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${staffKey}`, 'Content-Type': 'application/json' },
    });
  } catch {
    throw new Error(`Can’t reach the server at ${API_URL}. Check that this phone is on the same Wi-Fi as the server.`);
  }
  if (response.status === 401) throw new StaffKeyRejectedError('That PIN isn’t right. Try again.');
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}));
    throw new Error(error ?? `The server couldn’t complete this request (error ${response.status}). Try again.`);
  }
  return response;
}

async function send(method, path, staffKey, body) {
  const response = await request(path, staffKey, { method, body: JSON.stringify(body) });
  return response.json();
}

// service is 'meals', 'dorm', or 'clinic'; each has its own staff PIN.
export async function checkStaffKey(service, staffKey) {
  await request(`/api/${service}/staff`, staffKey);
}

// Scan and lookup calls resolve to { result: 'unknown_card' } for QR codes that aren't registered.
export const scanMealCard = (staffKey, qrToken) => send('POST', '/api/meals/scan', staffKey, { qrToken });

export const lookupDorm = (staffKey, qrToken) => send('POST', '/api/dorm/lookup', staffKey, { qrToken });

export const saveDorm = (staffKey, qrToken, assignment) =>
  send('PUT', '/api/dorm/assignment', staffKey, { qrToken, ...assignment });

export const lookupClinicStudent = (staffKey, qrToken) => send('POST', '/api/clinic/lookup', staffKey, { qrToken });

export const addClinicVisit = (staffKey, qrToken, visit) =>
  send('POST', '/api/clinic/visits', staffKey, { qrToken, ...visit });
