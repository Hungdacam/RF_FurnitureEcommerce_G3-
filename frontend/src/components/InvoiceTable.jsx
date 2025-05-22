import React, { useEffect, useState, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import useOrderStore from '../stores/useOrderStore';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const InvoiceTable = ({ startDate, endDate }) => {
  const { getAllOrders, orders, isLoadingOrders } = useOrderStore();
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

  // Lọc chỉ lấy đơn hàng đã giao thành công và theo khoảng thời gian
  const deliveredOrders = useMemo(() => {
    let filtered = orders.filter(order => order.status === 'DELIVERED');
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= start && orderDate <= end;
      });
    }
    
    return filtered;
  }, [orders, startDate, endDate]);

  
  useEffect(() => {
    // Chỉ gọi API một lần khi component mount
    if (!hasCalledApi.current) {
      getAllOrders();
      hasCalledApi.current = true;
    }
  }, [getAllOrders]);

  const handleRowClick = async (orderId) => {
    if (expandedRow === orderId) {
      // Đóng hàng đang mở
      setExpandedRow(null);
      setInvoiceDetails(null);
    } else {
      // Mở hàng mới và lấy chi tiết
      setExpandedRow(orderId);
      const orderDetails = deliveredOrders.find(order => order.id === orderId);
      setInvoiceDetails(orderDetails);
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

  // Tính tổng doanh thu và số lượng đơn hàng từ deliveredOrders
  const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalInvoices = deliveredOrders.length;

  return (
    <div className="invoice-table-container">
      <div className="invoice-summary">
        <div className="summary-item">
          <h3>Tổng số hóa đơn</h3>
          <p className="summary-value">{totalInvoices}</p>
        </div>
        <div className="summary-item">
          <h3>Tổng doanh thu</h3>
          <p className="summary-value">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {isLoadingOrders ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="table-container">
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
              {deliveredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Không có hóa đơn nào trong khoảng thời gian này
                  </td>
                </tr>
              ) : (
                deliveredOrders.map(order => (
                  <React.Fragment key={order.id}>
                    <tr 
                      className={`invoice-row ${expandedRow === order.id ? 'expanded' : ''}`}
                      onClick={() => handleRowClick(order.id)}
                    >
                      <td>{order.invoiceCode || 'N/A'}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{order.fullName}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>{order.paymentMethod}</td>
                      <td>
                        {expandedRow === order.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </td>
                    </tr>
                    {expandedRow === order.id && invoiceDetails && (
                      <tr className="invoice-details-row">
                        <td colSpan="6">
                          <div className="invoice-details">
                            <h3>Chi tiết hóa đơn {invoiceDetails.invoiceCode || invoiceDetails.id}</h3>
                            {invoiceDetails.note && (
                              <p><strong>Ghi chú:</strong> {invoiceDetails.note}</p>
                            )}
                            <p><strong>Địa chỉ giao hàng:</strong> {invoiceDetails.address}</p>
                            <p><strong>Số điện thoại:</strong> {invoiceDetails.phoneNumber}</p>
                            <p><strong>Số điện thoại người mua:</strong> {invoiceDetails.buyerPhoneNumber}</p>
                            
                            <h4>Danh sách sản phẩm:</h4>
                            <table className="product-details-table">
                              <thead>
                                <tr>
                                  <th>Tên sản phẩm</th>
                                  <th>Số lượng</th>
                                  <th>Đơn giá</th>
                                  <th>Thành tiền</th>
                                </tr>
                              </thead>
                              <tbody>
                                {invoiceDetails.items?.map((item, index) => (
                                  <tr key={index}>
                                    <td>{item.productName}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{formatCurrency(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            
                            <div className="invoice-total">
                              <strong>Tổng cộng: {formatCurrency(invoiceDetails.totalAmount)}</strong>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
