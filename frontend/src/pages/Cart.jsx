import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCartStore from '../stores/useCartStore';
import useAuthStore from '../stores/useAuthStore';
import { axiosCatalog } from '../lib/axios';
import { toast } from 'react-hot-toast';
import '../css/Cart.css';

export default function Cart() {
    const { cart, getCart, updateCartItemQuantity, error, isLoading } = useCartStore();
    const { authUser } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedItems, setSelectedItems] = useState({});
    const [localCartItems, setLocalCartItems] = useState([]);
    const [stockWarnings, setStockWarnings] = useState({});

    useEffect(() => {
        if (!authUser) {
            toast.error('Vui lòng đăng nhập để xem giỏ hàng!');
            navigate('/');
            return;
        }

        getCart(authUser.userName);
    }, [authUser, navigate, getCart]);

    useEffect(() => {
        if (cart && cart.items) {
            const newLocalCartItems = cart.items.map((item) => ({ ...item }));
            setLocalCartItems(newLocalCartItems);

            // Check and adjust stock quantities
            const checkAndAdjustStock = async () => {
                const updatedItems = [...newLocalCartItems];
                const warnings = {};
                let hasStockIssue = false;

                for (const item of updatedItems) {
                    try {
                        const productResponse = await axiosCatalog.get(`/products/${item.productId}`);
                        const latestStockQuantity = productResponse.data.quantity;

                        if (item.quantity > latestStockQuantity) {
                            hasStockIssue = true;
                            warnings[item.productId] = `Tồn kho chỉ còn ${latestStockQuantity}, số lượng đã được điều chỉnh!`;
                            updatedItems.forEach((i) => {
                                if (i.productId === item.productId) {
                                    i.quantity = latestStockQuantity;
                                    i.stockQuantity = latestStockQuantity;
                                }
                            });
                            // Update backend
                            await updateCartItemQuantity(authUser.userName, item.productId, latestStockQuantity);
                            toast.warn(`Sản phẩm ${item.productName}: ${warnings[item.productId]}`);
                        } else {
                            updatedItems.forEach((i) => {
                                if (i.productId === item.productId) {
                                    i.stockQuantity = latestStockQuantity;
                                }
                            });
                        }
                    } catch (error) {
                        console.error(`Error checking stock for product ${item.productId}:`, error);
                    }
                }

                setLocalCartItems(updatedItems);
                setStockWarnings(warnings);

                if (hasStockIssue) {
                    // Refresh cart from backend to ensure consistency
                    await getCart(authUser.userName);
                }
            };

            checkAndAdjustStock();

            // Handle rebuy product selection
            const rebuyProductIds = location.state?.rebuyProductIds || [];
            setSelectedItems((prevSelected) => {
                const newSelected = { ...prevSelected };
                cart.items.forEach((item) => {
                    if (rebuyProductIds.length > 0 && rebuyProductIds.includes(item.productId) && item.available && !item.outOfStock) {
                        newSelected[item.productId] = true;
                    }
                });
                Object.keys(newSelected).forEach((productId) => {
                    if (!cart.items.some((item) => item.productId === Number(productId))) {
                        delete newSelected[productId];
                    }
                });
                return newSelected;
            });

            if (rebuyProductIds.length > 0) {
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [cart, location.state, navigate, authUser.userName, getCart, updateCartItemQuantity]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 0) {
            return;
        }

        const item = localCartItems.find((item) => item.productId === productId);
        if (!item) {
            toast.error('Sản phẩm không tồn tại trong giỏ hàng!');
            return;
        }

        console.log(`handleQuantityChange: productId=${productId}, newQuantity=${newQuantity}, localStockQuantity=${item.stockQuantity}`);

        try {
            const productResponse = await axiosCatalog.get(`/products/${productId}`);
            const latestStockQuantity = productResponse.data.quantity;
            console.log(`Latest stock: productId=${productId}, stockQuantity=${latestStockQuantity}`);

            if (newQuantity > latestStockQuantity) {
                toast.error(`Không thể tăng số lượng! Tồn kho hiện tại chỉ còn ${latestStockQuantity} sản phẩm.`);
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
                toast.success('Sản phẩm đã được xóa khỏi giỏ hàng!');
            } else {
                setLocalCartItems((prevItems) =>
                    prevItems.map((i) =>
                        i.productId === productId
                            ? { ...i, quantity: newQuantity, stockQuantity: latestStockQuantity }
                            : i
                    )
                );
            }

            try {
                await updateCartItemQuantity(authUser.userName, productId, newQuantity);
                setStockWarnings((prev) => {
                    const newWarnings = { ...prev };
                    delete newWarnings[productId];
                    return newWarnings;
                });
            } catch (error) {
                toast.error(error.message);
                setLocalCartItems(cart.items.map((item) => ({ ...item })));
                console.error('Error updating cart:', error);
            }
        } catch (error) {
            toast.error('Lỗi khi kiểm tra tồn kho. Vui lòng thử lại!');
            console.error('Error fetching stock:', error);
        }
    };

    const handleAdjustToStock = async (productId, stockQuantity) => {
        await handleQuantityChange(productId, stockQuantity);
        toast.success(`Số lượng đã được điều chỉnh xuống ${stockQuantity} theo tồn kho!`);
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
            toast.success('Sản phẩm đã được xóa khỏi giỏ hàng!');
        } catch (error) {
            toast.error(`Lỗi khi xóa sản phẩm: ${error.message}`);
            setLocalCartItems(cart.items.map((item) => ({ ...item })));
            console.error('Error removing item:', error);
        }
    };

    const handleCheckboxChange = (productId) => {
        setSelectedItems((prev) => ({
            ...prev,
            [productId]: !prev[productId] || false,
        }));
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        const newSelected = {};
        localCartItems.forEach((item) => {
            newSelected[item.productId] = isChecked && item.available && !item.outOfStock;
        });
        setSelectedItems(newSelected);
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
        return (
            <div className="empty-cart">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ⬅ Quay lại
                </button>
                Giỏ hàng của bạn đang trống
            </div>
        );
    }

    const hasUnavailableItems = localCartItems.some(
        (item) => selectedItems[item.productId] && (!item.available || item.outOfStock)
    );
    const hasStockIssues = localCartItems.some(
        (item) => selectedItems[item.productId] && stockWarnings[item.productId]
    );
    const selectedTotal = localCartItems
        .filter((item) => selectedItems[item.productId])
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2);
    const hasSelectedItems = Object.values(selectedItems).some((selected) => selected);

    console.log('Local cart items:', localCartItems);
    console.log('Selected items:', selectedItems);
    console.log('Stock warnings:', JSON.stringify(stockWarnings, null, 2));

    return (
        <div className="cart-container">
            <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>
            <button className="back-button" onClick={() => navigate('/dashboard')}>
                ⬅ Quay lại
            </button>
            <div className="select-all-container">
                <input
                    type="checkbox"
                    checked={localCartItems.every(
                        (item) => !item.available || item.outOfStock || selectedItems[item.productId]
                    )}
                    onChange={handleSelectAll}
                />
                <label>Chọn tất cả</label>
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
                            <h3>{item.productName}</h3>
                            {!item.available && (
                                <p className="unavailable-message">Sản phẩm không tồn tại</p>
                            )}
                            {item.available && item.outOfStock && (
                                <p className="unavailable-message">Sản phẩm đã hết hàng</p>
                            )}
                            {stockWarnings[item.productId] && (
                                <>
                                    <p className="stock-warning">{stockWarnings[item.productId]}</p>
                                    <button
                                        className="adjust-button"
                                        onClick={() => handleAdjustToStock(item.productId, item.stockQuantity)}
                                    >
                                        Điều chỉnh
                                    </button>
                                </>
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
                                    disabled={
                                        !item.available ||
                                        item.outOfStock ||
                                        item.quantity >= item.stockQuantity
                                    }
                                    title={
                                        item.quantity >= item.stockQuantity
                                            ? `Đã đạt tối đa tồn kho (${item.stockQuantity} sản phẩm)`
                                            : 'Tăng số lượng'
                                    }
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
                disabled={hasUnavailableItems || !hasSelectedItems || hasStockIssues}
            >
                Thanh Toán
            </button>
            {(hasUnavailableItems || !hasSelectedItems || hasStockIssues) && (
                <p className="checkout-warning">
                    {hasUnavailableItems
                        ? 'Vui lòng xóa các sản phẩm không tồn tại hoặc hết hàng trong số đã chọn.'
                        : hasStockIssues
                        ? 'Vui lòng điều chỉnh số lượng sản phẩm vượt quá tồn kho.'
                        : 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.'}
                </p>
            )}
        </div>
    );
}