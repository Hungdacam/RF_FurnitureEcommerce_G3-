// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { Link } from 'react-router-dom';
import background from '../assets/background.png';
import "../css/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
  });

  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
   
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData, navigate);
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-input-container">
            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="Tên người dùng"
              value={formData.userName}
              onChange={handleChange}
              required
              className="login-input"
            />
          </div>
          <div className="login-input-container">
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              placeholder="Nhập mật khẩu"
              value={formData.userPassword}
              onChange={handleChange}
              required
              className="login-input"
            />
          </div>
          <div className="login-button-container">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="login-button"
            >
              {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
          <p className="signup-text">
            Chưa có tài khoản? <Link to="/signup" className="signup-link">Đăng ký</Link>
          </p>
        </form>
      </div>
    </div>

  );
};

export default Login;
