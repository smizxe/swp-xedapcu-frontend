import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { MessageCircleQuestionMark } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { User } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import LogoImg from '../../assets/HomePage/Logo_ekibdlo2.png';
import { isAuthenticated, getCurrentUser, logoutUser } from '../../service/authService';

const Header = ({ variant = 'light' }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Check authentication status on mount and when storage changes
    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            const user = getCurrentUser();

            console.log('🔍 Header Auth Check:', {
                isAuthenticated: authenticated,
                userEmail: user ? user.email : 'N/A', // Handle case where user might be null
                userToken: user && user.token ? 'Present' : 'Not present'
            });

            setIsLoggedIn(authenticated);
            if (authenticated) {
                setUserEmail(user.email);
            } else {
                setUserEmail(''); // Clear email if not authenticated
            }
        };

        checkAuth();

        // Listen for storage changes (e.g., login/logout in another tab)
        window.addEventListener('storage', checkAuth);

        // Listen for custom login event
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

    // Determine which CSS classes to use based on variant
    const navbarClass = variant === 'dark' ? `${styles.navbar} ${styles.navbarDark}` : styles.navbar;

    return (
        <nav className={navbarClass}>
            <div className={styles.navContainer}>
                {/* Logo - Click để về Home */}
                <Link to="/" className={styles.logo}>
                    <img src={LogoImg} alt="EkibDlo Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>EkibDlo</span>
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
                        <ShoppingCart />
                    </button>

                    {/* User Icon/Username with Dropdown */}
                    <div className={styles.userDropdownContainer}>
                        {isLoggedIn ? (
                            // Show "Hi! Username" when logged in
                            <div className={styles.userGreeting}>
                                <span className={styles.userGreetingText}>
                                    Hi! {userEmail.split('@')[0]}
                                </span>
                            </div>
                        ) : (
                            // Show User icon when not logged in
                            <button
                                className={styles.btnSecondary}
                                onClick={handleUserIconClick}
                            >
                                <User />
                            </button>
                        )}

                        {/* Dropdown - Only show if logged in */}
                        {isLoggedIn && (
                            <div className={styles.userDropdown}>
                                <div className={styles.dropdownHeader}>
                                    <p className={styles.greeting}>{userEmail}</p>
                                </div>
                                <div className={styles.dropdownDivider}></div>
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => navigate('/profile')}
                                >
                                    My Profile
                                </button>
                                <button
                                    className={styles.dropdownItem}
                                    onClick={() => navigate('/orders')}
                                >
                                    My Orders
                                </button>
                                <div className={styles.dropdownDivider}></div>
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
