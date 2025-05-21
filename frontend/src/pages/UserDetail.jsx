import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import '../css/UserDetail.css';

const UserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/api/users/${userId}`);
        setUser(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy người dùng</h2>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className='user-detail-page'>
      <div className="user-detail-container">
        <div className="user-detail-header">

          <button className="back-button5" onClick={() => navigate(-1)}>⬅ Quay lại</button>
          <h1>Thông tin chi tiết người dùng</h1>
        </div>

        <div className="user-detail-card">
          <div className="user-detail-section">
            <h2>Thông tin tài khoản</h2>
            <div className="detail-row">
              <div className="detail-label">ID:</div>
              <div className="detail-value">{user.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Tên đăng nhập:</div>
              <div className="detail-value">{user.userName}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Vai trò:</div>
              <div className="detail-value">{user.role?.roleName || 'Không xác định'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Trạng thái:</div>
              <div className="detail-value">
                <span className={`status-badge ${user.active === 1 ? 'active' : 'inactive'}`}>
                  {user.active === 1 ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </div>
            </div>
          </div>

          {user.userDetails && (
            <div className="user-detail-section">
              <h2>Thông tin cá nhân</h2>
              <div className="detail-row">
                <div className="detail-label">Họ:</div>
                <div className="detail-value">{user.userDetails.firstName || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Tên:</div>
                <div className="detail-value">{user.userDetails.lastName || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Email:</div>
                <div className="detail-value">{user.userDetails.email || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Số điện thoại:</div>
                <div className="detail-value">{user.userDetails.phoneNumber || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Địa chỉ:</div>
                <div className="detail-value">{user.userDetails.street || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Số nhà:</div>
                <div className="detail-value">{user.userDetails.streetNumber || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Mã bưu điện:</div>
                <div className="detail-value">{user.userDetails.zipCode || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Khu vực:</div>
                <div className="detail-value">{user.userDetails.locality || 'Chưa cập nhật'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Quốc gia:</div>
                <div className="detail-value">{user.userDetails.country || 'Chưa cập nhật'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
