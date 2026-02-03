import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from './RegisterPage.module.css';

function RegisterPageUI({
    onRegister,
    onGoogleLogin,
    onBack,
    isLoading = false,
    externalErrors = {},
    externalSuccess = ''
}) {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // State nội bộ cho form để người dùng nhập liệu mượt mà
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

    const handleGoBack = () => {
        navigate('/');
    };

    const handleGoToSignIn = () => {
        navigate('/login');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (onRegister) onRegister(formData);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.gradientBg} />
            <div className={styles.container}>
                {/* Nút Back */}
                <button type="button" className={styles.backButton} onClick={handleGoBack}>
                    <span className={styles.backText}>&larr; Back</span>
                </button>

                {/* Cột bên trái: Giới thiệu */}
                <div className={styles.leftPane}>
                    <div className={styles.brand}>EkibDlo</div>
                    <h1 className={styles.title}>Create New Account</h1>
                    <p className={styles.subtitle}>
                        Join the trusted marketplace for pre-owned bicycles. Buy, sell, and verify with confidence.
                    </p>
                </div>

                {/* Card Đăng ký */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Sign Up</h2>
                        <p>
                            Already have an account?{' '}
                            <span className={styles.link} onClick={handleGoToSignIn}>Sign in</span>
                        </p>
                    </div>

                    <form className={styles.form} onSubmit={handleFormSubmit}>
                        {externalSuccess && <div className={styles.successMessage}>{externalSuccess}</div>}
                        {externalErrors.general && <div className={styles.errorMessage}>{externalErrors.general}</div>}

                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <input
                                    name="firstName"
                                    type="text"
                                    placeholder=" "
                                    className={`${styles.input} ${externalErrors.firstName ? styles.inputError : ''}`}
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <label className={styles.label}>First Name</label>
                            </div>
                            <div className={styles.inputGroup}>
                                <input
                                    name="lastName"
                                    type="text"
                                    placeholder=" "
                                    className={`${styles.input} ${externalErrors.lastName ? styles.inputError : ''}`}
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <label className={styles.label}>Last Name</label>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                name="email"
                                type="email"
                                placeholder=" "
                                className={`${styles.input} ${externalErrors.email ? styles.inputError : ''}`}
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label className={styles.label}>Email Address</label>
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder=" "
                                className={`${styles.input} ${styles.passwordInput} ${externalErrors.password ? styles.inputError : ''}`}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label className={styles.label}>Password</label>
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </button>
                        </div>

                        <div className={styles.inputGroup}>
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder=" "
                                className={`${styles.input} ${styles.passwordInput} ${externalErrors.confirmPassword ? styles.inputError : ''}`}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label className={styles.label}>Confirm Password</label>
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </button>
                        </div>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                className={styles.checkbox}
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                required
                            />
                            <span>I agree to the terms and conditions</span>
                        </label>

                        <button type="submit" className={styles.submitButton} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className={styles.divider}><span>or</span></div>

                        <button type="button" className={styles.socialButton} onClick={onGoogleLogin}>
                            <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPageUI;