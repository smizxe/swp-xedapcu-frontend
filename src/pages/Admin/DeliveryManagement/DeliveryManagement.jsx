import React, { useCallback, useEffect, useState } from 'react';
import { Typography, Alert, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import adminService from '../../../services/adminService';
import { adminAssignInspector } from '../../../service/orderService';
import { RefreshCw, Truck, UserCheck, Clock3, PackageCheck } from 'lucide-react';
import styles from './DeliveryManagement.module.css';

const DELIVERY_FILTERS = ['ALL', 'PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW', 'ASSIGNED_TO_INSPECTOR', 'IN_DELIVERY', 'COMPLETED'];
const DELIVERY_STATUSES = DELIVERY_FILTERS.filter((item) => item !== 'ALL');

const DeliveryStatusBadge = ({ status }) => {
    const tone =
        status === 'COMPLETED' ? styles.badgeCompleted :
        status === 'ASSIGNED_TO_INSPECTOR' ? styles.badgeAssigned :
        status === 'IN_DELIVERY' ? styles.badgeShipping :
        styles.badgePending;
    return <span className={`${styles.deliveryBadge} ${tone}`}>{status}</span>;
};

const DeliveryOrderCard = ({ order, inspectors, assigningOrderId, onAssign }) => {
    const [inspectorId, setInspectorId] = useState(() => order.assignedInspector?.userId || '');
    const canAssign = ['PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW'].includes(order.status);

    return (
        <div className={styles.deliveryCard}>
            <div className={styles.deliveryCardHeader}>
                <div>
                    <Typography className={styles.deliveryTitle}>
                        Order #{order.orderId} · {order.postTitle || order.post?.title || 'Untitled'}
                    </Typography>
                    <Typography className={styles.deliveryMeta}>
                        Buyer: <strong>{order.buyer?.fullName || order.buyer?.email || '—'}</strong>
                    </Typography>
                    <Typography className={styles.deliveryMeta}>
                        Seller: <strong>{order.seller?.fullName || order.seller?.email || '—'}</strong>
                    </Typography>
                </div>
                <DeliveryStatusBadge status={order.status} />
            </div>

            {order.deliveryAddress && (
                <Typography className={styles.deliveryMeta}>
                    Delivery address: <strong>{order.deliveryAddress}</strong>
                </Typography>
            )}

            {order.deliverySession && (
                <div className={styles.deliveryMetaGrid}>
                    {order.deliverySession.location && (
                        <Typography className={styles.deliveryMeta}>
                            Session location: <strong>{order.deliverySession.location}</strong>
                        </Typography>
                    )}
                    {order.deliverySession.deliveryStatus && (
                        <Typography className={styles.deliveryMeta}>
                            Delivery status: <strong>{order.deliverySession.deliveryStatus}</strong>
                        </Typography>
                    )}
                    {order.deliverySession.assignedAt && (
                        <Typography className={styles.deliveryMeta}>
                            Assigned at: <strong>{new Date(order.deliverySession.assignedAt).toLocaleString('vi-VN')}</strong>
                        </Typography>
                    )}
                </div>
            )}

            {order.assignedInspector && (
                <Typography className={styles.deliveryMeta}>
                    Assigned inspector: <strong>{order.assignedInspector.fullName || order.assignedInspector.email}</strong>
                </Typography>
            )}

            {order.status === 'COMPLETED' && (
                <Typography className={styles.deliveryMeta}>
                    <strong>Delivery completed successfully.</strong>
                    {order.deliverySession?.deliveredAt && (
                        <> Delivered at {new Date(order.deliverySession.deliveredAt).toLocaleString('vi-VN')}</>
                    )}
                </Typography>
            )}

            {canAssign && (
                <div className={styles.assignRow}>
                    <FormControl size="small" className={styles.lookupField}>
                        <InputLabel id={`delivery-inspector-select-${order.orderId}`}>Inspector</InputLabel>
                        <Select
                            labelId={`delivery-inspector-select-${order.orderId}`}
                            value={inspectorId}
                            label="Inspector"
                            onChange={(e) => setInspectorId(e.target.value)}
                        >
                            {inspectors.map((item) => (
                                <MenuItem key={item.userId || item.email} value={item.userId}>
                                    {item.fullName || item.email} ({item.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        className={styles.actionButton}
                        onClick={() => onAssign(order.orderId, inspectorId)}
                        disabled={!inspectorId || assigningOrderId === order.orderId}
                    >
                        {assigningOrderId === order.orderId ? 'Assigning...' : 'Assign Inspector'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default function DeliveryManagement() {
    const [inspectors, setInspectors] = useState([]);
    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [deliveryFilter, setDeliveryFilter] = useState('ALL');
    const [deliveryLoading, setDeliveryLoading] = useState(true);
    const [deliveryError, setDeliveryError] = useState('');
    const [assigningOrderId, setAssigningOrderId] = useState(null);

    const fetchInspectors = async () => {
        try {
            const users = await adminService.getUsersByRole('INSPECTOR');
            const list = Array.isArray(users) ? users : [];
            setInspectors(list.filter((item) => String(item.role).includes('INSPECTOR')));
        } catch {
            setInspectors([]);
        }
    };

    const fetchDeliveryOrders = useCallback(async (status = deliveryFilter) => {
        try {
            setDeliveryLoading(true);
            setDeliveryError('');
            const orders = await adminService.getAllOrders(0, 200);
            const list = Array.isArray(orders) ? orders : [];
            const deliveryList = list.filter((order) => DELIVERY_STATUSES.includes(order.status));
            const filteredList = status === 'ALL'
                ? deliveryList
                : deliveryList.filter((order) => order.status === status);
            setDeliveryOrders(filteredList);
        } catch (err) {
            setDeliveryError(err?.response?.data || 'Failed to load delivery orders.');
        } finally {
            setDeliveryLoading(false);
        }
    }, [deliveryFilter]);

    useEffect(() => {
        fetchInspectors();
        fetchDeliveryOrders('ALL');
    }, [fetchDeliveryOrders]);

    const handleFilterChange = async (nextFilter) => {
        setDeliveryFilter(nextFilter);
        fetchDeliveryOrders(nextFilter);
    };

    const handleAssignInspector = async (orderId, inspectorId) => {
        if (!inspectorId) {
            setDeliveryError('Please select an inspector.');
            return;
        }
        try {
            setAssigningOrderId(orderId);
            setDeliveryError('');
            await adminAssignInspector(orderId, inspectorId);
            fetchDeliveryOrders(deliveryFilter);
        } catch (err) {
            setDeliveryError(err?.response?.data || 'Failed to assign inspector.');
        } finally {
            setAssigningOrderId(null);
        }
    };

    const deliveryStats = {
        total: deliveryOrders.length,
        pending: deliveryOrders.filter((item) => ['PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW'].includes(item.status)).length,
        assigned: deliveryOrders.filter((item) => item.status === 'ASSIGNED_TO_INSPECTOR').length,
        shipping: deliveryOrders.filter((item) => item.status === 'IN_DELIVERY').length,
        completed: deliveryOrders.filter((item) => item.status === 'COMPLETED').length,
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Delivery Management</h1>
                    <p className={styles.pageSub}>Assign inspectors to delivery orders and track shipping progress.</p>
                </div>
                <Button
                    startIcon={<RefreshCw size={16} />}
                    variant="outlined"
                    onClick={() => {
                        fetchInspectors();
                        fetchDeliveryOrders(deliveryFilter);
                    }}
                    disabled={deliveryLoading}
                    sx={{ color: '#064E3B', borderColor: '#064E3B', fontFamily: 'inherit', fontWeight: 'bold' }}
                >
                    Refresh
                </Button>
            </div>

            <div className={styles.deliveryHeaderStats}>
                <div className={styles.deliveryMiniStat}><Truck size={15} /> {deliveryStats.shipping} shipping</div>
                <div className={styles.deliveryMiniStat}><UserCheck size={15} /> {deliveryStats.assigned} assigned</div>
                <div className={styles.deliveryMiniStat}><Clock3 size={15} /> {deliveryStats.pending} pending</div>
                <div className={styles.deliveryMiniStat}><PackageCheck size={15} /> {deliveryStats.completed} completed</div>
            </div>

            <div className={styles.panel}>
                <div className={styles.filterRow}>
                    {DELIVERY_FILTERS.map((item) => (
                        <button
                            key={item}
                            className={`${styles.filterChip} ${deliveryFilter === item ? styles.filterChipActive : ''}`}
                            onClick={() => handleFilterChange(item)}
                        >
                            {item === 'ALL' ? 'ALL' : item.replaceAll('_', ' ')}
                        </button>
                    ))}
                </div>

                {deliveryError && <Alert severity="error" sx={{ mt: 2 }}>{deliveryError}</Alert>}

                {deliveryLoading ? (
                    <div className={styles.emptyBlock}>Loading delivery orders...</div>
                ) : deliveryOrders.length === 0 ? (
                    <div className={styles.emptyBlock}>No delivery orders found for this filter.</div>
                ) : (
                    <div className={styles.deliveryGrid}>
                        {deliveryOrders.map((order) => (
                            <DeliveryOrderCard
                                key={order.orderId}
                                order={order}
                                inspectors={inspectors}
                                assigningOrderId={assigningOrderId}
                                onAssign={handleAssignInspector}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
