import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { MessageCircleQuestionMark } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { User } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import LogoImg from '../../assets/HomePage/Logo_ekibdlo2.png';

const Header = ({ variant = 'light' }) => {
    const navigate = useNavigate();

    // Determine which CSS classes to use based on variant
    const navbarClass = variant === 'dark' ? `${styles.navbar} ${styles.navbarDark}` : styles.navbar;

    return (
        <nav className={navbarClass}>
            <div className={styles.navContainer}>
                {/* Logo - Click để về Home */}
                <Link to="/" className={styles.logo}>
                    <img src={LogoImg} alt="EkidBlo Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>EkidBlo</span>
                </Link>

                {/* Menu chính */}
                <div className={styles.navLinks}>
                    <Link to="/browse">Browse</Link>
                    <Link to="/sell">Sell Bike</Link>
                    <Link to="/verified">Verified</Link>
                    <Link to="/about">About</Link>

                </div>

                {/* Nút hành động */}
                <div className={styles.navActions}>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => navigate('/help')}
                    >
                        <MessageCircleQuestionMark />
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => navigate('/login')}
                    >
                        <MapPin />
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => navigate('/login')}
                    >
                        <User />
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => navigate('/login')}
                    >
                        <ShoppingCart />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;
