import { send } from '../../core/api';
import type { Service } from '../../core/services';

export type Admin = { username: string; service: Service };

export const listAdmins = (token: string) => send<Admin[]>('GET', '/api/admin/admins', token);

export const registerAdmin = (token: string, admin: Admin & { password: string }) =>
  send<Admin>('POST', '/api/admin/admins', token, admin);
