import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/products';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getProducts = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, getAuthHeader);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createProduct = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const addProductMaterial = async (productId, rawMaterialId, quantity) => {
  const response = await axios.post(`${API_URL}/${productId}/materials`, { raw_material_id: rawMaterialId, quantity }, getAuthHeader());
  return response.data;
};

export const removeProductMaterial = async (productId, rawMaterialId) => {
  const response = await axios.delete(`${API_URL}/${productId}/materials/${rawMaterialId}`, getAuthHeader());
  return response.data;
};