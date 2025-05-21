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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductOrder, setSelectedProductOrder] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [searchInvoiceCode, setSearchInvoiceCode] = useState('');

    useEffect(() => {
        if (!authUser || !authUser.roles.includes('ROLE_ADMIN')) {
            toast.error('Bạn không có quyền truy cập!');
            navigate('/');
            return;
        }

        getAllOrders().then(() => {
            setLastRefreshed(new Date());
        });

        const intervalId = setInterval(() => {
            getAllOrders().then(() => {
                setLastRefreshed(new Date());
            }).catch(error => {
                console.error('Lỗi khi làm mới đơn hàng:', error);
                toast.error('Lỗi khi làm mới đơn hàng!');
            });
        }, 10000);

        return () => clearInterval(intervalId);
    }, [authUser, navigate, getAllOrders]);

    const filteredOrders = useMemo(() => {
        let filtered = selectedStatus === 'ALL'
            ? orders
            : orders.filter(order => order.status === selectedStatus);

        if (searchInvoiceCode.trim()) {
            filtered = filtered.filter(order => 
                order.invoiceCode && order.invoiceCode.toLowerCase().includes(searchInvoiceCode.toLowerCase())
            );
        }

        return [...filtered].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }, [orders, selectedStatus, searchInvoiceCode]);

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const openProductModal = (order) => {
        setSelectedProductOrder(order);
        setIsProductModalOpen(true);
    };

    const closeProductModal = () => {
        setIsProductModalOpen(false);
        setSelectedProductOrder(null);
    };

    const handleSearchInvoiceCode = (e) => {
        setSearchInvoiceCode(e.target.value);
    };

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
            <p className="last-refreshed">
                Lần làm mới cuối: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Đang tải...'}
            </p>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã hóa đơn..."
                    value={searchInvoiceCode}
                    onChange={handleSearchInvoiceCode}
                    className="search-input"
                />
            </div>
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
                            <p><strong>Mã hóa đơn:</strong> {order.invoiceCode || 'N/A'}</p>
                            <div className="order-details-container">
                                <div className="order-info">
                                    <p><strong>Khách hàng:</strong> {order.fullName}</p>
                                    <button
                                        className="view-details-button"
                                        onClick={() => openModal(order)}
                                    >
                                        Xem chi tiết người mua
                                    </button>
                                </div>
                            </div>
                            <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                            <p><strong>Ghi chú:</strong> {order.note}</p>
                            <p><strong>Tổng tiền:</strong> ${order.totalAmount.toFixed(2)}</p>
                            <p><strong>Số lượng sản phẩm:</strong> {order.items.length}</p>
                            <button
                                className="view-products-button"
                                onClick={() => openProductModal(order)}
                            >
                                Xem chi tiết sản phẩm
                            </button>
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

            {/* Modal hiển thị chi tiết người mua */}
            {isModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Chi tiết người mua - Đơn hàng #{selectedOrder.id}</h2>
                        <div className="modal-details">
                            <p><strong>Mã hóa đơn:</strong> {selectedOrder.invoiceCode || 'N/A'}</p>
                            <p><strong>Tên:</strong> {selectedOrder.fullName}</p>
                            <p><strong>Số điện thoại người mua:</strong> {selectedOrder.buyerPhoneNumber}</p>
                            <p><strong>Số điện thoại người nhận:</strong> {selectedOrder.phoneNumber}</p>
                            <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-close-button" onClick={closeModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal hiển thị chi tiết sản phẩm */}
            {isProductModalOpen && selectedProductOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Chi tiết sản phẩm - Đơn hàng #{selectedProductOrder.id}</h2>
                        <div className="modal-product-list">
                            {selectedProductOrder.items.map((item, index) => (
                                <div key={index} className="modal-product-item">
                                    <img
                                        src={item.imageUrl || '/images/placeholder.jpg'}
                                        alt={item.productName}
                                        className="modal-product-image"
                                    />
                                    <div className="modal-product-details">
                                        <p><strong>Tên:</strong> {item.productName}</p>
                                        <p><strong>Giá:</strong> ${item.price.toFixed(2)}</p>
                                        <p><strong>Số lượng:</strong> {item.quantity}</p>
                                        <p><strong>Tổng:</strong> ${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p><strong>Tổng tiền đơn hàng:</strong> ${selectedProductOrder.totalAmount.toFixed(2)}</p>
                        <div className="modal-actions">
                            <button className="modal-close-button" onClick={closeProductModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}