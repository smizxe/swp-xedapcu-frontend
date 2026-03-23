import { useState } from 'react';
import {
    Button,
    Table,
    Tag,
    DatePicker,
    Select,
    Modal,
    InputNumber,
    Input,
    Space,
    Spin,
    Tooltip,
} from 'antd';
import {
    WalletOutlined,
    PlusOutlined,
    ReloadOutlined,
    EyeOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    BankOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import styles from './WalletPage.module.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TRANSACTION_TYPES = [
    { value: 'DEPOSIT', label: 'Deposit', color: '#2D5A27', bg: '#e8f5e9' },
    { value: 'WITHDRAW', label: 'Withdraw', color: '#c0392b', bg: '#fdecea' },
    { value: 'WITHDRAWAL', label: 'Withdraw', color: '#c0392b', bg: '#fdecea' },
    { value: 'ORDER_DEPOSIT', label: 'Order Deposit', color: '#c0392b', bg: '#fdecea' },
    { value: 'ORDER_PAYMENT', label: 'Order Payment', color: '#c0392b', bg: '#fdecea' },
    { value: 'REFUND', label: 'Refund', color: '#2D5A27', bg: '#e8f5e9' },
    { value: 'COMPENSATION', label: 'Compensation', color: '#2D5A27', bg: '#e8f5e9' },
    { value: 'TRANSFER', label: 'Transfer', color: '#2f54eb', bg: '#edf2ff' },
    { value: 'FEE', label: 'Fee', color: '#8c6d1f', bg: '#fff7e6' },
];

const STATUS_COLOR = {
    PENDING: 'processing',
    COMPLETED: 'success',
    FAILED: 'error',
    CANCELLED: 'default',
};

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    const abs = Math.abs(Number(amount));
    const formatted = abs.toLocaleString('vi-VN') + ' đ';
    return Number(amount) < 0 ? `-${formatted}` : `+${formatted}`;
};

const getTypeInfo = (type) =>
    TRANSACTION_TYPES.find((t) => t.value === type) || { label: type || 'Unknown', color: '#666', bg: '#f0f0f0' };

const isPositiveType = (type) => ['DEPOSIT', 'REFUND', 'COMPENSATION'].includes(type);

