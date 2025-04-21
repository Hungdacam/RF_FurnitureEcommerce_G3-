import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    street: '',
    streetNumber: '',
    zipCode: '',
    locality: '',
    country: '',
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
    const userDetails = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      street: formData.street,
      streetNumber: formData.streetNumber,
      zipCode: formData.zipCode,
      locality: formData.locality,
      country: formData.country,
    };
    await signup({ userName: formData.userName, userPassword: formData.userPassword, userDetails }, navigate);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Đăng ký</h2>
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
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="firstName">Họ:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="lastName">Tên:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="phoneNumber">Số điện thoại:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="street">Đường:</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="streetNumber">Số nhà:</label>
          <input
            type="text"
            id="streetNumber"
            name="streetNumber"
            value={formData.streetNumber}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="zipCode">Mã bưu điện:</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="locality">Thành phố:</label>
          <input
            type="text"
            id="locality"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="country">Quốc gia:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isSigningUp}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isSigningUp ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
};

export default Signup;