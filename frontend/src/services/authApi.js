import { apiRequest } from './httpClient';

export const authApi = {
  async register(name, email, password) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
  },

  async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },
};