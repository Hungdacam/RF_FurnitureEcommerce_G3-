import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import '../css/Cart.css';

export default function Cart() {
    const { cart, getCart, updateCartItemQuantity, error, isLoading } = useCartStore();
    const { authUser } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authUser) {
            alert('Vui lòng đăng nhập để xem giỏ hàng!');
            navigate('/');
            return;
        }
        getCart(authUser.userName);
    }, [authUser, navigate, getCart]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 0) {
            alert('Số lượng sản phẩm không thể nhỏ hơn 0');
            return;
        }
        try {
            await updateCartItemQuantity(authUser.userName, productId, newQuantity);
            if (newQuantity === 0) {
                alert('Sản phẩm đã được xóa khỏi giỏ hàng!');
            } else {
                alert('Cập nhật số lượng sản phẩm thành công!');
            }
        } catch (error) {
            alert(`Lỗi khi cập nhật số lượng: ${error.message}`);
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className='loading-container'>
                <div className='spinner'></div>
                <div className="loading-text">Đang tải giỏ hàng...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='error'>Lỗi khi tải giỏ hàng: {error}</div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return <div className='empty-cart'>Giỏ hàng của bạn đang trống</div>;
    }

    return (
        <div className='cart-container'>
            <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>
            <div className='cart-items'>
                {cart.items.map((item, index) => (
                    <div key={index} className='cart-items'>
                        <h3>{item.productName}</h3>
                        <div className='quantity-control'>
                            <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 0}
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            >
                                +
                            </button>
                        </div>
                        <p>Giá: ${item.price}</p>
                        <p>Tổng: ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div className="cart-total">
                <h3>Tổng tiền: ${cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</h3>
            </div>
            <button className="checkout-button" onClick={() => navigate('/checkout')}>
                Thanh Toán
            </button>
        </div>
    );
}