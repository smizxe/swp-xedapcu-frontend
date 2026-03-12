import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OAuth2Redirect() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const role = searchParams.get('role');

        if (token && email) {
            // Store authToken for service interceptors
            localStorage.setItem('authToken', token);
            localStorage.setItem('userEmail', email);

            // Save to AuthContext
            login({
                token,
                user: { email, role: role || 'BUYER' },
            });

            navigate('/', { replace: true });
        } else {
            setError('Google login failed. Missing token.');
        }
    }, [searchParams, login, navigate]);

    if (error) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column', gap: 16,
                fontFamily: 'sans-serif', background: '#f7f8f5',
            }}>
                <p style={{ color: '#e74c3c', fontWeight: 600 }}>{error}</p>
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
