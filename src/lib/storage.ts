// LocalForage configuration and storage utilities
import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'TalentFlow',
  version: 1.0,
  storeName: 'talentflow_data',
  description: 'TalentFlow hiring platform data storage'
});

// Storage keys
export const STORAGE_KEYS = {
  JOBS: 'jobs',
  CANDIDATES: 'candidates',
  ASSESSMENTS: 'assessments',
  ASSESSMENT_RESPONSES: 'assessment_responses',
  CANDIDATE_TIMELINE: 'candidate_timeline',
  USERS: 'users',
  APP_STATE: 'app_state'
} as const;

// Generic storage functions
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await localforage.getItem<T>(key);
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await localforage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      throw error;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await localforage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  async keys(): Promise<string[]> {
    try {
      return await localforage.keys();
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }
};

// Typed storage helpers for specific data types
export const jobStorage = {
  async getAll(): Promise<any[]> {
    const result = await storage.get(STORAGE_KEYS.JOBS);
    return Array.isArray(result) ? result : [];
  },
  
  async setAll(jobs: any[]) {
    await storage.set(STORAGE_KEYS.JOBS, jobs);
  }
};

export const candidateStorage = {
  async getAll(): Promise<any[]> {
    const result = await storage.get(STORAGE_KEYS.CANDIDATES);
    return Array.isArray(result) ? result : [];
  },
  
  async setAll(candidates: any[]) {
    await storage.set(STORAGE_KEYS.CANDIDATES, candidates);
  }
};

export const assessmentStorage = {
  async getAll(): Promise<any[]> {
    const result = await storage.get(STORAGE_KEYS.ASSESSMENTS);
    return Array.isArray(result) ? result : [];
  },
  
  async setAll(assessments: any[]) {
    await storage.set(STORAGE_KEYS.ASSESSMENTS, assessments);
  }
};

export const assessmentResponseStorage = {
  async getAll(): Promise<any[]> {
    const result = await storage.get(STORAGE_KEYS.ASSESSMENT_RESPONSES);
    return Array.isArray(result) ? result : [];
  },
  
  async setAll(responses: any[]) {
    await storage.set(STORAGE_KEYS.ASSESSMENT_RESPONSES, responses);
  }
};

export const timelineStorage = {
  async getAll(): Promise<any[]> {
    const result = await storage.get(STORAGE_KEYS.CANDIDATE_TIMELINE);
    return Array.isArray(result) ? result : [];
  },
  
  async setAll(timeline: any[]) {
    await storage.set(STORAGE_KEYS.CANDIDATE_TIMELINE, timeline);
  }
};

export const userStorage = {
  async getAll(): Promise<any[]> {
    const result = await storage.get(STORAGE_KEYS.USERS);
    return Array.isArray(result) ? result : [];
  },
  
  async setAll(users: any[]) {
    await storage.set(STORAGE_KEYS.USERS, users);
  }
};