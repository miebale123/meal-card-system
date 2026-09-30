import { createInterface } from 'node:readline/promises';
import { MIN_PASSWORD_LENGTH, saveStaff, SERVICES } from '../src/core/staff.js';

const ACCOUNT_TYPES = [...SERVICES, 'superadmin'];

const [username, service] = process.argv.slice(2).map((arg) => arg.trim());
if (!username || !ACCOUNT_TYPES.includes(service)) {
  console.error(`Usage: npm run add-staff -- <username> <${ACCOUNT_TYPES.join('|')}>`);
  process.exit(1);
}

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const password = await prompt.question(`Password for ${username}: `);
prompt.close();
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

await saveStaff(username, password, service);
console.log(`Saved ${username} as a ${service} account.`);
