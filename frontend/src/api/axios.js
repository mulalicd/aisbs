import axios from 'axios';

// Configure axios base URL based on environment
const getBaseURL = () => {
  // If REACT_APP_API_URL is set in environment, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're accessing via sandbox public URL
  const currentHost = window.location.host;
  if (currentHost.includes('sandbox.novita.ai')) {
    // Replace 3000 port with 5000 for backend
    return window.location.origin.replace('3000-', '5000-');
  }
  
  // Check if we're on localhost
  if (currentHost.includes('localhost:3000')) {
    // Use the proxy configuration
    return '';
  }
  
  // Default: use relative paths (proxy will handle it)
  return '';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the base URL for debugging
console.log('[Axios Config] Base URL:', axiosInstance.defaults.baseURL || 'Using proxy (relative paths)');

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[Axios Error]', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
