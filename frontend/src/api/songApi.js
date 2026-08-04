import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

const cfg = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const songApi = {
  getRandom: (token, excludeIds = []) =>
    axios.get(`${BASE}/songs/random?exclude=${excludeIds.join(',')}`, cfg(token)).then(r => r.data),
  getSongs:  (token, page = 1)        =>
    axios.get(`${BASE}/songs?page=${page}`, cfg(token)).then(r => r.data),
  getById:   (token, id)              =>
    axios.get(`${BASE}/songs/${id}`, cfg(token)).then(r => r.data),
};

