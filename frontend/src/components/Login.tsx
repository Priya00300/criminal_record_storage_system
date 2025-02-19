import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.login(username, password);
      console.log("Login successful:", data);

      // Store the token in localStorage
      localStorage.setItem("token", data.token);

      // Redirect to the dashboard
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
        <p className="text-sm mt-2">
          <Link to="/" className="text-blue-500 hover:underline">
            Go back to Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;