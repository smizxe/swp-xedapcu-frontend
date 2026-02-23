import { useState, useEffect } from 'react';
import { message } from 'antd';
import WalletPage from './WalletPage';

// ===== MOCK DATA (replace with real API calls) =====
const MOCK_WALLET = {
    balance: 45156975,
    totalDeposit: 13000,
    totalPayment: 3701225,
    totalRefund: 850000,
};

const MOCK_TRANSACTIONS = [
    {
        id: 'TX001',
        type: 'CONTRACT_DEPOSIT',
        amount: -832000,
        balanceBefore: 45988975,
        balanceAfter: 45156975,
        createdAt: '2025-12-15T02:26:08',
        note: 'Contract deposit payment #HC001',
    },
    {
        id: 'TX002',
        type: 'CONTRACT_DEPOSIT',
        amount: -632000,
        balanceBefore: 46620975,
        balanceAfter: 45988975,
        createdAt: '2025-12-15T01:40:29',
        note: 'Contract deposit payment #HC002',
    },
    {
        id: 'TX003',
        type: 'MILESTONE',
        amount: -59100,
        balanceBefore: 46680075,
        balanceAfter: 46620975,
        createdAt: '2025-12-15T01:19:39',
        note: 'Milestone payment',
    },
    {
        id: 'TX004',
        type: 'CORRECTION_FEE',
        amount: -500000,
        balanceBefore: 47180075,
        balanceAfter: 46680075,
        createdAt: '2025-12-15T01:02:30',
        note: 'Correction fee',
    },
    {
        id: 'TX005',
        type: 'REFUND',
        amount: 500000,
        balanceBefore: 46680075,
        balanceAfter: 47180075,
        createdAt: '2025-12-15T00:57:24',
        note: 'Refund',
    },
    {
        id: 'TX006',
        type: 'CORRECTION_FEE',
        amount: -500000,
        balanceBefore: 47180075,
        balanceAfter: 46680075,
        createdAt: '2025-12-15T00:52:06',
        note: 'Correction fee',
    },
    {
        id: 'TX007',
        type: 'DEPOSIT',
        amount: 1000000,
        balanceBefore: 46180075,
        balanceAfter: 47180075,
        createdAt: '2025-12-14T10:00:00',
        note: 'Top up wallet',
    },
];
// ===================================================

const WalletPageContainer = () => {
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWalletData = async () => {
        setIsLoading(true);
        try {
            // TODO: replace with real API
            // const res = await walletService.getWallet();
            // setWalletData(res.data);
            await new Promise((r) => setTimeout(r, 600)); // simulate fetch
            setWalletData(MOCK_WALLET);
        } catch (err) {
            message.error('Failed to load wallet data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            // TODO: replace with real API
            // const res = await walletService.getTransactions();
            // setTransactions(res.data);
            setTransactions(MOCK_TRANSACTIONS);
        } catch (err) {
            message.error('Failed to load transaction history.');
        }
    };

    useEffect(() => {
        fetchWalletData();
        fetchTransactions();
    }, []);

    const handleDeposit = async (amount) => {
        try {
            // TODO: replace with real API
            // await walletService.deposit({ amount });
            await new Promise((r) => setTimeout(r, 800));
            message.success(`Successfully deposited ${amount.toLocaleString('en-US')} VND!`);
            fetchWalletData();
            fetchTransactions();
        } catch (err) {
            message.error('Deposit failed. Please try again.');
        }
    };

    const handleRefresh = () => {
        fetchWalletData();
        fetchTransactions();
    };

    return (
        <WalletPage
            walletData={walletData}
            transactions={transactions}
            isLoading={isLoading}
            onDeposit={handleDeposit}
            onRefresh={handleRefresh}
        />
    );
};

export default WalletPageContainer;
