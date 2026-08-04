/**
 * Global Application Configuration
 * Contains backend base URL, local storage keys, and API endpoints matching Phase 3 routers.
 */
const CONFIG = {
  API_BASE_URL: "http://localhost:8000",

  STORAGE_KEYS: {
    ACCESS_TOKEN: "access_token",
    USER_DATA: "user",
  },

  ENDPOINTS: {
    AUTH: {
      SIGNUP: "/auth/signup",
      PASSWORD_LOGIN: "/auth/login/password",
      OTP_LOGIN: "/auth/login/otp",
      VERIFY_OTP: "/auth/verify-otp",
      PROFILE: "/auth/profile",
      RESET_PASSWORD: "/auth/reset-password",
    },
    CATALOG: {
      CITIES: "/catalog/cities",
      VENUES: "/catalog/venues",
      TICKETS_SEARCH: "/catalog/tickets/search",
      TICKET_DETAIL: (id) => `/catalog/tickets/${id}`,
    },
    TRANSACTIONS: {
      RESERVE: "/transactions/reserve",
      PAY: "/transactions/pay",
      BOOKINGS: "/transactions/bookings",
      CANCEL: "/transactions/cancel",
      PENALTY: "/transactions/cancellation-penalty",
      REPORT: "/transactions/report",
      REPORTS: "/transactions/reports",
      ADMIN_CANCELLATIONS: "/transactions/admin/cancellations",
      ADMIN_REPORTS: "/transactions/admin/reports",
      ADMIN_SUSPICIOUS_PAYMENTS: "/transactions/admin/payments/suspicious",
    }

  }
};

// Prevent accidental modification of configuration at runtime
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ENDPOINTS);
Object.freeze(CONFIG.ENDPOINTS.AUTH);
Object.freeze(CONFIG.ENDPOINTS.CATALOG);
Object.freeze(CONFIG.ENDPOINTS.TRANSACTIONS);

export default CONFIG;