import { cleanText, serviceRouter, withStudent } from '../../core/http.js';
import { addClinicVisit } from './clinic.js';

export const clinicRouter = serviceRouter();

clinicRouter.post('/lookup', withStudent, (req, res) => res.json({ result: 'found', student: req.student }));

clinicRouter.post('/visits', withStudent, (req, res) => {
  const diagnosis = cleanText(req.body.diagnosis, 1000);
  const prescription = cleanText(req.body.prescription, 1000);
  if (!diagnosis || !prescription) {
    return res.status(400).json({ error: 'Enter a diagnosis and a prescription, up to 1000 characters each.' });
  }
  res.json(addClinicVisit(req.student.id, { diagnosis, prescription }));
});
