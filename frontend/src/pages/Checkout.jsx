import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import useOrderStore from '../stores/useOrderStore';
import { toast } from 'react-hot-toast';
import '../css/Checkout.css';

export default function Checkout() {
    const { cart, getCart } = useCartStore();
    const { authUser } = useAuthStore();
    const { createOrder, isCreatingOrder } = useOrderStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        street: '',
        streetNumber: '',
        zipCode: '',
        locality: '',
        country: ''
    });
    const [note, setNote] = useState('');
    const [paymentMethod] = useState('COD');
    const [selectedItems, setSelectedItems] = useState({});
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (!authUser) {
            toast.error('Vui lòng đăng nhập để thanh toán!');
            navigate('/login');
            return;
        }

        if (!authUser.userName) {
            toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!');
            navigate('/login');
            return;
        }

        setUserDetails(authUser.userDetails || {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            street: '',
            streetNumber: '',
            zipCode: '',
            locality: '',
            country: ''
        });

        getCart(authUser.userName);

        if (location.state?.selectedItems) {
            setSelectedItems(location.state.selectedItems);
        }
    }, [authUser, navigate, getCart, location.state]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'firstName' || name === 'lastName') {
            if (!value) {
                error = `${name === 'firstName' ? 'Họ' : 'Tên'} không được để trống!`;
            } else if (!/^[a-zA-ZÀ-ỹ\s]+$/u.test(value)) {
                error = `${name === 'firstName' ? 'Họ' : 'Tên'} chỉ chứa chữ cái và không chứa ký tự đặc biệt!`;
            }
        } else if (name === 'phoneNumber') {
            if (!value) {
                error = 'Số điện thoại không được để trống!';
            } else {
                let normalizedPhone = value.replace(/[\s-]/g, '');
                if (normalizedPhone.startsWith('+84')) {
                    normalizedPhone = '0' + normalizedPhone.slice(3);
                }
                if (!/^0\d{9,10}$/.test(normalizedPhone)) {
                    error = 'Số điện thoại không hợp lệ! Vui lòng nhập số bắt đầu bằng 0, dài 10-11 chữ số.';
                }
            }
        } else if (name === 'street') {
            if (!value) {
                error = 'Đường không được để trống!';
            }
        }
        return error;
    };

    const validateForm = () => {
        const newErrors = {};
        let formIsValid = true;

        // Kiểm tra các trường bắt buộc
        ['firstName', 'lastName', 'phoneNumber', 'street'].forEach((field) => {
            const error = validateField(field, userDetails[field]);
            if (error) {
                newErrors[field] = error;
                formIsValid = false;
            }
        });

        setErrors(newErrors);
        setIsFormValid(formIsValid);
    };

    useEffect(() => {
        validateForm();
    }, [userDetails]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phoneNumber') {
            let normalizedPhone = value.replace(/[\s-]/g, '');
            if (normalizedPhone.startsWith('+84')) {
                normalizedPhone = '0' + normalizedPhone.slice(3);
            }
            setUserDetails((prev) => ({
                ...prev,
                phoneNumber: normalizedPhone
            }));
        } else {
            setUserDetails((prev) => ({
                ...prev,
                [name]: value
            }));
        }

        // Kiểm tra lỗi ngay khi nhập
        const error = validateField(name, name === 'phoneNumber' ? value.replace(/[\s-]/g, '').replace(/^\+84/, '0') : value);
        setErrors((prev) => ({
            ...prev,
            [name]: error || undefined
        }));
    };

    const handleSaveUserDetails = () => {
        if (isFormValid) {
            toast.success('Thông tin người nhận đã được lưu để đặt hàng!');
        } else {
            toast.error('Vui lòng sửa các lỗi trước khi lưu!');
        }
    };

    const handlePlaceOrder = async () => {
        if (!isFormValid) {
            toast.error('Vui lòng sửa các lỗi trước khi đặt hàng!');
            return;
        }

        const selectedCartItems = cart.items.filter((item) => selectedItems[item.productId]);
        if (selectedCartItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm!');
            return;
        }

        const totalAmount = selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        const orderData = {
            userName: authUser.userName,
            fullName: `${userDetails.firstName} ${userDetails.lastName}`,
            phoneNumber: userDetails.phoneNumber,
            address: `${userDetails.street} ${userDetails.streetNumber}, ${userDetails.locality}, ${userDetails.zipCode}, ${userDetails.country}`,
            note,
            paymentMethod,
            totalAmount,
            items: selectedCartItems.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl || ''
            }))
        };

        try {
            await createOrder(orderData, navigate);
        } catch (error) {
            // Lỗi đã được xử lý trong useOrderStore, không cần xử lý thêm
        }
    };

    if (!cart || !cart.items) {
        return <div className="loading">Đang tải...</div>;
    }

    const selectedCartItems = cart.items.filter((item) => selectedItems[item.productId]);
    const totalAmount = selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

    return (
        <div className="checkout-page">
            <button className="back-button-checkkout" onClick={() => navigate('/dashboard')}>
                ⬅ Quay lại
            </button>
            <div className="checkout-container">
                <h1 className="checkout-title">Thanh Toán</h1>
                <div className="checkout-content">
                    <div className="user-details">
                        <h2>Thông Tin Người Nhận</h2>
                        <div className="form-group">
                            <label>Họ *</label>
                            <input type="text" name="firstName" value={userDetails.firstName} onChange={handleInputChange} required />
                            {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                        </div>
                        <div className="form-group">
                            <label>Tên *</label>
                            <input type="text" name="lastName" value={userDetails.lastName} onChange={handleInputChange} required />
                            {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại *</label>
                            <input type="text" name="phoneNumber" value={userDetails.phoneNumber} onChange={handleInputChange} required placeholder="Ví dụ: 0912345678 hoặc +84912345678" />
                            {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                        </div>
                        <div className="form-group">
                            <label>Đường *</label>
                            <input type="text" name="street" value={userDetails.street} onChange={handleInputChange} required />
                            {errors.street && <p className="error-text">{errors.street}</p>}
                        </div>
                        <div className="form-group">
                            <label>Số nhà</label>
                            <input type="text" name="streetNumber" value={userDetails.streetNumber} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Mã bưu điện</label>
                            <input type="text" name="zipCode" value={userDetails.zipCode} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Thành phố</label>
                            <input type="text" name="locality" value={userDetails.locality} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Quốc gia</label>
                            <input type="text" name="country" value={userDetails.country} onChange={handleInputChange} />
                        </div>
                        <button className="save-button" onClick={handleSaveUserDetails}>Lưu thông tin</button>
                    </div>
                    <div className="order-details">
                        <h2>Chi Tiết Đơn Hàng</h2>
                        {selectedCartItems.length === 0 ? (
                            <p>Chưa có sản phẩm nào được chọn.</p>
                        ) : (
                            <div className="order-items">
                                {selectedCartItems.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img src={item.imageUrl || '/images/placeholder.jpg'} alt={item.productName} className="order-item-image1" />
                                        <div className="order-item-details">
                                            <h3>{item.productName}</h3>
                                            <p>Giá: ${item.price}</p>
                                            <p>Số lượng: {item.quantity}</p>
                                            <p>Tổng: ${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="order-note">
                            <label>Lời nhắn cho shop</label>
                            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập lời nhắn (nếu có)" />
                        </div>
                        <div className="payment-method">
                            <h3>Phương thức thanh toán</h3>
                            <p>Thanh toán khi nhận hàng (COD)</p>
                        </div>
                        <div className="order-total">
                            <h3>Tổng cộng: ${totalAmount}</h3>
                        </div>
                        <button
                            className="place-order-button"
                            onClick={handlePlaceOrder}
                            disabled={selectedCartItems.length === 0 || isCreatingOrder || !isFormValid}
                        >
                            {isCreatingOrder ? 'Đang đặt hàng...' : 'Đặt Hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}