import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import '../css/Signup.css';
const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuthStore();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await signup({
      userName: formData.userName,
      userPassword: formData.userPassword,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber
    }, navigate);
  };
  
  return (
    <div className="signup-container">
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userName">Tên đăng nhập</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="userPassword">Mật khẩu</label>
          <input
            type="password"
            id="userPassword"
            name="userPassword"
            value={formData.userPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="firstName">Họ</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Tên</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phoneNumber">Số điện thoại</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" disabled={isSigningUp}>
          {isSigningUp ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      
      <p className="login-text">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default Signup;