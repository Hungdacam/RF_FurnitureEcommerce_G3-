import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import useStatisticsStore from '../stores/useStatisticsStore';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const InvoiceTable = ({ startDate, endDate }) => {
  const { 
    getInvoices, 
    getInvoiceDetails, 
    invoices, 
    isLoading,
    lastFetchedStartDate,
    lastFetchedEndDate
  } = useStatisticsStore();
  
  const [expandedRow, setExpandedRow] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const hasCalledApi = useRef(false);
  
  // Reset expanded row khi thay đổi bộ lọc
  const resetExpanded = () => {
    setExpandedRow(null);
    setInvoiceDetails(null);
  };
  
  // Expose ref for parent component
  React.useImperativeHandle(window.invoiceTableRef = React.createRef(), () => ({
    hasCalledApi,
    resetExpanded
  }));
  
  useEffect(() => {
    // Chỉ gọi API nếu chưa có dữ liệu hoặc thay đổi ngày lọc
    if (!hasCalledApi.current || 
        startDate !== lastFetchedStartDate || 
        endDate !== lastFetchedEndDate) {
      getInvoices(startDate, endDate);
      hasCalledApi.current = true;
    }
  }, [getInvoices, startDate, endDate, lastFetchedStartDate, lastFetchedEndDate]);
  
  const handleRowClick = async (invoiceId) => {
    if (expandedRow === invoiceId) {
      // Đóng hàng đang mở
      setExpandedRow(null);
      setInvoiceDetails(null);
    } else {
      // Mở hàng mới và lấy chi tiết
      setExpandedRow(invoiceId);
      const details = await getInvoiceDetails(invoiceId);
      setInvoiceDetails(details);
    }
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
        console.log(error);
      return dateString;
    }
  };
  
  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };
  
  // Tính tổng doanh thu và số lượng đơn hàng
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalInvoices = invoices.length;
  
  return (
    <div className="invoice-container">
      <div className="invoice-summary">
        <div className="stats-grid">
          <div className="stats-card">
            <h2>Tổng doanh thu</h2>
            <div className="stat-value">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          
          <div className="stats-card">
            <h2>Tổng số hóa đơn</h2>
            <div className="stat-value">
              {totalInvoices}
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="table-responsive">
          {invoices.length > 0 ? (
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Mã hóa đơn</th>
                  <th>Thời gian</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức thanh toán</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <React.Fragment key={invoice.id}>
                    <tr 
                      className={expandedRow === invoice.id ? 'expanded-row' : ''}
                      onClick={() => handleRowClick(invoice.id)}
                    >
                      <td>#{invoice.id}</td>
                      <td>{formatDate(invoice.orderDate)}</td>
                      <td>{invoice.fullName}</td>
                      <td>{formatCurrency(invoice.totalAmount)}</td>
                      <td>{invoice.paymentMethod}</td>
                      <td>
                        {expandedRow === invoice.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </td>
                    </tr>
                    
                    {expandedRow === invoice.id && invoiceDetails && (
                      <tr className="detail-row">
                        <td colSpan="6">
                          <div className="invoice-details">
                            <div className="invoice-details-header">
                              <h3>Chi tiết hóa đơn #{invoiceDetails.id}</h3>
                              <button 
                                className="close-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRow(null);
                                  setInvoiceDetails(null);
                                }}
                              >
                                ×
                              </button>
                            </div>
                            
                            <div className="invoice-info">
                              <div className="info-group">
                                <p><strong>Khách hàng:</strong> {invoiceDetails.fullName}</p>
                                <p><strong>Số điện thoại:</strong> {invoiceDetails.phoneNumber}</p>
                                <p><strong>Địa chỉ:</strong> {invoiceDetails.address}</p>
                              </div>
                              <div className="info-group">
                                <p><strong>Ngày đặt hàng:</strong> {formatDate(invoiceDetails.orderDate)}</p>
                                <p><strong>Phương thức thanh toán:</strong> {invoiceDetails.paymentMethod}</p>
                                {invoiceDetails.note && (
                                  <p><strong>Ghi chú:</strong> {invoiceDetails.note}</p>
                                )}
                              </div>
                            </div>
                            
                            <table className="invoice-items-table">
                              <thead>
                                <tr>
                                  <th>Sản phẩm</th>
                                  <th>Đơn giá</th>
                                  <th>Số lượng</th>
                                  <th>Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoiceDetails.items.map((item, index) => (
                                  <tr key={index}>
                                    <td>
                                      <div className="product-info">
                                        {item.imageUrl && (
                                          <img 
                                            src={item.imageUrl} 
                                            alt={item.productName} 
                                            className="product-image" 
                                          />
                                        )}
                                        <span>{item.productName}</span>
                                      </div>
                                    </td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                                <tr>
                                  <td colSpan="3" className="total-label">Tổng cộng:</td>
                                  <td className="total-amount">{formatCurrency(invoiceDetails.totalAmount)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">Không có hóa đơn nào trong khoảng thời gian này</div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
