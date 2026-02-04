// API Configuration
export const API_CONFIG = {
  // Backend API endpoint
  BASE_URL:
    import.meta.env.VITE_API_BACK_END_ENDPOINT ||
    'http://localhost:8080',

  // Google OAuth config
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',

  // Environment
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/auth/logout',
  },
}
// Log configuration in development
if (API_CONFIG.IS_DEV) {
  console.log('🔧 [Config] API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    GOOGLE_CLIENT_ID: API_CONFIG.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
    ENV: API_CONFIG.IS_DEV ? 'Development' : 'Production',
  });
}
