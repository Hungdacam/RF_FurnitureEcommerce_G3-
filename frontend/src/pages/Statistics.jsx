import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { format, subDays } from 'date-fns';
import { FaSync, FaChartLine, FaShoppingCart } from 'react-icons/fa';
import useStatisticsStore from '../stores/useStatisticsStore';
import useAuthStore from '../stores/useAuthStore';
import DateRangeFilter from '../components/DateRangeFilter';
import InvoiceTable from '../components/InvoiceTable';
import '../css/Statistics.css';
import { debounce } from 'lodash';

const Statistics = () => {
  const { syncData, getDashboardStats, isLoading, error, dashboardStats } = useStatisticsStore();
  const { role } = useAuthStore();
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'invoices'
  
  const revenueChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const paymentChartRef = useRef(null);
  const paymentChartInstance = useRef(null);
  
  // Kiểm tra người dùng có quyền admin không
  const isAdmin = role && role.includes('ROLE_ADMIN');
  
  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    getDashboardStats(startDate, endDate);
  }, [getDashboardStats, isAdmin, startDate, endDate]);
  
  // Tạo biểu đồ doanh thu và phương thức thanh toán
  useEffect(() => {
    if (!dashboardStats?.revenueStats || !revenueChartRef.current || activeTab !== 'dashboard') return;
    
    // Tạo biểu đồ doanh thu
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }
    
    const ctx = revenueChartRef.current.getContext('2d');
    revenueChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dashboardStats.revenueStats.map(stat => format(new Date(stat.date), 'dd/MM/yyyy')),
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: dashboardStats.revenueStats.map(stat => stat.dailyRevenue),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('vi-VN') + ' đ';
              }
            }
          }
        }
      }
    });
    
    // Tạo biểu đồ phương thức thanh toán
    if (dashboardStats.paymentMethodStats && paymentChartRef.current) {
      if (paymentChartInstance.current) {
        paymentChartInstance.current.destroy();
      }
      
      const paymentCtx = paymentChartRef.current.getContext('2d');
      paymentChartInstance.current = new Chart(paymentCtx, {
        type: 'pie',
        data: {
          labels: dashboardStats.paymentMethodStats.map(stat => stat.paymentMethod),
          datasets: [{
            data: dashboardStats.paymentMethodStats.map(stat => stat.orderCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Phương thức thanh toán'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const dataset = context.dataset;
                  const total = dataset.data.reduce((acc, data) => acc + data, 0);
                  const percentage = ((value / total) * 100).toFixed(2);
                  return `${label}: ${value} đơn hàng (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }, [dashboardStats, activeTab]);
  
  const handleSyncData = async () => {
    await syncData();
    getDashboardStats(startDate, endDate);
  };
  
  // Cập nhật hàm debouncedDateRangeChange để cập nhật tất cả các thống kê
  const debouncedDateRangeChange = useCallback(
    debounce((start, end, tab) => {
      console.log('Debounced date change:', start, end, 'for tab:', tab);
      if (tab === 'dashboard') {
        getDashboardStats(start, end);
      } else if (tab === 'invoices') {
        // Reset cache để buộc InvoiceTable gọi lại API
        useStatisticsStore.getState().resetInvoiceCache();
        // Reset expanded row nếu có
        if (window.invoiceTableRef && window.invoiceTableRef.current) {
          window.invoiceTableRef.current.hasCalledApi.current = false;
          if (window.invoiceTableRef.current.resetExpanded) {
            window.invoiceTableRef.current.resetExpanded();
          }
        }
      }
    }, 500), // 500ms debounce
    [getDashboardStats]
  );

  
  const handleDateRangeChange = useCallback((start, end) => {
    console.log('Date range changed:', start, end);
    setStartDate(start);
    setEndDate(end);
    
    // Gọi hàm debounce với tab hiện tại
    debouncedDateRangeChange(start, end, activeTab);
  }, [debouncedDateRangeChange, activeTab]);
  
  // Sử dụng useMemo để tránh re-render không cần thiết
  const invoiceTableProps = useMemo(() => ({
    startDate,
    endDate
  }), [startDate, endDate]);
  //tính toán totalOrders và totalProductsSold
  const totalOrders = dashboardStats.revenueStats?.reduce((sum, stat) => sum + stat.orderCount, 0) || 0;
  const totalProductsSold = useMemo(() => {
    // Nếu không có dữ liệu revenueStats (theo bộ lọc thời gian), trả về 0
    if (!dashboardStats.revenueStats || dashboardStats.revenueStats.length === 0) {
      return 0;
    }
    
    // Tính tổng số sản phẩm đã bán dựa trên các sản phẩm có trong khoảng thời gian được lọc
    // Chỉ tính các sản phẩm có trong topSellingProducts và có ngày bán trong khoảng thời gian lọc
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Đặt end về cuối ngày
    
    // Lọc các sản phẩm theo thời gian
    let filteredProducts = [];
    
    // Nếu có dữ liệu revenueStats, tức là đã có dữ liệu trong khoảng thời gian lọc
    if (dashboardStats.revenueStats && dashboardStats.revenueStats.length > 0) {
      // Lấy tổng số sản phẩm đã bán từ topSellingProducts
      if (dashboardStats.topSellingProducts && dashboardStats.topSellingProducts.length > 0) {
        filteredProducts = dashboardStats.topSellingProducts;
      }
    }
    
    return filteredProducts.reduce((sum, product) => sum + product.totalQuantitySold, 0);
  }, [dashboardStats.revenueStats, dashboardStats.topSellingProducts, startDate, endDate]);
  if (!isAdmin) {
    return (
      <div className="statistics-container">
        <h1>Thống kê</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
      </div>
    );
  }
  
  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>Thống kê doanh số</h1>
        <button 
          className="sync-button" 
          onClick={handleSyncData} 
          disabled={isLoading}
        >
          <FaSync /> Đồng bộ dữ liệu
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filter-section">
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
        
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartLine /> Tổng quan
          </button>
          <button 
            className={`tab-button ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            <FaShoppingCart /> Danh sách hóa đơn
          </button>
        </div>
      </div>
      
      {activeTab === 'dashboard' && (
        <>
          <div className="stats-grid">
            <div className="stats-card">
              <h2>Tổng doanh thu</h2>
              {dashboardStats.totalRevenue !== undefined ? (
                <div className="stat-value">
                  {dashboardStats.totalRevenue.toLocaleString('vi-VN')} đ
                </div>
              ) : (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            
            <div className="stats-card">
              <h2>Số đơn hàng</h2>
              {dashboardStats.revenueStats ? (
                <div className="stat-value">
                  {totalOrders}
                </div>
              ) : (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
            
            <div className="stats-card">
              <h2>Số sản phẩm đã bán</h2>
              {dashboardStats.topSellingProducts ? (
                <div className="stat-value">
                  {totalProductsSold}
                </div>
              ) : (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="revenue-chart">
            <canvas ref={revenueChartRef}></canvas>
          </div>
          
          <div className="stats-grid">
            <div className="stats-card">
              <h2>Top sản phẩm bán chạy</h2>
              {dashboardStats.topSellingProducts && dashboardStats.topSellingProducts.length > 0 ? (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.topSellingProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          {product.imageUrl && (
                            <img 
                              src={product.imageUrl} 
                              alt={product.productName} 
                              className="product-image" 
                            />
                          )} {product.productName}
                        </td>
                        <td>{product.totalQuantitySold}</td>
                        <td>{product.totalRevenue.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">Chưa có dữ liệu</div>
              )}
            </div>
            
            <div className="stats-card">
              <h2>Top sản phẩm doanh thu cao</h2>
              {dashboardStats.topRevenueProducts && dashboardStats.topRevenueProducts.length > 0 ? (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.topRevenueProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          {product.imageUrl && (
                            <img 
                              src={product.imageUrl} 
                              alt={product.productName} 
                              className="product-image" 
                            />
                          )} {product.productName}
                        </td>
                        <td>{product.totalQuantitySold}</td>
                        <td>{product.totalRevenue.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stats-card">
              <h2>Top khách hàng chi tiêu nhiều</h2>
              {dashboardStats.topSpendingCustomers && dashboardStats.topSpendingCustomers.length > 0 ? (
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Số đơn hàng</th>
                      <th>Tổng chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats.topSpendingCustomers.map((customer, index) => (
                      <tr key={index}>
                        <td>{customer.fullName || customer.userName}</td>
                        <td>{customer.orderCount}</td>
                        <td>{customer.totalSpent.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">Chưa có dữ liệu</div>
              )}
            </div>
            
            <div className="stats-card">
              <h2>Phương thức thanh toán</h2>
              <div className="payment-method-chart">
                <canvas ref={paymentChartRef}></canvas>
              </div>
            </div>
          </div>
        </>
      )}

      
      {activeTab === 'invoices' && (
        <InvoiceTable {...invoiceTableProps} />
      )}
    </div>
  );
};

export default Statistics;
