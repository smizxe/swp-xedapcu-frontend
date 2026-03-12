import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { checkVnPayReturn } from '../../service/paymentService';
import styles from './VnPayReturn.module.css';

export default function VnPayReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null); // { status: 'success' | 'failed', transactionId }

    useEffect(() => {
        const params = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // If we have vnp_ResponseCode, we can determine status locally too
        const responseCode = params.vnp_ResponseCode;

        if (responseCode) {
            // Also notify backend
            checkVnPayReturn(params)
                .then((data) => setResult(data))
                .catch(() => {
                    // Fallback to local check
                    setResult({
                        status: responseCode === '00' ? 'success' : 'failed',
                        transactionId: params.vnp_TxnRef || '',
                    });
                })
                .finally(() => setLoading(false));
        } else {
            setResult({ status: 'failed' });
            setLoading(false);
        }
    }, [searchParams]);

    if (loading) {
        return (
            <div>
                <Header variant="dark" />
                <div className={styles.wrapper}>
                    <Spin size="large" />
                    <p className={styles.loadingText}>Processing payment...</p>
                </div>
            </div>
        );
    }

    const isSuccess = result?.status === 'success';

    return (
        <div>
            <Header variant="dark" />
            <div className={styles.wrapper}>
                <Result
                    icon={isSuccess ? <CheckCircleOutlined className={styles.iconSuccess} /> : <CloseCircleOutlined className={styles.iconFailed} />}
                    status={isSuccess ? 'success' : 'error'}
                    title={isSuccess ? 'Deposit Successful!' : 'Payment Failed'}
                    subTitle={
                        isSuccess
                            ? `Transaction #${result.transactionId || ''} has been completed. Your wallet balance has been updated.`
                            : 'The payment was not completed. Please try again or contact support.'
                    }
                    extra={[
                        <Button
                            key="wallet"
                            type="primary"
                            className={styles.btnPrimary}
                            onClick={() => navigate('/wallet')}
                        >
                            Go to Wallet
                        </Button>,
                        <Button
                            key="home"
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </Button>,
                    ]}
                />
            </div>
        </div>
    );
}
