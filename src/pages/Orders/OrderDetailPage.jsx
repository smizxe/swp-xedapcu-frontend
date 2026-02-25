import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getOrderById } from '../../service/orderService';
import styles from './OrderDetailPage.module.css';

const STATUS_COLOR = {
    DEPOSITED: 'processing',
    DELIVERY_SCHEDULED: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'default',
};

const formatPrice = (v) => (v != null ? v.toLocaleString('vi-VN') : '—');

function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getOrderById(orderId)
            .then(setOrder)
            .catch(() => message.error('Failed to load order details.'))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <Header variant="dark" />
                <div className={styles.loadingWrapper}><Spin size="large" /></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.pageWrapper}>
                <Header variant="dark" />
                <div className={styles.errorWrapper}>
                    <p>Order not found.</p>
                    <Button onClick={() => navigate('/my-orders')}>Back to Orders</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <Button
                    className={styles.btnBack}
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>

                <div className={styles.headerRow}>
                    <h1 className={styles.pageTitle}>Order #{order.orderId}</h1>
                    <Tag color={STATUS_COLOR[order.status] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                        {order.status}
                    </Tag>
                </div>

                <div className={styles.card}>
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
                        <Descriptions.Item label="Post">{order.postTitle || order.post?.title || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Post Price">{formatPrice(order.post?.price)} VND</Descriptions.Item>
                        <Descriptions.Item label="Deposit Amount">{formatPrice(order.depositAmount)} VND</Descriptions.Item>
                        <Descriptions.Item label="Total Amount">{formatPrice(order.totalAmount)} VND</Descriptions.Item>
                        <Descriptions.Item label="Remaining">{formatPrice(order.remainingAmount)} VND</Descriptions.Item>
                        <Descriptions.Item label="Created">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}</Descriptions.Item>
                        {order.expiresAt && (
                            <Descriptions.Item label="Expires">{new Date(order.expiresAt).toLocaleString('vi-VN')}</Descriptions.Item>
                        )}
                    </Descriptions>
                </div>

                {/* Buyer Info */}
                {order.buyer && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Buyer</h3>
                        <p>{order.buyer.fullName || 'Unknown'}</p>
                        <p className={styles.metaText}>{order.buyer.email}</p>
                    </div>
                )}

                {/* Seller Info */}
                {order.seller && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Seller</h3>
                        <p>{order.seller.fullName || 'Unknown'}</p>
                        <p className={styles.metaText}>{order.seller.email}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetailPage;
