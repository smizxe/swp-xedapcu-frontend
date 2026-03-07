import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { registerUser } from '../../../service/authService';

function RegisterPageContainer() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        // Client-side validations
        if (!formData.email || !formData.password || !formData.fullName) {
            setErrors({ general: 'Please fill in all required fields.' });
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors({ general: 'Passwords do not match.' });
            setIsLoading(false);
            return;
        }

        try {
            console.log('📝 Form data being submitted:', { email: formData.email, password: '***' });

            const response = await registerUser(formData);

            console.log('✅ Registration response:', response);
            setSuccessMessage('Account created successfully! Redirecting to login...');

            // Navigate to login page after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('❌ Registration handler error:', error);
            setErrors({
                general: error.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google OAuth registration
        console.log('Google registration clicked');
    };

    return (
        <RegisterPage
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
            isLoading={isLoading}
            externalErrors={errors}
            externalSuccess={successMessage}
        />
    );
}

export default RegisterPageContainer;
