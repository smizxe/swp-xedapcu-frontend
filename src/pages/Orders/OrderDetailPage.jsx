import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Descriptions, Modal, DatePicker, Input, Select, Rate } from 'antd';
import {
    ArrowLeftOutlined,
    ScheduleOutlined,
    CarOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser } from '../../service/authService';
import adminService from '../../services/adminService';
import { getOrderById, cancelDeposit, cancelBySeller, completeOrder, scheduleDelivery, sellerConfirmDelivery, adminAssignInspector, inspectorStartDelivery, inspectorMarkDelivered, reportBuyerNoShow, reportSellerNoShow, getSavedOrderDeliveryAddress, saveOrderDeliveryAddress } from '../../service/orderService';
import { createReview, getSellerReviews } from '../../service/reviewService';
import InspectionBookingModal from './InspectionBookingModal';
import styles from './OrderDetailPage.module.css';

const toIsoDateTime = (str) => (str ? str.replace(' ', 'T') : str);

const STATUS_COLOR = {
    PENDING: 'processing',
    DEPOSIT_PAID: 'processing',
    PENDING_SELLER_CONFIRMATION: 'gold',
    PENDING_ADMIN_REVIEW: 'gold',
    ASSIGNED_TO_INSPECTOR: 'cyan',
    IN_DELIVERY: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'default',
    REFUNDED: 'default',
};

const formatPrice = (v) => (v != null ? v.toLocaleString('vi-VN') : '—');
const resolveUserId = (entity) => entity?.userId || entity?.id || null;

