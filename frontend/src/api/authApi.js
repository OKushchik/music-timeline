import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

const headers = (token) => ({ Authorization: `Bearer ${token}` });

export const authApi = {
  register: (data)        => axios.post(`${BASE}/auth/register`, data).then(r => r.data),
  login:    (data)        => axios.post(`${BASE}/auth/login`, data, { withCredentials: true }).then(r => r.data),
  guest:    ()            => axios.post(`${BASE}/auth/guest`).then(r => r.data),
  logout:   ()            => axios.post(`${BASE}/auth/logout`, {}, { withCredentials: true }).then(r => r.data),
  getMe:    (token)       => axios.get(`${BASE}/auth/me`, { headers: headers(token) }).then(r => r.data),
};

