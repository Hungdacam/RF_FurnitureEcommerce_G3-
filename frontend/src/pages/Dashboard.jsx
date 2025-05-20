import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import useAuthStore from '../stores/useAuthStore';
import useCartStore from '../stores/useCartStore';
import background from '../assets/background.png';
import seatingImg from '../assets/seating.png';
import storageImg from '../assets/storage.png';
import tableImg from '../assets/table.png';
import lampImg from '../assets/lamp.png';
import vavesImg from '../assets/vaves.png';
import '../css/Dasboard.css';

const Dashboard = () => {
  const { 
    products, 
    searchResults, 
    isSearching, 
    selectedCategory, 
    fetchAllProducts, 
    filterByCategory, 
    resetSearch, 
    isLoading: isProductLoading 
  } = useProductStore();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const handleAddToCart = async (product) => {
    if (!authUser) {
      try {
        await addToCart(null, product.id, product.productName, product.price, 1, false);
        alert('Sản phẩm đã được thêm vào giỏ hàng tạm. Vui lòng đăng nhập để lưu vào giỏ hàng chính thức!');
        navigate('/login');
      } catch (error) {
        alert('Lỗi khi thêm sản phẩm vào giỏ hàng tạm!');
        console.error(error);
      }
      return;
    }
    try {
      await addToCart(authUser.userName, product.id, product.productName, product.price, 1, true);
      alert('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      alert('Lỗi khi thêm sản phẩm vào giỏ hàng!');
      console.error(error);
    }
  };

  if (isProductLoading || isCartLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#B0C9C5', fontFamily: 'Arial, sans-serif' }}>
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          style={{
            backgroundImage: `url('/path/to/your/background.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            paddingLeft: '60px'
          }}
        >
          <div style={{ maxWidth: '600px', marginLeft: '-700px' }}>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textTransform: 'uppercase'
              }}
            >
              Modern pastel colors
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Made from premium non-stretch Japanese denim for a vintage-inspired look, the ’90s Cheeky Jean has an easy straight leg, an extra-high rise, and a butt-boosting rear fit. Lorem ipsum sit dolor...
            </p>
            <button
              style={{
                padding: '12px 24px',
                border: '1px solid white',
                backgroundColor: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                letterSpacing: '1px'
              }}
            >
              DISCOVERY MORE
            </button>
          </div>
        </div>
      </div>
      <div className="container">
        <div style={{ maxWidth: '250px', marginLeft: '-50px', marginTop: '40px', padding: '0 20px', display: 'flex', }}>
          <div style={{
            flex: '0 0 250px',
            paddingTop: '20px',
          }}>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textTransform: 'uppercase'
              }}
            >
              Category
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              Explore our curated selection of furniture, lighting, décor and tabletop handcrafted by the best Italian artisans.
            </p>
          </div>
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))',
              gap: '20px',
              maxWidth: '950px',
              margin: '0 auto',
              paddingLeft: '20px',
            }}
          >
            {[
              { img: seatingImg, text: 'Đồ decor' },
              { img: storageImg, text: 'Ghế' },
              { img: tableImg, text: 'Bàn' },
              { img: lampImg, text: 'Giường' },
              { img: vavesImg, text: 'Khác' },
            ].map((item, index) => (
              <div
                key={index}
                onClick={() => filterByCategory(item.text)}
                style={{
                  backgroundColor: '#d3e4e4',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  transform: hoveredIndex === index ? 'translateY(-10px)' : 'translateY(0)',
                  boxShadow:
                    hoveredIndex === index
                      ? '0 10px 20px rgba(0, 0, 0, 0.2)'
                      : '0 2px 5px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={item.img}
                  alt={item.text}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    marginBottom: '10px',
                    borderRadius: '6px'
                  }}
                />
                <p style={{ fontSize: '14px' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        {(isSearching || selectedCategory) && (
          <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '-20px' }}>
            <button
              onClick={() => resetSearch()}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgb(45,88,83)',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              Hiển thị tất cả sản phẩm
            </button>
          </div>
        )}
        <div style={{ paddingTop: '40px' }}>
          <h1 style={{ textAlign: 'center', textTransform: 'uppercase', color: 'rgb(45,88,83)' }}>
            {isSearching ? `Kết quả tìm kiếm` : 'BEST SELLER'}
          </h1>
          {isSearching && searchResults.length === 0 && (
            <div style={{ width: '100%', marginTop: '20px', textAlign: 'center' }}>
              <p style={{ color: 'rgb(45,88,83)', fontSize: '18px', fontWeight: 'bold' }}>
                Không tìm thấy sản phẩm phù hợp.
              </p>
            </div>
          )}
          <div className="product-grid">
            {(isSearching ? searchResults : products).map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="product-image"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150')}
                  />
                </div>
                <div className="product-details">
                  <h2 className="product-name">{product.productName}</h2>
                  <div className="product-info">
                    <p className="product-price">${product.price}</p>
                  </div>
                  <button
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(product)}
                  >
                    <span className="cart-icon">🛒</span>
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                  <button
                    className="add-to-info-button"
                    onClick={() => navigate(`/product-detail/${product.id}`)}
                  >
                    <span>Chi tiết sản phẩm</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;