function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking inspection modal
    const [bookingOpen, setBookingOpen] = useState(false);

    // Delivery modal
    const [deliveryOpen, setDeliveryOpen] = useState(false);
    const [deliveryForm, setDeliveryForm] = useState({ deliveryAddress: '', deliveryTime: null });
    const [inspectors, setInspectors] = useState([]);
    const [assignInspectorId, setAssignInspectorId] = useState();
    const [assignLoading, setAssignLoading] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    const fetchOrder = useCallback(() => {
        setLoading(true);
        getOrderById(orderId)
            .then(setOrder)
            .catch(() => message.error('Failed to load order details.'))
            .finally(() => setLoading(false));
    }, [orderId]);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            fetchOrder();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [fetchOrder]);

    useEffect(() => {
        setDeliveryForm((prev) => ({
            ...prev,
            deliveryAddress: order?.deliveryAddress || order?.deliverySession?.location || getSavedOrderDeliveryAddress(order?.orderId) || prev.deliveryAddress || '',
        }));
    }, [order?.deliveryAddress, order?.deliverySession?.location, order?.orderId]);

    useEffect(() => {
        const currentRole = String(getCurrentUser()?.role || user?.role || '');
        if (!currentRole.includes('ADMIN')) {
            return;
        }

        adminService.getAllUsers()
            .then((users) => {
                const list = Array.isArray(users) ? users : [];
                setInspectors(list.filter((item) => String(item.role).includes('INSPECTOR')));
            })
            .catch(() => {
                setInspectors([]);
            });
    }, [user?.role]);

    useEffect(() => {
        const currentUserData = getCurrentUser();
        const currentUserId = currentUserData?.userId ? Number(currentUserData.userId) : null;
        const sellerId = resolveUserId(order?.seller);

        if (!order || order.status !== 'COMPLETED' || !sellerId || !currentUserId) {
            setExistingReview(null);
            return;
        }

        getSellerReviews(sellerId, 0, 50)
            .then((pageData) => {
                const reviews = Array.isArray(pageData?.content) ? pageData.content : [];
                const matchedReview = reviews.find((review) =>
                    Number(review.orderId) === Number(order.orderId) &&
                    Number(review.fromUserId) === currentUserId
                );
                setExistingReview(matchedReview || null);
            })
            .catch(() => {
                setExistingReview(null);
            });
    }, [order]);

    const currentUser = getCurrentUser();
    const currentUserEmail = (user?.email || currentUser?.email || '').toLowerCase();
    const currentUserRole = String(user?.role || currentUser?.role || '').toUpperCase();
    const isSeller = !!(currentUserEmail && order?.seller && currentUserEmail === order.seller.email?.toLowerCase());
    const isBuyer = !!(currentUserEmail && order?.buyer && currentUserEmail === order.buyer.email?.toLowerCase());
    const isAdmin = currentUserRole.includes('ADMIN');
    const isAssignedInspector = !!(
        currentUserEmail &&
        order?.assignedInspector &&
        currentUserEmail === order.assignedInspector.email?.toLowerCase()
    );
    const currentUserId = currentUser?.userId ? Number(currentUser.userId) : null;
    const canManageDelivery = isSeller && ['DEPOSIT_PAID', 'PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW'].includes(order?.status);
    const resolvedOrderDeliveryAddress = order?.deliveryAddress || order?.deliverySession?.location || '';
    const savedDeliveryAddress = order?.orderId ? getSavedOrderDeliveryAddress(order.orderId) || '' : '';
    const currentDeliveryAddress = deliveryForm.deliveryAddress || resolvedOrderDeliveryAddress || savedDeliveryAddress;
    const canReviewSeller = Boolean(isBuyer && currentUserId && order?.status === 'COMPLETED' && resolveUserId(order?.buyer) === currentUserId);

    const handleDeliveryAddressChange = (value) => {
        setDeliveryForm((prev) => ({ ...prev, deliveryAddress: value }));
        if (order?.orderId) {
            saveOrderDeliveryAddress(order.orderId, value);
        }
    };

    const handleCancel = async () => {
        Modal.confirm({
            title: 'Cancel this order?',
            content: 'If you cancel now, your deposit will be forfeited and transferred to the seller.',
            okText: 'Cancel Order',
            okButtonProps: { danger: true },
            cancelText: 'Keep Order',
            onOk: async () => {
                try {
                    await cancelDeposit(orderId);
                    message.success('Order cancelled. Deposit forfeited.');
                    fetchOrder();
                } catch (err) {
                    message.error(err.response?.data || 'Cancel failed.');
                }
            },
        });
    };

    const handleSellerCancel = async () => {
        Modal.confirm({
            title: 'Cancel this sale?',
            content: 'Buyer will be refunded and your account will receive a violation record.',
            okText: 'Cancel Sale',
            okButtonProps: { danger: true },
            cancelText: 'Keep Sale',
            onOk: async () => {
                try {
                    await cancelBySeller(orderId);
                    message.success('Sale cancelled. Buyer refunded and violation recorded.');
                    fetchOrder();
                } catch (err) {
                    message.error(err.response?.data || 'Cancel failed.');
                }
            },
        });
    };

    const handleComplete = async () => {
        try {
            await completeOrder(orderId);
            message.success('Order completed!');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Complete failed.');
        }
    };

    const handleReportBuyerNoShow = async () => {
        try {
            await reportBuyerNoShow(orderId);
            message.success('Buyer no-show reported. Deposit transferred.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to report buyer no-show.');
        }
    };

    const handleReportSellerNoShow = async () => {
        try {
            await reportSellerNoShow(orderId);
            message.success('Seller no-show reported. Deposit refunded.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to report seller no-show.');
        }
    };

    const handleScheduleDelivery = async () => {
        if (!currentDeliveryAddress || !deliveryForm.deliveryTime) {
            message.warning('Please fill in all delivery details.');
            return;
        }
        try {
            await scheduleDelivery(orderId, {
                deliveryAddress: currentDeliveryAddress,
                deliveryTime: deliveryForm.deliveryTime,
            });
            message.success('Delivery scheduled!');
            setDeliveryOpen(false);
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to schedule delivery.');
        }
    };

    const handleSellerConfirm = async () => {
        try {
            await sellerConfirmDelivery(orderId);
            message.success('Delivery confirmed. Waiting for admin to assign an inspector.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to confirm delivery.');
        }
    };

    const handleAdminAssign = async () => {
        if (!assignInspectorId) {
            message.warning('Please select an inspector first.');
            return;
        }
        try {
            setAssignLoading(true);
            await adminAssignInspector(orderId, assignInspectorId);
            message.success('Inspector assigned successfully.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to assign inspector.');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleInspectorStartDelivery = async () => {
        try {
            await inspectorStartDelivery(orderId);
            message.success('Shipping started successfully.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to update delivery status.');
        }
    };

    const handleInspectorMarkDelivered = async () => {
        try {
            await inspectorMarkDelivered(orderId);
            message.success('Delivery completed successfully.');
            fetchOrder();
        } catch (err) {
            message.error(err.response?.data || 'Failed to mark delivery as completed.');
        }
    };

    const handleSubmitReview = async () => {
        const trimmedComment = reviewForm.comment.trim();
        const payload = {
            rating: reviewForm.rating || null,
            comment: trimmedComment || null,
        };

        if (!payload.rating && !payload.comment) {
            message.warning('Please provide a rating or a comment.');
            return;
        }

        try {
            setReviewSubmitting(true);
            const createdReview = await createReview(orderId, payload);
            setExistingReview(createdReview);
            setReviewModalOpen(false);
            message.success('Review submitted successfully.');
        } catch (err) {
            const errorText = err.response?.data || err.message || 'Failed to submit review.';
            if (typeof errorText === 'string' && errorText.toLowerCase().includes('already reviewed')) {
                setExistingReview({
                    orderId: order?.orderId,
                    rating: payload.rating,
                    comment: payload.comment,
                });
            }
            message.error(errorText);
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <Header variant="dark" />
                <div className={styles.loadingWrapper}><Spin size="large" /></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.pageWrapper}>
                <Header variant="dark" />
                <div className={styles.errorWrapper}>
                    <p>Order not found.</p>
                    <Button onClick={() => navigate('/my-orders')}>Back to Orders</Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <Button
                    className={styles.btnBack}
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>

                <div className={styles.headerRow}>
                    <h1 className={styles.pageTitle}>Order #{order.orderId}</h1>
                    <Tag color={STATUS_COLOR[order.status] || 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                        {order.status}
                    </Tag>
                </div>

                <div className={styles.card}>
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
                        <Descriptions.Item label="Post">{order.postTitle || order.post?.title || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Post Price">{formatPrice(order.post?.price)} VND</Descriptions.Item>
                        <Descriptions.Item label="Deposit Amount">{formatPrice(order.depositAmount)} VND</Descriptions.Item>
                        <Descriptions.Item label="Total Amount">{formatPrice(order.totalAmount)} VND</Descriptions.Item>
                        <Descriptions.Item label="Remaining">{formatPrice(order.remainingAmount)} VND</Descriptions.Item>
                        <Descriptions.Item label="Created">{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}</Descriptions.Item>
                        {resolvedOrderDeliveryAddress && (
                            <Descriptions.Item label="Delivery Address">{resolvedOrderDeliveryAddress}</Descriptions.Item>
                        )}
                        {order.expiresAt && (
                            <Descriptions.Item label="Expires">{new Date(order.expiresAt).toLocaleString('vi-VN')}</Descriptions.Item>
                        )}
                        {order.sellerConfirmedAt && (
                            <Descriptions.Item label="Seller Confirmed At">
                                {new Date(order.sellerConfirmedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        )}
                        {order.adminReviewedAt && (
                            <Descriptions.Item label="Admin Reviewed At">
                                {new Date(order.adminReviewedAt).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </div>

                {/* Buyer Info */}
                {order.buyer && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Buyer</h3>
                        <p>{order.buyer.fullName || 'Unknown'}</p>
                        <p className={styles.metaText}>{order.buyer.email}</p>
                    </div>
                )}

                {/* Seller Info */}
                {order.seller && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Seller</h3>
                        <p>{order.seller.fullName || 'Unknown'}</p>
                        <p className={styles.metaText}>{order.seller.email}</p>
                    </div>
                )}

                {order.assignedInspector && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Assigned Inspector</h3>
                        <p>{order.assignedInspector.fullName || 'Unknown'}</p>
                        <p className={styles.metaText}>{order.assignedInspector.email}</p>
                    </div>
                )}

                {order.deliverySession && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Delivery Session</h3>
                        {order.deliverySession.location && <p className={styles.metaText}>Location: {order.deliverySession.location}</p>}
                        {order.deliverySession.deliveryStatus && <p className={styles.metaText}>Status: {order.deliverySession.deliveryStatus}</p>}
                        {order.deliverySession.assignedAt && <p className={styles.metaText}>Assigned at: {new Date(order.deliverySession.assignedAt).toLocaleString('vi-VN')}</p>}
                        {order.deliverySession.deliveredAt && <p className={styles.metaText}>Delivered at: {new Date(order.deliverySession.deliveredAt).toLocaleString('vi-VN')}</p>}
                    </div>
                )}

                {canManageDelivery && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Delivery Address</h3>
                        <p className={styles.helperText}>
                            Enter or update the buyer delivery address here. This value will be reused when you schedule delivery in this browser.
                        </p>
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter the buyer delivery address"
                            value={currentDeliveryAddress}
                            onChange={(e) => handleDeliveryAddressChange(e.target.value)}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                {order.status === 'PENDING' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Actions</h3>
                        <Tag color="warning">Awaiting deposit payment from buyer</Tag>
                    </div>
                )}

                {order.status === 'DEPOSIT_PAID' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Actions</h3>
                        <div className={styles.actionRow}>
                            {isSeller && (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<ScheduleOutlined />}
                                        className={styles.btnPrimary}
                                        onClick={() => setBookingOpen(true)}
                                    >
                                        Book Inspection
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<CheckCircleOutlined />}
                                        onClick={handleSellerConfirm}
                                    >
                                        Confirm for Inspector
                                    </Button>
                                    <Button
                                        icon={<CarOutlined />}
                                        onClick={() => {
                                            setDeliveryForm({
                                                deliveryAddress: currentDeliveryAddress || getSavedOrderDeliveryAddress(order.orderId) || '',
                                                deliveryTime: null,
                                            });
                                            setDeliveryOpen(true);
                                        }}
                                    >
                                        Schedule Delivery
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={handleSellerCancel}
                                    >
                                        Cancel Order
                                    </Button>
                                </>
                            )}
                            {isBuyer && (
                                <Button
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={handleCancel}
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {['PENDING_SELLER_CONFIRMATION', 'PENDING_ADMIN_REVIEW'].includes(order.status) && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Inspector Delivery Flow</h3>
                        <p className={styles.helperText}>
                            Seller has confirmed the order for inspector delivery. The next step is assigning an inspector.
                        </p>
                        {isAdmin ? (
                            <div className={styles.assignRow}>
                                <Select
                                    className={styles.assignSelect}
                                    placeholder="Select an inspector"
                                    value={assignInspectorId}
                                    onChange={setAssignInspectorId}
                                    options={inspectors.map((item) => ({
                                        value: item.userId,
                                        label: `${item.fullName || item.email} (${item.email})`,
                                    }))}
                                />
                                <Button
                                    type="primary"
                                    className={styles.btnPrimary}
                                    loading={assignLoading}
                                    onClick={handleAdminAssign}
                                >
                                    Assign Inspector
                                </Button>
                            </div>
                        ) : (
                            <Tag icon={<ClockCircleOutlined />} color="gold">
                                Waiting for admin to assign an inspector
                            </Tag>
                        )}
                    </div>
                )}

                {order.status === 'ASSIGNED_TO_INSPECTOR' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Inspector Delivery Flow</h3>
                        <p className={styles.helperText}>
                            An inspector has been assigned. When the assigned inspector picks up the bicycle, they can move this order into shipping progress.
                        </p>
                        {isAssignedInspector ? (
                            <Button
                                type="primary"
                                icon={<CarOutlined />}
                                className={styles.btnPrimary}
                                onClick={handleInspectorStartDelivery}
                            >
                                Start Shipping
                            </Button>
                        ) : (
                            <Tag color="cyan">
                                Waiting for the assigned inspector to start shipping
                            </Tag>
                        )}
                    </div>
                )}

                {order.status === 'IN_DELIVERY' && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Actions</h3>
                        <div className={styles.actionRow}>
                            {isAssignedInspector && (
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    className={styles.btnPrimary}
                                    onClick={handleInspectorMarkDelivered}
                                >
                                    Mark Delivered
                                </Button>
                            )}
                            {isBuyer && (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        className={styles.btnPrimary}
                                        onClick={handleComplete}
                                    >
                                        Confirm Received
                                    </Button>
                                    <Button
                                        danger
                                        icon={<WarningOutlined />}
                                        onClick={handleReportSellerNoShow}
                                    >
                                        Report Seller No-Show
                                    </Button>
                                </>
                            )}
                            {isSeller && (
                                <>
                                    <Button
                                        danger
                                        icon={<WarningOutlined />}
                                        onClick={handleReportBuyerNoShow}
                                    >
                                        Report Buyer No-Show
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={handleSellerCancel}
                                    >
                                        Cancel Order
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {canReviewSeller && (
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}>Seller Review</h3>
                        {existingReview ? (
                            <>
                                <p className={styles.helperText}>
                                    You already reviewed this seller for this order.
                                </p>
                                {existingReview.rating ? (
                                    <Rate disabled value={existingReview.rating} className={styles.reviewStars} />
                                ) : null}
                                {existingReview.comment ? (
                                    <p className={styles.reviewPreview}>{existingReview.comment}</p>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <p className={styles.helperText}>
                                    This order is complete. Leave a review to help other buyers evaluate this seller.
                                </p>
                                <Button
                                    type="primary"
                                    className={styles.btnPrimary}
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => setReviewModalOpen(true)}
                                >
                                    Review Seller
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Schedule Delivery Modal */}
            <Modal
                title="Schedule Delivery"
                open={deliveryOpen}
                onOk={handleScheduleDelivery}
                onCancel={() => setDeliveryOpen(false)}
                okText="Confirm"
                okButtonProps={{ className: styles.btnPrimary }}
            >
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Address</label>
                    <Input
                        placeholder="Buyer address should auto-fill here from the deposit order"
                        value={currentDeliveryAddress}
                        onChange={(e) => handleDeliveryAddressChange(e.target.value)}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Delivery Date & Time</label>
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        onChange={(_, dateStr) => setDeliveryForm((prev) => ({
                            ...prev,
                            deliveryTime: toIsoDateTime(Array.isArray(dateStr) ? dateStr[0] : dateStr),
                        }))}
                    />
                </div>
            </Modal>

            {/* Inspection Booking Modal */}
            <InspectionBookingModal
                open={bookingOpen}
                postId={order.postId || order.post?.postId}
                onClose={() => setBookingOpen(false)}
                onSuccess={() => {
                    setBookingOpen(false);
                    message.success('Inspection booked! Waiting for inspector assignment.');
                    fetchOrder();
                }}
            />

            <Modal
                title="Review Seller"
                open={reviewModalOpen}
                onOk={handleSubmitReview}
                onCancel={() => setReviewModalOpen(false)}
                okText="Submit Review"
                cancelText="Cancel"
                confirmLoading={reviewSubmitting}
            >
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Rating</label>
                    <Rate
                        value={reviewForm.rating}
                        onChange={(value) => setReviewForm((prev) => ({ ...prev, rating: value }))}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Comment</label>
                    <Input.TextArea
                        rows={4}
                        maxLength={500}
                        placeholder="Share your experience with this seller"
                        value={reviewForm.comment}
                        onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default OrderDetailPage;
