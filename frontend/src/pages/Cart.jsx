import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import '../css/Cart.css';

export default function Cart() {
    const { cart, getCart, updateCartItemQuantity, error, isLoading } = useCartStore();
    const { authUser } = useAuthStore();
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState({});
    const [localCartItems, setLocalCartItems] = useState([]);

    useEffect(() => {
        if (!authUser) {
            alert('Vui lòng đăng nhập để xem giỏ hàng!');
            navigate('/');
            return;
        }

        getCart(authUser.userName);

        const intervalId = setInterval(() => {
            getCart(authUser.userName);
            console.log('Giỏ hàng được làm mới tự động');
        }, 10000);

        return () => clearInterval(intervalId);
    }, [authUser, navigate, getCart]);

    useEffect(() => {
        if (cart && cart.items) {
            const newLocalCartItems = cart.items.map((item) => ({ ...item }));
            setLocalCartItems(newLocalCartItems);

            setSelectedItems((prevSelected) => {
                const newSelectedItems = { ...prevSelected };
                cart.items.forEach((item) => {
                    if (!(item.productId in newSelectedItems)) {
                        newSelectedItems[item.productId] = false;
                    }
                });
                Object.keys(newSelectedItems).forEach((productId) => {
                    if (!cart.items.some((item) => item.productId === Number(productId))) {
                        delete newSelectedItems[productId];
                    }
                });
                return newSelectedItems;
            });
        }
    }, [cart]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 0) {
            return;
        }

        if (newQuantity === 0) {
            setLocalCartItems((prevItems) =>
                prevItems.filter((item) => item.productId !== productId)
            );
            setSelectedItems((prev) => {
                const newSelected = { ...prev };
                delete newSelected[productId];
                return newSelected;
            });
            alert('Sản phẩm đã được xóa khỏi giỏ hàng!');
        } else {
            setLocalCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.productId === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        }

        try {
            await updateCartItemQuantity(authUser.userName, productId, newQuantity);
        } catch (error) {
            alert(error.message);
            setLocalCartItems(cart.items.map((item) => ({ ...item })));
            console.error(error);
        }
    };

    const handleRemoveItem = async (productId) => {
        setLocalCartItems((prevItems) =>
            prevItems.filter((item) => item.productId !== productId)
        );
        setSelectedItems((prev) => {
            const newSelected = { ...prev };
            delete newSelected[productId];
            return newSelected;
        });

        try {
            await updateCartItemQuantity(authUser.userName, productId, 0);
            alert('Sản phẩm đã được xóa khỏi giỏ hàng!');
        } catch (error) {
            alert(`Lỗi khi xóa sản phẩm: ${error.message}`);
            setLocalCartItems(cart.items.map((item) => ({ ...item })));
            console.error(error);
        }
    };

    const handleCheckboxChange = (productId) => {
        setSelectedItems((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setSelectedItems((prev) => {
            const newSelected = { ...prev };
            localCartItems.forEach((item) => {
                newSelected[item.productId] = isChecked && item.available && !item.outOfStock;
            });
            return newSelected;
        });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <div className="loading-text">Đang tải giỏ hàng...</div>
            </div>
        );
    }

    if (error) {
        return <div className="error">Lỗi khi tải giỏ hàng: {error}</div>;
    }

    if (!localCartItems.length) {
        return <div className="empty-cart">Giỏ hàng của bạn đang trống</div>;
    }

    const hasUnavailableItems = localCartItems.some(
        (item) => selectedItems[item.productId] && (!item.available || item.outOfStock)
    );
    const selectedTotal = localCartItems
        .filter((item) => selectedItems[item.productId])
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2);
    const hasSelectedItems = Object.values(selectedItems).some((selected) => selected);

    console.log('Local cart items:', localCartItems);
    console.log('Selected items:', selectedItems);

    return (
        <div className="cart-wrapper">
            <button className="back-buttoncart" onClick={() => navigate('/dashboard')}>
                ⬅ Quay lại
            </button>
            <div className="cart-container">
                <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>
                <div className="checkbox-container1">
                    <input
                        type="checkbox"
                        checked={localCartItems.every(
                            (item) => !item.available || item.outOfStock || selectedItems[item.productId]
                        )}
                        onChange={handleSelectAll}
                    />
                    <label className='font'>Chọn tất cả</label>
                </div>
                <div className="cart-items">
                    {localCartItems.map((item, index) => (
                        <div
                            key={index}
                            className={`cart-item ${!item.available || item.outOfStock ? 'unavailable' : ''}`}
                        >
                            <div className="cart-item-image">
                                <img
                                    src={item.imageUrl || '/images/placeholder.jpg'}
                                    alt={item.productName}
                                    loading="lazy"
                                    onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                                />
                            </div>
                            <div className="cart-item-details">
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={!!selectedItems[item.productId]}
                                        onChange={() => handleCheckboxChange(item.productId)}
                                        disabled={!item.available || item.outOfStock}
                                    />
                                </div>
                                <h3 className="productName-title">{item.productName}</h3>
                                {!item.available && (
                                    <p className="unavailable-message">Sản phẩm không tồn tại</p>
                                )}
                                {item.available && item.outOfStock && (
                                    <p className="unavailable-message">Sản phẩm đã hết hàng</p>
                                )}
                                <div className="quantity-control">
                                    <button
                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                        disabled={item.quantity <= 0 || !item.available || item.outOfStock}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                        disabled={!item.available || item.outOfStock}
                                    >
                                        +
                                    </button>
                                </div>
                                <p>Giá: ${item.price}</p>
                                <p>Tổng: ${(item.price * item.quantity).toFixed(2)}</p>
                                <button
                                    className="remove-item-button"
                                    onClick={() => handleRemoveItem(item.productId)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-total">
                    <h3>Tổng tiền (đã chọn): ${selectedTotal}</h3>
                </div>
                <button
                    className="checkout-button"
                    onClick={() => navigate('/checkout', { state: { selectedItems } })}
                    disabled={hasUnavailableItems || !hasSelectedItems}
                >
                    Thanh Toán
                </button>
                {(hasUnavailableItems || !hasSelectedItems) && (
                    <p className="checkout-warning">
                        {hasUnavailableItems
                            ? 'Vui lòng xóa các sản phẩm không tồn tại hoặc hết hàng trong số đã chọn.'
                            : 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.'}
                    </p>
                )}
            </div>
        </div>
    );
}