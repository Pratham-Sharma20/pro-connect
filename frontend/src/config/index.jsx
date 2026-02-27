import axios from 'axios';

export const BASE_URL = "http://localhost:9090"


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