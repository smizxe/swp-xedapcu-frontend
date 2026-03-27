import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Spin, Button, Tag, message, Empty, Modal, DatePicker, Select, Input } from 'antd';
import { ShopOutlined, EyeOutlined, CarOutlined, WarningOutlined, CloseCircleOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getMySales, scheduleDelivery, sellerConfirmDelivery, cancelBySeller, getSavedOrderDeliveryAddress } from '../../service/orderService';
import styles from './MySalesPage.module.css';

// Returns the minimum start hour available for a given delivery date
const DELIVERY_LAST_HOUR = 20;
const DELIVERY_START_HOUR = 7;
const padH = (h) => `${String(h).padStart(2, '0')}:00`;

const getMinStartHour = (dateStr) => {
    if (!dateStr) return DELIVERY_START_HOUR;
    const today = dayjs().format('YYYY-MM-DD');
    if (dateStr !== today) return DELIVERY_START_HOUR;
    return Math.max(DELIVERY_START_HOUR, dayjs().hour() + 1);
};

const getStartTimeOptions = (dateStr) => {
    const minH = getMinStartHour(dateStr);
    const options = [];
    for (let h = minH; h <= DELIVERY_LAST_HOUR; h++) {
        options.push({ value: padH(h), label: padH(h) });
    }
    return options;
};

const toIsoDateTime = (dateStr, startTime) => {
    if (!dateStr || !startTime) return null;
    return `${dateStr}T${startTime}:00`;
};

