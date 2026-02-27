import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import { loginUser } from '../../../service/authService';

function LoginContainer() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async ({ email, password }) => {
        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await loginUser(email, password);

            console.log('Login successful:', response);
            setSuccessMessage('Login successful! Redirecting...');

            // Dispatch custom event to notify Header component
            window.dispatchEvent(new Event('userLoggedIn'));

            // Redirect to HomePage after successful login
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error('Login failed:', error);
            setErrors({
                general: error.message || 'Invalid email or password. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth login
        console.log('Google login clicked');
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <LoginPage
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
            onForgotPassword={handleForgotPassword}
            isLoading={isLoading}
            externalErrors={errors}
            externalSuccess={successMessage}
        />
    );
}

export default LoginContainer;