import axios from 'axios';

// Create axios instance with custom configuration
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_FAST_API_BASE_URL || 'http://localhost:8050',
    headers: {
        'Content-Type': 'application/json',
    },
    // Important for cookies
    withCredentials: true
});

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.warn('Unauthorized');
                    break;
                case 403:
                    console.error('Forbidden access');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                default:
                    console.error('An error occurred:', error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient; 