import api from './api';

const API_URL = '/profile'; // baseURL já está configurada

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getProfile = async () => {
  const response = await api.get(API_URL, getAuthHeader());
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put(API_URL, data, getAuthHeader());
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await api.put(`${API_URL}/password`, data, getAuthHeader());
  return response.data;
};