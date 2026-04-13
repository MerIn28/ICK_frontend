import axios, { type AxiosInstance } from 'axios';

// Tworzymy instancję z jawnym typem AxiosInstance
const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;