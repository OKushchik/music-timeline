import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

const cfg = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const roomApi = {
  getRooms:     (token)           => axios.get(`${BASE}/rooms`, cfg(token)).then(r => r.data),
  getRoomByCode:(token, code)     => axios.get(`${BASE}/rooms/${code}`, cfg(token)).then(r => r.data),
  createRoom:   (token, data)     => axios.post(`${BASE}/rooms`, data, cfg(token)).then(r => r.data),
  deleteRoom:   (token, code)     => axios.delete(`${BASE}/rooms/${code}`, cfg(token)).then(r => r.data),
};

