import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import LogoImg from '../../assets/HomePage/Logo_ekibdlo.png';

const Header = () => {
    const navigate = useNavigate();

    return (
        <nav className={styles.navbar}>
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
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={styles.btnPrimary}
                        onClick={() => navigate('/register')}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Header;