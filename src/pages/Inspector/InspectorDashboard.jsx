import { useState, useEffect, useCallback } from 'react';
import styles from './InspectorDashboard.module.css';
import {
    getMyBookings,
    getMyRequests,
    confirmBooking,
} from '../../service/inspectionService';
import { getMyDeliveryTasks, inspectorStartDelivery, inspectorMarkDelivered, reportBuyerNoShow, reportSellerNoShow } from '../../service/orderService';
import InspectionReportModal from './InspectionReportModal';
import {
    Shield, ClipboardList, CheckCircle, Clock, AlertCircle,
    Calendar, MapPin, Loader, ChevronRight, FileText, User, Truck, PackageCheck, Phone, UserX
} from 'lucide-react';

const BOOKING_STATUS = {
    PENDING: { label: 'Pending Assignment', cls: 'badgePending' },
    ASSIGNED: { label: 'Assigned to You', cls: 'badgeAssigned' },
    CONFIRMED: { label: 'In Progress', cls: 'badgeConfirmed' },
    COMPLETED: { label: 'Completed', cls: 'badgeCompleted' },
};

const INSPECT_STATUS = {
    PENDING: { label: 'Pending', cls: 'badgePending' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badgeConfirmed' },
    COMPLETED: { label: 'Completed', cls: 'badgeCompleted' },
};

function StatusBadge({ status, type = 'booking' }) {
    const map = type === 'booking' ? BOOKING_STATUS : INSPECT_STATUS;
    const cfg = map[status] ?? { label: status, cls: 'badgePending' };
    return <span className={`${styles.badge} ${styles[cfg.cls]}`}>{cfg.label}</span>;
}

function BookingCard({ booking, onConfirm, confirming }) {
    const canConfirm = booking.status === 'PENDING';
    return (
        <div className={styles.card}>
            <div className={styles.cardTop}>
                <StatusBadge status={booking.status} type="booking" />
                <span className={styles.cardId}>Booking #{booking.bookingId}</span>
            </div>
            <h3 className={styles.cardTitle}>{booking.postTitle || `Post #${booking.postId}`}</h3>
            <div className={styles.cardMeta}>
                {booking.bookingDate && (
                    <div className={styles.metaRow}><Calendar size={13} /><span>{booking.bookingDate}</span></div>
                )}
                {booking.startTime && (
                    <div className={styles.metaRow}><Clock size={13} />
                        <span>{booking.startTime}{booking.endTime ? ` – ${booking.endTime}` : ''}</span>
                    </div>
                )}
                {booking.location && (
                    <div className={styles.metaRow}><MapPin size={13} /><span>{booking.location}</span></div>
                )}
            </div>
            {booking.requester && (
                <div className={styles.metaRow}><User size={13} />
                    <span>Booked by: {booking.requester.fullName || booking.requester.email}</span>
                </div>
            )}
            {(booking.sellerPhone || booking.requester?.phone) && (
                <div className={styles.metaRow}>
                    <Phone size={13} />
                    <a
                        href={`tel:${booking.sellerPhone || booking.requester?.phone}`}
                        className={styles.phoneLink}
                    >
                        {booking.sellerPhone || booking.requester?.phone}
                    </a>
                    <span className={styles.phoneLabelBadge}>Seller</span>
                </div>
            )}
            {booking.paidBy && (
                <div className={styles.paidByBadge}>Fee paid by: {booking.paidBy}</div>
            )}
            {canConfirm && (
                <button
                    className={styles.confirmBtn}
                    onClick={() => onConfirm(booking.bookingId)}
                    disabled={confirming === booking.bookingId}
                >
                    {confirming === booking.bookingId
                        ? <><Loader size={14} className={styles.spin} /> Confirming…</>
                        : <><CheckCircle size={14} /> Confirm & Start Inspection</>}
                </button>
            )}
            {booking.status === 'CONFIRMED' && (
                <div className={styles.confirmedNote}>
                    <CheckCircle size={13} /> Active — go to "In Progress" tab
                </div>
            )}
        </div>
    );
}

function RequestCard({ req, onReport }) {
    const hasReport = !!req.report;
    return (
        <div className={styles.card}>
            <div className={styles.cardTop}>
                <StatusBadge status={req.status} type="request" />
                <span className={styles.cardId}>Inspection #{req.inspectionId}</span>
            </div>
            <h3 className={styles.cardTitle}>{req.postTitle || `Post #${req.postId}`}</h3>

            {req.inspectionFee && (
                <div className={styles.feePill}>
                    Fee: <strong>{Number(req.inspectionFee).toLocaleString()} VND</strong> (paid by {req.paidBy})
                </div>
            )}
            {req.booking && (
                <div className={styles.cardMeta}>
                    {req.booking.bookingDate && (
                        <div className={styles.metaRow}><Calendar size={13} /><span>{req.booking.bookingDate}</span></div>
                    )}
                    {req.booking.startTime && (
                        <div className={styles.metaRow}><Clock size={13} />
                            <span>{req.booking.startTime}{req.booking.endTime ? ` - ${req.booking.endTime}` : ''}</span>
                        </div>
                    )}
                    {req.booking.location && (
                        <div className={styles.metaRow}><MapPin size={13} /><span>{req.booking.location}</span></div>
                    )}
                </div>
            )}

            {hasReport ? (
                <div className={styles.reportDone}>
                    <CheckCircle size={14} /> Report submitted — Inspection complete
                </div>
            ) : (
                <button className={styles.reportBtn} onClick={() => onReport(req)}>
                    <FileText size={14} /> Fill Inspection Report
                    <ChevronRight size={14} className={styles.reportBtnArrow} />
                </button>
            )}
        </div>
    );
}

function DeliveryCard({ order, actingOrderId, onStart, onFinish, onBuyerNoShow, onSellerNoShow }) {
    const isStarting = actingOrderId === `start-${order.orderId}`;
    const isFinishing = actingOrderId === `finish-${order.orderId}`;
    const isBuyerNoShowing = actingOrderId === `buyer-noshow-${order.orderId}`;
    const isSellerNoShowing = actingOrderId === `seller-noshow-${order.orderId}`;

    return (
        <div className={styles.deliveryCard}>
            <div className={styles.cardTop}>
                <span className={`${styles.badge} ${order.status === 'ASSIGNED_TO_INSPECTOR' ? styles.badgeAssigned : styles.badgeCompleted}`}>
                    {order.status}
                </span>
                <span className={styles.cardId}>Order #{order.orderId}</span>
            </div>
            <h3 className={styles.cardTitle}>{order.postTitle || order.post?.title || 'Untitled order'}</h3>
            <div className={styles.cardMeta}>
                {order.pickupAddress && (
                    <div className={styles.metaRow}><MapPin size={13} /><span>Pickup: {order.pickupAddress}</span></div>
                )}
                {order.deliveryAddress && (
                    <div className={styles.metaRow}><MapPin size={13} /><span>Delivery: {order.deliveryAddress}</span></div>
                )}
                {order.seller && (
                    <div className={styles.metaRow}><User size={13} /><span>Seller: {order.seller.fullName || order.seller.email} {order.seller.phone ? `- ${order.seller.phone}` : ''}</span></div>
                )}
                {order.buyer && (
                    <div className={styles.metaRow}><User size={13} /><span>Buyer: {order.buyer.fullName || order.buyer.email} {order.buyer.phone ? `- ${order.buyer.phone}` : ''}</span></div>
                )}
                {order.deliverySession?.deliveryStatus && (
                    <div className={styles.metaRow}><Truck size={13} /><span>Delivery: {order.deliverySession.deliveryStatus}</span></div>
                )}
            </div>
            {order.status === 'ASSIGNED_TO_INSPECTOR' && (
                <div className={styles.deliveryActionGroup}>
                    <button className={styles.deliveryActionBtn} onClick={() => onStart(order.orderId)} disabled={actingOrderId !== ''}>
                        {isStarting ? <><Loader size={14} className={styles.spin} /> Starting...</> : <><Truck size={14} /> Start Shipping</>}
                    </button>
                    <button className={styles.deliveryActionBtnDanger} onClick={() => onSellerNoShow(order.orderId)} disabled={actingOrderId !== ''}>
                        {isSellerNoShowing ? <><Loader size={14} className={styles.spin} /> Reporting...</> : <><UserX size={14} /> Seller No Show</>}
                    </button>
                </div>
            )}
            {order.status === 'IN_DELIVERY' && order.deliverySession?.deliveryStatus !== 'DELIVERED' && (
                <div className={styles.deliveryActionGroup}>
                    <button className={styles.deliveryActionBtnSecondary} onClick={() => onFinish(order.orderId)} disabled={actingOrderId !== ''}>
                        {isFinishing ? <><Loader size={14} className={styles.spin} /> Completing...</> : <><PackageCheck size={14} /> Mark Delivered</>}
                    </button>
                    <button className={styles.deliveryActionBtnDanger} onClick={() => onBuyerNoShow(order.orderId)} disabled={actingOrderId !== ''}>
                        {isBuyerNoShowing ? <><Loader size={14} className={styles.spin} /> Reporting...</> : <><UserX size={14} /> Buyer No Show</>}
                    </button>
                </div>
            )}
            {order.status === 'IN_DELIVERY' && order.deliverySession?.deliveryStatus === 'DELIVERED' && (
                <div className={styles.confirmedNote} style={{ marginTop: '10px' }}>
                    <PackageCheck size={14} /> Delivered! Awaiting Buyer confirmation.
                </div>
            )}
        </div>
    );
}

export default function InspectorDashboard() {
    const [tab, setTab] = useState('tasks');
    const [bookings, setBookings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [deliveryTasks, setDeliveryTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirming, setConfirming] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);
    const [deliveryActionKey, setDeliveryActionKey] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [bk, rq, dt] = await Promise.all([
                getMyBookings().catch(() => []),
                getMyRequests().catch(() => []),
                getMyDeliveryTasks().catch(() => []),
            ]);
            setBookings(Array.isArray(bk) ? bk : []);
            setRequests(Array.isArray(rq) ? rq : []);
            setDeliveryTasks(Array.isArray(dt) ? dt : []);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to load tasks.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleConfirm = async (bookingId) => {
        setConfirming(bookingId);
        try {
            await confirmBooking(bookingId);
            fetchData();
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to confirm booking.');
        } finally {
            setConfirming(null);
        }
    };

    const handleStartDelivery = async (orderId) => {
        try {
            setDeliveryActionKey(`start-${orderId}`);
            await inspectorStartDelivery(orderId);
            fetchData();
        } catch (e) {
            alert(e?.response?.data || 'Failed to start delivery.');
        } finally {
            setDeliveryActionKey('');
        }
    };

    const handleFinishDelivery = async (orderId) => {
        try {
            setDeliveryActionKey(`finish-${orderId}`);
            await inspectorMarkDelivered(orderId);
            fetchData();
        } catch (e) {
            alert(e?.response?.data || 'Failed to mark delivery as completed.');
        } finally {
            setDeliveryActionKey('');
        }
    };

    const handleBuyerNoShow = async (orderId) => {
        if (!window.confirm('Are you sure you want to report Buyer No Show?')) return;
        try {
            setDeliveryActionKey(`buyer-noshow-${orderId}`);
            await reportBuyerNoShow(orderId);
            fetchData();
        } catch (e) {
            alert(e?.response?.data || 'Failed to report buyer no show.');
        } finally {
            setDeliveryActionKey('');
        }
    };

    const handleSellerNoShow = async (orderId) => {
        if (!window.confirm('Are you sure you want to report Seller No Show?')) return;
        try {
            setDeliveryActionKey(`seller-noshow-${orderId}`);
            
            const currentOrder = deliveryTasks.find(o => o.orderId === orderId);
            if (currentOrder && currentOrder.status === 'ASSIGNED_TO_INSPECTOR') {
                // Backend requires the order to be IN_DELIVERY to report a Seller No Show
                await inspectorStartDelivery(orderId);
            }

            await reportSellerNoShow(orderId);
            fetchData();
        } catch (e) {
            alert(e?.response?.data || 'Failed to report seller no show.');
        } finally {
            setDeliveryActionKey('');
        }
    };

    const handleReportDone = () => {
        setReportTarget(null);
        fetchData();
    };

    const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
    const activeCount = requests.filter((r) => r.status !== 'COMPLETED').length;
    const deliveryCount = deliveryTasks.length;

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIconWrap}><Shield size={26} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Inspector Dashboard</h1>
                        <p className={styles.pageSub}>Manage inspections and assigned delivery orders</p>
                    </div>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    {loading ? <Loader size={14} className={styles.spin} /> : 'Refresh'}
                </button>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <ClipboardList size={20} className={styles.statIcon} />
                    <div className={styles.statValue}>{bookings.length}</div>
                    <div className={styles.statLabel}>Total Assigned</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardPending}`}>
                    <AlertCircle size={20} className={styles.statIcon} />
                    <div className={styles.statValue}>{pendingCount}</div>
                    <div className={styles.statLabel}>Awaiting Confirm</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardActive}`}>
                    <Clock size={20} className={styles.statIcon} />
                    <div className={styles.statValue}>{activeCount}</div>
                    <div className={styles.statLabel}>Inspections</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardDone}`}>
                    <Truck size={20} className={styles.statIcon} />
                    <div className={styles.statValue}>{deliveryCount}</div>
                    <div className={styles.statLabel}>Delivery Orders</div>
                </div>
            </div>

            <div className={styles.deliveryPanel}>
                <div className={styles.deliveryPanelHeader}>
                    <div>
                        <h2 className={styles.deliveryPanelTitle}>Delivery Tasks</h2>
                    </div>
                </div>
                {deliveryTasks.length === 0 ? (
                    <div className={styles.emptyBlock}>No delivery tasks assigned yet.</div>
                ) : (
                    <div className={styles.deliveryGrid}>
                        {deliveryTasks.map((order) => (
                            <DeliveryCard
                                key={order.orderId}
                                order={order}
                                actingOrderId={deliveryActionKey}
                                onStart={handleStartDelivery}
                                onFinish={handleFinishDelivery}
                                onBuyerNoShow={handleBuyerNoShow}
                                onSellerNoShow={handleSellerNoShow}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === 'tasks' ? styles.tabActive : ''}`}
                    onClick={() => setTab('tasks')}
                >
                    <ClipboardList size={15} /> My Tasks
                    {pendingCount > 0 && <span className={styles.tabBadge}>{pendingCount}</span>}
                </button>
                <button
                    className={`${styles.tab} ${tab === 'progress' ? styles.tabActive : ''}`}
                    onClick={() => setTab('progress')}
                >
                    <FileText size={15} /> In Progress
                    {activeCount > 0 && <span className={styles.tabBadge}>{activeCount}</span>}
                </button>
            </div>

            {loading && (
                <div className={styles.stateBox}>
                    <Loader size={32} className={styles.spin} />
                    <p>Loading your tasks…</p>
                </div>
            )}

            {!loading && error && (
                <div className={`${styles.stateBox} ${styles.stateError}`}>
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={fetchData}>Retry</button>
                </div>
            )}

            {!loading && !error && tab === 'tasks' && (
                bookings.length === 0
                    ? <div className={styles.stateBox}>
                        <ClipboardList size={48} strokeWidth={1} />
                        <p>No tasks assigned yet. Check back later.</p>
                    </div>
                    : <div className={styles.grid}>
                        {[...bookings]
                            .sort((a, b) => {
                                const STATUS_ORDER = { PENDING: 0, ASSIGNED: 1, CONFIRMED: 2, COMPLETED: 3 };
                                const orderA = STATUS_ORDER[a.status] ?? 99;
                                const orderB = STATUS_ORDER[b.status] ?? 99;
                                if (orderA !== orderB) return orderA - orderB;
                                return (b.bookingId ?? 0) - (a.bookingId ?? 0);
                            })
                            .map((b) => (
                                <BookingCard
                                    key={b.bookingId} booking={b}
                                    onConfirm={handleConfirm} confirming={confirming}
                                />
                            ))}
                    </div>
            )}

            {!loading && !error && tab === 'progress' && (() => {
                const activeReqs = [...requests.filter((r) => r.status !== 'COMPLETED')]
                    .sort((a, b) => (b.inspectionId ?? 0) - (a.inspectionId ?? 0));
                const completedReqs = [...requests.filter((r) => r.status === 'COMPLETED')]
                    .sort((a, b) => (b.inspectionId ?? 0) - (a.inspectionId ?? 0));
                return (
                    <>
                        <div className={styles.sectionLabel}>
                            <Clock size={14} /> Active Inspections
                            <span className={styles.sectionCount}>{activeReqs.length}</span>
                        </div>
                        {activeReqs.length === 0 ? (
                            <div className={styles.stateBox} style={{ padding: '28px 24px' }}>
                                <CheckCircle size={36} strokeWidth={1} style={{ color: '#10B981' }} />
                                <p>No active inspections.<br />Confirm a task from "My Tasks" to start.</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {activeReqs.map((r) => (
                                    <RequestCard key={r.inspectionId} req={r} onReport={setReportTarget} />
                                ))}
                            </div>
                        )}

                        {completedReqs.length > 0 && (
                            <>
                                <div className={styles.sectionLabel} style={{ marginTop: 28 }}>
                                    <CheckCircle size={14} /> Completed
                                    <span className={styles.sectionCount}>{completedReqs.length}</span>
                                </div>
                                <div className={styles.grid}>
                                    {completedReqs.map((r) => (
                                        <RequestCard key={r.inspectionId} req={r} onReport={setReportTarget} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                );
            })()}

            {reportTarget && (
                <InspectionReportModal
                    inspection={reportTarget}
                    onDone={handleReportDone}
                    onClose={() => setReportTarget(null)}
                />
            )}
        </div>
    );
}
