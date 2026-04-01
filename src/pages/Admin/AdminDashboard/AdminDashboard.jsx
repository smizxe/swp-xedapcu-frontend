import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import adminService from '../../../services/adminService';
import styles from './AdminDashboard.module.css';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { TrendingUp, DollarSign, RefreshCw, Calendar, AlertCircle, Users, ReceiptText } from 'lucide-react';

const EMERALD = { 900: '#064E3B', 700: '#047857', 500: '#10B981', 300: '#6EE7B7' };
const PIE_COLORS = [EMERALD[700], EMERALD[500], '#14B8A6', '#94A3B8'];

const fmtCurrency = (value) =>
    value === null || value === undefined ? '—' : `${Number(value).toLocaleString('vi-VN')} ₫`;

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const FEE_LABEL = {
    FEE: 'Post Fee',
    PENALTY: 'Cancel Penalty',
    INSPECTION_FEE: 'Inspection Fee',
    DEPOSIT: 'Platform Commission',
};

const INCOMING_TYPES = new Set(['FEE', 'PENALTY', 'INSPECTION_FEE', 'DEPOSIT']);
const today = new Date();
const iso = (date) => date.toISOString().slice(0, 10);
const RANGES = [
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: 'All Time', days: 0 },
];

const classifyFee = (tx) => {
    const type = (tx.transactionType || tx.type || '').toUpperCase();
    if (FEE_LABEL[type] && type !== 'DEPOSIT') return FEE_LABEL[type];

    if (type === 'DEPOSIT') {
        const desc = (tx.description || '').toLowerCase();
        if (desc.includes('10%')) return 'Post Fee (10%)';
        if (desc.includes('5%')) return 'Post Fee (5%)';
        if (desc.includes('penalty') || desc.includes('1%')) return 'Cancel Penalty (1%)';
        return 'Platform Commission';
    }

    return null;
};

