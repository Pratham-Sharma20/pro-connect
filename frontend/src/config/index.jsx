import axios from 'axios';

export const BASE_URL = "https://pro-connect-szpw.onrender.com"

export const clientServer = axios.create({
    baseURL : BASE_URL,
})

clientServer.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const formatImageUrl = (path) => {
    if (!path) return "/default-avatar.png"; 
    if (path.startsWith("http")) {
        return path;
    }
    return `${BASE_URL}/${path}`;
};
