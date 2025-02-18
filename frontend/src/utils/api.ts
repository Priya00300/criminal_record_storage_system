const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Removed /api from base URL

const api = {
  // Auth endpoints
  async register(username: string, password: string, role: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      return data;
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    }
  },

  async login(username: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  },

  // Contract endpoints
  async registerCriminal(criminalAddress: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/contract/register-criminal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ criminalAddress }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to register criminal");
      }

      return data;
    } catch (err) {
      console.error("Register criminal error:", err);
      throw err;
    }
  },

  async addCrime(criminalAddress: string, crimeDescription: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/contract/add-crime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ criminalAddress, crimeDescription }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add crime");
      }

      return data;
    } catch (err) {
      console.error("Add crime error:", err);
      throw err;
    }
  },

  // IPFS endpoint
  async uploadToIPFS(file: File, token: string) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/ipfs/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file to IPFS");
      }

      return data;
    } catch (err) {
      console.error("IPFS upload error:", err);
      throw err;
    }
  },
};

export default api;