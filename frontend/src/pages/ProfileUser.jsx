import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/ProfileUser.css";
import useAuthStore from '../stores/useAuthStore';
import useUserStore from '../stores/userStore';

import { axiosInstance } from '../lib/axios';

const ProfileUser = () => {
  const authUser = useAuthStore((state) => state.authUser);
  // Lấy hàm logout từ useAuthStore (điều chỉnh tên hàm theo store của bạn)
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const updateUser = useUserStore((state) => state.updateUser);


  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };



  const [isEditing, setIsEditing] = useState(false);

  // Thêm state cho việc cập nhật mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: authUser?.userDetails?.firstName || '',
    lastName: authUser?.userDetails?.lastName || '',
    email: authUser?.userDetails?.email || '',
    street: authUser?.userDetails?.street || '',
    phoneNumber: authUser?.userDetails?.phoneNumber || '',
    streetNumber: authUser?.userDetails?.streetNumber || '',
    zipCode: authUser?.userDetails?.zipCode || '',
    locality: authUser?.userDetails?.locality || '',
    country: authUser?.userDetails?.country || ''
  });

  const [errors, setErrors] = useState({});

  if (!authUser) {
    return <div>Vui lòng đăng nhập để xem thông tin người dùng.</div>;
  }

  // Xử lý thay đổi input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Xử lý thay đổi form mật khẩu
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form cơ bản
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    if (!formData.firstName.trim()) newErrors.firstName = 'Họ không được để trống';
    if (!formData.lastName.trim()) newErrors.lastName = 'Tên không được để trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form đổi mật khẩu
  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.oldPassword) newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!passwordForm.newPassword) newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (passwordForm.newPassword.length < 6) newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!passwordForm.confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý cập nhật mật khẩu
  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      // Log URL để kiểm tra
      const url = `/api/users/${authUser.id}/password`;
      console.log('Gửi request đến:', url);
      console.log('Dữ liệu gửi đi:', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      // Thay đổi từ axios.put thành axiosInstance.put
      const response = await axiosInstance.put(
        url,
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        }
      );

      console.log('Kết quả từ server:', response);

      if (response.status === 200) {
        alert('Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.');

        // Đăng xuất người dùng
        if (typeof logout === 'function') {
          await logout();
        } else {
          // Logout thủ công nếu không có hàm logout
          useAuthStore.setState({ authUser: null });
          localStorage.removeItem('authToken'); // Nếu bạn lưu token trong localStorage
        }

        // Chuyển hướng đến trang đăng nhập
        navigate('/login');
      }
    } catch (error) {
      console.error('Lỗi cập nhật mật khẩu:', error);
      console.log('Chi tiết response:', error.response);

      // Xử lý các lỗi thường gặp
      if (error.response) {
        if (error.response.status === 400) {
          setPasswordErrors({ oldPassword: 'Mật khẩu hiện tại không đúng' });
        } else if (error.response.status === 404) {
          alert('API endpoint không tồn tại. Vui lòng kiểm tra API đã được triển khai chưa.');
        } else {
          alert('Đã xảy ra lỗi khi cập nhật mật khẩu: ' + (error.response.data || 'Vui lòng thử lại sau'));
        }
      } else {
        alert('Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại sau!');
      }
    }
  };


  // Lưu thông tin
  const handleSave = async () => {
    if (!validateForm()) return;

    const dataToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      street: formData.street,
      phoneNumber: formData.phoneNumber || authUser.userDetails?.phoneNumber || '',
      streetNumber: formData.streetNumber || authUser.userDetails?.streetNumber || '',
      zipCode: formData.zipCode || authUser.userDetails?.zipCode || '',
      locality: formData.locality || authUser.userDetails?.locality || '',
      country: formData.country || authUser.userDetails?.country || ''
    };

    try {
      console.log('Dữ liệu gửi lên:', dataToSend);
      const updatedUser = await updateUser(authUser.id, dataToSend);

      if (updatedUser) {
        // Cập nhật UI
        useAuthStore.setState(state => ({
          ...state,
          authUser: {
            ...state.authUser,
            userDetails: {
              ...state.authUser.userDetails,
              ...dataToSend
            }
          }
        }));

        setIsEditing(false);
        alert('Cập nhật thành công!');
      } else {
        alert('Cập nhật không thành công, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi cập nhật thông tin: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  // Hủy chỉnh sửa
  const handleCancel = () => {
    setFormData({
      firstName: authUser.userDetails?.firstName || '',
      lastName: authUser.userDetails?.lastName || '',
      email: authUser.userDetails?.email || '',
      street: authUser.userDetails?.street || '',
      phoneNumber: authUser.userDetails?.phoneNumber || '',
      streetNumber: authUser.userDetails?.streetNumber || '',
      zipCode: authUser.userDetails?.zipCode || '',
      locality: authUser.userDetails?.locality || '',
      country: authUser.userDetails?.country || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  // Hủy đổi mật khẩu
  const handleCancelPassword = () => {
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setIsChangingPassword(false);
  };

  return (
    <div className="profile-container">
      <button className="custom-button1" onClick={() => navigate(-1)}>⬅ Quay lại</button>
      <div className="profile-header">
        <h1 className="h1-custom">Thông tin người dùng</h1>
        <div className="user-info">
          <div className="user-info-row">
            <span className="user-info-label">Họ tên:</span>
            {isEditing ? (
              <>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Họ"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}

                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tên"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </>
            ) : (
              <span className="user-info-value">
                {authUser.userDetails?.firstName} {authUser.userDetails?.lastName}
              </span>
            )}
          </div>

          <div className="user-info-row">
            <span className="user-info-label">Vai trò:</span>
            <span className="user-info-value">{authUser?.roles?.join(', ')}</span>
          </div>

          <div className="user-info-row">
            <span className="user-info-label">Email:</span>
            {isEditing ? (
              <>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </>
            ) : (
              <span className="user-info-value">{authUser.userDetails?.email}</span>
            )}
          </div>

          <div className="user-info-row">
            <span className="user-info-label">Số điện thoại:</span>
            <span className="user-info-value">{authUser.userDetails?.phoneNumber}</span>
          </div>

          <div className="user-info-row">
            <span className="user-info-label">Địa chỉ:</span>
            {isEditing ? (
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Địa chỉ"
              />
            ) : (
              <span className="user-info-value">{authUser.userDetails?.street}</span>
            )}
          </div>

          {/* Form đổi mật khẩu */}
          {isChangingPassword && (
            <div className="password-change-form">
              <h3 style={{color:'#32325d'}}>Đổi mật khẩu</h3>
              <div className="form-group">
                <div className="password-input-wrapper">
                  <label>Mật khẩu hiện tại:</label>
                  <input
                    // type="password"
                    type={showPassword.oldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button type="button" className="toggle-password" onClick={() => toggleShowPassword('oldPassword')}>
                    {showPassword.oldPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {passwordErrors.oldPassword && <span className="error-message">{passwordErrors.oldPassword}</span>}
              </div>

              <div className="form-group">
                <label>Mật khẩu mới:</label>
                <div className="password-input-wrapper">
                  <input
                    // type="password"
                    type={showPassword.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button type="button" className="toggle-password" onClick={() => toggleShowPassword('newPassword')}>
                    {showPassword.newPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {passwordErrors.newPassword && <span className="error-message">{passwordErrors.newPassword}</span>}
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới:</label>
                <div className="password-input-wrapper">
                  <input
                    // type="password"
                    type={showPassword.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                  <button type="button" className="toggle-password" onClick={() => toggleShowPassword('confirmPassword')}>
                    {showPassword.confirmPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <span className="error-message">{passwordErrors.confirmPassword}</span>}
              </div>

              <div className="button-group">
                <button className="update-info-button" onClick={handleUpdatePassword}>Lưu thay đổi mật khẩu</button>
                <button className="cancel-button1" onClick={handleCancelPassword}>Hủy</button>
              </div>
            </div>
          )}

          <div className="button-group">
            {isEditing ? (
              <>
                <button className="update-info-button" onClick={handleSave}>Lưu thay đổi thông tin</button>
                <button className="cancel-button1" onClick={handleCancel}>Hủy</button>
              </>
            ) : (
              <>
                <button className="update-info-button" onClick={() => setIsEditing(true)}>Cập nhật thông tin</button>
                <button className="change-password-button" onClick={() => setIsChangingPassword(true)} disabled={isChangingPassword}>Đổi mật khẩu</button>
                
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUser;