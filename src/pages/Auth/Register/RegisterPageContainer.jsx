import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { registerUser } from '../../../service/authService';

const getRegisterErrorMessage = (error) => {
    const responseData = error?.response?.data;
    const rawMessage = typeof responseData === 'string'
        ? responseData
        : responseData?.message || error?.message || '';
    const message = String(rawMessage).trim();
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('already') || normalizedMessage.includes('exist') || normalizedMessage.includes('duplicate')) {
        return 'Email này đã được đăng ký.';
    }

    if (normalizedMessage.includes('password')) {
        return message || 'Mật khẩu không hợp lệ.';
    }

    if (error?.code === 'ERR_NETWORK') {
        return 'Không thể kết nối tới backend. Hãy kiểm tra server đang chạy.';
    }

    return message || 'Đăng ký thất bại. Vui lòng thử lại.';
};

function RegisterPageContainer() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        if (!formData.email || !formData.password || !formData.fullName) {
            setErrors({ general: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrors({ general: 'Mật khẩu xác nhận không khớp.' });
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setErrors({ general: 'Mật khẩu phải có ít nhất 6 ký tự.' });
            setIsLoading(false);
            return;
        }

        try {
            await registerUser(formData);
            setSuccessMessage('Tạo tài khoản thành công. Đang chuyển sang trang đăng nhập...');

            window.setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setErrors({
                general: getRegisterErrorMessage(error),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
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
