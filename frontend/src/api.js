import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const loginRequest = (payload) => api.post('/auth/login/', payload);
export const registerRequest = (payload) => api.post('/auth/register/', payload);
export const getCustomers = () => api.get('/customers/');
export const createCustomer = (payload) => api.post('/customers/', payload);
export const updateCustomer = (id, payload) => api.put(`/customers/${id}/`, payload);
export const deleteCustomer = (id) => api.delete(`/customers/${id}/`);
export const getProducts = () => api.get('/products/');
export const createProduct = (payload) => api.post('/products/', payload);
export const updateProduct = (id, payload) => api.put(`/products/${id}/`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);
export const getQuotations = () => api.get('/quotations/');
export const createQuotation = (payload) => api.post('/quotations/', payload);
export const convertQuotation = (id) => api.post(`/quotations/${id}/convert/`);
export const getOrders = () => api.get('/orders/');
export const createOrder = (payload) => api.post('/orders/', payload);
export const updateOrder = (id, payload) => api.put(`/orders/${id}/`, payload);
export const deleteOrder = (id) => api.delete(`/orders/${id}/`);

export default api;
