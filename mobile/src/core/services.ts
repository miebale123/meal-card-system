// The services an admin can belong to, with their titles in the app.
export const SERVICE_TITLES = { meals: 'Meal card', dorm: 'Dormitory', clinic: 'Clinic' } as const;

export type Service = keyof typeof SERVICE_TITLES;

export const SERVICES = Object.keys(SERVICE_TITLES) as Service[];
