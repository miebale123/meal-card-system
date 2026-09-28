import { createInterface } from 'node:readline/promises';
import { saveStaff, SERVICES } from '../src/staff.js';

const [username, service] = process.argv.slice(2).map((arg) => arg.trim());
if (!username || !SERVICES.includes(service)) {
  console.error(`Usage: npm run add-staff -- <username> <${SERVICES.join('|')}>`);
  process.exit(1);
}

const prompt = createInterface({ input: process.stdin, output: process.stdout });
const password = await prompt.question(`Password for ${username}: `);
prompt.close();
if (password.length < 8) {
  console.error('Use a password of at least 8 characters.');
  process.exit(1);
}

await saveStaff(username, password, service);
console.log(`Saved ${username}. They will sign in to the ${service} service.`);
