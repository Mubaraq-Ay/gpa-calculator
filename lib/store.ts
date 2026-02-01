import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, Semester, GradePoint } from './gpa-calculations';
import { DEFAULT_GRADE_SCALE } from './gpa-calculations';

// Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Plain storage for frontend demo
}

export interface AuthState {
  currentUserId: string | null;
  sessionToken: string | null;
}

// Settings types
export interface UserSettings {
  scaleType: '5.0' | '4.0';
  gradeMapping: GradePoint[];
  retakePolicy: 'replace' | 'keep-both';
  targetCgpa: number;
}

// Store state
export interface AppState {
  // Auth
  auth: AuthState;
  users: User[];
  userSettings: Record<string, UserSettings>;

  // Data
  semesters: Semester[];
  coursesBySemester: Record<string, Course[]>;

  // Auth actions
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // User actions
  updateUserProfile: (name: string) => void;

  // Semester actions
  addSemester: (semester: Semester) => void;
  updateSemester: (id: string, updates: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;

  // Course actions
  addCourse: (semesterId: string, course: Course) => void;
  updateCourse: (semesterId: string, courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (semesterId: string, courseId: string) => void;

  // Settings actions
  updateSettings: (settings: Partial<UserSettings>) => void;
  getSettings: () => UserSettings;

  // Utility
  getCurrentUser: () => User | null;
  isAuthenticated: () => boolean;
}

const getDefaultSettings = (): UserSettings => ({
  scaleType: '5.0',
  gradeMapping: DEFAULT_GRADE_SCALE,
  retakePolicy: 'replace',
  targetCgpa: 4.0,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        currentUserId: null,
        sessionToken: null,
      },
      users: [],
      userSettings: {},
      semesters: [],
      coursesBySemester: {},

      // Auth actions
      signup: (name: string, email: string, password: string) => {
        const { users } = get();
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
          return { success: false, error: 'Email already registered' };
        }

        // Validate inputs
        if (!name.trim()) {
          return { success: false, error: 'Full name is required' };
        }
        if (!email.includes('@')) {
          return { success: false, error: 'Invalid email address' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        const userId = `user_${Date.now()}`;
        const sessionToken = `session_${Date.now()}_${Math.random()}`;

        set(state => ({
          users: [
            ...state.users,
            {
              id: userId,
              name,
              email,
              password, // In production, hash this!
            },
          ],
          auth: {
            currentUserId: userId,
            sessionToken,
          },
          userSettings: {
            ...state.userSettings,
            [userId]: getDefaultSettings(),
          },
        }));

        return { success: true };
      },

      login: (email: string, password: string) => {
        const { users } = get();

        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          return { success: false, error: 'Invalid email or password' };
        }

        const sessionToken = `session_${Date.now()}_${Math.random()}`;

        set(state => ({
          auth: {
            currentUserId: user.id,
            sessionToken,
          },
        }));

        return { success: true };
      },

      logout: () => {
        set({
          auth: {
            currentUserId: null,
            sessionToken: null,
          },
        });
      },

      updateUserProfile: (name: string) => {
        const { auth, users } = get();
        if (!auth.currentUserId) return;

        set(state => ({
          users: state.users.map(u =>
            u.id === auth.currentUserId ? { ...u, name } : u
          ),
        }));
      },

      // Semester actions
      addSemester: (semester: Semester) => {
        const { auth } = get();
        if (!auth.currentUserId) return;

        set(state => ({
          semesters: [...state.semesters, semester],
        }));
      },

      updateSemester: (id: string, updates: Partial<Semester>) => {
        set(state => ({
          semesters: state.semesters.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSemester: (id: string) => {
        set(state => {
          const newCourses = { ...state.coursesBySemester };
          delete newCourses[id];
          return {
            semesters: state.semesters.filter(s => s.id !== id),
            coursesBySemester: newCourses,
          };
        });
      },

      // Course actions
      addCourse: (semesterId: string, course: Course) => {
        set(state => ({
          coursesBySemester: {
            ...state.coursesBySemester,
            [semesterId]: [...(state.coursesBySemester[semesterId] || []), course],
          },
        }));
      },

      updateCourse: (semesterId: string, courseId: string, updates: Partial<Course>) => {
        set(state => ({
          coursesBySemester: {
            ...state.coursesBySemester,
            [semesterId]: (state.coursesBySemester[semesterId] || []).map(c =>
              c.id === courseId ? { ...c, ...updates } : c
            ),
          },
        }));
      },

      deleteCourse: (semesterId: string, courseId: string) => {
        set(state => ({
          coursesBySemester: {
            ...state.coursesBySemester,
            [semesterId]: (state.coursesBySemester[semesterId] || []).filter(
              c => c.id !== courseId
            ),
          },
        }));
      },

      // Settings actions
      updateSettings: (settings: Partial<UserSettings>) => {
        const { auth } = get();
        if (!auth.currentUserId) return;

        set(state => ({
          userSettings: {
            ...state.userSettings,
            [auth.currentUserId!]: {
              ...state.userSettings[auth.currentUserId!],
              ...settings,
            },
          },
        }));
      },

      getSettings: () => {
        const { auth, userSettings } = get();
        if (!auth.currentUserId) {
          return getDefaultSettings();
        }
        return (
          userSettings[auth.currentUserId] || getDefaultSettings()
        );
      },

      // Utility
      getCurrentUser: () => {
        const { auth, users } = get();
        if (!auth.currentUserId) return null;
        return users.find(u => u.id === auth.currentUserId) || null;
      },

      isAuthenticated: () => {
        const { auth } = get();
        return auth.currentUserId !== null && auth.sessionToken !== null;
      },
    }),
    {
      name: 'gpa-calculator-store',
    }
  )
);
