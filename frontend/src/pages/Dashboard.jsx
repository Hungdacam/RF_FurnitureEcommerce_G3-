import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Dashboard = () => {
  const { logout, isLoggingOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();             // Gọi logout trong store
    navigate('/login');         // Điều hướng về trang đăng nhập sau khi logout
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chào mừng bạn đến Dashboard</h2>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    </div>
  );
};

export default Dashboard;
