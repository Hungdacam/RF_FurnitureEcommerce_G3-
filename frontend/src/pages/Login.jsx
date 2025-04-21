// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { Link } from 'react-router-dom';
import background from '../assets/background.png';


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
      style={{
        height: '100vh', // Full screen height
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${background})`, // Background image from variable
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '200vh',
      }}
    >
      <div style={{ marginLeft:'650px' ,width: '400px', padding: '30px', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>Đăng nhập</h2>
        <form onSubmit={handleSubmit} >
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
            {/* <label htmlFor="userName">Tên người dùng:</label> */}
            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="Tên người dùng"
              value={formData.userName}
              onChange={handleChange}
              required
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
            {/* <label htmlFor="userPassword">Mật khẩu:</label> */}
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              placeholder="Nhập mật khẩu"
              value={formData.userPassword}
              onChange={handleChange}
              required
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                width: '50%',
                padding: '10px',
                backgroundColor: '#598176',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '10px',
              }}
            >
              {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
          <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/signup">Đăng ký</Link>
          </p>

        </form>
      </div>
    </div>
  );
};

export default Login;
