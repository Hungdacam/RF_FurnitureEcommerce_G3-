import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import background from '../assets/background.png';
import '../css/Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    userPassword: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    otp: '',
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const navigate = useNavigate();
  const { signup, verifyOtp, resendOtp, isSigningUp, isVerifyingOtp, isResendingOtp } = useAuthStore();

  const validate = () => {
    const newErrors = {};

    // Username required
    if (!formData.userName.trim()) {
      newErrors.userName = 'Vui lòng nhập tên đăng nhập';
    }

    // Password: min 6, upper, lower, number, special char
    if (!formData.userPassword) {
      newErrors.userPassword = 'Vui lòng nhập mật khẩu';
    } else if (
      formData.userPassword.length < 6 ||
      !/[A-Z]/.test(formData.userPassword) ||
      !/[a-z]/.test(formData.userPassword) ||
      !/[0-9]/.test(formData.userPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(formData.userPassword)
    ) {
      newErrors.userPassword =
        'Mật khẩu phải có ít nhất 6 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    // Confirm password
    if (formData.confirmPassword !== formData.userPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // First name required
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }

    // Last name required
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }

    // Email format
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone: 10 digits
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số';
    }

    // OTP required if showOtpInput is true
    if (showOtpInput && !formData.otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');
    if (!validate()) return;

    if (!showOtpInput) {
      const success = await signup(
        {
          userName: formData.userName,
          userPassword: formData.userPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        },
        navigate,
        (err) => {
          console.log('Backend error:', err);
          if (typeof err === 'string') {
            if (err.includes('Email') && err.includes('Số điện thoại')) {
              setErrors((prev) => ({
                ...prev,
                email: 'Email đã được sử dụng',
                phoneNumber: 'Số điện thoại đã được sử dụng',
              }));
            } else if (err.includes('Email')) {
              setErrors((prev) => ({ ...prev, email: err }));
            } else if (err.includes('Số điện thoại')) {
              setErrors((prev) => ({ ...prev, phoneNumber: err }));
            } else {
              setBackendError(err);
            }
          } else {
            setBackendError('Đăng ký thất bại. Vui lòng thử lại.');
          }
        }
      );

      if (success) {
        setShowOtpInput(true);
      }
    } else {
      const success = await verifyOtp(formData.otp, formData.userName, navigate);
      if (!success) {
        setErrors((prev) => ({ ...prev, otp: 'Mã OTP không hợp lệ' }));
      }
    }
  };

  const handleResendOtp = async () => {
    const success = await resendOtp(formData.userName);
    if (!success) {
      setErrors((prev) => ({ ...prev, otp: 'Gửi lại OTP thất bại' }));
    }
  };

  return (
    <div
      className="signup-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="signup-form-wrapper">
        <h2>{showOtpInput ? 'Xác thực Email' : 'Đăng ký tài khoản'}</h2>
        {backendError && <div className="error">{backendError}</div>}
        <form onSubmit={handleSubmit}>
          {!showOtpInput && (
            <>
              <div className="signup-input-group">
                <label htmlFor="userName">Tên đăng nhập</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
                {errors.userName && <span className="error">{errors.userName}</span>}
              </div>

              <div className="signup-input-group">
                <label htmlFor="userPassword">Mật khẩu</label>
                <input
                  type="password"
                  id="userPassword"
                  name="userPassword"
                  value={formData.userPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {errors.userPassword && (
                  <span className="error">{errors.userPassword}</span>
                )}
              </div>

              <div className="signup-input-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="signup-input-group">
                <label htmlFor="firstName">Họ</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                {errors.firstName && (
                  <span className="error">{errors.firstName}</span>
                )}
              </div>

              <div className="signup-input-group">
                <label htmlFor="lastName">Tên</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && (
                  <span className="error">{errors.lastName}</span>
                )}
              </div>

              <div className="signup-input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="signup-input-group">
                <label htmlFor="phoneNumber">Số điện thoại</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
              </div>
            </>
          )}

          {showOtpInput && (
            <>
              <div className="signup-input-group">
                <label htmlFor="otp">Mã OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
                {errors.otp && <span className="error">{errors.otp}</span>}
              </div>
              <button
                type="button"
                className="resend-otp-button"
                onClick={handleResendOtp}
                disabled={isSigningUp || isVerifyingOtp || isResendingOtp}
              >
                {isResendingOtp ? 'Đang gửi lại...' : 'Gửi lại OTP'}
              </button>
            </>
          )}

          <button
            className="signup-button"
            type="submit"
            disabled={isSigningUp || isVerifyingOtp || isResendingOtp}
          >
            {isSigningUp
              ? 'Đang đăng ký...'
              : isVerifyingOtp
              ? 'Đang xác thực...'
              : showOtpInput
              ? 'Xác thực'
              : 'Đăng ký'}
          </button>
        </form>

        <p className="login-text">
          Đã có tài khoản? <Link className="signup-link" to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;