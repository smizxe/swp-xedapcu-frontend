import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircleQuestionMark, ShoppingCart, User } from 'lucide-react';
import LogoImg from '../../assets/HomePage/Logo_ekibdlo2.png';
import { getCurrentUser, isAuthenticated, logoutUser } from '../../service/authService';
import styles from './Header.module.css';

const Header = ({ variant = 'light' }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            const user = getCurrentUser();

            setIsLoggedIn(authenticated);
            if (authenticated) {
                setUserEmail(user.email || '');
                setUserId(user.userId || user.id || 'me');
                setUserRole(user.role || null);
            } else {
                setUserEmail('');
                setUserId(null);
                setUserRole(null);
            }
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        window.addEventListener('userLoggedIn', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('userLoggedIn', checkAuth);
        };
    }, []);

    const handleUserIconClick = () => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        logoutUser();
        setIsLoggedIn(false);
        setUserEmail('');
        navigate('/');
    };

    const navbarClass = variant === 'dark' ? `${styles.navbar} ${styles.navbarDark}` : styles.navbar;

    return (
        <nav className={navbarClass}>
            <div className={styles.navContainer}>
                <Link to="/" className={styles.logo}>
                    <img src={LogoImg} alt="EkibDlo Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>EkibDlo</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link to="/my-posts">Verified</Link>
                    <Link to="/marketplace">Market Place</Link>
                    <Link to="/about">About</Link>
                </div>

                <div className={styles.navActions}>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => navigate('/help')}
                    >
                        <MessageCircleQuestionMark />
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => window.open('https://www.google.com/maps/place/FPT+Software+Tp.H%E1%BB%93+Ch%C3%AD+Minh/@10.6950573,106.2378064,11z/data=!4m10!1m2!2m1!1sFPT+Software!3m6!1s0x317527374c43baad:0xb8b244d75d12213e!8m2!3d10.8508885!4d106.7983267!15sCgxGUFQgU29mdHdhcmUiA4gBAVoOIgxmcHQgc29mdHdhcmWSARBzb2Z0d2FyZV9jb21wYW55mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVU5ZTVdWSGRsaDNFQUXgAQD6AQQIABAy!16s%2Fg%2F113gl62_r?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D', '_blank')}
                    >
                        <MapPin />
                    </button>
                    <div className={styles.userDropdownContainer}>
                        {isLoggedIn ? (
                            <div className={styles.userGreeting}>
                                <span className={styles.userGreetingText}>
                                    Hi! {(userEmail || 'user').split('@')[0]}
                                </span>
                            </div>
                        ) : (
                            <button
                                className={styles.btnSecondary}
                                onClick={handleUserIconClick}
                            >
                                <User />
                            </button>
                        )}

                        {isLoggedIn && (
                            <div className={styles.userDropdown}>
                                <div className={styles.dropdownHeader}>
                                    <p className={styles.greeting}>{userEmail}</p>
                                </div>
                                <div className={styles.dropdownDivider} />

                                {userRole === 'ADMIN' || userRole === 'ROLE_ADMIN' ? (
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={() => navigate('/admin')}
                                    >
                                        Admin Dashboard
                                    </button>
                                ) : userRole === 'INSPECTOR' || userRole === 'ROLE_INSPECTOR' ? (
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={() => navigate('/inspector')}
                                    >
                                        Inspector Dashboard
                                    </button>
                                ) : userRole === 'SELLER' || userRole === 'ROLE_SELLER' ? (
                                    <>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/profile')}
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/wallet')}
                                        >
                                            My Wallet
                                        </button>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/my-sales')}
                                        >
                                            My Sales
                                        </button>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/my-posts')}
                                        >
                                            My Posts
                                        </button>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate(`/${userId}/bicycles`)}
                                        >
                                            My Bicycles
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/profile')}
                                        >
                                            My Profile
                                        </button>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/wallet')}
                                        >
                                            My Wallet
                                        </button>
                                        <button
                                            className={styles.dropdownItem}
                                            onClick={() => navigate('/my-orders')}
                                        >
                                            My Orders
                                        </button>
                                    </>
                                )}

                                <div className={styles.dropdownDivider} />
                                <button
                                    className={styles.dropdownItemLogout}
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
