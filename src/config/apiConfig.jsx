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
  // Post endpoints
  POSTS: {
    GET_ALL: '/api/posts',
    SEARCH: '/api/posts/search',
    MY_POSTS: '/api/posts/my-posts',
    GET_BY_ID: (id) => `/api/posts/${id}`,
    CREATE: '/api/posts',
    UPDATE: (id) => `/api/posts/${id}`,
    UPDATE_STATUS: (id) => `/api/posts/${id}/status`,
    DELETE: (id) => `/api/posts/${id}`,
  },
  // Bicycle endpoints
  BICYCLES: {
    GET_ALL: '/api/bicycles',
    MY_BICYCLES: '/api/bicycles/my-bicycles',
    GET_BY_ID: (id) => `/api/bicycles/${id}`,
    CREATE: '/api/bicycles',
    UPDATE: (id) => `/api/bicycles/${id}`,
    DELETE: (id) => `/api/bicycles/${id}`,
  },
  // Category endpoints
  CATEGORIES: {
    GET_ALL: '/api/categories',
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
