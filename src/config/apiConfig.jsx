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
    CREATE: '/api/categories',
    DELETE: (id) => `/api/categories/${id}`,
  },
  // User endpoints
  USERS: {
    ME: '/api/users/me',
    GET_BY_EMAIL: (email) => `/api/users/${email}`,
  },
  // Order endpoints
  ORDERS: {
    DEPOSIT: '/api/orders/deposit',
    MY_ORDERS: '/api/orders/my-orders',
    MY_SALES: '/api/orders/my-sales',
    GET_BY_ID: (id) => `/api/orders/${id}`,
    CANCEL: (id) => `/api/orders/${id}/cancel`,
    SELLER_CANCEL: (id) => `/api/orders/${id}/seller-cancel`,
    SCHEDULE_DELIVERY: (id) => `/api/orders/${id}/schedule-delivery`,
    COMPLETE: (id) => `/api/orders/${id}/complete`,
    REPORT_BUYER_NO_SHOW: (id) => `/api/orders/${id}/report-buyer-no-show`,
    REPORT_SELLER_NO_SHOW: (id) => `/api/orders/${id}/report-seller-no-show`,
  },
  // Wallet endpoints
  WALLET: {
    BALANCE: '/api/wallet/balance',
    WITHDRAW: '/api/wallet/withdraw',
    TRANSACTIONS: '/api/wallet/transactions',
  },
  // Payment endpoints
  PAYMENT: {
    CREATE_DEPOSIT_URL: '/api/payment/create-deposit-url',
    VNPAY_RETURN: '/api/payment/vnpay-return',
  },
  // Image endpoints
  IMAGES: {
    UPLOAD: (postId) => `/api/posts/${postId}/images`,
    GET_ALL: (postId) => `/api/posts/${postId}/images`,
    THUMBNAIL: (postId) => `/api/posts/${postId}/images/thumbnail`,
    SET_THUMBNAIL: (postId, imageId) => `/api/posts/${postId}/images/${imageId}/thumbnail`,
    DELETE: (postId, imageId) => `/api/posts/${postId}/images/${imageId}`,
    DELETE_ALL: (postId) => `/api/posts/${postId}/images`,
  },
  // Admin endpoints
  ADMIN: {
    GET_ALL_USERS: '/api/admin/users',
    GET_USER_BY_EMAIL: (email) => `/api/admin/users/${email}`,
    UPDATE_ROLE: (email) => `/api/admin/users/${email}/role`,
    DELETE_USER: (email) => `/api/admin/users/${email}`,
  },
  // Inspection endpoints
  INSPECTIONS: {
    CREATE_BOOKING: '/api/inspections/bookings',
    GET_ALL_BOOKINGS: '/api/inspections/bookings',
    GET_MY_BOOKINGS: '/api/inspections/bookings/my-bookings',
    ASSIGN_INSPECTOR: (bookingId) => `/api/inspections/bookings/${bookingId}/assign`,
    CONFIRM_BOOKING: (bookingId) => `/api/inspections/bookings/${bookingId}/confirm`,
    GET_MY_REQUESTS: '/api/inspections/requests/my-requests',
    GET_POST_HISTORY: (postId) => `/api/inspections/posts/${postId}/history`,
    SUBMIT_REPORT: (inspectionId) => `/api/inspections/${inspectionId}/report`,
    GET_REPORT: (inspectionId) => `/api/inspections/${inspectionId}/report`,
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
