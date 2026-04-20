import api from './api';

const API_URL = '/products'; // baseURL já está configurada

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getProducts = async (page = 1, limit = 10) => {
  const response = await api.get(`${API_URL}?page=${page}&limit=${limit}`, getAuthHeader);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post(API_URL, data, getAuthHeader());
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const addProductMaterial = async (productId, rawMaterialId, quantity) => {
  const response = await api.post(`${API_URL}/${productId}/materials`, { raw_material_id: rawMaterialId, quantity }, getAuthHeader());
  return response.data;
};

export const removeProductMaterial = async (productId, rawMaterialId) => {
  const response = await api.delete(`${API_URL}/${productId}/materials/${rawMaterialId}`, getAuthHeader());
  return response.data;
};