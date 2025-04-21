import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore(); // Lấy thông tin người dùng từ store

  const handleGoToProductManagement = () => {
    if (authUser?.roles?.includes('ROLE_ADMIN')) {
      navigate('/product-management');
    } else {
      alert('Bạn không có quyền truy cập vào trang này!');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to the Dashboard</h1>
      <p>This is the main page of the application.</p>
      {authUser?.roles?.includes('ROLE_ADMIN') && ( // Chỉ hiển thị nút nếu có ROLE_ADMIN
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={handleGoToProductManagement}
        >
          Go to Product Management
        </button>
      )}
    </div>
  );
};

export default Dashboard;