import axios from 'axios';
import { getToken } from './auth';

const API_URL = 'http://localhost:3000/api/customers';

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// GET com paginação – agora aceita page e limit
export const getCustomers = async (page = 1, limit = 10) => {
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, getAuthHeader());
  return response.data; // { data: [], pagination: {} }
};

export const getCustomerById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await axios.post(API_URL, customer, getAuthHeader());
  return response.data;
};

export const updateCustomer = async (id, customer) => {
  const response = await axios.put(`${API_URL}/${id}`, customer, getAuthHeader());
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};