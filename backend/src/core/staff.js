import bcrypt from 'bcrypt';
import { db } from './db.js';

// The services an admin can belong to. A superadmin registers admins and is only created with add-staff.
export const SERVICES = ['meals', 'dorm', 'clinic'];
export const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;

const upsertStaff = db.prepare(`
  INSERT INTO staff (username, password_hash, service) VALUES (?, ?, ?)
  ON CONFLICT (username) DO UPDATE SET password_hash = excluded.password_hash, service = excluded.service
`);
const insertStaff = db.prepare(
  'INSERT INTO staff (username, password_hash, service) VALUES (?, ?, ?) ON CONFLICT (username) DO NOTHING',
);
const selectStaff = db.prepare('SELECT username, password_hash, service FROM staff WHERE username = ?');
const selectAdmins = db.prepare(
  "SELECT username, service FROM staff WHERE service <> 'superadmin' ORDER BY service, username",
);

// Compared against for unknown usernames, so a wrong username takes as long to reject as a wrong password.
const DUMMY_HASH = bcrypt.hashSync('not a real password', SALT_ROUNDS);

// Creates the account, or gives an existing one a new password and service.
export async function saveStaff(username, password, service) {
  upsertStaff.run(username, await bcrypt.hash(password, SALT_ROUNDS), service);
}

// Creates the account, or returns false if the username is taken; existing accounts are never changed.
export async function addStaff(username, password, service) {
  const { changes } = insertStaff.run(username, await bcrypt.hash(password, SALT_ROUNDS), service);
  return changes > 0;
}

// Every account except superadmins, as { username, service }.
export function listAdmins() {
  return selectAdmins.all();
}

// Returns { username, service } when the password is right, otherwise null.
export async function verifyStaff(username, password) {
  const staff = selectStaff.get(username);
  const matches = await bcrypt.compare(password, staff?.password_hash ?? DUMMY_HASH);
  return staff && matches ? { username: staff.username, service: staff.service } : null;
}

// The service an account may use, or undefined once the account is gone.
export function staffService(username) {
  return selectStaff.get(username)?.service;
}
