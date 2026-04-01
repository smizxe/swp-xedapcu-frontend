import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const normalizeRole = (role) => String(role || '').replace(/^ROLE_/, '').toUpperCase();

const getPostLoginPath = (role) => {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === 'ADMIN') {
        return '/admin';
    }

    if (normalizedRole === 'INSPECTOR') {
        return '/inspector';
    }

    return '/';
};

export default function OAuth2Redirect() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const hasOAuthError = !token || !email;
    const errorParam = searchParams.get('error');
    // Lỗi từ OAuth2FailureHandler: ?error=<encoded message>
    const hasOAuthFailure = !!errorParam && !token;

    useEffect(() => {
        if (hasOAuthError) {
            return;
        }

        // Store authToken for service interceptors
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        if (role) {
            localStorage.setItem('userRole', role);
        }
        if (userId) {
            localStorage.setItem('userId', userId);
            localStorage.setItem('userIdOwnerEmail', email);
        } else {
            localStorage.removeItem('userId');
            localStorage.removeItem('userIdOwnerEmail');
        }

        // Save to AuthContext
        login({
            token,
            user: { email, role: role || 'BUYER', userId },
        });

        navigate(getPostLoginPath(role), { replace: true });
    }, [email, hasOAuthError, login, navigate, role, token, userId]);

    // Bị banned hoặc lỗi từ OAuth2FailureHandler
    if (hasOAuthFailure) {
        const isBanned = (errorParam || '').toLowerCase().includes('deactivated') ||
            (errorParam || '').toLowerCase().includes('disabled') ||
            (errorParam || '').toLowerCase().includes('banned');
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column', gap: 20,
                fontFamily: 'sans-serif', background: '#fff5f5',
            }}>
                <div style={{
                    background: '#fff1f0', border: '1px solid #ffa39e',
                    borderRadius: 12, padding: '32px 40px', textAlign: 'center',
                    maxWidth: 460,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>{isBanned ? '🚫' : '⚠️'}</div>
                    <h2 style={{ color: '#cf1322', margin: '0 0 8px' }}>
                        {isBanned ? 'Tài khoản bị khoá' : 'Đăng nhập thất bại'}
                    </h2>
                    <p style={{ color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
                        {isBanned
                            ? 'Tài khoản Google của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'
                            : decodeURIComponent(errorParam || 'Đã có lỗi xảy ra. Vui lòng thử lại.')}
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: '#cf1322', color: '#fff', fontWeight: 600,
                            cursor: 'pointer', fontSize: 14,
                        }}
                    >
                        Quay lại trang đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    if (hasOAuthError) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column', gap: 16,
                fontFamily: 'sans-serif', background: '#f7f8f5',
            }}>
                <p style={{ color: '#e74c3c', fontWeight: 600 }}>Google login failed. Missing token.</p>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        background: '#2D5A27', color: '#fff', fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'sans-serif', background: '#f7f8f5',
        }}>
            <p style={{ color: '#666' }}>Signing you in...</p>
        </div>
    );
}
