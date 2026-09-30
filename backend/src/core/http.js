import express from 'express';
import { findStudentByToken } from './students.js';

// Mounted after requireService, so bodies are parsed only after the request is let through.
export const serviceRouter = () => express.Router().use(express.json());

export function withStudent(req, res, next) {
  req.student = findStudentByToken(req.body?.qrToken);
  if (!req.student) return res.json({ result: 'unknown_card' });
  next();
}

// Trimmed text, or null when it's missing, not a string, or longer than maxLength.
export function cleanText(value, maxLength) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text && text.length <= maxLength ? text : null;
}
