import React, { useState } from "react";
import "./LoginPage.css";
import axios from "axios";
import { BASE_URL, LOGIN } from "../Constants";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call your Spring Boot login API here
    try {
      const response = await axios.post(`${BASE_URL}/${LOGIN}`, {
        username,
        password,
      });
      const data = response.data;

      // Store info locally (optional)
      if (data.success) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("roleId", data.roleId);
        setIsAuthenticated(true);
        navigate("/");
      } else {
        setMessage("Invalid credentials");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || "Invalid credentials");
      } else {
        setMessage("Server error. Please try again.");
      }
      console.error("Login error:", error);
    }
  };
  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">CityFashion POS</h2>
        {message && <div className="message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
