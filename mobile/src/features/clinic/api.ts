import { send, type Student, type UnknownCard } from '../../core/api';

export type ClinicStudent = { result: 'found'; student: Student };

export const lookupClinicStudent = (token: string, qrToken: string) =>
  send<ClinicStudent | UnknownCard>('POST', '/api/clinic/lookup', token, { qrToken });

export const addClinicVisit = (token: string, qrToken: string, visit: { diagnosis: string; prescription: string }) =>
  send<{ result: 'saved' }>('POST', '/api/clinic/visits', token, { qrToken, ...visit });
