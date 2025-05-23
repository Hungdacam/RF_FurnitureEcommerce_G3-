import React from 'react';
import '../css/AboutUs.css'; // Đừng quên tạo file CSS này
import logoAphrodite from '../assets/logoAphrodife.png';
import hinh1 from '../assets/hinh1.png';
import hinh2 from '../assets/hinh2.png';
import hinh3 from '../assets/hinh3.png';
import hinh4 from '../assets/hinh4.png';
import hinh5 from '../assets/hinh5.png';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();
  return (
    <div className="about-us">
      <div className="about-us-container">
        <button className="back-button-aboutus" onClick={() => navigate(-1)}>
          ⬅ Quay lại
        </button>
        <section className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h1>Giới thiệu chung</h1>
              <p>
                Chào mừng bạn đến với Aphrodite, thương hiệu nội thất hàng đầu mang đến sự tinh tế và đẳng cấp cho không gian sống của bạn.
                Chúng tôi không chỉ cung cấp sản phẩm, mà còn mang đến những giải pháp nội thất hoàn hảo, giúp ngôi nhà của bạn trở nên đẹp mắt và tiện nghi hơn bao giờ hết.
              </p>
            </div>
            <img src={logoAphrodite} alt="Nội thất Aphrodite" className="about-image" />
          </div>

        </section>

        <section className="about-section">
          <div className="about-content">
            <img src={hinh1} alt="Nội thất Aphrodite" className="about-image1" />
            <div className="about-text1">
              <h1>Thiết Kế Đẳng Cấp – Phong Cách Độc Đáo</h1>
              <p>
                Mỗi sản phẩm tại Aphrodite đều được thiết kế tinh tế và hiện đại. Sự kết hợp giữa xu hướng hiện đại và sự tiện dụng, từ màu sắc tới thời gian, sáng tạo không gian sống lý tưởng cho bạn.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h1>Chất Lượng Vượt Trội – Bền Bỉ Theo Thời Gian</h1>
              <p>
                Chúng tôi cam kết sử dụng nguyên liệu cao cấp, đảm bảo độ bền lâu dài. Mọi sản phẩm đều trải qua quy trình kiểm định nghiêm ngặt, giúp khách hàng an tâm về chất lượng và sự an toàn khi sử dụng.
              </p>
            </div>
            <img src={hinh2} alt="Nội thất Aphrodite" className="about-image" />
          </div>
        </section>

        <section className="about-section">
          <div className="about-content">
            <img src={hinh3} alt="Nội thất Aphrodite" className="about-image1" />
            <div className="about-text1">
              <h1>Mẫu Mã Đa Dạng – Đáp Ứng Mọi Nhu Cầu</h1>
              <p>
                Không chỉ có thiết kế đẹp, sản phẩm của chúng tôi còn có nhiều kích thước, màu sắc, kiểu dáng phù hợp cho nhiều không gian khác nhau.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h1>Dịch Vụ Chuyên Nghiệp – Hỗ Trợ Tận Tâm</h1>
              <p>
                - Tư vấn miễn phí giúp bạn chọn lựa nội thất phù hợp. <br />
                - Giao hàng nhanh chóng, đảm bảo đúng tiến độ. <br />
                - Chăm sóc khách hàng hậu mãi tốt, giúp khách hàng an tâm khi mua sắm.
              </p>
            </div>
            <img src={hinh4} alt="Nội thất Aphrodite" className="about-image" />
          </div>
        </section>

        <section className="about-section">
          <div className="about-content">
            <img src={hinh5} alt="Nội thất Aphrodite" className="about-image1" />
            <div className="about-text1">
              <h1>Giá Cả Hợp Lý – Giá Trị Xứng Đáng</h1>
              <p>
                Aphrodite luôn mang đến mức giá cạnh tranh nhất trên thị trường, đi kèm với chất lượng vượt trội.
              </p>
            </div>
          </div>
        </section>

        <h3 className="about-footer">✨ Aphrodite – Tạo Dựng Không Gian Sống Hoàn Hảo Cùng Bạn! ✨</h3>

        <footer className="about-footer-contact">
          <div>
            <strong>Kết nối với Aphrodite</strong>
            <p>Instagram - Youtube - Facebook</p>
          </div>
          <div>
            <strong>Aphrodite</strong>
            <p>Chuyên nội thất phong cách hiện đại</p>
          </div>
          <div>
            <strong>Newsletter</strong>
            <p>Email: aphrodite98@gmail.com</p>
            <p>Hotline: 0123456789</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;
