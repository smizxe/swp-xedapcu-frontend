import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Empty } from 'antd';
import {
    ShoppingOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getMyOrders, cancelDeposit, completeOrder } from '../../service/orderService';
import styles from './MyOrdersPage.module.css';

const STATUS_COLOR = {
    DEPOSITED: 'processing',
    DELIVERY_SCHEDULED: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'default',
};

const formatPrice = (v) => (v != null ? v.toLocaleString('vi-VN') : '—');

function MyOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = () => {
        setLoading(true);
        getMyOrders()
            .then(setOrders)
            .catch(() => message.error('Failed to load orders.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleCancel = async (orderId) => {
        try {
            await cancelDeposit(orderId);
            message.success('Deposit cancelled.');
            fetchOrders();
        } catch (err) {
            message.error(err.response?.data || 'Cancel failed.');
        }
    };

    const handleComplete = async (orderId) => {
        try {
            await completeOrder(orderId);
            message.success('Order completed!');
            fetchOrders();
        } catch (err) {
            message.error(err.response?.data || 'Complete failed.');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <h1 className={styles.pageTitle}>
                    <ShoppingOutlined /> My Orders
                </h1>
                <p className={styles.pageSubtitle}>Track and manage your purchases.</p>

                {loading ? (
                    <div className={styles.loadingWrapper}><Spin size="large" /></div>
                ) : orders.length === 0 ? (
                    <Empty description="You haven't placed any orders yet." />
                ) : (
                    <div className={styles.orderList}>
                        {orders.map((order) => (
                            <div key={order.orderId} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>Order #{order.orderId}</span>
                                    <Tag color={STATUS_COLOR[order.status] || 'default'}>
                                        {order.status}
                                    </Tag>
                                </div>

                                <div className={styles.orderBody}>
                                    <p className={styles.postTitle}>{order.postTitle || order.post?.title || 'Untitled'}</p>
                                    <div className={styles.priceRow}>
                                        <span>Deposit: <strong>{formatPrice(order.depositAmount)} VND</strong></span>
                                        <span>Total: <strong>{formatPrice(order.totalAmount)} VND</strong></span>
                                    </div>
                                    {order.createdAt && (
                                        <p className={styles.dateMeta}>
                                            Placed on {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    )}
                                </div>

                                <div className={styles.orderActions}>
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate(`/orders/${order.orderId}`)}
                                    >
                                        Details
                                    </Button>
                                    {order.status === 'DEPOSITED' && (
                                        <Button
                                            danger
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => handleCancel(order.orderId)}
                                        >
                                            Cancel Deposit
                                        </Button>
                                    )}
                                    {order.status === 'DELIVERY_SCHEDULED' && (
                                        <Button
                                            type="primary"
                                            icon={<CheckCircleOutlined />}
                                            className={styles.btnComplete}
                                            onClick={() => handleComplete(order.orderId)}
                                        >
                                            Confirm Received
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyOrdersPage;
