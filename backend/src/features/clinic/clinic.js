import { db } from '../../core/db.js';

const insertVisit = db.prepare(
  'INSERT INTO clinic_visits (student_id, diagnosis, prescription, visited_at) VALUES (?, ?, ?, ?)',
);

export function addClinicVisit(studentId, { diagnosis, prescription }) {
  insertVisit.run(studentId, diagnosis, prescription, new Date().toISOString());
  return { result: 'saved' };
}
