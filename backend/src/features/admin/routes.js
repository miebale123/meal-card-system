import { cleanText, serviceRouter } from '../../core/http.js';
import { addStaff, listAdmins, MIN_PASSWORD_LENGTH, SERVICES } from '../../core/staff.js';

export const adminRouter = serviceRouter();

adminRouter.get('/admins', (req, res) => res.json(listAdmins()));

// Only registers new meals, dorm, or clinic accounts, so it can't change a password or make another superadmin.
adminRouter.post('/admins', async (req, res) => {
  const username = cleanText(req.body?.username, 50);
  const { password, service } = req.body ?? {};
  if (!username || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH || !SERVICES.includes(service)) {
    const error = `Enter a username, a password of at least ${MIN_PASSWORD_LENGTH} characters, and a service.`;
    return res.status(400).json({ error });
  }
  if (!(await addStaff(username, password, service))) {
    return res.status(409).json({ error: `The username ${username} is already taken.` });
  }
  res.status(201).json({ username, service });
});
