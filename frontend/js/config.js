/**
 * Global Application Configuration
 */

const CONFIG = {
  // Base URL for the backend FastAPI server
  API_BASE_URL: 'http://localhost:8000',

  // LocalStorage keys for authentication and user data
  STORAGE_KEYS: {
    AUTH_TOKEN: 'token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_info',
  },

  // API Route endpoints matching FastAPI routers
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      PROFILE: '/auth/profile',
    },
    CATALOG: {
      TICKETS: '/tickets',
      CATEGORIES: '/categories',
    },
    TRANSACTIONS: {
      RESERVATIONS: '/reservations',
      REPORTS: '/reports',
      ADMIN_STATS: '/admin/stats',
    },
  },
};

// Freeze object to prevent accidental modifications during runtime
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ENDPOINTS);