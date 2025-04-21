// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

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
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="userName">Tên người dùng:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="userPassword">Mật khẩu:</label>
          <input
            type="password"
            id="userPassword"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoggingIn}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default Login;