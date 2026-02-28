import { User } from '../types';

const USERS_KEY = 'smartSchedule_users';
const SESSION_KEY = 'smartSchedule_session';

interface StoredUser extends User {
  passwordHash: string; // In a real app, use bcrypt. Here we just simulate.
}

// Simple hash function for demo purposes (NOT securely encrypted for production)
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, StoredUser> = usersStr ? JSON.parse(usersStr) : {};
    
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user || user.passwordHash !== simpleHash(password)) {
      throw new Error('Invalid email or password');
    }

    const sessionUser = { id: user.id, email: user.email, name: user.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  signup: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: Record<string, StoredUser> = usersStr ? JSON.parse(usersStr) : {};

    if (Object.values(users).some(u => u.email === email)) {
      throw new Error('User already exists with this email');
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash: simpleHash(password)
    };

    users[newUser.id] = newUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }
};
