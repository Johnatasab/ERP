import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/profile';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const getProfile = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(API_URL, data, getAuthHeader());
  return response.data;
};

export const updatePassword = async (data) => {
  const response = await axios.put(`${API_URL}/password`, data, getAuthHeader());
  return response.data;
};