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
