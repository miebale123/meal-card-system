import { send, type Student, type UnknownCard } from '../../core/api';

export type DormAssignment = { room: string; bed: string; itemCount: number };
export type DormStudent = { result: 'found'; student: Student; assignment: DormAssignment | null };
export type DormSave = { result: 'saved'; assignment: DormAssignment } | { result: 'bed_taken'; holder: Student };

export const lookupDorm = (token: string, qrToken: string) =>
  send<DormStudent | UnknownCard>('POST', '/api/dorm/lookup', token, { qrToken });

export const saveDorm = (token: string, qrToken: string, assignment: DormAssignment) =>
  send<DormSave>('PUT', '/api/dorm/assignment', token, { qrToken, ...assignment });
