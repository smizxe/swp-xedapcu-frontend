import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import authService from '../../../services/authService';
import styles from '../Login/LoginPage.module.css'; // Reuse login styles

function RegisterPage({
    onSubmit,
    onGoogleLogin,
    isLoading = false,
    externalErrors = {},
    externalSuccess = ''
}) {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.gradientBg} />
            <div className={styles.container}>
                {/* Nút Back */}
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => navigate('/')}
                >
                    <span className={styles.backIcon}>&larr;</span>
                    <span className={styles.backText}>Back</span>
                </button>

                {/* Cột bên trái: Giới thiệu */}
                <div className={styles.leftPane}>
                    <div className={styles.brand}>CycleTrust</div>
                    <h1 className={styles.title}>Join Us Today</h1>
                    <p className={styles.subtitle}>
                        Create an account to start buying, selling, and verifying quality bicycles with confidence.
                    </p>
                </div>

                {/* Card Đăng ký */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Sign Up</h2>
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className={styles.link}>
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handleFormSubmit}>
                        {externalSuccess && <div className={styles.successMessage}>{externalSuccess}</div>}
                        {externalErrors.general && <div className={styles.errorMessage}>{externalErrors.general}</div>}

                        <div className={styles.inputGroup}>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder=" "
                                className={styles.input}
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="fullName" className={styles.label}>Full Name</label>
                        </div>

                        {/* Input Email */}
                        <div className={styles.inputGroup}>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder=" "
                                className={styles.input}
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="email" className={styles.label}>Email</label>
                        </div>

                        {/* Input Phone */}
                        <div className={styles.inputGroup}>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder=" "
                                className={styles.input}
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="phone" className={styles.label}>Phone (optional)</label>
                        </div>

                        {/* Input Password */}
                        <div className={styles.inputGroup}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder=" "
                                className={`${styles.input} ${styles.passwordInput}`}
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </button>
                        </div>

                        {/* Nút Submit */}
                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;