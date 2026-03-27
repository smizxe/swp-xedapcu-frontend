import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import styles from './AdminDashboard.module.css';
import {
    AreaChart, Area, PieChart, Pie, Cell, Tooltip as ReTooltip,
    XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import {
    TrendingUp, DollarSign, RefreshCw, Calendar, AlertCircle, Users
} from 'lucide-react';

// ─── Palette ────────────────────────────────────────────────────────────────
const EMERALD = { 900: '#064E3B', 700: '#047857', 500: '#10B981', 300: '#6EE7B7', 100: '#D1FAE5' };
const PIE_COLORS = [EMERALD[700], EMERALD[500], '#14B8A6', '#94A3B8'];

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
    n === null || n === undefined
        ? '—'
        : Number(n).toLocaleString('vi-VN') + ' ₫';

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
};

const FEE_LABEL = {
    FEE: 'Post Fee',
    PENALTY: 'Cancel Penalty',
    INSPECTION_FEE: 'Inspection Fee',
    DEPOSIT: 'Platform Commission',
};

const INCOMING_TYPES = new Set(['FEE', 'PENALTY', 'INSPECTION_FEE', 'DEPOSIT']);

const classifyFee = (tx) => {
    const type = (tx.transactionType || tx.type || '').toUpperCase();
    // Nếu BE đã dùng enum mới → map trực tiếp
    if (FEE_LABEL[type] && type !== 'DEPOSIT') return FEE_LABEL[type];
    // Fallback: DEPOSIT (data cũ) → parse description
    if (type === 'DEPOSIT') {
        const desc = (tx.description || '').toLowerCase();
        if (desc.includes('10%')) return 'Post Fee (10%)';
        if (desc.includes('5%')) return 'Post Fee (5%)';
        if (desc.includes('penalty') || desc.includes('1%')) return 'Cancel Penalty (1%)';
        return 'Platform Commission';
    }
    return null; // không phải income
};

const parsePostId = (desc = '') => {
    const match = desc.match(/post\s*#?(\d+)/i) || desc.match(/#(\d+)/);
    return match ? `#${match[1]}` : '—';
};

const groupByDay = (txs) => {
    const map = {};
    txs.forEach((tx) => {
        const d = new Date(tx.createdAt);
        const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!map[key]) map[key] = 0;
        map[key] += Math.abs(Number(tx.amount));
    });
    return Object.entries(map)
        .sort((a, b) => {
            const [ad, am] = a[0].split('/').map(Number);
            const [bd, bm] = b[0].split('/').map(Number);
            return am !== bm ? am - bm : ad - bd;
        })
        .map(([date, revenue]) => ({ date, revenue }));
};

// ─── Date Range Picker (native) ───────────────────────────────────────────
const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const RANGES = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: 'All Time', days: 0 },
];

// ─── Stat Card ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, subtitle, value, accent }) => (
    <div className={styles.statCard}>
        <div className={styles.statCardGlow} style={{ background: accent }} />
        <div className={styles.statCardInner}>
            <div className={styles.statIcon} style={{ background: `${accent}22`, color: accent }}>
                <Icon size={22} />
            </div>
            <div className={styles.statInfo}>
                <div className={styles.statTitle}>{title}</div>
                <div className={styles.statSubtitle}>{subtitle}</div>
                <div className={styles.statValue}>{value}</div>
            </div>
        </div>
    </div>
);

// ─── Custom Tooltip for Recharts ─────────────────────────────────────────
const CustomAreaTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            <div className={styles.tooltipValue}>{fmt(payload[0].value)}</div>
        </div>
    );
};

const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>{payload[0].name}</div>
            <div className={styles.tooltipValue}>{`${payload[0].payload.pct}%`}</div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rangeIdx, setRangeIdx] = useState(1); // default 30 days
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        if (!user?.userId) return;
        try {
            setLoading(true);
            setError('');
            const [bal, txs, uStats] = await Promise.all([
                adminService.getAdminWalletBalance(user.userId),
                adminService.getAdminWalletTransactions(user.userId, 0, 500),
                adminService.getUserStats()
            ]);
            setBalance(bal);
            setTransactions(txs);
            setUserStats(uStats);
        } catch (err) {
            setError(err?.response?.data || 'Failed to load revenue data.');
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        if (!authLoading && isAdmin) fetchData();
    }, [authLoading, isAdmin, fetchData]);

    // ── Date filtering ─────────────────────────────────────────────────────
    const filteredTx = useMemo(() => {
        const range = RANGES[rangeIdx];
        let from = null, to = null;

        if (fromDate && toDate) {
            from = new Date(fromDate);
            to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
        } else if (range.days > 0) {
            to = new Date();
            to.setHours(23, 59, 59, 999); // Set to end of day to avoid timezone/clock clipping newer records
            from = new Date();
            from.setDate(from.getDate() - range.days);
            from.setHours(0, 0, 0, 0);
        }

        return transactions.filter((tx) => {
            if (!tx.createdAt) return false;
            const d = new Date(tx.createdAt);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
    }, [transactions, rangeIdx, fromDate, toDate]);

    // Incoming revenue: new enum types OR legacy DEPOSIT with positive amount
    const incomingTx = useMemo(
        () => filteredTx.filter((tx) => {
            const type = (tx.transactionType || tx.type || '').toUpperCase();
            return INCOMING_TYPES.has(type) && Number(tx.amount) > 0;
        }),
        [filteredTx]
    );

    // ── Stats ──────────────────────────────────────────────────────────────
    const totalCollected = useMemo(
        () => transactions.filter(tx => {
            const type = (tx.transactionType || tx.type || '').toUpperCase();
            return INCOMING_TYPES.has(type) && Number(tx.amount) > 0;
        }).reduce((s, tx) => s + Number(tx.amount), 0),
        [transactions]
    );

    const todayEarnings = useMemo(
        () => transactions.filter(tx => {
            const type = (tx.transactionType || tx.type || '').toUpperCase();
            return INCOMING_TYPES.has(type) && Number(tx.amount) > 0 && isToday(tx.createdAt);
        }).reduce((s, tx) => s + Number(tx.amount), 0),
        [transactions]
    );

    // Removal of activeListingsFee since we use User Stats now
    // ── Pie data ───────────────────────────────────────────────────────────
    const pieData = useMemo(() => {
        const buckets = {};
        incomingTx.forEach(tx => {
            const cat = classifyFee(tx) || 'Other Income';
            if (!buckets[cat]) buckets[cat] = 0;
            buckets[cat] += Number(tx.amount);
        });
        const total = Object.values(buckets).reduce((s, v) => s + v, 0) || 1;
        return Object.entries(buckets).map(([name, value]) => ({
            name, value, pct: ((value / total) * 100).toFixed(1),
        }));
    }, [incomingTx]);

    // ── Area chart data ────────────────────────────────────────────────────
    const areaData = useMemo(() => groupByDay(incomingTx), [incomingTx]);

    // ── Guards ─────────────────────────────────────────────────────────────
    if (authLoading) return null;

    return (
        <div className={styles.page}>
            {/* ── Page Header ─────────────────────────────────────── */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Revenue Dashboard</h1>
                    <p className={styles.pageSubtitle}>Platform income · Admin wallet analytics</p>
                </div>
                <button
                    className={styles.refreshBtn}
                    onClick={fetchData}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* ── Stat Cards (Top) ──────────────────────────────── */}
            <div className={styles.statsRow}>
                <StatCard
                    icon={DollarSign}
                    title="Total Collected Revenue"
                    subtitle="All-time platform income"
                    value={loading ? '...' : fmt(totalCollected)}
                    accent={EMERALD[900]}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Today's Earnings"
                    subtitle="Collected today"
                    value={loading ? '...' : fmt(todayEarnings)}
                    accent={EMERALD[700]}
                />
                <StatCard
                    icon={Users}
                    title="Total Platform Users"
                    subtitle="Registered accounts"
                    value={loading ? '...' : (userStats?.totalUsers?.toLocaleString('vi-VN') || 0)}
                    accent={EMERALD[500]}
                />
            </div>

            {/* ── Date Range Selector ───────────────────────────── */}
            <div className={styles.glassCard}>
                <div className={styles.filterRow}>
                    <Calendar size={16} className={styles.filterIcon} />
                    <span className={styles.filterLabel}>Date Range:</span>
                    <div className={styles.rangeChips}>
                        {RANGES.map((r, i) => (
                            <button
                                key={r.label}
                                className={`${styles.chip} ${rangeIdx === i && !fromDate ? styles.chipActive : ''}`}
                                onClick={() => { setRangeIdx(i); setFromDate(''); setToDate(''); }}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.customRange}>
                        <input
                            type="date"
                            className={styles.datePicker}
                            value={fromDate}
                            max={iso(today)}
                            onChange={e => { setFromDate(e.target.value); setRangeIdx(-1); }}
                        />
                        <span className={styles.dateSep}>→</span>
                        <input
                            type="date"
                            className={styles.datePicker}
                            value={toDate}
                            max={iso(today)}
                            onChange={e => { setToDate(e.target.value); setRangeIdx(-1); }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Charts (Middle) ───────────────────────────────── */}
            <div className={styles.chartsGrid}>
                {/* Pie Chart */}
                <div className={styles.glassCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>Revenue Breakdown</h3>
                        <p className={styles.chartSubtitle}>Fee type distribution</p>
                    </div>
                    {pieData.length === 0 ? (
                        <div className={styles.emptyChart}>No data in range</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip content={<CustomPieTooltip />} />
                                <Legend
                                    iconType="circle"
                                    iconSize={10}
                                    formatter={(val) => <span className={styles.legendText}>{val}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Area Chart */}
                <div className={styles.glassCard}>
                    <div className={styles.chartHeader}>
                        <h3 className={styles.chartTitle}>Revenue Growth</h3>
                        <p className={styles.chartSubtitle}>Incoming cash flow over time</p>
                    </div>
                    {areaData.length === 0 ? (
                        <div className={styles.emptyChart}>No data in range</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={EMERALD[700]} stopOpacity={0.35} />
                                        <stop offset="95%" stopColor={EMERALD[700]} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={v => v === 0 ? '0' : (v / 1000).toFixed(0) + 'k'}
                                    tick={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <ReTooltip content={<CustomAreaTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={EMERALD[700]}
                                    strokeWidth={2.5}
                                    fill="url(#emeraldGrad)"
                                    dot={{ fill: EMERALD[700], r: 3.5, strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: EMERALD[900] }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Incoming Transactions (Bottom) ───────────────── */}
            <div className={`${styles.glassCard} ${styles.tableCard}`}>
                <div className={styles.tableHeader}>
                    <div>
                        <h3 className={styles.chartTitle}>Incoming Transactions</h3>
                        <p className={styles.chartSubtitle}>{incomingTx.length} transaction(s) in selected range</p>
                    </div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Type Transaction</th>
                                <th>Amount</th>
                                <th>Time</th>
                                <th>Related Post</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.loadingRow}>
                                        <div className={styles.loadingDots}>
                                            <span /><span /><span />
                                        </div>
                                    </td>
                                </tr>
                            ) : incomingTx.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyRow}>
                                        No incoming transactions found in this period.
                                    </td>
                                </tr>
                            ) : (
                                incomingTx.map((tx) => {
                                    const cat = classifyFee(tx) || 'Platform Commission';
                                    const postId = parsePostId(tx.description || '');
                                    return (
                                        <tr key={tx.transactionId} className={styles.tableRow}>
                                            <td>
                                                <span className={styles.txId}>#{tx.transactionId}</span>
                                            </td>
                                            <td>
                                                <span className={styles.feeBadge}>{cat}</span>
                                            </td>
                                            <td>
                                                <span className={styles.amountPositive}>
                                                    +{Number(tx.amount).toLocaleString('vi-VN')} ₫
                                                </span>
                                            </td>
                                            <td className={styles.timeCell}>
                                                {tx.createdAt
                                                    ? new Date(tx.createdAt).toLocaleString('vi-VN', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })
                                                    : '—'}
                                            </td>
                                            <td>
                                                <span className={styles.postIdCell}>{postId}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
