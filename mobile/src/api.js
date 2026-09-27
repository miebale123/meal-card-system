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
  if (response.status === 401) throw new StaffKeyRejectedError('That staff key isn’t valid.');
  if (!response.ok) throw new Error(`The server couldn’t check this card (error ${response.status}). Try again.`);
  return response;
}

export async function checkStaffKey(staffKey) {
  await request('/api/staff', staffKey);
}

// Resolves to { result: 'ticked' | 'already_ticked' | 'unknown_card', student, tickedAt }.
export async function scanMealCard(staffKey, qrToken) {
  const response = await request('/api/meals/scan', staffKey, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  });
  return response.json();
}
