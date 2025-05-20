import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useOrderStore from '../stores/useOrderStore';
import { toast } from 'react-hot-toast';
import '../css/Orders.css';

export default function Orders() {
    const { authUser } = useAuthStore();
    const { orders, isLoadingOrders, getOrdersByUser, cancelOrder } = useOrderStore();
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    useEffect(() => {
        if (!authUser) {
            toast.error('Vui lòng đăng nhập để xem đơn hàng!');
            navigate('/login');
            return;
        }

        if (!authUser.userName) {
            toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!');
            navigate('/login');
            return;
        }

        getOrdersByUser(authUser.userName);
    }, [authUser, navigate, getOrdersByUser]);

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
        <div className="orders-container">
            <h1 className="orders-title">Lịch Sử Đơn Hàng</h1>
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
                            {order.status === 'PENDING' && (
                                <button className="cancel-button" onClick={() => {
                                    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                                        cancelOrder(order.id);
                                    }
                                }}>Hủy đơn hàng</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}