const parsePostId = (desc = '') => {
    const match = desc.match(/post\s*#?(\d+)/i) || desc.match(/#(\d+)/);
    return match ? `#${match[1]}` : '—';
};

const groupByDay = (txs) => {
    const map = {};
    txs.forEach((tx) => {
        const date = new Date(tx.createdAt);
        const key = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
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

const StatCard = ({ icon: Icon, title, subtitle, value, accent }) => (
    <div className={styles.statCard}>
        <div className={styles.statCardGlow} style={{ background: accent }} />
        <div className={styles.statCardInner}>
            <div className={styles.statIcon} style={{ background: `${accent}22`, color: accent }}>
                {Icon ? <Icon size={22} /> : null}
            </div>
            <div className={styles.statInfo}>
                <div className={styles.statTitle}>{title}</div>
                <div className={styles.statSubtitle}>{subtitle}</div>
                <div className={styles.statValue}>{value}</div>
            </div>
        </div>
    </div>
);

const CustomAreaTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            <div className={styles.tooltipValue}>{fmtCurrency(payload[0].value)}</div>
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

function AdminDashboard() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rangeIdx, setRangeIdx] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchData = useCallback(async () => {
        if (!user?.userId) return;

        try {
            setLoading(true);
            setError('');
            const [summaryData, txs] = await Promise.all([
                adminService.getDashboardSummary(),
                adminService.getAdminWalletTransactions(user.userId, 0, 500),
            ]);

            setSummary(summaryData);
            setTransactions(txs);
        } catch (err) {
            setError(err?.response?.data || 'Failed to load admin overview.');
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    useEffect(() => {
        if (!authLoading && isAdmin) {
            fetchData();
        }
    }, [authLoading, isAdmin, fetchData]);

    const filteredTx = useMemo(() => {
        const range = RANGES[rangeIdx];
        let from = null;
        let to = null;

        if (fromDate && toDate) {
            from = new Date(fromDate);
            to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
        } else if (range?.days > 0) {
            to = new Date();
            to.setHours(23, 59, 59, 999);
            from = new Date();
            from.setDate(from.getDate() - range.days);
            from.setHours(0, 0, 0, 0);
        }

        return transactions.filter((tx) => {
            if (!tx.createdAt) return false;
            const date = new Date(tx.createdAt);
            if (from && date < from) return false;
            if (to && date > to) return false;
            return true;
        });
    }, [transactions, rangeIdx, fromDate, toDate]);

    const incomingTx = useMemo(
        () =>
            filteredTx.filter((tx) => {
                const type = (tx.transactionType || tx.type || '').toUpperCase();
                return INCOMING_TYPES.has(type) && Number(tx.amount) > 0;
            }),
        [filteredTx]
    );

    const todayEarnings = useMemo(
        () =>
            transactions
                .filter((tx) => {
                    const type = (tx.transactionType || tx.type || '').toUpperCase();
                    return INCOMING_TYPES.has(type) && Number(tx.amount) > 0 && isToday(tx.createdAt);
                })
                .reduce((sum, tx) => sum + Number(tx.amount), 0),
        [transactions]
    );

    const pieData = useMemo(() => {
        const buckets = {};
        incomingTx.forEach((tx) => {
            const label = classifyFee(tx) || 'Other Income';
            if (!buckets[label]) buckets[label] = 0;
            buckets[label] += Number(tx.amount);
        });
        const total = Object.values(buckets).reduce((sum, value) => sum + value, 0) || 1;
        return Object.entries(buckets).map(([name, value]) => ({
            name,
            value,
            pct: ((value / total) * 100).toFixed(1),
        }));
    }, [incomingTx]);

    const areaData = useMemo(() => groupByDay(incomingTx), [incomingTx]);

    if (authLoading) return null;

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Admin Overview</h1>
                    <p className={styles.pageSubtitle}>Unified platform metrics, revenue flow, and operational health</p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                    <RefreshCw size={16} className={loading ? styles.spinning : ''} />
                    Refresh
                </button>
            </div>

            {error ? (
                <div className={styles.errorBanner}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            ) : null}

            <div className={styles.statsRow}>
                <StatCard
                    icon={DollarSign}
                    title="Platform Revenue"
                    subtitle="Current admin-side revenue pool"
                    value={loading ? '...' : fmtCurrency(summary?.financialStats?.platformRevenue ?? 0)}
                    accent={EMERALD[900]}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Today's Earnings"
                    subtitle="Incoming fees collected today"
                    value={loading ? '...' : fmtCurrency(todayEarnings)}
                    accent={EMERALD[700]}
                />
                <StatCard
                    icon={Users}
                    title="Total Users"
                    subtitle="Registered accounts"
                    value={loading ? '...' : Number(summary?.userStats?.totalUsers ?? 0).toLocaleString('vi-VN')}
                    accent={EMERALD[500]}
                />
                <StatCard
                    icon={ReceiptText}
                    title="Completed Orders"
                    subtitle="Orders finished successfully"
                    value={loading ? '...' : Number(summary?.orderStats?.completed ?? 0).toLocaleString('vi-VN')}
                    accent={EMERALD[300]}
                />
            </div>

            <div className={styles.quickStatsGrid}>
                <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>Total Transactions</span>
                    <strong className={styles.quickStatValue}>
                        {loading ? '...' : Number(summary?.financialStats?.totalTransactions ?? 0).toLocaleString('vi-VN')}
                    </strong>
                </div>
                <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>Total Order Value</span>
                    <strong className={styles.quickStatValue}>
                        {loading ? '...' : fmtCurrency(summary?.financialStats?.totalOrderValue ?? 0)}
                    </strong>
                </div>
                <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>Active Users</span>
                    <strong className={styles.quickStatValue}>
                        {loading ? '...' : Number(summary?.userStats?.activeUsers ?? 0).toLocaleString('vi-VN')}
                    </strong>
                </div>
                <div className={styles.quickStat}>
                    <span className={styles.quickStatLabel}>Active Posts</span>
                    <strong className={styles.quickStatValue}>
                        {loading ? '...' : Number(summary?.postStats?.active ?? 0).toLocaleString('vi-VN')}
                    </strong>
                </div>
            </div>

            <div className={styles.glassCard}>
                <div className={styles.filterRow}>
                    <Calendar size={16} className={styles.filterIcon} />
                    <span className={styles.filterLabel}>Date Range:</span>
                    <div className={styles.rangeChips}>
                        {RANGES.map((range, index) => (
                            <button
                                key={range.label}
                                className={`${styles.chip} ${rangeIdx === index && !fromDate ? styles.chipActive : ''}`}
                                onClick={() => {
                                    setRangeIdx(index);
                                    setFromDate('');
                                    setToDate('');
                                }}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.customRange}>
                        <input
                            type="date"
                            className={styles.datePicker}
                            value={fromDate}
                            max={iso(today)}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setRangeIdx(-1);
                            }}
                        />
                        <span className={styles.dateSep}>→</span>
                        <input
                            type="date"
                            className={styles.datePicker}
                            value={toDate}
                            max={iso(today)}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setRangeIdx(-1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.chartsGrid}>
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
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                    {pieData.map((_, index) => (
                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip content={<CustomPieTooltip />} />
                                <Legend iconType="circle" iconSize={10} formatter={(value) => <span className={styles.legendText}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

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
                                    tickFormatter={(value) => (value === 0 ? '0' : `${(value / 1000).toFixed(0)}k`)}
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
                                    const category = classifyFee(tx) || 'Platform Commission';
                                    const postId = parsePostId(tx.description || '');
                                    return (
                                        <tr key={tx.transactionId} className={styles.tableRow}>
                                            <td>
                                                <span className={styles.txId}>#{tx.transactionId}</span>
                                            </td>
                                            <td>
                                                <span className={styles.feeBadge}>{category}</span>
                                            </td>
                                            <td>
                                                <span className={styles.amountPositive}>+{Number(tx.amount).toLocaleString('vi-VN')} ₫</span>
                                            </td>
                                            <td className={styles.timeCell}>
                                                {tx.createdAt
                                                    ? new Date(tx.createdAt).toLocaleString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
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
}

export default AdminDashboard;
