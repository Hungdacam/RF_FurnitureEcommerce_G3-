import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useOrderStore from '../stores/useOrderStore';
import useCartStore from '../stores/useCartStore';
import { toast } from 'react-hot-toast';
import '../css/Orders.css';

export default function Orders() {
    const { authUser } = useAuthStore();
    const { orders, isLoadingOrders, getOrdersByUser, cancelOrder, updateOrder } = useOrderStore();
    const { rebuyOrder } = useCartStore();
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ phoneNumber: '', address: '' });
    const [editErrors, setEditErrors] = useState({});

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

    const filteredOrders = useMemo(() => {
        const filtered = selectedStatus === 'ALL'
            ? orders
            : orders.filter(order => order.status === selectedStatus);
        return [...filtered].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }, [orders, selectedStatus]);

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const closeOrderModal = () => {
        setIsOrderModalOpen(false);
        setSelectedOrder(null);
    };

    const openInfoModal = (order) => {
        setSelectedOrder(order);
        setEditForm({ phoneNumber: order.phoneNumber || '', address: order.address || '' });
        setIsInfoModalOpen(true);
    };

    const closeInfoModal = () => {
        setIsInfoModalOpen(false);
        setSelectedOrder(null);
        setIsEditing(false);
        setEditErrors({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
        setEditErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateEditForm = () => {
        const errors = {};
        if (!editForm.phoneNumber) {
            errors.phoneNumber = 'Số điện thoại không được để trống';
        } else if (!/^\d{10}$/.test(editForm.phoneNumber)) {
            errors.phoneNumber = 'Số điện thoại phải gồm 10 chữ số';
        }
        if (!editForm.address.trim()) {
            errors.address = 'Địa chỉ không được để trống';
        } else if (editForm.address.length > 500) {
            errors.address = 'Địa chỉ không được vượt quá 500 ký tự';
        }
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveEdit = async () => {
        if (!validateEditForm()) return;

        try {
            await updateOrder(selectedOrder.id, {
                phoneNumber: editForm.phoneNumber,
                address: editForm.address,
            });
            setSelectedOrder(prev => ({
                ...prev,
                phoneNumber: editForm.phoneNumber,
                address: editForm.address,
            }));
            setIsEditing(false);
            toast.success('Cập nhật thông tin liên hệ thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin đơn hàng:', error);
            toast.error(error.message || 'Lỗi khi cập nhật thông tin liên hệ');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            phoneNumber: selectedOrder.phoneNumber || '',
            address: selectedOrder.address || '',
        });
        setEditErrors({});
    };

    const handleRebuyOrder = async (order) => {
        const userName = authUser.userName;
        const items = order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity
        }));
        const productIds = order.items.map(item => item.productId);

        try {
            await rebuyOrder(userName, items);
            toast.success('Đã thêm sản phẩm vào giỏ hàng thành công!');
            navigate('/cart', { state: { rebuyProductIds: productIds } });
        } catch (error) {
            toast.error(`Lỗi: ${error.message || 'Không thể thêm vào giỏ hàng'}`);
            console.error('Error rebuying order:', error);
        }
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
        <div className="orders-container">
            <h1 className="orders-title">Lịch Sử Đơn Hàng</h1>
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                ⬅ Trở về trang chủ
            </button>
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
                            <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                            <p><strong>Trạng thái:</strong> {order.status === 'PENDING' ? 'Chờ xác nhận' : order.status === 'SHIPPING' ? 'Đang giao hàng' : order.status === 'DELIVERED' ? 'Giao thành công' : 'Đã hủy'}</p>
                            <p><strong>Tổng tiền:</strong> ${order.totalAmount.toFixed(2)}</p>
                            <p><strong>Số lượng sản phẩm:</strong> {order.items.length}</p>
                            <div className="order-actions">
                                <button
                                    className="view-order-button"
                                    onClick={() => openOrderModal(order)}
                                >
                                    Xem chi tiết sản phẩm
                                </button>
                                <button
                                    className="view-info-button"
                                    onClick={() => openInfoModal(order)}
                                >
                                    Xem chi tiết thông tin
                                </button>
                            </div>
                            {order.status === 'PENDING' && (
                                <button className="cancel-button" onClick={() => {
                                    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                                        cancelOrder(order.id);
                                    }
                                }}>Hủy đơn hàng</button>
                            )}
                            {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                                <button
                                    className="rebuy-button"
                                    onClick={() => handleRebuyOrder(order)}
                                >
                                    Mua lại
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal chi tiết sản phẩm */}
            {isOrderModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                        <p><strong>Mã hóa đơn:</strong> {selectedOrder.invoiceCode || 'N/A'}</p>
                        <div className="modal-order-items">
                            {selectedOrder.items.map((item, index) => (
                                <div key={index} className="modal-order-item">
                                    <img
                                        src={item.imageUrl || '/images/placeholder.jpg'}
                                        alt={item.productName}
                                        className="modal-order-image"
                                    />
                                    <div className="modal-order-info">
                                        <p><strong>Tên:</strong> {item.productName}</p>
                                        <p><strong>Giá:</strong> ${item.price.toFixed(2)}</p>
                                        <p><strong>Số lượng:</strong> {item.quantity}</p>
                                        <p><strong>Tổng:</strong> ${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p><strong>Tổng tiền đơn hàng:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
                        <div className="modal-actions">
                            <button className="modal-close-button" onClick={closeOrderModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal chi tiết thông tin */}
            {isInfoModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Chi tiết thông tin - Đơn hàng #{selectedOrder.id}</h2>
                        <div className="modal-details">
                            <p><strong>Mã hóa đơn:</strong> {selectedOrder.invoiceCode || 'N/A'}</p>
                            <p><strong>Người đặt:</strong> {selectedOrder.fullName}</p>
                            <p><strong>Số điện thoại:</strong> {selectedOrder.buyerPhoneNumber}</p>
                           
                            {isEditing ? (
                                <>
                                    <div className="edit-field">
                                        <strong>Số điện thoại người nhận:</strong>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={editForm.phoneNumber}
                                            onChange={handleEditChange}
                                            className="edit-input"
                                        />
                                        {editErrors.phoneNumber && (
                                            <span className="error-message">{editErrors.phoneNumber}</span>
                                        )}
                                    </div>
                                    <div className="edit-field">
                                        <strong>Địa chỉ:</strong>
                                        <input
                                            type="text"
                                            name="address"
                                            value={editForm.address}
                                            onChange={handleEditChange}
                                            className="edit-input"
                                        />
                                        {editErrors.address && (
                                            <span className="error-message">{editErrors.address}</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p><strong>Số điện thoại người nhận:</strong> {selectedOrder.phoneNumber}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                                </>
                            )}
                        </div>
                        {!isEditing && selectedOrder.status !== 'PENDING' && (
                            <p className="edit-disabled-message">
                                Chỉ có thể chỉnh sửa thông tin liên hệ cho đơn hàng đang chờ xác nhận.
                            </p>
                        )}
                        <div className="modal-actions">
                            {isEditing ? (
                                <>
                                    <button className="modal-save-button" onClick={handleSaveEdit}>
                                        Lưu
                                    </button>
                                    <button className="modal-cancel-button" onClick={handleCancelEdit}>
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                selectedOrder.status === 'PENDING' && (
                                    <button
                                        className="modal-edit-button"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Chỉnh sửa
                                    </button>
                                )
                            )}
                            <button className="modal-close-button" onClick={closeInfoModal}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}