const STATUS_COLOR = {
    PENDING: 'processing',
    DEPOSIT_PAID: 'processing',
    PENDING_SELLER_CONFIRMATION: 'gold',
    PENDING_ADMIN_REVIEW: 'gold',
    ASSIGNED_TO_INSPECTOR: 'cyan',
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
    const [deliveryForm, setDeliveryForm] = useState({ deliveryAddress: '', deliveryDate: null, startTime: null, endTime: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');
    const fetchSales = useCallback(() => {
        setLoading(true);
        getMySales()
            .then(setOrders)
            .catch(() => message.error('Failed to load sales.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            fetchSales();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [fetchSales]);

    const getOrderDeliveryAddress = (order) =>
        order?.deliveryAddress
        || order?.deliverySession?.location
        || getSavedOrderDeliveryAddress(order?.orderId)
        || '';

    const openDeliveryModal = (order) => {
        setDeliveryModal({ open: true, orderId: order.orderId });
        setDeliveryForm({
            deliveryAddress: getOrderDeliveryAddress(order),
            deliveryDate: null,
            startTime: null,
            endTime: null,
        });
    };

    const startTimeOptions = useMemo(
        () => getStartTimeOptions(deliveryForm.deliveryDate),
        [deliveryForm.deliveryDate]
    );



    const handleSellerCancel = (orderId) => {
        Modal.confirm({
            title: 'Cancel this sale?',
            content: 'Buyer will be refunded and your account will receive a violation record.',
            okText: 'Cancel Sale',
            okButtonProps: { danger: true },
            cancelText: 'Keep Sale',
            onOk: async () => {
                try {
                    await cancelBySeller(orderId);
                    message.success('Sale cancelled. Buyer refunded and violation recorded.');
                    fetchSales();
                } catch (err) {
                    message.error(err.response?.data || 'Failed to cancel sale.');
                }
            },
        });
    };

    const handleSchedule = async () => {
        if (!deliveryForm.deliveryAddress || !deliveryForm.deliveryDate || !deliveryForm.startTime) {
            message.warning('Please fill in all delivery details.');
            return;
        }
        try {
            await scheduleDelivery(deliveryModal.orderId, {
                deliveryAddress: deliveryForm.deliveryAddress,
                deliveryTime: toIsoDateTime(deliveryForm.deliveryDate, deliveryForm.startTime),
            });
            message.success('Delivery scheduled!');
            setDeliveryModal({ open: false, orderId: null });
            fetchSales();
        } catch (err) {
            message.error(err.response?.data || 'Failed to schedule delivery.');
        }
    };

    const handleSellerConfirm = async (orderId) => {
        try {
            await sellerConfirmDelivery(orderId);
            message.success('Delivery confirmed. Waiting for admin to assign an inspector.');
            fetchSales();
        } catch (err) {
            message.error(err.response?.data || 'Failed to confirm delivery.');
        }
    };

    const filteredSales = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = orders.filter((order) => {
            const orderAddress = getOrderDeliveryAddress(order);
            const matchesSearch = !normalizedSearch || [
                `sale #${order.orderId}`,
                order.postTitle,
                order.post?.title,
                order.buyer?.fullName,
                order.buyer?.email,
                orderAddress,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedSearch));

            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        return [...filtered].sort((a, b) => {
            const left = new Date(a.createdAt || 0).getTime();
            const right = new Date(b.createdAt || 0).getTime();
            return sortOrder === 'OLDEST' ? left - right : right - left;
        });
    }, [orders, searchTerm, statusFilter, sortOrder]);

    const saleStatuses = Array.from(new Set(orders.map((order) => order.status).filter(Boolean)));

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <h1 className={styles.pageTitle}>
                    <ShopOutlined /> My Sales
                </h1>
                <p className={styles.pageSubtitle}>Manage orders from buyers.</p>

                {!loading && orders.length > 0 && (
                    <div className={styles.toolbar}>
                        <Input
                            className={styles.searchInput}
                            placeholder="Search by sale id, post, buyer, address..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            allowClear
                        />
                        <Select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                ...saleStatuses.map((status) => ({ value: status, label: status })),
                            ]}
                        />
                        <Select
                            className={styles.filterSelect}
                            value={sortOrder}
                            onChange={setSortOrder}
                            options={[
                                { value: 'NEWEST', label: 'Newest First' },
                                { value: 'OLDEST', label: 'Oldest First' },
                            ]}
                        />
                    </div>
                )}

                {loading ? (
                    <div className={styles.loadingWrapper}><Spin size="large" /></div>
                ) : orders.length === 0 ? (
                    <Empty description="No sales yet." />
                ) : filteredSales.length === 0 ? (
                    <Empty description="No sales match your current filters." />
                ) : (
                    <div className={styles.orderList}>
                        {filteredSales.map((order) => (
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
                                    {getOrderDeliveryAddress(order) && (
                                        <p className={styles.metaLine}>
                                            Delivery Address: {getOrderDeliveryAddress(order)}
                                        </p>
                                    )}
                                    {order.assignedInspector && (
                                        <p className={styles.metaLine}>
                                            Assigned Inspector: {order.assignedInspector.fullName || order.assignedInspector.email}
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
                                    {order.status === 'PENDING' && (
                                        <Tag color="warning" style={{ marginLeft: 4 }}>
                                            Awaiting Buyer Payment
                                        </Tag>
                                    )}
                                    {order.status === 'DEPOSIT_PAID' && (
                                        <>
                                            <Button
                                                type="default"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => handleSellerConfirm(order.orderId)}
                                            >
                                                Confirm for Inspector
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<CarOutlined />}
                                                className={styles.btnSchedule}
                                                onClick={() => openDeliveryModal(order)}
                                            >
                                                Schedule Delivery
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleSellerCancel(order.orderId)}
                                            >
                                                Cancel Order
                                            </Button>
                                        </>
                                    )}
                                    {order.status === 'PENDING_SELLER_CONFIRMATION' && (
                                        <Tag icon={<ClockCircleOutlined />} color="gold" style={{ marginLeft: 4 }}>
                                            Waiting for admin to assign an inspector
                                        </Tag>
                                    )}
                                    {order.status === 'PENDING_ADMIN_REVIEW' && (
                                        <Tag icon={<ClockCircleOutlined />} color="gold" style={{ marginLeft: 4 }}>
                                            Waiting for admin review
                                        </Tag>
                                    )}
                                    {order.status === 'ASSIGNED_TO_INSPECTOR' && (
                                        <Tag icon={<CheckCircleOutlined />} color="cyan" style={{ marginLeft: 4 }}>
                                            Inspector assigned
                                        </Tag>
                                    )}
                                    {order.status === 'IN_DELIVERY' && (
                                        <>

                                            <Button
                                                danger
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleSellerCancel(order.orderId)}
                                            >
                                                Cancel Order
                                            </Button>
                                        </>
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
                        placeholder="Buyer address should auto-fill here from the deposit order"
                        value={deliveryForm.deliveryAddress}
                        onChange={(e) => setDeliveryForm((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Date</label>
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabledDate={(current) => current && current.startOf('day').isBefore(dayjs().startOf('day'))}
                        onChange={(_, dateStr) => {
                            const nextDate = Array.isArray(dateStr) ? dateStr[0] : dateStr;
                            const opts = getStartTimeOptions(nextDate);
                            const stillValid = opts.some((o) => o.value === deliveryForm.startTime);
                            setDeliveryForm((prev) => ({
                                ...prev,
                                deliveryDate: nextDate,
                                startTime: stillValid ? prev.startTime : null,
                                endTime: stillValid ? prev.endTime : null,
                            }));
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label className={styles.formLabel}>Start Time</label>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Select start time"
                            value={deliveryForm.startTime}
                            onChange={(value) => {
                                const h = parseInt(value.split(':')[0], 10);
                                setDeliveryForm((prev) => ({
                                    ...prev,
                                    startTime: value,
                                    endTime: padH(h + 1),
                                }));
                            }}
                            options={startTimeOptions}
                        />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label className={styles.formLabel}>End Time</label>
                        <Select
                            style={{ width: '100%' }}
                            value={deliveryForm.endTime}
                            disabled
                            placeholder="Auto-set (start + 1h)"
                            options={deliveryForm.endTime ? [{ value: deliveryForm.endTime, label: deliveryForm.endTime }] : []}
                        />
                    </div>
                </div>
            </Modal>

        </div>
    );
}

export default MySalesPage;
