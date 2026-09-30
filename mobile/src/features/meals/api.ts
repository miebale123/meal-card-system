import { send, type Student, type UnknownCard } from '../../core/api';

export type MealScan = { result: 'ticked' | 'already_ticked'; student: Student; tickedAt: string } | UnknownCard;

export const scanMealCard = (token: string, qrToken: string) =>
  send<MealScan>('POST', '/api/meals/scan', token, { qrToken });
