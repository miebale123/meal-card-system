import cors from 'cors';
import express from 'express';
import { authRouter, requireService } from './core/auth.js';
import { adminRouter } from './features/admin/routes.js';
import { clinicRouter } from './features/clinic/routes.js';
import { dormRouter } from './features/dorm/routes.js';
import { mealsRouter } from './features/meals/routes.js';

// CORS_ORIGIN is a comma-separated list; the default is Expo's web dev server.
const { PORT = 3000, CORS_ORIGIN = 'http://localhost:8081' } = process.env;

const app = express();
app.disable('x-powered-by');
// Only browsers enforce CORS, so this limits which websites can call the API; the phone app is unaffected.
app.use(cors({ origin: CORS_ORIGIN.split(',').map((origin) => origin.trim()) }));
app.use('/api/auth', authRouter);
// Each account belongs to one section, so cafeteria staff can't read or write clinic records,
// and the superadmin manages accounts without seeing any service's records.
app.use('/api/meals', requireService('meals'), mealsRouter);
app.use('/api/dorm', requireService('dorm'), dormRouter);
app.use('/api/clinic', requireService('clinic'), clinicRouter);
app.use('/api/admin', requireService('superadmin'), adminRouter);

// Replaces Express's default handler, which sends stack traces to clients outside production.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'The server couldn’t complete this request. Try again.' });
});

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Campus services API listening on port ${PORT}`);
});
