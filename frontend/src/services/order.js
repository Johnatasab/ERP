import api from './api';

const API_URL = '/orders'; // baseURL já está configurada

const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getOrders = async (page = 1, limit = 10) => {
  const response = await api.get(`${API_URL}?page=${page}&limit=${limit}`, getAuthHeader());
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post(API_URL, data, getAuthHeader());
  return response.data;
};

export const addOrderItem = async (orderId, item) => {
  const response = await api.post(`${API_URL}/${orderId}/items`, item, getAuthHeader());
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`${API_URL}/${orderId}/status`, { status }, getAuthHeader());
  return response.data;
};

export const updatePaymentStatus = async (orderId, payment_status) => {
  const response = await api.patch(`${API_URL}/${orderId}/payment`, { payment_status }, getAuthHeader());
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};