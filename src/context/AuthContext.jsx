/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const readStoredAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            if (parsed && typeof parsed === 'object') {
                return {
                    token: storedToken,
                    user: parsed,
                };
            }
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (authToken && userEmail) {
        return {
            token: authToken,
            user: {
                email: userEmail,
                role: userRole || null,
                userId: userId ? Number(userId) : null,
            },
        };
    }

    return { token: null, user: null };
};

const persistAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', user?.email || '');

    if (user?.role) {
        localStorage.setItem('userRole', String(user.role));
    } else {
        localStorage.removeItem('userRole');
    }

    if (user?.userId != null) {
        localStorage.setItem('userId', String(user.userId));
        localStorage.setItem('userIdOwnerEmail', user?.email || '');
    } else {
        localStorage.removeItem('userId');
        localStorage.removeItem('userIdOwnerEmail');
    }
};

const clearStoredAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userIdOwnerEmail');
};

export const AuthProvider = ({ children }) => {
    const [initialAuth] = useState(() => readStoredAuth());
    const [user, setUser] = useState(initialAuth.user);
    const [token, setToken] = useState(initialAuth.token);
    const [loading] = useState(false);

    const login = (authResponse) => {
        const { token: newToken, user: newUser } = authResponse;
        setToken(newToken);
        setUser(newUser);
        persistAuth(newToken, newUser);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        clearStoredAuth();
    };

    const isAuthenticated = !!token;
    const isAdmin = user?.role === 'ADMIN';
    const isSeller = user?.role === 'SELLER' || isAdmin;
    const isInspector = user?.role === 'INSPECTOR';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                isAdmin,
                isSeller,
                isInspector,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
