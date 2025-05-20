import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../stores/useAuthStore';
import useOrderStore from '../stores/useOrderStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../css/OrderManagement.css';

export default function OrderManagement() {
    const { authUser } = useAuthStore();
    const { orders, isLoadingOrders, getAllOrders, updateOrderStatus } = useOrderStore();
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    useEffect(() => {
        if (!authUser || !authUser.roles.includes('ROLE_ADMIN')) {
            toast.error('Bạn không có quyền truy cập!');
            navigate('/');
            return;
        }

        getAllOrders();
    }, [authUser, navigate, getAllOrders]);

    // Lọc và sắp xếp orders dựa trên selectedStatus
    const filteredOrders = useMemo(() => {
        const filtered = selectedStatus === 'ALL'
            ? orders
            : orders.filter(order => order.status === selectedStatus);
        return [...filtered].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }, [orders, selectedStatus]);

    if (isLoadingOrders) {
        return <div className="loading">Đang tải đơn hàng...</div>;
    }

    const statusTabs = [
        { key: 'ALL', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ xác nhận' },
        { key: 'SHIPPING', label: 'Đang giao hàng' },
        { key: 'DELIVERED', label: 'Giao thành công' },
        { key: 'CANCELLED', label: 'Đã hủy' },
    ];

    return (
        <div className="order-management-container">
            <h1 className="order-management-title">Quản Lý Đơn Hàng</h1>
            <div className="status-tabs">
                {statusTabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`status-tab ${selectedStatus === tab.key ? 'active' : ''}`}
                        onClick={() => setSelectedStatus(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {filteredOrders.length === 0 ? (
                <p>Chưa có đơn hàng nào ở trạng thái này.</p>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="order-item">
                            <h2>Đơn hàng #{order.id}</h2>
                            <p><strong>Khách hàng:</strong> {order.fullName}</p>
                            <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                            <p><strong>Trạng thái:</strong> {order.status === 'PENDING' ? 'Chờ xác nhận' : order.status === 'SHIPPING' ? 'Đang giao hàng' : order.status === 'DELIVERED' ? 'Giao thành công' : 'Đã hủy'}</p>
                            <p><strong>Tổng tiền:</strong> ${order.totalAmount.toFixed(2)}</p>
                            <h3>Sản phẩm:</h3>
                            <div className="order-items">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item-detail">
                                        <img src={item.imageUrl || '/images/placeholder.jpg'} alt={item.productName} className="order-item-image" />
                                        <div>
                                            <p><strong>{item.productName}</strong></p>
                                            <p>Giá: ${item.price}</p>
                                            <p>Số lượng: {item.quantity}</p>
                                            <p>Tổng: ${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="status-controls">
                                <select
                                    value={order.status}
                                    onChange={(e) => {
                                        if (window.confirm(`Bạn có chắc muốn thay đổi trạng thái đơn hàng #${order.id} thành ${e.target.value}?`)) {
                                            updateOrderStatus(order.id, e.target.value);
                                        }
                                    }}
                                    disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                >
                                    <option value="PENDING">Chờ xác nhận</option>
                                    <option value="SHIPPING">Đang giao hàng</option>
                                    <option value="DELIVERED">Giao thành công</option>
                                    <option value="CANCELLED">Đã hủy</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}