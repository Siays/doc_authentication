import axios from 'axios';

// Create axios instance with custom configuration
const axiosClient = axios.create({
    baseURL: import.meta.env.FAST_API_BASE_URL || 'http://localhost:8050',
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
            // Handle specific error status codes
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized access
                    window.location.href = '/login';
                    break;
                case 403:
                    // Handle forbidden access
                    console.error('Forbidden access');
                    break;
                case 404:
                    // Handle not found
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