import api from './api';

const API_URL = '/transactions'; // baseURL já está configurada

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getTransactions = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters }).toString();
  const response = await api.get(`${API_URL}?${params}`, getAuthHeader());
  return response.data; // { data, pagination }
};

export const getBalance = async () => {
  const response = await api.get(`${API_URL}/balance`, getAuthHeader());
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await api.post(API_URL, data, getAuthHeader());
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const exportTransactions = async (format, filters = {}) => {
  const params = new URLSearchParams({ format, ...filters }).toString();
  window.open(`http://localhost:3000/api/transactions/export?${params}`, '_blank');
};