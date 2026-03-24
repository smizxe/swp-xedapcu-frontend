import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Spin, message, Modal, Input, Image } from 'antd';
import {
    ArrowLeftOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    CalendarOutlined,
    LeftOutlined,
    RightOutlined,
    EditOutlined,
} from '@ant-design/icons';
import styles from './PostDetailPage.module.css';
import Header from '../../../components/Header/Header';
import { getPostById } from '../../../service/postService';
import { getPostImages } from '../../../service/imageService';
import { getCurrentUser, isAuthenticated } from '../../../service/authService';
import { createDeposit } from '../../../service/orderService';

const STATUS_MAP = {
    APPROVED: { label: 'Available', className: styles.statusActive },
    ACTIVE: { label: 'Available', className: styles.statusActive },
    PENDING: { label: 'Pending', className: styles.statusPending },
    REJECTED: { label: 'Rejected', className: styles.statusSold },
    HIDDEN: { label: 'Hidden', className: styles.statusReserved },
    RESERVED: { label: 'Reserved', className: styles.statusReserved },
    SOLD: { label: 'Sold', className: styles.statusSold },
};

const isPurchasableStatus = (status) => status === 'APPROVED' || status === 'ACTIVE';

const formatPrice = (price) =>
    price != null ? price.toLocaleString('vi-VN') : '—';

const getConditionColor = (pct) => {
    if (pct >= 80) return '#2D5A27';
    if (pct >= 50) return '#f39c12';
    return '#c0392b';
};

const initials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : '?';

