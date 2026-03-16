import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Empty, Modal, DatePicker, Input } from 'antd';
import { ShopOutlined, EyeOutlined, CarOutlined, WarningOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getMySales, scheduleDelivery, reportBuyerNoShow } from '../../service/orderService';
import styles from './MySalesPage.module.css';

// antd DatePicker showTime returns "YYYY-MM-DD HH:mm:ss", backend needs ISO "YYYY-MM-DDTHH:mm:ss"
const toIsoDateTime = (str) => (str ? str.replace(' ', 'T') : str);

const STATUS_COLOR = {
    PENDING: 'processing',
    DEPOSIT_PAID: 'processing',
    IN_DELIVERY: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'default',
    REFUNDED: 'default',
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

    const openDeliveryModal = (order) => {
        setDeliveryModal({ open: true, orderId: order.orderId });
        setDeliveryForm({ deliveryAddress: order.deliveryAddress || '', deliveryTime: null });
    };

    const handleReportBuyerNoShow = async (orderId) => {
        try {
            await reportBuyerNoShow(orderId);
            message.success('Buyer no-show reported. Deposit transferred.');
            fetchSales();
        } catch (err) {
            message.error(err.response?.data || 'Failed to report buyer no-show.');
        }
    };

    const handleSchedule = async () => {
        if (!deliveryForm.deliveryAddress || !deliveryForm.deliveryTime) {
            message.warning('Please fill in all delivery details.');
            return;
        }
        try {
            await scheduleDelivery(deliveryModal.orderId, {
                deliveryAddress: deliveryForm.deliveryAddress,
                deliveryTime: toIsoDateTime(deliveryForm.deliveryTime),
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
                                    {order.status === 'PENDING' && (
                                        <Tag color="warning" style={{ marginLeft: 4 }}>
                                            Awaiting Buyer Payment
                                        </Tag>
                                    )}
                                    {order.status === 'DEPOSIT_PAID' && (
                                        <Button
                                            type="primary"
                                            icon={<CarOutlined />}
                                            className={styles.btnSchedule}
                                            onClick={() => openDeliveryModal(order)}
                                        >
                                            Schedule Delivery
                                        </Button>
                                    )}
                                    {order.status === 'IN_DELIVERY' && (
                                        <Button
                                            danger
                                            icon={<WarningOutlined />}
                                            onClick={() => handleReportBuyerNoShow(order.orderId)}
                                        >
                                            Buyer No-Show
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
                        onChange={(e) => setDeliveryForm((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Date & Time</label>
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        onChange={(_, dateStr) => setDeliveryForm((prev) => ({
                            ...prev,
                            deliveryTime: Array.isArray(dateStr) ? dateStr[0] : dateStr,
                        }))}
                    />
                </div>
            </Modal>

        </div>
    );
}

export default MySalesPage;
