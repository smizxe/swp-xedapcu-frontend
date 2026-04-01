import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getAllBookings, assignInspector, getAllUsers } from '../../../service/inspectionService';
import adminService from '../../../services/adminService';
import styles from './InspectionAdminPage.module.css';
import {
    Shield,
    ClipboardList,
    User,
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader,
    X,
    UserCheck,
    FileText,
    ExternalLink,
    Star,
} from 'lucide-react';

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
                        {inspectors.map((user) => {
                            const uid = user.userId ?? user.email;
                            return (
                                <div
                                    key={user.email}
                                    className={`${styles.inspectorItem} ${selectedId === uid ? styles.inspectorItemSelected : ''}`}
                                    onClick={() => setSelectedId(uid)}
                                >
                                    <div className={styles.inspectorAvatar}>
                                        {(user.fullName || user.email || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className={styles.inspectorName}>{user.fullName || '—'}</p>
                                        <p className={styles.inspectorEmail}>{user.email}</p>
                                    </div>
                                    {selectedId === uid ? <CheckCircle size={16} className={styles.inspectorCheck} /> : null}
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
                            const inspector = inspectors.find((user) => (user.userId ?? user.email) === selectedId);
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

function ReportModal({ booking, report, loading, error, onClose }) {
    return (
        <div className={styles.assignOverlay} onClick={onClose}>
            <div className={styles.reportModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.assignHeader}>
                    <div className={styles.assignHeaderLeft}>
                        <div className={styles.assignIconWrap}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className={styles.assignTitle}>Inspection Report</h3>
                            <p className={styles.assignSub}>{booking.postTitle || `Inspection #${booking.bookingId}`}</p>
                        </div>
                    </div>
                    <button className={styles.assignClose} onClick={onClose}><X size={16} /></button>
                </div>

                <div className={styles.assignBody}>
                    {loading ? (
                        <div className={styles.reportLoading}>
                            <Loader size={24} className={styles.spin} />
                            <p>Loading inspection report…</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorState}>
                            <AlertCircle size={28} />
                            <p>{error}</p>
                        </div>
                    ) : report ? (
                        <div className={styles.reportContent}>
                            <div className={styles.reportGrid}>
                                <div className={styles.reportStat}><span>Frame</span><strong>{report.frameStatus || '—'}</strong></div>
                                <div className={styles.reportStat}><span>Brake</span><strong>{report.brakeStatus || '—'}</strong></div>
                                <div className={styles.reportStat}><span>Drivetrain</span><strong>{report.drivetrainStatus || '—'}</strong></div>
                                <div className={styles.reportStat}>
                                    <span>Overall Rating</span>
                                    <strong>{report.overallRating != null ? `${report.overallRating}/10` : '—'}</strong>
                                </div>
                            </div>

                            <div className={styles.reportMetaBlock}>
                                <div className={styles.metaRow}>
                                    <UserCheck size={13} />
                                    <span>{report.inspector?.fullName || report.inspector?.email || 'Unknown inspector'}</span>
                                </div>
                                {report.verifiedAt ? (
                                    <div className={styles.metaRow}>
                                        <Calendar size={13} />
                                        <span>{new Date(report.verifiedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                ) : null}
                                {report.reportFileUrl ? (
                                    <a className={styles.reportLink} href={report.reportFileUrl} target="_blank" rel="noreferrer">
                                        <ExternalLink size={14} />
                                        Open report file
                                    </a>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <FileText size={40} strokeWidth={1.2} />
                            <p>No report available for this inspection.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function BookingCard({ booking, onAssign, onViewReport }) {
    const canAssign = booking.status === 'PENDING' && !booking.inspector;
    const canViewReport = booking.status === 'COMPLETED';

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
                {booking.bookingDate ? (
                    <div className={styles.metaRow}>
                        <Calendar size={13} />
                        <span>{booking.bookingDate}</span>
                    </div>
                ) : null}
                {booking.startTime ? (
                    <div className={styles.metaRow}>
                        <Clock size={13} />
                        <span>{booking.startTime}{booking.endTime ? ` – ${booking.endTime}` : ''}</span>
                    </div>
                ) : null}
                {booking.location ? (
                    <div className={styles.metaRow}>
                        <MapPin size={13} />
                        <span>{booking.location}</span>
                    </div>
                ) : null}
                {booking.requester ? (
                    <div className={styles.metaRow}>
                        <User size={13} />
                        <span>{booking.requester.fullName || booking.requester.email}</span>
                    </div>
                ) : null}
            </div>

            {booking.inspector ? (
                <div className={styles.inspectorAssigned}>
                    <UserCheck size={13} />
                    <span>{booking.inspector.fullName || booking.inspector.email}</span>
                </div>
            ) : null}

            <div className={styles.cardActions}>
                {canAssign ? (
                    <button className={styles.assignBtn} onClick={() => onAssign(booking)}>
                        <UserCheck size={14} /> Assign Inspector
                    </button>
                ) : null}
                {canViewReport ? (
                    <button className={styles.reportBtn} onClick={() => onViewReport(booking)}>
                        <FileText size={14} /> View Report
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, accent }) {
    return (
        <div className={`${styles.statCard} ${accent ? styles[`statCard${accent}`] : ''}`}>
            <div className={styles.statIcon}>{Icon ? <Icon size={20} /> : null}</div>
            <div className={styles.statValue}>{value}</div>
            <div className={styles.statLabel}>{label}</div>
        </div>
    );
}

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
    const [reportTarget, setReportTarget] = useState(null);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [bkData, usersData] = await Promise.all([getAllBookings(), getAllUsers().catch(() => [])]);

            const list = Array.isArray(bkData) ? bkData : (bkData?.content ?? []);
            setBookings(list);

            const allUsers = Array.isArray(usersData) ? usersData : [];
            setInspectors(
                allUsers.filter((user) =>
                    user.role === 'INSPECTOR' || user.role === 'ROLE_INSPECTOR' || String(user.role).includes('INSPECTOR')
                )
            );
        } catch (e) {
            setError(e?.response?.data?.error || e?.response?.data || e.message || 'Failed to load bookings.');
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
            alert(e?.response?.data?.error || e?.response?.data || 'Failed to assign inspector.');
        } finally {
            setAssigning(false);
        }
    };

    const handleViewReport = async (booking) => {
        setReportTarget(booking);
        setReport(null);
        setReportError('');
        setReportLoading(true);

        try {
            const data = await adminService.getInspectionReport(booking.bookingId);
            setReport(data);
        } catch (e) {
            setReportError(e?.response?.data?.error || e?.response?.data || 'Failed to load inspection report.');
        } finally {
            setReportLoading(false);
        }
    };

    const FILTERS = ['ALL', 'PENDING', 'ASSIGNED', 'CONFIRMED', 'COMPLETED'];
    const STATUS_ORDER = { PENDING: 0, ASSIGNED: 1, CONFIRMED: 2, COMPLETED: 3 };
    const filtered = (filter === 'ALL' ? bookings : bookings.filter((booking) => booking.status === filter))
        .slice()
        .sort((a, b) => {
            const orderA = STATUS_ORDER[a.status] ?? 99;
            const orderB = STATUS_ORDER[b.status] ?? 99;
            if (orderA !== orderB) return orderA - orderB;
            return (b.bookingId ?? 0) - (a.bookingId ?? 0);
        });

    const stats = {
        total: bookings.length,
        pending: bookings.filter((booking) => booking.status === 'PENDING').length,
        assigned: bookings.filter((booking) => booking.status === 'ASSIGNED').length,
        completed: bookings.filter((booking) => booking.status === 'COMPLETED').length,
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
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <div className={styles.pageIconWrap}><Shield size={26} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Inspection Management</h1>
                        <p className={styles.pageSub}>Assign inspectors and review completed verification reports</p>
                    </div>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    {loading ? <Loader size={14} className={styles.spin} /> : 'Refresh'}
                </button>
            </div>

            <div className={styles.statsRow}>
                <StatCard label="Total Bookings" value={stats.total} icon={ClipboardList} />
                <StatCard label="Pending" value={stats.pending} icon={AlertCircle} accent="Pending" />
                <StatCard label="Assigned" value={stats.assigned} icon={Clock} accent="Assigned" />
                <StatCard label="Completed" value={stats.completed} icon={CheckCircle} accent="Completed" />
            </div>

            <div className={styles.filterTabs}>
                {FILTERS.map((item) => (
                    <button
                        key={item}
                        className={`${styles.filterTab} ${filter === item ? styles.filterTabActive : ''}`}
                        onClick={() => setFilter(item)}
                    >
                        {item === 'ALL' ? `All (${bookings.length})` : `${item} (${bookings.filter((booking) => booking.status === item).length})`}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <Loader size={32} className={styles.spin} />
                    <p>Loading inspection bookings…</p>
                </div>
            ) : null}

            {!loading && error ? (
                <div className={styles.errorState}>
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button onClick={fetchData}>Retry</button>
                </div>
            ) : null}

            {!loading && !error && filtered.length === 0 ? (
                <div className={styles.emptyState}>
                    <ClipboardList size={48} strokeWidth={1} />
                    <p>No {filter !== 'ALL' ? filter.toLowerCase() : ''} bookings found.</p>
                </div>
            ) : null}

            {!loading && !error && filtered.length > 0 ? (
                <div className={styles.bentoGrid}>
                    {filtered.map((booking) => (
                        <BookingCard key={booking.bookingId} booking={booking} onAssign={setAssignTarget} onViewReport={handleViewReport} />
                    ))}
                </div>
            ) : null}

            {assignTarget ? (
                <AssignModal
                    booking={assignTarget}
                    inspectors={inspectors}
                    onConfirm={handleAssign}
                    onClose={() => setAssignTarget(null)}
                    loading={assigning}
                />
            ) : null}

            {reportTarget ? (
                <ReportModal
                    booking={reportTarget}
                    report={report}
                    loading={reportLoading}
                    error={reportError}
                    onClose={() => setReportTarget(null)}
                />
            ) : null}
        </div>
    );
}
