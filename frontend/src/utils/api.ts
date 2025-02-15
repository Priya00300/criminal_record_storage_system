const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  // Auth endpoints
  async register(username: string, password: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });
    return response.json();
  },

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  // Contract endpoints
  async registerCriminal(criminalAddress: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contract/register-criminal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ criminalAddress }),
    });
    return response.json();
  },

  async addCrime(criminalAddress: string, crimeDescription: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/contract/add-crime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ criminalAddress, crimeDescription }),
    });
    return response.json();
  },

  // Generic methods
  async get(endpoint: string, token?: string) {
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { headers });
    return response.json();
  },

  async post(endpoint: string, data: any, token?: string) {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export default api;
