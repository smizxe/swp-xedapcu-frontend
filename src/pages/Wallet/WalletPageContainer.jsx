import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../service/authService';
import { getBalance, getTransactions, withdraw } from '../../service/walletService';
import { createDepositUrl } from '../../service/paymentService';
import WalletPage from './WalletPage';

const WalletPageContainer = () => {
    const { user } = useAuth();
    const currentUser = getCurrentUser();
    const storedUser = (() => {
        try {
            const raw = localStorage.getItem('user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();
    const resolvedUserId = user?.userId
        || user?.id
        || storedUser?.userId
        || storedUser?.id
        || currentUser?.userId
        || localStorage.getItem('userId');
    const userId = resolvedUserId != null && resolvedUserId !== '' ? Number(resolvedUserId) : null;

    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWalletData = useCallback(async () => {
        if (!userId) {
            setWalletData({ balance: 0 });
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const balance = await getBalance(userId);
            setWalletData({ balance: Number(balance) || 0 });
        } catch {
            message.error('Failed to load wallet data.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const fetchTransactions = useCallback(async () => {
        if (!userId) {
            setTransactions([]);
            return;
        }
        try {
            const data = await getTransactions(userId, 0, 50);
            // Backend returns a Spring Page object
            const content = data.content || data;
            setTransactions(Array.isArray(content) ? content : []);
        } catch {
            message.error('Failed to load transaction history.');
            setTransactions([]);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) {
            setWalletData({ balance: 0 });
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        fetchWalletData();
        fetchTransactions();
    }, [userId, fetchWalletData, fetchTransactions]);

    const handleDeposit = async (amount) => {
        if (!userId) {
            message.error('Please log in first.');
            return;
        }
        try {
            const result = await createDepositUrl(userId, amount);
            if (result.paymentUrl) {
                // Redirect to VNPay payment gateway
                window.location.href = result.paymentUrl;
            } else {
                message.error('Failed to create payment link.');
            }
        } catch (err) {
            message.error(err.response?.data || 'Failed to create deposit URL.');
        }
    };

    const handleWithdraw = async (amount, bankAccount) => {
        if (!userId) {
            message.error('Please log in first.');
            return;
        }
        try {
            await withdraw(userId, amount, bankAccount);
            message.success('Withdraw request submitted successfully!');
            fetchWalletData();
            fetchTransactions();
        } catch (err) {
            message.error(err.response?.data || 'Withdraw failed.');
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
            onWithdraw={handleWithdraw}
            onRefresh={handleRefresh}
        />
    );
};

export default WalletPageContainer;
