export type Role = 'superuser' | 'admin' | 'musician';

export type SlotType = 'matinee' | 'vermuth' | 'noche' | 'todo';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string; // 4 digits
}

export interface Unavailability {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  slots: SlotType[];
}

export interface Notification {
  id: string;
  message: string;
  date: string;
  read: boolean;
}

export const SLOTS: { key: SlotType; label: string; time: string }[] = [
  { key: 'matinee', label: 'Matinée', time: '08:00 - 13:00' },
  { key: 'vermuth', label: 'Vermuth', time: '13:01 - 20:00' },
  { key: 'noche', label: 'Noche', time: '20:01 - 07:59' },
  { key: 'todo', label: 'Día completo', time: 'Todo el día' },
];
