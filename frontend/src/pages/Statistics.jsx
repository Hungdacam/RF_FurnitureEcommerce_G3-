import React from 'react';
import '../css/Statistics.css';

const Statistics = () => {
  return (
    <div className="statistics-container">
      <h2>Trang Thống Kê</h2>
      <div className="statistics-buttons">
        <button className="stat-button">Thống kê doanh thu</button>
        <button className="stat-button">Thống kê số đơn hàng</button>
        <button className="stat-button">Thống kê sản phẩm bán chạy</button>
        <button className="stat-button">Thống kê người dùng</button>
        <button className="stat-button">Thống kê theo danh mục</button>
      </div>
    </div>
  );
};

export default Statistics;
