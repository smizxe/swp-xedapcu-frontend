import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    getAllBookings,
    assignInspector,
    getAllUsers,
} from '../../../service/inspectionService';
import styles from './InspectionAdminPage.module.css';
import {
    Shield, ClipboardList, User, Calendar, MapPin,
    Clock, CheckCircle, AlertCircle, Loader, X, UserCheck
} from 'lucide-react';
// Removed AdminTabs

/* ── Status badge ──────────────────────────────────────── */
const STATUS_CONFIG = {
    PENDING: { label: 'Pending', cls: 'badgePending', icon: AlertCircle },
    ASSIGNED: { label: 'Assigned', cls: 'badgeAssigned', icon: Clock },
    CONFIRMED: { label: 'Confirmed', cls: 'badgeConfirmed', icon: CheckCircle },
    COMPLETED: { label: 'Completed', cls: 'badgeCompleted', icon: CheckCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`${styles.badge} ${styles[cfg.cls]}`}>
            <Icon size={11} /> {cfg.label}
        </span>
    );
}

/* ── Assign Inspector Modal ─────────────────────────────── */
function AssignModal({ booking, inspectors, onConfirm, onClose, loading }) {
    const [selectedId, setSelectedId] = useState('');

    return (
        <div className={styles.assignOverlay} onClick={onClose}>
            <div className={styles.assignModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.assignHeader}>
                    <div className={styles.assignHeaderLeft}>
                        <div className={styles.assignIconWrap}>
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <h3 className={styles.assignTitle}>Assign Inspector</h3>
                            <p className={styles.assignSub}>{booking.postTitle}</p>
                        </div>
                    </div>
                    <button className={styles.assignClose} onClick={onClose}><X size={16} /></button>
                </div>

                <div className={styles.assignBody}>
                    <div className={styles.bookingMeta}>
                        <span><Calendar size={13} /> {booking.bookingDate}</span>
                        {booking.startTime && <span><Clock size={13} /> {booking.startTime} – {booking.endTime}</span>}
                        {booking.location && <span><MapPin size={13} /> {booking.location}</span>}
                    </div>

                    <label className={styles.assignLabel}>Select Inspector</label>
                    <div className={styles.inspectorList}>
                        {inspectors.length === 0 && (
                            <p className={styles.noInspectors}>No inspectors found. Assign INSPECTOR role to a user first.</p>
                        )}
                        {inspectors.map((u) => {
                            // Use email as unique key since userId may be null in some edge cases
                            const uid = u.userId ?? u.email;
                            return (
                                <div
                                    key={u.email}
                                    className={`${styles.inspectorItem} ${selectedId === uid ? styles.inspectorItemSelected : ''}`}
                                    onClick={() => setSelectedId(uid)}
                                >
                                    <div className={styles.inspectorAvatar}>
                                        {(u.fullName || u.email || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className={styles.inspectorName}>{u.fullName || '—'}</p>
                                        <p className={styles.inspectorEmail}>{u.email}</p>
                                    </div>
                                    {selectedId === uid && (
                                        <CheckCircle size={16} className={styles.inspectorCheck} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.assignFooter}>
                    <button className={styles.assignCancelBtn} onClick={onClose}>Cancel</button>
                    <button
                        className={styles.assignConfirmBtn}
                        onClick={() => {
                            // Find the inspector and get their numeric userId for the API call
                            const inspector = inspectors.find(u => (u.userId ?? u.email) === selectedId);
                            onConfirm(booking.bookingId, inspector?.userId);
                        }}
                        disabled={!selectedId || loading}
                    >
                        {loading ? <><Loader size={14} className={styles.spin} /> Assigning…</> : 'Assign Inspector'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Booking card ───────────────────────────────────────── */
function BookingCard({ booking, onAssign }) {
    // BE keeps status=PENDING after assignment (only changes to CONFIRMED when inspector confirms).
    // So check BOTH: status is PENDING and no inspector assigned yet.
    const canAssign = booking.status === 'PENDING' && !booking.inspector;
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <StatusBadge status={booking.status} />
                <span className={styles.cardDate}>
                    <Calendar size={12} /> #{booking.bookingId}
                </span>
            </div>

            <h3 className={styles.cardTitle}>{booking.postTitle || `Post #${booking.postId}`}</h3>

            <div className={styles.cardMeta}>
                {booking.bookingDate && (
                    <div className={styles.metaRow}>
                        <Calendar size={13} />
                        <span>{booking.bookingDate}</span>
                    </div>
                )}
                {booking.startTime && (
                    <div className={styles.metaRow}>
                        <Clock size={13} />
                        <span>{booking.startTime}{booking.endTime ? ` – ${booking.endTime}` : ''}</span>
                    </div>
                )}
                {booking.location && (
                    <div className={styles.metaRow}>
                        <MapPin size={13} />
                        <span>{booking.location}</span>
                    </div>
                )}
                {booking.requester && (
                    <div className={styles.metaRow}>
                        <User size={13} />
                        <span>{booking.requester.fullName || booking.requester.email}</span>
                    </div>
                )}
            </div>

            {booking.inspector && (
                <div className={styles.inspectorAssigned}>
                    <UserCheck size={13} />
                    <span>{booking.inspector.fullName || booking.inspector.email}</span>
                </div>
            )}

            {canAssign && (
                <button className={styles.assignBtn} onClick={() => onAssign(booking)}>
                    <UserCheck size={14} /> Assign Inspector
                </button>
            )}
        </div>
    );
}

/* ── Stat card ──────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, accent }) {
    return (
        <div className={`${styles.statCard} ${accent ? styles[`statCard${accent}`] : ''}`}>
            <div className={styles.statIcon}><Icon size={20} /></div>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
        </div>
    );
}

/* ── Main page ──────────────────────────────────────────── */
export default function InspectionAdminPage() {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [inspectors, setInspectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assignTarget, setAssignTarget] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [bkData, usersData] = await Promise.all([
                getAllBookings(),
                getAllUsers().catch(() => []),
            ]);

            const list = Array.isArray(bkData) ? bkData : (bkData?.content ?? []);
            setBookings(list);

            const allUsers = Array.isArray(usersData) ? usersData : [];
            // Role comes as 'INSPECTOR' or 'ROLE_INSPECTOR' depending on Spring config
            setInspectors(allUsers.filter((u) =>
                u.role === 'INSPECTOR' || u.role === 'ROLE_INSPECTOR' || String(u.role).includes('INSPECTOR')
            ));
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!isAdmin) {
            navigate('/');
            return;
        }
        fetchData();
    }, [isAdmin, authLoading, navigate, fetchData]);

    const handleAssign = async (bookingId, inspectorId) => {
        if (!inspectorId) return;
        setAssigning(true);
        try {
            await assignInspector(bookingId, inspectorId);
            setAssignTarget(null);
            fetchData();
        } catch (e) {
            alert(e?.response?.data?.error || 'Failed to assign inspector.');
        } finally {
            setAssigning(false);
        }
    };

    const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'CONFIRMED', 'COMPLETED'];
    const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === 'PENDING').length,
        assigned: bookings.filter((b) => b.status === 'ASSIGNED').length,
        completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    };

    if (authLoading) {
        return (
            <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Loader size={32} className={styles.spin} />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles.page}>
            {/* Hero header */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <div className={styles.pageIconWrap}><Shield size={26} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Inspection Management</h1>
                        <p className={styles.pageSub}>Assign inspectors to pending bicycle verifications</p>
                    </div>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    {loading ? <Loader size={14} className={styles.spin} /> : 'Refresh'}
                </button>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
                <StatCard label="Total Bookings" value={stats.total} icon={ClipboardList} />
                <StatCard label="Pending" value={stats.pending} icon={AlertCircle} accent="Pending" />
                <StatCard label="Assigned" value={stats.assigned} icon={Clock} accent="Assigned" />
                <StatCard label="Completed" value={stats.completed} icon={CheckCircle} accent="Completed" />
            </div>

            {/* Filter tabs */}
            <div className={styles.filterTabs}>
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'ALL' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading && (
                <div className={styles.loading}>
                    <Loader size={32} className={styles.spin} />
                    <p>Loading inspection bookings…</p>
                </div>
            )}

            {!loading && error && (
                <div className={styles.errorState}>
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={fetchData}>Retry</button>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className={styles.emptyState}>
                    <ClipboardList size={48} strokeWidth={1} />
                    <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found.</p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className={styles.bentoGrid}>
                    {filtered.map((booking) => (
                        <BookingCard
                            key={booking.bookingId}
                            booking={booking}
                            onAssign={setAssignTarget}
                        />
                    ))}
                </div>
            )}

            {/* Assign modal */}
            {assignTarget && (
                <AssignModal
                    booking={assignTarget}
                    inspectors={inspectors}
                    onConfirm={handleAssign}
                    onClose={() => setAssignTarget(null)}
                    loading={assigning}
                />
            )}
        </div>
    );
}
