import api from './api';

const API_URL = '/customers'; // baseURL já está configurada

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });


// GET com paginação – agora aceita page e limit
export const getCustomers = async (page = 1, limit = 10) => {
  const response = await api.get(`${API_URL}?page=${page}&limit=${limit}`, getAuthHeader());
  return response.data; // { data: [], pagination: {} }
};

export const getCustomerById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createCustomer = async (customer) => {
  const response = await api.post(API_URL, customer, getAuthHeader());
  return response.data;
};

export const updateCustomer = async (id, customer) => {
  const response = await api.put(`${API_URL}/${id}`, customer, getAuthHeader());
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};