import { cleanText, serviceRouter, withStudent } from '../../core/http.js';
import { getDormAssignment, saveDormAssignment } from './dorm.js';

export const dormRouter = serviceRouter();

dormRouter.post('/lookup', withStudent, (req, res) => {
  res.json({ result: 'found', student: req.student, assignment: getDormAssignment(req.student.id) });
});

dormRouter.put('/assignment', withStudent, (req, res) => {
  const room = cleanText(req.body.room, 30);
  const bed = cleanText(req.body.bed, 10);
  const { itemCount } = req.body;
  if (!room || !bed || !Number.isInteger(itemCount) || itemCount < 0 || itemCount > 999) {
    return res.status(400).json({ error: 'Enter a room, a bed, and a number of items from 0 to 999.' });
  }
  res.json(saveDormAssignment(req.student.id, { room, bed, itemCount }));
});
