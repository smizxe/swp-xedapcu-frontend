import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import {
    ArrowLeftOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
    CalendarOutlined,
    TagOutlined,
} from '@ant-design/icons';
import styles from './PostDetailPage.module.css';
import Header from '../../../components/Header/Header';
import { getPostById } from '../../../service/postService';
import { isAuthenticated } from '../../../service/authService';
import { createDeposit } from '../../../service/orderService';

const STATUS_MAP = {
    ACTIVE: { label: 'Available', className: styles.statusActive },
    PENDING: { label: 'Pending', className: styles.statusPending },
    RESERVED: { label: 'Reserved', className: styles.statusReserved },
    SOLD: { label: 'Sold', className: styles.statusSold },
};

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

    useEffect(() => {
        if (post) return; // already have data from navigation state
        setIsLoading(true);
        getPostById(postId)
            .then(setPost)
            .catch(() => message.error('Failed to load post details.'))
            .finally(() => setIsLoading(false));
    }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeposit = async () => {
        if (!isAuthenticated()) {
            message.warning('Please log in to place a deposit.');
            return;
        }
        try {
            await createDeposit(postId);
            message.success('Deposit placed successfully!');
            navigate('/my-orders');
        } catch (err) {
            message.error(err.response?.data || 'Failed to place deposit.');
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
                            <Button
                                id="btn-place-deposit"
                                type="primary"
                                className={styles.btnDeposit}
                                disabled={post.status !== 'ACTIVE'}
                                onClick={handleDeposit}
                                icon={<UserOutlined />}
                            >
                                {post.status === 'ACTIVE' ? 'Place Deposit' : statusInfo.label}
                            </Button>
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
        </div>
    );
}

export default PostDetailPage;
