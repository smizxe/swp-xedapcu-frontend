
import React from 'react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <h1>OldBikeMarkt</h1>
            </div>
            <ul className="navbar-links">
                <li><a href="/">Trang chủ</a></li>
                <li><a href="/buy">Mua xe</a></li>
                <li><a href="/sell">Bán xe</a></li>
                <li><a href="/about">Giới thiệu</a></li>
                <li><a href="/contact">Liên hệ</a></li>
            </ul>
            <div className="navbar-auth">
                <button className="btn-login">Đăng nhập</button>
                <button className="btn-register">Đăng ký</button>
            </div>
        </nav>
    );
};

export default Navbar;
