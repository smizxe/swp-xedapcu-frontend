
import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>OldBikeMarkt</h3>
                    <p>Nền tảng mua bán xe đạp cũ uy tín hàng đầu.</p>
                </div>
                <div className="footer-section">
                    <h4>Liên kết</h4>
                    <ul>
                        <li><a href="/">Trang chủ</a></li>
                        <li><a href="/buy">Mua xe</a></li>
                        <li><a href="/sell">Bán xe</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Liên hệ</h4>
                    <p>Email: contact@oldbikemarkt.com</p>
                    <p>Phone: 0123 456 789</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 OldBikeMarkt. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
