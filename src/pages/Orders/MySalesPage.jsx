import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Empty, Modal, DatePicker, Input } from 'antd';
import {
    ShopOutlined,
    EyeOutlined,
    CarOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getMySales, scheduleDelivery } from '../../service/orderService';
import styles from './MySalesPage.module.css';

const STATUS_COLOR = {
    DEPOSITED: 'processing',
    DELIVERY_SCHEDULED: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'default',
};

const formatPrice = (v) => (v != null ? v.toLocaleString('vi-VN') : '—');

function MySalesPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveryModal, setDeliveryModal] = useState({ open: false, orderId: null });
    const [deliveryForm, setDeliveryForm] = useState({ deliveryAddress: '', deliveryTime: null });

    const fetchSales = () => {
        setLoading(true);
        getMySales()
            .then(setOrders)
            .catch(() => message.error('Failed to load sales.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSales(); }, []);

    const openDeliveryModal = (orderId) => {
        setDeliveryModal({ open: true, orderId });
        setDeliveryForm({ deliveryAddress: '', deliveryTime: null });
    };

    const handleSchedule = async () => {
        if (!deliveryForm.deliveryAddress || !deliveryForm.deliveryTime) {
            message.warning('Please fill in all delivery details.');
            return;
        }
        try {
            await scheduleDelivery(deliveryModal.orderId, {
                deliveryAddress: deliveryForm.deliveryAddress,
                deliveryTime: deliveryForm.deliveryTime,
            });
            message.success('Delivery scheduled!');
            setDeliveryModal({ open: false, orderId: null });
            fetchSales();
        } catch (err) {
            message.error(err.response?.data || 'Failed to schedule delivery.');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <h1 className={styles.pageTitle}>
                    <ShopOutlined /> My Sales
                </h1>
                <p className={styles.pageSubtitle}>Manage orders from buyers.</p>

                {loading ? (
                    <div className={styles.loadingWrapper}><Spin size="large" /></div>
                ) : orders.length === 0 ? (
                    <Empty description="No sales yet." />
                ) : (
                    <div className={styles.orderList}>
                        {orders.map((order) => (
                            <div key={order.orderId} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <span className={styles.orderId}>Sale #{order.orderId}</span>
                                    <Tag color={STATUS_COLOR[order.status] || 'default'}>
                                        {order.status}
                                    </Tag>
                                </div>

                                <div className={styles.orderBody}>
                                    <p className={styles.postTitle}>{order.postTitle || order.post?.title || 'Untitled'}</p>
                                    <p className={styles.buyerInfo}>
                                        Buyer: {order.buyer?.fullName || order.buyer?.email || 'Unknown'}
                                    </p>
                                    <div className={styles.priceRow}>
                                        <span>Deposit: <strong>{formatPrice(order.depositAmount)} VND</strong></span>
                                        <span>Total: <strong>{formatPrice(order.totalAmount)} VND</strong></span>
                                    </div>
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
                                            type="primary"
                                            icon={<CarOutlined />}
                                            className={styles.btnSchedule}
                                            onClick={() => openDeliveryModal(order.orderId)}
                                        >
                                            Schedule Delivery
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                title="Schedule Delivery"
                open={deliveryModal.open}
                onOk={handleSchedule}
                onCancel={() => setDeliveryModal({ open: false, orderId: null })}
                okText="Confirm"
                okButtonProps={{ className: styles.btnSchedule }}
            >
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Address</label>
                    <Input
                        placeholder="Enter delivery address"
                        value={deliveryForm.deliveryAddress}
                        onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryAddress: e.target.value })}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Date & Time</label>
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        onChange={(_, dateStr) => setDeliveryForm({ ...deliveryForm, deliveryTime: dateStr })}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default MySalesPage;
