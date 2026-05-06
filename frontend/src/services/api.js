import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Teams
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
};

// Players
export const playersAPI = {
  getAll: (params) => api.get('/players', { params }),
  getById: (id) => api.get(`/players/${id}`),
  create: (data) => api.post('/players', data),
  update: (id, data) => api.put(`/players/${id}`, data),
  delete: (id) => api.delete(`/players/${id}`),
};

// Tournaments
export const tournamentsAPI = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  addTeam: (id, data) => api.post(`/tournaments/${id}/teams`, data),
};

// Matches
export const matchesAPI = {
  getAll: (params) => api.get('/matches', { params }),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  update: (id, data) => api.put(`/matches/${id}`, data),
};

// Scorecards
export const scorecardsAPI = {
  getByMatch: (matchId) => api.get(`/scorecards/match/${matchId}`),
  addBatting: (data) => api.post('/scorecards/batting', data),
  addBowling: (data) => api.post('/scorecards/bowling', data),
  addInnings: (data) => api.post('/scorecards/innings', data),
};

// Stats
export const statsAPI = {
  dashboard: () => api.get('/stats/dashboard'),
  topScorers: (params) => api.get('/stats/top-scorers', { params }),
  topWicketTakers: (params) => api.get('/stats/top-wicket-takers', { params }),
  pointsTable: (tournamentId) => api.get(`/stats/points-table/${tournamentId}`),
  playerStats: (playerId) => api.get(`/stats/player/${playerId}`),
};

export default api;
