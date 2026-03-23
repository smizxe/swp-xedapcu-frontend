import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Empty, Modal, Input, Select } from 'antd';
import {
    ShoppingOutlined,
    EyeOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getMyOrders, cancelDeposit, completeOrder, reportSellerNoShow } from '../../service/orderService';
import styles from './MyOrdersPage.module.css';

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

function MyOrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');

    const fetchOrders = useCallback(() => {
        setLoading(true);
        getMyOrders()
            .then(setOrders)
            .catch(() => message.error('Failed to load orders.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            fetchOrders();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [fetchOrders]);

    const handleCancel = async (orderId) => {
        Modal.confirm({
            title: 'Cancel this order?',
            content: 'If you cancel now, your deposit will be forfeited and transferred to the seller.',
            okText: 'Cancel Order',
            okButtonProps: { danger: true },
            cancelText: 'Keep Order',
            onOk: async () => {
                try {
                    await cancelDeposit(orderId);
                    message.success('Order cancelled. Deposit forfeited.');
                    fetchOrders();
                } catch (err) {
                    message.error(err.response?.data || 'Cancel failed.');
                }
            },
        });
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

    const handleReportSellerNoShow = async (orderId) => {
        try {
            await reportSellerNoShow(orderId);
            message.success('Seller no-show reported. Deposit refunded.');
            fetchOrders();
        } catch (err) {
            message.error(err.response?.data || 'Failed to report seller no-show.');
        }
    };

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = orders.filter((order) => {
            const matchesSearch = !normalizedSearch || [
                `order #${order.orderId}`,
                order.postTitle,
                order.post?.title,
                order.seller?.fullName,
                order.seller?.email,
                order.deliveryAddress,
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

    const orderStatuses = Array.from(new Set(orders.map((order) => order.status).filter(Boolean)));

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <h1 className={styles.pageTitle}>
                    <ShoppingOutlined /> My Orders
                </h1>
                <p className={styles.pageSubtitle}>Track and manage your purchases.</p>

                {!loading && orders.length > 0 && (
                    <div className={styles.toolbar}>
                        <Input
                            className={styles.searchInput}
                            placeholder="Search by order id, post, seller, address..."
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
                                ...orderStatuses.map((status) => ({ value: status, label: status })),
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
                    <Empty description="You haven't placed any orders yet." />
                ) : filteredOrders.length === 0 ? (
                    <Empty description="No orders match your current filters." />
                ) : (
                    <div className={styles.orderList}>
                        {filteredOrders.map((order) => (
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
                                    {order.deliveryAddress && (
                                        <p className={styles.dateMeta}>
                                            Delivery address: {order.deliveryAddress}
                                        </p>
                                    )}
                                    {order.assignedInspector && (
                                        <p className={styles.dateMeta}>
                                            Assigned inspector: {order.assignedInspector.fullName || order.assignedInspector.email}
                                        </p>
                                    )}
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
                                    {order.status === 'DEPOSIT_PAID' && (
                                        <Button
                                            danger
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => handleCancel(order.orderId)}
                                        >
                                            Cancel Order
                                        </Button>
                                    )}
                                    {['PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW', 'ASSIGNED_TO_INSPECTOR'].includes(order.status) && (
                                        <Tag color={order.status === 'ASSIGNED_TO_INSPECTOR' ? 'cyan' : 'gold'}>
                                            {order.status === 'ASSIGNED_TO_INSPECTOR'
                                                ? 'Inspector assigned. Waiting for delivery progress.'
                                                : 'Seller confirmed. Waiting for admin/inspector flow.'}
                                        </Tag>
                                    )}
                                    {order.status === 'IN_DELIVERY' && (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                className={styles.btnComplete}
                                                onClick={() => handleComplete(order.orderId)}
                                            >
                                                Confirm Received
                                            </Button>
                                            <Button
                                                danger
                                                icon={<WarningOutlined />}
                                                onClick={() => handleReportSellerNoShow(order.orderId)}
                                            >
                                                Seller No-Show
                                            </Button>
                                        </>
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
