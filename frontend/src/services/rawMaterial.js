import api from './api';

const API_URL = '/raw-materials'; // baseURL já está configurada

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getRawMaterials = async () => {
  const response = await api.get(API_URL, getAuthHeader());
  return response.data;
};

export const createRawMaterial = async (data) => {
  const response = await api.post(API_URL, data, getAuthHeader());
  return response.data;
};

export const updateRawMaterial = async (id, data) => {
  const response = await api.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

export const deleteRawMaterial = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};