import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN} from './constants';


// Create an Axios instance with a base URL
// Allow methods such as GET, POST, PUT, DELETE
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});


// Interceptors request handles custom code before the request is sent
// It will add the Authorization header with the access token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptors response handles custom code after the response is received
// If the response status is 401, it will try to refresh the token
// Source: https://medium.com/@eric_abell/refactoring-token-management-a-cleaner-approach-to-handling-access-and-refresh-tokens-542c38212162
api.interceptors.response.use(
    (response) => response,
    async (error) => {

        // Prevent infinite loop
        // Don't try to refresh token if the request was to the token endpoint and it failed
        if (error.config.url.includes('/api/token/')) {
            return Promise.reject(error);
        }

        // If the error status is 401, from an expired access token of any request, try to refresh the token
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN);
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                    { refresh: refreshToken }
                );
                const { access } = res.data; // SimpleJWT returns 'access'
                localStorage.setItem(ACCESS_TOKEN, access);
                error.config.headers['Authorization'] = `Bearer ${access}`;
                return api(error.config); // Retry original request
            } catch (refreshError) {
                // Optionally clear tokens and redirect to login
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                window.location.href = '/login';
                throw refreshError;
            }
        }
        throw error;
    }
);



export default api;