const WalletPage = ({
    walletData,
    walletError = '',
    transactions = [],
    isLoading = false,
    onDeposit,
    onWithdraw,
    onRefresh,
}) => {
    const [filterType, setFilterType] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [depositOpen, setDepositOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState(null);
    const [depositLoading, setDepositLoading] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState(null);
    const [withdrawBank, setWithdrawBank] = useState('');
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    const currentBalance = walletData?.balance ?? 0;

    // Filter logic — use transactionType from backend response
    const filteredTx = transactions.filter((tx) => {
        const txType = tx.transactionType || tx.type;
        const matchType = filterType ? txType === filterType : true;
        const matchDate = dateRange
            ? new Date(tx.createdAt) >= dateRange[0].toDate() &&
            new Date(tx.createdAt) <= dateRange[1].toDate()
            : true;
        return matchType && matchDate;
    });

    const handleDeposit = async () => {
        if (!depositAmount || depositAmount <= 0) return;
        setDepositLoading(true);
        try {
            if (onDeposit) await onDeposit(depositAmount);
        } finally {
            setDepositLoading(false);
            setDepositOpen(false);
            setDepositAmount(null);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || withdrawAmount <= 0 || !withdrawBank.trim()) return;
        setWithdrawLoading(true);
        try {
            if (onWithdraw) await onWithdraw(withdrawAmount, withdrawBank.trim());
            setWithdrawOpen(false);
            setWithdrawAmount(null);
            setWithdrawBank('');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleViewDetail = (record) => {
        setSelectedTx(record);
        setDetailOpen(true);
    };

    const columns = [
        {
            title: 'Type',
            dataIndex: 'transactionType',
            key: 'transactionType',
            width: 200,
            render: (type, record) => {
                const txType = type || record.type;
                const info = getTypeInfo(txType);
                const positive = isPositiveType(txType);
                return (
                    <span className={styles.typeCell}>
                        {positive ? (
                            <ArrowUpOutlined className={styles.iconUp} />
                        ) : (
                            <ArrowDownOutlined className={styles.iconDown} />
                        )}
                        <Tag
                            style={{
                                color: info.color,
                                background: info.bg,
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {info.label}
                        </Tag>
                    </span>
                );
            },
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 160,
            render: (amount, record) => {
                const txType = record.transactionType || record.type;
                const positive = isPositiveType(txType);
                return (
                    <span className={positive ? styles.amountPositive : styles.amountNegative}>
                        {positive ? '+' : '-'}{Math.abs(Number(amount)).toLocaleString('vi-VN')} đ
                    </span>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={STATUS_COLOR[status] || 'default'}>
                    {status || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 170,
            render: (val) => {
                if (!val) return '—';
                const d = new Date(val);
                return (
                    <span style={{ whiteSpace: 'nowrap' }}>
                        {d.toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                );
            },
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="View Detail">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        className={styles.detailBtn}
                        onClick={() => handleViewDetail(record)}
                    >
                        Detail
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <Header variant="dark" />

            <div className={styles.pageWrapper}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Wallet Management</h1>
                    <p className={styles.pageSubtitle}>Manage your balance and transaction history</p>
                </div>

                <div className={styles.mainGrid}>
                    {/* Left Panel */}
                    <div className={styles.leftPanel}>
                        {walletError && (
                            <div className={styles.warningCard}>
                                <div className={styles.warningTitle}>Wallet sync issue</div>
                                <div className={styles.warningText}>{walletError}</div>
                            </div>
                        )}
                        <div className={styles.balanceCard}>
                            <div className={styles.balanceLabel}>CURRENT BALANCE</div>
                            {isLoading ? (
                                <Spin className={styles.balanceSpin} />
                            ) : (
                                <div className={styles.balanceAmount}>
                                    {currentBalance.toLocaleString('vi-VN')} <span className={styles.currency}>đ</span>
                                </div>
                            )}
                            <Button
                                className={styles.btnDeposit}
                                icon={<PlusOutlined />}
                                onClick={() => setDepositOpen(true)}
                                disabled={Boolean(walletError)}
                                block
                            >
                                Deposit
                            </Button>
                            <Button
                                className={styles.btnWithdraw}
                                icon={<BankOutlined />}
                                onClick={() => setWithdrawOpen(true)}
                                disabled={Boolean(walletError)}
                                block
                            >
                                Withdraw
                            </Button>
                            <Button
                                className={styles.btnRefresh}
                                icon={<ReloadOutlined />}
                                onClick={onRefresh}
                                block
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel - Transaction History */}
                    <div className={styles.rightPanel}>
                        <div className={styles.tableCard}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableTitle}>
                                    <ReloadOutlined className={styles.tableTitleIcon} />
                                    Transaction History
                                </div>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={onRefresh}
                                    className={styles.refreshBtn}
                                >
                                    Refresh
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className={styles.filterRow}>
                                <Select
                                    allowClear
                                    placeholder="Transaction Type"
                                    className={styles.filterSelect}
                                    onChange={setFilterType}
                                    value={filterType}
                                >
                                    {TRANSACTION_TYPES.map((t) => (
                                        <Option key={t.value} value={t.value}>
                                            {t.label}
                                        </Option>
                                    ))}
                                </Select>
                                <RangePicker
                                    className={styles.filterDate}
                                    onChange={setDateRange}
                                    placeholder={['From Date', 'To Date']}
                                    value={dateRange}
                                />
                            </div>

                            <Table
                                columns={columns}
                                dataSource={filteredTx}
                                rowKey={(r) => r.transactionId || r.id || Math.random()}
                                loading={isLoading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: false,
                                    showTotal: (total) => `${total} transaction(s)`,
                                }}
                                className={styles.txTable}
                                scroll={{ x: 750 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            <Modal
                title={
                    <span className={styles.modalTitle}>
                        <WalletOutlined /> Top Up Wallet (VNPay)
                    </span>
                }
                open={depositOpen}
                onCancel={() => { setDepositOpen(false); setDepositAmount(null); }}
                footer={null}
                className={styles.depositModal}
                centered
            >
                <div className={styles.depositContent}>
                    <p className={styles.depositSubtitle}>Enter the amount to deposit via VNPay. You will be redirected to VNPay to complete the payment.</p>

                    <Space.Compact className={styles.depositInputRow}>
                        <InputNumber
                            className={styles.depositInput}
                            placeholder="Enter amount (VND)"
                            value={depositAmount}
                            onChange={setDepositAmount}
                            min={10000}
                            step={10000}
                            controls={false}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(v) => v.replace(/,/g, '')}
                        />
                        <Button className={styles.currencyTag} disabled>VND</Button>
                    </Space.Compact>

                    {/* Quick-select amounts */}
                    <div className={styles.quickAmounts}>
                        {[50000, 100000, 200000, 500000, 1000000].map((amt) => (
                            <Button
                                key={amt}
                                className={`${styles.quickBtn} ${depositAmount === amt ? styles.quickBtnActive : ''}`}
                                onClick={() => setDepositAmount(amt)}
                            >
                                {amt.toLocaleString('vi-VN')}đ
                            </Button>
                        ))}
                    </div>

                    <div className={styles.depositActions}>
                        <Button
                            type="primary"
                            className={styles.btnConfirmDeposit}
                            loading={depositLoading}
                            onClick={handleDeposit}
                            disabled={!depositAmount || depositAmount < 10000}
                        >
                            Pay with VNPay
                        </Button>
                        <Button
                            className={styles.btnCancelDeposit}
                            onClick={() => { setDepositOpen(false); setDepositAmount(null); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Withdraw Modal */}
            <Modal
                title={
                    <span className={styles.modalTitle}>
                        <BankOutlined /> Withdraw Funds
                    </span>
                }
                open={withdrawOpen}
                onCancel={() => { setWithdrawOpen(false); setWithdrawAmount(null); setWithdrawBank(''); }}
                footer={null}
                centered
            >
                <div className={styles.depositContent}>
                    <p className={styles.depositSubtitle}>Enter the amount and your bank account to withdraw.</p>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Amount (VND)</label>
                        <Space.Compact className={styles.depositInputRow}>
                            <InputNumber
                                className={styles.depositInput}
                                placeholder="Enter amount"
                                value={withdrawAmount}
                                onChange={setWithdrawAmount}
                                min={10000}
                                step={10000}
                                controls={false}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(v) => v.replace(/,/g, '')}
                            />
                            <Button className={styles.currencyTag} disabled>VND</Button>
                        </Space.Compact>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Bank Account</label>
                        <Input
                            placeholder="e.g. Vietcombank - 1234567890 - Nguyen Van A"
                            value={withdrawBank}
                            onChange={(e) => setWithdrawBank(e.target.value)}
                        />
                    </div>

                    <div className={styles.depositActions}>
                        <Button
                            type="primary"
                            className={styles.btnConfirmDeposit}
                            loading={withdrawLoading}
                            onClick={handleWithdraw}
                            disabled={!withdrawAmount || withdrawAmount < 10000 || !withdrawBank.trim()}
                        >
                            Confirm Withdraw
                        </Button>
                        <Button
                            className={styles.btnCancelDeposit}
                            onClick={() => { setWithdrawOpen(false); setWithdrawAmount(null); setWithdrawBank(''); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                title={<span><EyeOutlined /> Transaction Detail</span>}
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={<Button onClick={() => setDetailOpen(false)}>Close</Button>}
                centered
            >
                {selectedTx && (
                    <div className={styles.detailContent}>
                        {[
                            { label: 'Transaction ID', value: selectedTx.transactionId || selectedTx.id || '—' },
                            { label: 'Type', value: getTypeInfo(selectedTx.transactionType || selectedTx.type).label },
                            { label: 'Amount', value: formatCurrency(selectedTx.amount) },
                            { label: 'Status', value: selectedTx.status || '—' },
                            { label: 'Time', value: selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString('vi-VN') : '—' },
                            ...(selectedTx.bankAccount ? [{ label: 'Bank Account', value: selectedTx.bankAccount }] : []),
                        ].map(({ label, value }) => (
                            <div key={label} className={styles.detailRow}>
                                <span className={styles.detailLabel}>{label}</span>
                                <span className={styles.detailValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WalletPage;
