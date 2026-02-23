import { useState } from 'react';
import {
    Button,
    Table,
    Tag,
    DatePicker,
    Select,
    Modal,
    InputNumber,
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
    DollarCircleOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import styles from './WalletPage.module.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TRANSACTION_TYPES = [
    { value: 'DEPOSIT', label: 'Deposit', color: '#2D5A27', bg: '#e8f5e9' },
    { value: 'CONTRACT_DEPOSIT', label: 'Contract Deposit', color: '#c0392b', bg: '#fdecea' },
    { value: 'MILESTONE', label: 'Milestone Payment', color: '#c0392b', bg: '#fdecea' },
    { value: 'CORRECTION_FEE', label: 'Correction Fee', color: '#c0392b', bg: '#fdecea' },
    { value: 'REFUND', label: 'Refund', color: '#2D5A27', bg: '#e8f5e9' },
];

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '—';
    const abs = Math.abs(amount);
    const formatted = abs.toLocaleString('vi-VN') + ' đ';
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
};

const formatVND = (amount) => {
    if (!amount && amount !== 0) return '—';
    return Math.abs(amount).toLocaleString('vi-VN') + ' VND';
};

const getTypeInfo = (type) =>
    TRANSACTION_TYPES.find((t) => t.value === type) || { label: type, color: '#666', bg: '#f0f0f0' };

const WalletPage = ({
    walletData,
    transactions = [],
    isLoading = false,
    onDeposit,
    onRefresh,
}) => {
    const [filterType, setFilterType] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [depositOpen, setDepositOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState(null);
    const [depositLoading, setDepositLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);

    const currentBalance = walletData?.balance ?? 0;
    const totalDeposit = walletData?.totalDeposit ?? 0;
    const totalPayment = walletData?.totalPayment ?? 0;
    const totalRefund = walletData?.totalRefund ?? 0;

    // Filter logic
    const filteredTx = transactions.filter((tx) => {
        const matchType = filterType ? tx.type === filterType : true;
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

    const handleViewDetail = (record) => {
        setSelectedTx(record);
        setDetailOpen(true);
    };

    const columns = [
        {
            title: 'Transaction Type',
            dataIndex: 'type',
            key: 'type',
            width: 220,
            render: (type, record) => {
                const info = getTypeInfo(type);
                const isPositive = record.amount >= 0;
                return (
                    <span className={styles.typeCell}>
                        {isPositive ? (
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
            width: 130,
            render: (amount) => (
                <span
                    className={amount >= 0 ? styles.amountPositive : styles.amountNegative}
                >
                    {formatCurrency(amount)}
                </span>
            ),
        },
        {
            title: 'Balance Before',
            dataIndex: 'balanceBefore',
            key: 'balanceBefore',
            width: 140,
            render: (val) => (
                <span className={styles.balanceCell}>
                    {val?.toLocaleString('vi-VN')} đ
                </span>
            ),
        },
        {
            title: 'Balance After',
            dataIndex: 'balanceAfter',
            key: 'balanceAfter',
            width: 140,
            render: (val) => (
                <span className={styles.balanceCellBold}>
                    {val?.toLocaleString('vi-VN')} đ
                </span>
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
                        {d.toLocaleString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
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
                                block
                            >
                                Deposit
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

                        {/* Stats */}
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Deposit</div>
                            <div className={styles.statPositive}>
                                <ArrowUpOutlined /> {formatVND(totalDeposit)}
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Payment</div>
                            <div className={styles.statNegative}>
                                <ArrowDownOutlined /> {formatVND(totalPayment)}
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Refund</div>
                            <div className={styles.statRefund}>
                                <DollarCircleOutlined /> {formatVND(totalRefund)}
                            </div>
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
                                rowKey={(r) => r.id || Math.random()}
                                loading={isLoading}
                                pagination={{
                                    pageSize: 8,
                                    showSizeChanger: false,
                                    showTotal: (total) => `${total} transaction(s)`,
                                }}
                                className={styles.txTable}
                                scroll={{ x: 900 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            <Modal
                title={
                    <span className={styles.modalTitle}>
                        <WalletOutlined /> Top Up Wallet
                    </span>
                }
                open={depositOpen}
                onCancel={() => { setDepositOpen(false); setDepositAmount(null); }}
                footer={null}
                className={styles.depositModal}
                centered
            >
                <div className={styles.depositContent}>
                    <p className={styles.depositSubtitle}>Enter the amount you want to deposit into your wallet</p>

                    {/* Input row: number field + VND label flush together */}
                    <Space.Compact className={styles.depositInputRow}>
                        <InputNumber
                            className={styles.depositInput}
                            placeholder="Enter amount (VND)"
                            value={depositAmount}
                            onChange={setDepositAmount}
                            min={1000}
                            step={10000}
                            controls={false}
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(v) => v.replace(/,/g, '')}
                        />
                        <Button className={styles.currencyTag} disabled>VND</Button>
                    </Space.Compact>

                    {/* Quick-select amounts */}
                    <div className={styles.quickAmounts}>
                        {[50000, 100000, 200000, 500000].map((amt) => (
                            <Button
                                key={amt}
                                className={`${styles.quickBtn} ${depositAmount === amt ? styles.quickBtnActive : ''}`}
                                onClick={() => setDepositAmount(amt)}
                            >
                                {amt.toLocaleString('vi-VN')}đ
                            </Button>
                        ))}
                    </div>

                    {/* Action buttons side by side */}
                    <div className={styles.depositActions}>
                        <Button
                            type="primary"
                            className={styles.btnConfirmDeposit}
                            loading={depositLoading}
                            onClick={handleDeposit}
                        >
                            Confirm Deposit
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
                            { label: 'Transaction Type', value: getTypeInfo(selectedTx.type).label },
                            { label: 'Amount', value: formatCurrency(selectedTx.amount) },
                            { label: 'Balance Before', value: `${selectedTx.balanceBefore?.toLocaleString('en-US')} đ` },
                            { label: 'Balance After', value: `${selectedTx.balanceAfter?.toLocaleString('en-US')} đ` },
                            { label: 'Time', value: new Date(selectedTx.createdAt).toLocaleString('en-US') },
                            { label: 'Transaction ID', value: selectedTx.id || '—' },
                            { label: 'Note', value: selectedTx.note || '—' },
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
