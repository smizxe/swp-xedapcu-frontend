import { useState, useEffect, useCallback } from 'react';
import styles from './InspectorDashboard.module.css';
import {
    getMyBookings,
    getMyRequests,
    confirmBooking,
} from '../../service/inspectionService';
import InspectionReportModal from './InspectionReportModal';
import {
    Shield, ClipboardList, CheckCircle, Clock, AlertCircle,
    Calendar, MapPin, Loader, ChevronRight, FileText
} from 'lucide-react';

/* ── Status badge ──────────────────────────────────────── */
const BOOKING_STATUS = {
    PENDING:   { label: 'Pending Assignment', cls: 'badgePending' },
    ASSIGNED:  { label: 'Assigned to You',    cls: 'badgeAssigned' },
    CONFIRMED: { label: 'In Progress',        cls: 'badgeConfirmed' },
    COMPLETED: { label: 'Completed',          cls: 'badgeCompleted' },
};

const INSPECT_STATUS = {
    PENDING:     { label: 'Pending',     cls: 'badgePending' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badgeConfirmed' },
    COMPLETED:   { label: 'Completed',   cls: 'badgeCompleted' },
};

function StatusBadge({ status, type = 'booking' }) {
    const map = type === 'booking' ? BOOKING_STATUS : INSPECT_STATUS;
    const cfg = map[status] ?? { label: status, cls: 'badgePending' };
    return <span className={`${styles.badge} ${styles[cfg.cls]}`}>{cfg.label}</span>;
}

/* ── Booking task card (My Tasks tab) ──────────────────── */
function BookingCard({ booking, onConfirm, confirming }) {
    // BE status after admin assigns = PENDING (awaiting inspector confirm)
    // BE status after inspector confirms = CONFIRMED
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
                        : <><CheckCircle size={14} /> Confirm & Start Inspection</>
                    }
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

/* ── Inspection request card (In Progress tab) ─────────── */
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

            {hasReport && req.report && (
                <div className={styles.reportSummary}>
                    <div className={styles.ratingRow}>
                        {Array.from({ length: 10 }, (_, i) => (
                            <div
                                key={i}
                                className={`${styles.ratingDot} ${i < req.report.overallRating ? styles.ratingDotFilled : ''}`}
                            />
                        ))}
                        <span>{req.report.overallRating}/10</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function InspectorDashboard() {
    const [tab, setTab]           = useState('tasks');
    const [bookings, setBookings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [confirming, setConfirming] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const [bk, rq] = await Promise.all([
                getMyBookings().catch(() => []),
                getMyRequests().catch(() => []),
            ]);
            setBookings(Array.isArray(bk) ? bk : []);
            setRequests(Array.isArray(rq) ? rq : []);
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

    const handleReportDone = () => {
        setReportTarget(null);
        fetchData();
    };

    const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
    const activeCount  = requests.filter((r) => r.status !== 'COMPLETED').length;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIconWrap}><Shield size={26} /></div>
                    <div>
                        <h1 className={styles.pageTitle}>Inspector Dashboard</h1>
                        <p className={styles.pageSub}>Manage your assigned bicycle inspections</p>
                    </div>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    {loading ? <Loader size={14} className={styles.spin} /> : 'Refresh'}
                </button>
            </div>

            {/* Stats */}
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
                    <div className={styles.statLabel}>In Progress</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardDone}`}>
                    <CheckCircle size={20} className={styles.statIcon} />
                    <div className={styles.statValue}>{requests.filter((r) => r.status === 'COMPLETED').length}</div>
                    <div className={styles.statLabel}>Completed</div>
                </div>
            </div>

            {/* Tabs */}
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

            {/* Content */}
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
                        {bookings.map((b) => (
                            <BookingCard
                                key={b.bookingId} booking={b}
                                onConfirm={handleConfirm} confirming={confirming}
                            />
                        ))}
                      </div>
            )}

            {!loading && !error && tab === 'progress' && (() => {
                const activeReqs    = requests.filter((r) => r.status !== 'COMPLETED');
                const completedReqs = requests.filter((r) => r.status === 'COMPLETED');
                return (
                    <>
                        {/* ── Active inspections ─────────────────── */}
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

                        {/* ── Completed inspections ──────────────── */}
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

            {/* Report Modal */}
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
