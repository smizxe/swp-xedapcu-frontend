import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { checkVnPayReturn } from '../../service/paymentService';
import styles from './VnPayReturn.module.css';

export default function VnPayReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const params = useMemo(() => {
        const nextParams = {};
        searchParams.forEach((value, key) => {
            nextParams[key] = value;
        });
        return nextParams;
    }, [searchParams]);

    const initialResult = useMemo(() => {
        const status = params.status;
        const transactionId = params.transactionId || params.vnp_TxnRef || '';
        const error = params.error || '';
        const responseCode = params.responseCode || params.vnp_ResponseCode || '';

        if (status) {
            return {
                status,
                transactionId,
                responseCode,
                error,
            };
        }

        if (!params.vnp_ResponseCode) {
            return {
                status: 'failed',
                transactionId,
                responseCode,
                error,
            };
        }

        return null;
    }, [params]);

    const [loading, setLoading] = useState(() => !initialResult);
    const [result, setResult] = useState(initialResult);

    useEffect(() => {
        if (initialResult) {
            return;
        }

        const transactionId = params.transactionId || params.vnp_TxnRef || '';
        const responseCode = params.vnp_ResponseCode;

        checkVnPayReturn(params)
            .then((data) => {
                setResult({
                    status: data?.status || (responseCode === '00' ? 'success' : 'failed'),
                    transactionId: data?.transactionId || transactionId,
                    responseCode,
                    error: '',
                });
            })
            .catch(() => {
                setResult({
                    status: responseCode === '00' ? 'success' : 'failed',
                    transactionId,
                    responseCode,
                    error: '',
                });
            })
            .finally(() => setLoading(false));
    }, [initialResult, params]);

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
    const subtitle = isSuccess
        ? `Transaction #${result?.transactionId || ''} has been completed. Your wallet balance has been updated.`
        : result?.error
            ? decodeURIComponent(result.error)
            : 'The payment was not completed. Please try again or contact support.';

    return (
        <div>
            <Header variant="dark" />
            <div className={styles.wrapper}>
                <Result
                    icon={isSuccess ? <CheckCircleOutlined className={styles.iconSuccess} /> : <CloseCircleOutlined className={styles.iconFailed} />}
                    status={isSuccess ? 'success' : 'error'}
                    title={isSuccess ? 'Deposit Successful!' : 'Payment Failed'}
                    subTitle={subtitle}
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
