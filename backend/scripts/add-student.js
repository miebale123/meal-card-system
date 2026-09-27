import { mkdirSync } from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { addStudent } from '../src/mealCard.js';

const [id, name] = process.argv.slice(2).map((arg) => arg.trim());
if (!id || !name) {
  console.error('Usage: npm run add-student -- <student-id> "<full name>"');
  process.exit(1);
}

const qrToken = addStudent(id, name);
if (!qrToken) {
  console.error(`Student ${id} is already registered.`);
  process.exit(1);
}

const dir = path.join(import.meta.dirname, '..', 'qr-codes');
mkdirSync(dir, { recursive: true });
// IDs like UGR/1234/15 contain slashes, so keep only file-name-safe characters.
const file = path.join(dir, `${id.replace(/[^A-Za-z0-9_-]/g, '-')}.png`);
await QRCode.toFile(file, qrToken, { width: 512 });
console.log(`Added ${name} (${id}). QR code: ${file}`);
