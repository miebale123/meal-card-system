import express from 'express';
import jwt from 'jsonwebtoken';
import { staffService, verifyStaff } from './staff.js';

const { JWT_SECRET } = process.env;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('Set JWT_SECRET in backend/.env to a random string of at least 32 characters.');
  process.exit(1);
}

const TOKEN_LIFETIME = '7d';
const MAX_WRONG_PASSWORDS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const loginTries = new Map();

export const authRouter = express.Router();
authRouter.use(express.json());

// Each device gets 5 wrong passwords every 15 minutes. A try counts before the password check,
// so parallel guesses can't slip past the limit.
authRouter.post('/login', async (req, res) => {
  const now = Date.now();
  let tries = loginTries.get(req.ip);
  if (!tries || now - tries.firstAt >= LOCKOUT_MS) tries = { count: 0, firstAt: now };
  if (tries.count >= MAX_WRONG_PASSWORDS) {
    const minutes = Math.ceil((tries.firstAt + LOCKOUT_MS - now) / 60_000);
    return res.status(429).json({ error: `Too many wrong passwords. Try again in ${minutes} min.` });
  }

  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Enter your username and password.' });
  }
  tries.count += 1;
  loginTries.set(req.ip, tries);

  const staff = await verifyStaff(username.trim(), password);
  if (!staff) return res.status(401).json({ error: 'Wrong username or password.' });

  loginTries.delete(req.ip);
  const token = jwt.sign({}, JWT_SECRET, { algorithm: 'HS256', subject: staff.username, expiresIn: TOKEN_LIFETIME });
  res.json({ token, user: staff });
});

// Lets a request through only with a valid token from an account of this service.
export function requireService(service) {
  return (req, res, next) => {
    const token = req.get('Authorization')?.replace(/^Bearer /, '') ?? '';
    let username;
    try {
      ({ sub: username } = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }));
    } catch {
      return res.status(401).json({ error: 'Sign in again.' });
    }
    const accountService = staffService(username);
    if (!accountService) return res.status(401).json({ error: 'Sign in again.' });
    if (accountService !== service) return res.status(403).json({ error: 'This account can’t use this service.' });
    next();
  };
}
