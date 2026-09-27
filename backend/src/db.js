import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const db = new DatabaseSync(path.join(import.meta.dirname, '..', 'meal-card.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id       TEXT PRIMARY KEY, -- university ID, e.g. UGR/1234/15
    name     TEXT NOT NULL,
    qr_token TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS meal_ticks (
    student_id TEXT NOT NULL REFERENCES students (id),
    meal_date  TEXT NOT NULL, -- YYYY-MM-DD in the server's time zone
    ticked_at  TEXT NOT NULL,
    PRIMARY KEY (student_id, meal_date)
  );

  CREATE TABLE IF NOT EXISTS dorm_assignments (
    student_id TEXT PRIMARY KEY REFERENCES students (id),
    room       TEXT NOT NULL COLLATE NOCASE,
    bed        TEXT NOT NULL COLLATE NOCASE,
    item_count INTEGER NOT NULL,
    UNIQUE (room, bed)
  );

  CREATE TABLE IF NOT EXISTS clinic_visits (
    id           INTEGER PRIMARY KEY,
    student_id   TEXT NOT NULL REFERENCES students (id),
    diagnosis    TEXT NOT NULL,
    prescription TEXT NOT NULL,
    visited_at   TEXT NOT NULL
  );
`);
