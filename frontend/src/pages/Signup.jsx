import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import background from '../assets/background.png';
import { Link } from 'react-router-dom';

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
    const success = await signup({ userName: formData.userName, userPassword: formData.userPassword, userDetails });
    if (success) {
      navigate('/login');
    }

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


      <div style={{
        marginLeft: '650px', width: '400px', padding: '30px',paddingTop: '-20px', marginTop: '-20px', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '20px'
      }}>
        <h2 style={{ textAlign: 'center' }}>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>

            <input
              type="text"
              id="userName"
              name="userName"
              placeholder='Tên người dùng'
              value={formData.userName}
              onChange={handleChange}
              required
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>

            <input
              type="password"
              id="userPassword"
              name="userPassword"
              placeholder='Nhập mật khẩu'
              value={formData.userPassword}
              onChange={handleChange}
              required
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder='Nhập họ'
              value={formData.firstName}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder='Nhập tên'
              value={formData.lastName}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder='Nhập email'
              value={formData.email}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              placeholder='Nhập số điện thoại'
              value={formData.phoneNumber}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="street"
              name="street"
              placeholder='Nhập tên đường'
              value={formData.street}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="streetNumber"
              name="streetNumber"
              placeholder='Nhập số nhà'
              value={formData.streetNumber}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              placeholder='Nhập mã bưu điện'
              value={formData.zipCode}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="locality"
              name="locality"
              placeholder='Nhập thành phố'
              value={formData.locality}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              id="country"
              name="country"
              placeholder='Nhập quốc gia'
              value={formData.country}
              onChange={handleChange}
              style={{ width: '90%', padding: '8px', marginTop: '5px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: '#fff' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={isSigningUp}
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
              {isSigningUp ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
          <p style={{ marginTop: '15px', textAlign: 'center' }}>
                      Đăng nhập bằng tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;