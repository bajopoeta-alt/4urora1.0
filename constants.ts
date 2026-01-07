import { User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u00',
    name: 'Fortuna',
    role: 'superuser',
    pin: '1111',
  },
  {
    id: 'u01',
    name: 'Admin User',
    role: 'admin',
    pin: '1111',
  },
  {
    id: 'u02',
    name: 'Musician A',
    role: 'musician',
    pin: '1111',
  },
];

export const MAX_MONTHS_AHEAD = 6;

// Helper to format date consistent with input value
export const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
