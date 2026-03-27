import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import styles from '../Login/LoginPage.module.css'; // Reuse login styles

function RegisterPage({
    onSubmit,
    isLoading = false,
    externalErrors = {},
    externalSuccess = ''
}) {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        role: 'BUYER',
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit) await onSubmit(formData);
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
                            <label htmlFor="phone" className={styles.label}>Phone</label>
                        </div>

                        {/* Role Selection */}
                        <div className={styles.inputGroup} style={{ flexDirection: 'column', gap: '10px' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #9ca3af)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>I am a...</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: formData.role === 'BUYER' ? '2px solid #10b981' : '1.5px solid rgba(255,255,255,0.12)', background: formData.role === 'BUYER' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="BUYER"
                                        checked={formData.role === 'BUYER'}
                                        onChange={handleChange}
                                        style={{ accentColor: '#10b981', width: 16, height: 16 }}
                                    />
                                    <span style={{ fontWeight: 600, color: formData.role === 'BUYER' ? '#10b981' : 'inherit', fontSize: '0.95rem' }}>Buyer</span>
                                </label>
                                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: formData.role === 'SELLER' ? '2px solid #10b981' : '1.5px solid rgba(255,255,255,0.12)', background: formData.role === 'SELLER' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="SELLER"
                                        checked={formData.role === 'SELLER'}
                                        onChange={handleChange}
                                        style={{ accentColor: '#10b981', width: 16, height: 16 }}
                                    />
                                    <span style={{ fontWeight: 600, color: formData.role === 'SELLER' ? '#10b981' : 'inherit', fontSize: '0.95rem' }}>Seller</span>
                                </label>
                            </div>
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

                        {/* Confirm Password */}
                        <div className={styles.inputGroup}>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder=" "
                                className={`${styles.input} ${styles.passwordInput}`}
                                required
                                minLength={6}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
