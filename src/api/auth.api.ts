import { api } from './axios';

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const register = (data: { firstName: string; lastName: string; email: string; password: string }) =>
  api.post('/users', data);

export const getProfile = () => api.get('/users/me');