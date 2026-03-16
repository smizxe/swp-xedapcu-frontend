import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Descriptions, Modal, DatePicker, Input } from 'antd';
import {
    ArrowLeftOutlined,
    ScheduleOutlined,
    CarOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { getOrderById, cancelDeposit, completeOrder, scheduleDelivery, reportBuyerNoShow, reportSellerNoShow } from '../../service/orderService';
import InspectionBookingModal from './InspectionBookingModal';
import styles from './OrderDetailPage.module.css';

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

function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking inspection modal
    const [bookingOpen, setBookingOpen] = useState(false);

    // Delivery modal
    const [deliveryOpen, setDeliveryOpen] = useState(false);
    const [deliveryForm, setDeliveryForm] = useState({ deliveryAddress: '', deliveryTime: null });

    const fetchOrder = () => {
        setLoading(true);
        getOrderById(orderId)
            .then(setOrder)
            .catch(() => message.error('Failed to load order details.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrder(); }, [orderId]);

    const isSeller = user && order?.seller && user.email === order.seller.email;
    const isBuyer = user && order?.buyer && user.email === order.buyer.email;

    const handleCancel = async () => {
        try {
            await cancelDeposit(orderId);
            message.success('Deposit cancelled.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Cancel failed.');
        }
    };

    const handleComplete = async () => {
        try {
            await completeOrder(orderId);
            message.success('Order completed!');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Complete failed.');
        }
    };

    const handleReportBuyerNoShow = async () => {
        try {
            await reportBuyerNoShow(orderId);
            message.success('Buyer no-show reported. Deposit transferred.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to report buyer no-show.');
        }
    };

    const handleReportSellerNoShow = async () => {
        try {
            await reportSellerNoShow(orderId);
            message.success('Seller no-show reported. Deposit refunded.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to report seller no-show.');
        }
    };

    const handleScheduleDelivery = async () => {
        if (!deliveryForm.deliveryAddress || !deliveryForm.deliveryTime) {
            message.warning('Please fill in all delivery details.');
            return;
        }
        try {
            await scheduleDelivery(orderId, {
                deliveryAddress: deliveryForm.deliveryAddress,
                deliveryTime: deliveryForm.deliveryTime,
            });
            message.success('Delivery scheduled!');
            setDeliveryOpen(false);
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to schedule delivery.');
        }
    };

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

                {/* Action Buttons */}
                {order.status === 'PENDING' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Actions</h3>
                        <Tag color="warning">Awaiting deposit payment from buyer</Tag>
                    </div>
                )}

                {order.status === 'DEPOSIT_PAID' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Actions</h3>
                        <div className={styles.actionRow}>
                            {isSeller && (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<ScheduleOutlined />}
                                        className={styles.btnPrimary}
                                        onClick={() => setBookingOpen(true)}
                                    >
                                        Book Inspection
                                    </Button>
                                    <Button
                                        icon={<CarOutlined />}
                                        onClick={() => {
                                            setDeliveryForm({ deliveryAddress: '', deliveryTime: null });
                                            setDeliveryOpen(true);
                                        }}
                                    >
                                        Schedule Delivery
                                    </Button>
                                </>
                            )}
                            {isBuyer && (
                                <Button
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={handleCancel}
                                >
                                    Cancel Deposit
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {order.status === 'IN_DELIVERY' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Actions</h3>
                        <div className={styles.actionRow}>
                            {isBuyer && (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        className={styles.btnPrimary}
                                        onClick={handleComplete}
                                    >
                                        Confirm Received
                                    </Button>
                                    <Button
                                        danger
                                        icon={<WarningOutlined />}
                                        onClick={handleReportSellerNoShow}
                                    >
                                        Report Seller No-Show
                                    </Button>
                                </>
                            )}
                            {isSeller && (
                                <Button
                                    danger
                                    icon={<WarningOutlined />}
                                    onClick={handleReportBuyerNoShow}
                                >
                                    Report Buyer No-Show
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Schedule Delivery Modal */}
            <Modal
                title="Schedule Delivery"
                open={deliveryOpen}
                onOk={handleScheduleDelivery}
                onCancel={() => setDeliveryOpen(false)}
                okText="Confirm"
                okButtonProps={{ className: styles.btnPrimary }}
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
                            deliveryTime: toIsoDateTime(Array.isArray(dateStr) ? dateStr[0] : dateStr),
                        }))}
                    />
                </div>
            </Modal>

            {/* Inspection Booking Modal */}
            <InspectionBookingModal
                open={bookingOpen}
                postId={order.postId || order.post?.postId}
                onClose={() => setBookingOpen(false)}
                onSuccess={() => {
                    setBookingOpen(false);
                    message.success('Inspection booked! Waiting for inspector assignment.');
                    fetchOrder();
                }}
            />
        </div>
    );
}

export default OrderDetailPage;
