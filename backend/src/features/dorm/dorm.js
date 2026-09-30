import { db } from '../../core/db.js';

const selectAssignment = db.prepare(
  'SELECT room, bed, item_count AS itemCount FROM dorm_assignments WHERE student_id = ?',
);
const selectBedHolder = db.prepare(`
  SELECT s.id, s.name FROM dorm_assignments d JOIN students s ON s.id = d.student_id
  WHERE d.room = ? AND d.bed = ? AND d.student_id <> ?
`);
const upsertAssignment = db.prepare(`
  INSERT INTO dorm_assignments (student_id, room, bed, item_count) VALUES (?, ?, ?, ?)
  ON CONFLICT (student_id) DO UPDATE SET room = excluded.room, bed = excluded.bed, item_count = excluded.item_count
`);

export function getDormAssignment(studentId) {
  return selectAssignment.get(studentId) ?? null;
}

// A bed holds one student, so a taken bed returns its current holder instead of saving.
export function saveDormAssignment(studentId, { room, bed, itemCount }) {
  const holder = selectBedHolder.get(room, bed, studentId);
  if (holder) return { result: 'bed_taken', holder };

  upsertAssignment.run(studentId, room, bed, itemCount);
  return { result: 'saved', assignment: { room, bed, itemCount } };
}
