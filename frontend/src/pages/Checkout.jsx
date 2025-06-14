import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import useOrderStore from '../stores/useOrderStore';
import { toast } from 'react-hot-toast';
import '../css/Checkout.css';

export default function Checkout() {
    const { cart, getCart } = useCartStore();
    const { authUser, updateUserDetails, findOneUser } = useAuthStore();
    const { createOrder, isCreatingOrder } = useOrderStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        street: '',
        streetNumber: '',
        zipCode: '',
        locality: '',
        country: ''
    });
    const [buyerPhoneNumber, setBuyerPhoneNumber] = useState('');
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

        // Lấy thông tin người dùng nếu userDetails chưa đầy đủ
        const fetchUserDetails = async () => {
            try {
                const userData = await findOneUser(authUser.userName);
                setUserDetails({
                    firstName: userData.userDetails?.firstName || '',
                    lastName: userData.userDetails?.lastName || '',
                    email: userData.userDetails?.email || '',
                    phoneNumber: userData.userDetails?.phoneNumber || '',
                    street: userData.userDetails?.street || '',
                    streetNumber: userData.userDetails?.streetNumber || '',
                    zipCode: userData.userDetails?.zipCode || '',
                    locality: userData.userDetails?.locality || '',
                    country: userData.userDetails?.country || ''
                });
                setBuyerPhoneNumber(userData.userDetails?.phoneNumber || '');
            } catch (error) {
                toast.error('Lỗi khi tải thông tin người dùng: ' + error.message);
            }
        };

        if (!authUser.userDetails || !authUser.userDetails.firstName || !authUser.userDetails.email) {
            fetchUserDetails();
        } else {
            setUserDetails({
                firstName: authUser.userDetails?.firstName || '',
                lastName: authUser.userDetails?.lastName || '',
                email: authUser.userDetails?.email || '',
                phoneNumber: authUser.userDetails?.phoneNumber || '',
                street: authUser.userDetails?.street || '',
                streetNumber: authUser.userDetails?.streetNumber || '',
                zipCode: authUser.userDetails?.zipCode || '',
                locality: authUser.userDetails?.locality || '',
                country: authUser.userDetails?.country || ''
            });
            setBuyerPhoneNumber(authUser.userDetails?.phoneNumber || '');
        }

        getCart(authUser.userName);

        if (location.state?.selectedItems) {
            setSelectedItems(location.state.selectedItems);
        }
    }, [authUser, navigate, getCart, location.state, findOneUser]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'phoneNumber') {
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
        } else if (name === 'firstName' || name === 'lastName' || name === 'email') {
            if (!value) {
                error = `${name === 'firstName' ? 'Họ' : name === 'lastName' ? 'Tên' : 'Email'} không được để trống!`;
            } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = 'Email không hợp lệ!';
            }
        }
        return error;
    };

    const validateForm = () => {
        const newErrors = {};
        let formIsValid = true;

        ['firstName', 'lastName', 'email', 'phoneNumber', 'street'].forEach((field) => {
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

        const error = validateField(name, name === 'phoneNumber' ? value.replace(/[\s-]/g, '').replace(/^\+84/, '0') : value);
        setErrors((prev) => ({
            ...prev,
            [name]: error || undefined
        }));
    };

    const handleSaveUserDetails = async () => {
        if (!isFormValid) {
            toast.error('Vui lòng sửa các lỗi trước khi lưu!');
            return;
        }

        try {
            await updateUserDetails(authUser.id, userDetails);
            toast.success('Thông tin người nhận đã được lưu!');
        } catch (error) {
            toast.error('Lỗi khi lưu thông tin: ' + error.message);
        }
    };

    const handlePlaceOrder = async () => {
        if (!isFormValid) {
            toast.error('Vui lòng sửa các lỗi trước khi đặt hàng!');
            return;
        }

        try {
            await getCart(authUser.userName);
        } catch (error) {
            toast.error('Lỗi khi làm mới giỏ hàng: ' + error.message);
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
            email: userDetails.email,
            fullName: `${userDetails.firstName} ${userDetails.lastName}`,
            phoneNumber: userDetails.phoneNumber,
            buyerPhoneNumber: buyerPhoneNumber,
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
            const response = await createOrder(orderData, navigate);
            toast.success(`Đặt hàng thành công! Mã hóa đơn của bạn: ${response.invoiceCode}`, {
                duration: 5000,
                action: {
                    text: 'Xem đơn hàng',
                    onClick: () => navigate('/orders')
                }
            });
            await getCart(authUser.userName);
        } catch (error) {
            await getCart(authUser.userName);
            if (error.message.includes('Số lượng sản phẩm') || error.message.includes('không tồn tại')) {
                toast.error('Vui lòng quay lại giỏ hàng để điều chỉnh số lượng hoặc xóa sản phẩm không khả dụng.', {
                    duration: 5000,
                    action: {
                        text: 'Quay lại giỏ hàng',
                        onClick: () => navigate('/cart')
                    }
                });
            } else if (error.message.includes('Không có quyền')) {
                toast.error('Lỗi quyền truy cập. Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ.', {
                    duration: 5000,
                    action: {
                        text: 'Đăng nhập',
                        onClick: () => navigate('/login')
                    }
                });
            }
        }
    };

    if (!cart || !cart.items) {
        return <div className="loading">Đang tải...</div>;
    }

    const selectedCartItems = cart.items.filter((item) => selectedItems[item.productId]);
    const totalAmount = selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

    return (
        <div className="checkout-container">
            <button className="back-button" onClick={() => navigate('/cart')}>
                ⬅ Quay lại
            </button>
            <h1 className="checkout-title">Thanh Toán</h1>
            <div className="checkout-content">
                <div className="user-details">
                    <h2>Thông Tin Người Nhận</h2>
                    <div className="form-group">
                        <label>Họ *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={userDetails.firstName}
                            onChange={handleInputChange}
                            required
                            disabled
                        />
                        {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                    </div>
                    <div className="form-group">
                        <label>Tên *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={userDetails.lastName}
                            onChange={handleInputChange}
                            required
                            disabled
                            
                        />
                        {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                    </div>
                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={userDetails.email}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại người mua</label>
                        <input type="text" value={buyerPhoneNumber} disabled />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại người nhận *</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={userDetails.phoneNumber}
                            onChange={handleInputChange}
                            required
                            placeholder="Ví dụ: 0912345678 hoặc +84912345678"
                        />
                        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                    </div>
                    <div className="form-group">
                        <label>Đường *</label>
                        <input
                            type="text"
                            name="street"
                            value={userDetails.street}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.street && <p className="error-text">{errors.street}</p>}
                    </div>
                    <div className="form-group">
                        <label>Số nhà</label>
                        <input
                            type="text"
                            name="streetNumber"
                            value={userDetails.streetNumber}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Mã bưu điện</label>
                        <input
                            type="text"
                            name="zipCode"
                            value={userDetails.zipCode}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Thành phố</label>
                        <input
                            type="text"
                            name="locality"
                            value={userDetails.locality}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Quốc gia</label>
                        <input
                            type="text"
                            name="country"
                            value={userDetails.country}
                            onChange={handleInputChange}
                        />
                    </div>
                    <button className="save-button" onClick={handleSaveUserDetails}>
                        Lưu thông tin
                    </button>
                </div>
                <div className="order-details">
                    <h2>Chi Tiết Đơn Hàng</h2>
                    {selectedCartItems.length === 0 ? (
                        <p>Chưa có sản phẩm nào được chọn.</p>
                    ) : (
                        <div className="order-items">
                            {selectedCartItems.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img
                                        src={item.imageUrl || '/images/placeholder.jpg'}
                                        alt={item.productName}
                                        className="order-item-image"
                                    />
                                    <div className="order-item-details">
                                        <h3>{item.productName}</h3>
                                        <p>Giá: ${item.price}</p>
                                        <p>Số lượng: ${item.quantity}</p>
                                        <p>Tổng: ${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="order-note">
                        <label>Lời nhắn cho shop</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Nhập lời nhắn (nếu có)"
                        />
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
    );
}