function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // If we navigated from the card we already have the post data
    const [post, setPost] = useState(location.state?.post || null);
    const [isLoading, setIsLoading] = useState(!post);

    // Deposit Modal State
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Image gallery
    const [postImages, setPostImages] = useState([]);
    const [activeImgIdx, setActiveImgIdx] = useState(0);

    useEffect(() => {
        if (post) return;
        setIsLoading(true);
        getPostById(postId)
            .then(setPost)
            .catch(() => message.error('Failed to load post details.'))
            .finally(() => setIsLoading(false));
    }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!postId) return;
        getPostImages(postId)
            .then((res) => {
                const imgs = res.data || [];
                setPostImages(imgs);
                // Start at thumbnail if exists
                const thumbIdx = imgs.findIndex((i) => i.isThumbnail);
                if (thumbIdx >= 0) setActiveImgIdx(thumbIdx);
            })
            .catch(() => {});
    }, [postId]);

    const handleDeposit = () => {
        if (!isAuthenticated()) {
            message.warning('Please log in to place a deposit.');
            return;
        }
        setIsDepositModalOpen(true);
    };

    const confirmDeposit = async () => {
        if (!deliveryAddress.trim()) {
            message.warning('Please enter a delivery address.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createDeposit(postId, deliveryAddress);
            message.success('Deposit placed successfully!');
            setIsDepositModalOpen(false);
            navigate('/my-orders');
        } catch (err) {
            const errMsg = err.response?.data || 'Failed to place deposit.';
            if (typeof errMsg === 'string' && errMsg.toLowerCase().includes('insufficient balance')) {
                message.error('Insufficient wallet balance for deposit. Redirecting to wallet...');
                setIsDepositModalOpen(false);
                setTimeout(() => navigate('/wallet'), 1500);
            } else {
                message.error(errMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.pageWrapper}>
                <Header variant="dark" />
                <div className={styles.loadingWrapper}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.pageWrapper}>
                <Header variant="dark" />
                <div className={styles.errorWrapper}>
                    <p style={{ fontSize: 48 }}>🚲</p>
                    <p>Post not found.</p>
                    <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
                </div>
            </div>
        );
    }

    const statusInfo = STATUS_MAP[post.status] || STATUS_MAP.PENDING;
    const condition = post.bicycle?.conditionPercent;
    const currentUserEmail = getCurrentUser()?.email?.toLowerCase() || '';
    const sellerEmail = post.seller?.email?.toLowerCase() || '';
    const isOwnPost = currentUserEmail && sellerEmail && currentUserEmail === sellerEmail;

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />

            <div className={styles.pageContent}>
                {/* Breadcrumb */}
                <div className={styles.breadcrumb}>
                    <span
                        className={styles.breadcrumbLink}
                        onClick={() => navigate('/marketplace')}
                    >
                        Marketplace
                    </span>
                    <span className={styles.breadcrumbSep}>/</span>
                    <span className={styles.breadcrumbCurrent}>{post.title}</span>
                </div>

                <div className={styles.mainGrid}>
                    {/* ── Left: Image ── */}
                    <div className={styles.imagePanel}>
                        <div className={styles.mainImage}>
                            {postImages.length > 0 ? (
                                <>
                                    <Image
                                        src={postImages[activeImgIdx]?.imageUrl}
                                        alt={post.title}
                                        className={styles.mainImageImg}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        preview={{ mask: 'Click to zoom' }}
                                    />
                                    {postImages.length > 1 && (
                                        <>
                                            <button
                                                className={`${styles.imgNav} ${styles.imgNavLeft}`}
                                                onClick={() => setActiveImgIdx((prev) => (prev - 1 + postImages.length) % postImages.length)}
                                            >
                                                <LeftOutlined />
                                            </button>
                                            <button
                                                className={`${styles.imgNav} ${styles.imgNavRight}`}
                                                onClick={() => setActiveImgIdx((prev) => (prev + 1) % postImages.length)}
                                            >
                                                <RightOutlined />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className={styles.noImage}>No images</div>
                            )}

                            <div className={styles.imageBadges}>
                                <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                                    {statusInfo.label}
                                </span>
                                {post.isInspected && (
                                    <span className={styles.inspectedBadge}>
                                        <SafetyCertificateOutlined /> Inspected
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail strip */}
                        {postImages.length > 1 && (
                            <div className={styles.thumbStrip}>
                                {postImages.map((img, idx) => (
                                    <div
                                        key={img.imageId}
                                        className={`${styles.thumbItem} ${idx === activeImgIdx ? styles.thumbActive : ''}`}
                                        onClick={() => setActiveImgIdx(idx)}
                                    >
                                        <img src={img.imageUrl} alt="" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Info ── */}
                    <div className={styles.infoPanel}>
                        {/* Title */}
                        <h1 className={styles.postTitle}>{post.title}</h1>

                        {/* Price */}
                        <p className={styles.price}>
                            {formatPrice(post.price)}
                            <span className={styles.priceCurrency}>VND</span>
                        </p>

                        {/* Description */}
                        {post.description && (
                            <p className={styles.description}>{post.description}</p>
                        )}

                        {/* Bicycle Specs */}
                        {post.bicycle && (
                            <div>
                                <p className={styles.sectionTitle}>Bicycle Specifications</p>
                                <div className={styles.specTable}>
                                    {post.bicycle.brand && (
                                        <div className={styles.specRow}>
                                            <span className={styles.specLabel}>Brand</span>
                                            <span className={styles.specValue}>{post.bicycle.brand}</span>
                                        </div>
                                    )}
                                    {post.bicycle.frameMaterial && (
                                        <div className={styles.specRow}>
                                            <span className={styles.specLabel}>Frame Material</span>
                                            <span className={styles.specValue}>{post.bicycle.frameMaterial}</span>
                                        </div>
                                    )}
                                    {post.bicycle.frameSize && (
                                        <div className={styles.specRow}>
                                            <span className={styles.specLabel}>Frame Size</span>
                                            <span className={styles.specValue}>{post.bicycle.frameSize}</span>
                                        </div>
                                    )}
                                    {post.bicycle.groupset && (
                                        <div className={styles.specRow}>
                                            <span className={styles.specLabel}>Groupset</span>
                                            <span className={styles.specValue}>{post.bicycle.groupset}</span>
                                        </div>
                                    )}
                                    {post.bicycle.wheelSize && (
                                        <div className={styles.specRow}>
                                            <span className={styles.specLabel}>Wheel Size</span>
                                            <span className={styles.specValue}>{post.bicycle.wheelSize}</span>
                                        </div>
                                    )}
                                    {condition != null && (
                                        <div className={styles.specRow}>
                                            <span className={styles.specLabel}>Condition</span>
                                            <div className={styles.conditionBar}>
                                                <div className={styles.conditionTrack}>
                                                    <div
                                                        className={styles.conditionFill}
                                                        style={{
                                                            width: `${condition}%`,
                                                            background: getConditionColor(condition),
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={styles.conditionLabel}
                                                    style={{ color: getConditionColor(condition) }}
                                                >
                                                    {condition}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Seller */}
                        {post.seller && (
                            <div className={styles.sellerCard}>
                                <div className={styles.sellerAvatar}>
                                    {initials(post.seller.fullName || post.seller.email)}
                                </div>
                                <div className={styles.sellerInfo}>
                                    <span className={styles.sellerLabel}>Seller</span>
                                    <span className={styles.sellerName}>
                                        {post.seller.fullName || 'Unknown'}
                                    </span>
                                    <span className={styles.sellerEmail}>{post.seller.email}</span>
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        <div className={styles.metaRow}>
                            {post.createdAt && (
                                <span className={styles.metaItem}>
                                    <CalendarOutlined />
                                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className={styles.actionRow}>
                            {isOwnPost ? (
                                <>
                                    <Button
                                        type="primary"
                                        className={styles.btnDeposit}
                                        disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                        title={post.status === 'RESERVED' ? 'Cannot edit — a buyer has placed a deposit' : post.status === 'SOLD' ? 'Cannot edit — this post has been sold' : undefined}
                                        onClick={() => navigate('/my-posts', { state: { editPostId: post.postId } })}
                                        icon={<EditOutlined />}
                                    >
                                        Edit Post
                                    </Button>
                                    {!post.isInspected && (
                                        <Button
                                            className={styles.btnManage}
                                            icon={<SafetyCertificateOutlined />}
                                            disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                            title={post.status === 'RESERVED' ? 'Cannot request verify — a buyer has placed a deposit' : post.status === 'SOLD' ? 'Cannot request verify — this post has been sold' : undefined}
                                            onClick={() => navigate('/my-posts', { state: { verifyPostId: post.postId } })}
                                        >
                                            Request Verify
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button
                                    id="btn-place-deposit"
                                    type="primary"
                                    className={styles.btnDeposit}
                                    disabled={!isPurchasableStatus(post.status)}
                                    onClick={handleDeposit}
                                    icon={<UserOutlined />}
                                >
                                    {isPurchasableStatus(post.status) ? 'Place Deposit' : statusInfo.label}
                                </Button>
                            )}
                            <Button
                                className={styles.btnBack}
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/marketplace')}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title="Confirm Deposit & Delivery Details"
                open={isDepositModalOpen}
                onOk={confirmDeposit}
                onCancel={() => setIsDepositModalOpen(false)}
                okText="Confirm & Deposit"
                cancelText="Cancel"
                confirmLoading={isSubmitting}
            >
                <p style={{ marginBottom: 16 }}>
                    To proceed with the deposit, please provide your delivery address. The seller will use this to deliver the bicycle to you.
                </p>
                <Input.TextArea
                    placeholder="Enter your full delivery address (e.g. 123 Street Name, District, City)"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                />
            </Modal>
        </div>
    );
}

export default PostDetailPage;
