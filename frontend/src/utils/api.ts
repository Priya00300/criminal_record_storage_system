const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
    throw new Error("REACT_APP_API_URL is not defined in .env");
}
const api = {
  // Auth endpoints
  async register(username: string, password: string, role: string) {
    try{
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    });
    return response.json();
    }catch(err){
      console.error("error", err);
    }
  },

  async login(username: string, password: string) {
   try{
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }catch(err){
    console.error("error", err);
  }
  },

  // Contract endpoints
  async registerCriminal(criminalAddress: string, token: string) {
    try{
    const response = await fetch(`${API_BASE_URL}/contract/register-criminal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ criminalAddress }),
    });
    return response.json();
  }catch(err){
    console.error("error", err);
  }
  },

  async addCrime(criminalAddress: string, crimeDescription: string, token: string) {
   try{
    const response = await fetch(`${API_BASE_URL}/contract/add-crime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ criminalAddress, crimeDescription }),
    });
    return response.json();
  }catch(err){
    console.error("error", err);
  }
  },

  // Generic methods
  async get(endpoint: string, token?: string) {
   try{
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { headers });
    return response.json();
  }catch(err){
    console.error("error", err);
  }
  },

  async post(endpoint: string, data: any, token?: string) {
    try{
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
  }catch(err){
    console.error("error", err);
  }
  },
};

export default api;
