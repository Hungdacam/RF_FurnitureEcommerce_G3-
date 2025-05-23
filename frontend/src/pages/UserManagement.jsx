import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import '../css/UserManagement.css'; // Sẽ tạo file CSS này sau

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/api/users');
        setUsers(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
  try {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const response = await axiosInstance.put(`/api/users/${userId}/status`, { active: newStatus });
    
    // Kiểm tra phản hồi từ server
    if (response.status === 200) {
      // Cập nhật state để hiển thị thay đổi ngay lập tức
      setUsers(users.map(user =>
        user.id === userId ? { ...user, active: newStatus } : user
      ));
      alert('Đã cập nhật trạng thái người dùng thành công!');
    }
  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái người dùng:', err);
    
    // Xử lý lỗi 404
    if (err.response && err.response.status === 404) {
      alert('Không tìm thấy người dùng. Vui lòng kiểm tra lại!');
    } else {
      alert('Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.');
    }
  }
};


  const handleViewDetail = (userId) => {
    navigate(`/user-detail/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải danh sách người dùng...</p>
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

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <button className="back-button4" onClick={() => navigate(-1)}>⬅ Quay lại</button>
        <h1>Quản lý người dùng</h1>
      </div>

      <div className="user-management-content">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.userName}</td>
                  <td>
                    {user.userDetails ?
                      `${user.userDetails.firstName || ''} ${user.userDetails.lastName || ''}` :
                      'Chưa cập nhật'}
                  </td>
                  <td>{user.userDetails?.email || 'Chưa cập nhật'}</td>
                  <td>{user.role?.roleName || 'Không xác định'}</td>
                  <td>
                    <span className={`status-badge ${user.active === 1 ? 'active' : 'inactive'}`}>
                      {user.active === 1 ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="view-button"
                      onClick={() => handleViewDetail(user.id)}
                    >
                      Chi tiết
                    </button>
                    <button 
                      className={`toggle-status-button ${user.active === 1 ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(user.id, user.active)}
                    >
                      {user.active === 1 ? 'Khóa' : 'Kích hoạt'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-users-message">
                  Không có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
