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
                    <Link to="/marketplace">Browse</Link>
                    <Link to="/marketplace">Verified</Link>
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
                        onClick={() => navigate('/login')}
                    >
                        <MapPin />
                    </button>
                    <button
                        className={styles.btnSecondary}
                        onClick={() => navigate('/login')}
                    >
                        <ShoppingCart />
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
