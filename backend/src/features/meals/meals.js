import { db } from '../../core/db.js';

const insertTick = db.prepare(
  'INSERT INTO meal_ticks (student_id, meal_date, ticked_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
);
const findTick = db.prepare('SELECT ticked_at FROM meal_ticks WHERE student_id = ? AND meal_date = ?');

// The (student_id, meal_date) primary key allows one meal per day, even across several scanners.
export function tickTodaysMeal(student) {
  const now = new Date();
  const today = localDate(now);
  const { changes } = insertTick.run(student.id, today, now.toISOString());
  const { ticked_at: tickedAt } = findTick.get(student.id, today);
  return { result: changes ? 'ticked' : 'already_ticked', student, tickedAt };
}

function localDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
