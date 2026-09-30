import { randomBytes } from 'node:crypto';
import { db } from './db.js';

const QR_TOKEN = /^[0-9a-f]{32}$/;

const insertStudent = db.prepare(
  'INSERT INTO students (id, name, qr_token) VALUES (?, ?, ?) ON CONFLICT (id) DO NOTHING',
);
const selectByToken = db.prepare('SELECT id, name FROM students WHERE qr_token = ?');

// Returns the token to encode in the student's QR code, or null if the ID is already registered.
export function addStudent(id, name) {
  const qrToken = randomBytes(16).toString('hex');
  const { changes } = insertStudent.run(id, name, qrToken);
  return changes ? qrToken : null;
}

// Returns { id, name } for a scanned QR code, or undefined if it isn't a registered card.
export function findStudentByToken(qrToken) {
  return typeof qrToken === 'string' && QR_TOKEN.test(qrToken) ? selectByToken.get(qrToken) : undefined;
}
