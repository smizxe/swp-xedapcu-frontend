
import React from 'react';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="homepage">
            <header className="hero">
                <div className="hero-content">
                    <h1>Tìm Chiếc Xe Đạp Ưng Ý Của Bạn</h1>
                    <p>Mua bán, trao đổi xe đạp thể thao cũ uy tín, chất lượng.</p>
                    <div className="hero-buttons">
                        <button className="btn-primary">Mua Ngay</button>
                        <button className="btn-secondary">Đăng Tin Bán</button>
                    </div>
                </div>
            </header>

            <section className="features">
                <div className="feature-card">
                    <h3>Minh Bạch</h3>
                    <p>Thông tin xe rõ ràng, đã được kiểm định.</p>
                </div>
                <div className="feature-card">
                    <h3>An Toàn</h3>
                    <p>Giao dịch an toàn, hỗ trợ thanh toán đảm bảo.</p>
                </div>
                <div className="feature-card">
                    <h3>Đa Dạng</h3>
                    <p>Nhiều mẫu mã, chủng loại phù hợp mọi nhu cầu.</p>
                </div>
            </section>

            <section className="featured-bikes">
                <h2>Xe Nổi Bật</h2>
                <div className="bikes-grid">
                    {/* Placeholder for bike cards */}
                    <div className="bike-card">
                        <div className="bike-image-placeholder">Ảnh Xe</div>
                        <h4>Trek Domane AL 2</h4>
                        <p className="price">15.000.000 VND</p>
                    </div>
                    <div className="bike-card">
                        <div className="bike-image-placeholder">Ảnh Xe</div>
                        <h4>Giant Escape 3</h4>
                        <p className="price">8.500.000 VND</p>
                    </div>
                    <div className="bike-card">
                        <div className="bike-image-placeholder">Ảnh Xe</div>
                        <h4>Trinx Free 2.0</h4>
                        <p className="price">5.200.000 VND</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
