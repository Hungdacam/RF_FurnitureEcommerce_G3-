import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import background from '../assets/background.png';
import { Link } from 'react-router-dom';
import "../css/Signup.css";

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
      className="signup-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="signup-form-wrapper">
        <h2>Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          {['userName', 'userPassword', 'firstName', 'lastName', 'email', 'phoneNumber'].map((field, index) => (
            <div className="signup-input-group" key={index}>
              <input
                type={field === 'userPassword' ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field}
                placeholder={
                  field === 'userName' ? 'Tên người dùng' :
                  field === 'userPassword' ? 'Nhập mật khẩu' :
                  field === 'firstName' ? 'Nhập họ' :
                  field === 'lastName' ? 'Nhập tên' :
                  field === 'email' ? 'Nhập email' :
                  'Nhập số điện thoại'
                }
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className="signup-button-wrapper">
            <button type="submit" className="signup-button" disabled={isSigningUp}>
              {isSigningUp ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
          <p className="signup-text">
            Đăng nhập bằng tài khoản? <Link to="/login" className="signup-link">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;