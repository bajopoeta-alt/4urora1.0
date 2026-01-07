import { User, Unavailability, Notification, Role, SlotType } from '../types';
import { INITIAL_USERS } from '../constants';

const KEYS = {
  USERS: '4uror4_users',
  UNAVAILABILITIES: '4uror4_unavailabilities',
  NOTIFICATIONS: '4uror4_notifications',
  CURRENT_USER: '4uror4_current_user',
};

// Initialize Storage
const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.UNAVAILABILITIES)) {
    localStorage.setItem(KEYS.UNAVAILABILITIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

initStorage();

// User Services
export const getUsers = (): User[] => {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const deleteUser = (userId: string) => {
  let users = getUsers();
  users = users.filter((u) => u.id !== userId);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const authenticate = (id: string, pin: string): User | null => {
  const users = getUsers();
  return users.find((u) => u.id === id && u.pin === pin) || null;
};

// Unavailability Services
export const getUnavailabilities = (): Unavailability[] => {
  const data = localStorage.getItem(KEYS.UNAVAILABILITIES);
  return data ? JSON.parse(data) : [];
};

export const setUnavailability = (
  userId: string,
  date: string,
  slots: SlotType[]
): { success: boolean; message?: string } => {
  const records = getUnavailabilities();
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  // Remove existing for this user/date (overwrite policy)
  const filtered = records.filter(
    (r) => !(r.userId === userId && r.date === date)
  );
  
  // If slots are empty, we just removed the unavailability
  if (slots.length > 0) {
    filtered.push({
      id: `${userId}-${date}-${Date.now()}`,
      userId,
      date,
      slots,
    });
    
    // Notification logic
    const currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || '{}');
    // If the user modifying is the owner of the data (normal case)
    // Send notification to admins
    addNotification(`El usuario ${user?.name} (${userId}) ha modificado su disponibilidad para el ${date}.`);
  } else {
      addNotification(`El usuario ${user?.name} (${userId}) ha eliminado su indisponibilidad para el ${date}.`);
  }

  localStorage.setItem(KEYS.UNAVAILABILITIES, JSON.stringify(filtered));
  return { success: true };
};

// Notification Services
export const getNotifications = (): Notification[] => {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
};

export const addNotification = (message: string) => {
  const notes = getNotifications();
  notes.unshift({
    id: Date.now().toString(),
    message,
    date: new Date().toISOString(),
    read: false,
  });
  // Keep last 50
  if (notes.length > 50) notes.pop();
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notes));
};

export const clearNotifications = () => {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
}
