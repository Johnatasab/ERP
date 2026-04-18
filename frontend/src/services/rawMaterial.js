import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/raw-materials';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getRawMaterials = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const createRawMaterial = async (data) => {
  const response = await axios.post(API_URL, data, getAuthHeader());
  return response.data;
};

export const updateRawMaterial = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

export const deleteRawMaterial = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};