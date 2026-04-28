/**
 * Axios instance for API calls.
 * - Dev: VITE_API_URL empty → same-origin /api (Vite proxy to backend).
 * - Prod: set VITE_API_URL to your deployed API origin (no trailing slash).
 */

import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({ baseURL });

const TOKEN_KEY = 'staffToken';

export function getStaffToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function setStaffToken(token) {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
    if (config.skipAuth) return config;
    const t = getStaffToken();
    if (t) {
        config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
});
