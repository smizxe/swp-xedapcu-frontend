import { useNavigate } from 'react-router-dom';
import { Input, Select, Button, Spin } from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import styles from './MarketplacePage.module.css';
import Header from '../../../components/Header/Header';
import CreateListingModal from '../CreateListingModal/CreateListingModal';
import { isAuthenticated } from '../../../service/authService';

const { Option } = Select;

const STATUS_MAP = {
    ACTIVE: { label: 'Active', className: styles.statusActive },
    PENDING: { label: 'Pending', className: styles.statusPending },
    RESERVED: { label: 'Reserved', className: styles.statusReserved },
    SOLD: { label: 'Sold', className: styles.statusSold },
};

const MarketplacePage = ({
    posts,
    categories,
    totalElements,
    currentPage,
    pageSize,
    isLoading,
    searchQuery,
    selectedCategory,
    sortBy,
    onSearch,
    onSearchChange,
    onCategoryChange,
    onSortChange,
    onPageChange,
    showAddPost,
    onToggleAddPost,
    myBicycles = [],
}) => {
    const navigate = useNavigate();

    const formatPrice = (price) =>
        price ? price.toLocaleString('vi-VN') : '—';

    const getStatusClass = (status) =>
        STATUS_MAP[status]?.className || styles.statusPending;

    const getStatusLabel = (status) =>
        STATUS_MAP[status]?.label || status;

    const goToDetail = (post) => {
        navigate(`/marketplace/${post.postId}`, { state: { post } });
    };

    return (
        <>
            <div className={styles.pageWrapper}>
                <Header variant="dark" />

                <div className={styles.pageContent}>
                    {/* Hero Banner */}
                    <div className={styles.heroBanner}>
                        <h1 className={styles.heroTitle}> Bicycle Marketplace</h1>
                        <p className={styles.heroSubtitle}>
                            Find your perfect pre-owned bicycle — verified, quality-checked, and ready to ride.
                        </p>

                        <div className={styles.searchRow}>
                            <Input
                                id="marketplace-search"
                                className={styles.searchInput}
                                prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                                placeholder="Search bicycles by title, brand…"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onPressEnter={onSearch}
                                allowClear
                            />

                            <Select
                                id="marketplace-category-filter"
                                className={styles.categorySelect}
                                placeholder="All Categories"
                                value={selectedCategory}
                                onChange={onCategoryChange}
                                allowClear
                            >
                                {categories.map((cat) => (
                                    <Option key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </Option>
                                ))}
                            </Select>

                            <Select
                                id="marketplace-sort"
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={onSortChange}
                            >
                                <Option value="newest">Newest First</Option>
                                <Option value="price_asc">Price: Low → High</Option>
                                <Option value="price_desc">Price: High → Low</Option>
                            </Select>

                            <Button
                                id="marketplace-search-btn"
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={onSearch}
                                style={{
                                    height: 44,
                                    borderRadius: 10,
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    fontWeight: 600,
                                    color: '#fff',
                                    minWidth: 100,
                                }}
                            >
                                Search
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className={styles.toolbar}>
                        <p className={styles.resultsCount}>
                            Showing{' '}
                            <span className={styles.resultsCountBold}>
                                {totalElements}
                            </span>{' '}
                            {totalElements === 1 ? 'listing' : 'listings'}
                            {searchQuery && (
                                <>
                                    {' '}for{' '}
                                    <span className={styles.resultsCountBold}>
                                        "{searchQuery}"
                                    </span>
                                </>
                            )}
                        </p>

                        {isAuthenticated() && (
                            <button
                                className={styles.btnAddPost}
                                onClick={() => onToggleAddPost(true)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Post
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className={styles.loadingWrapper}>
                            <Spin size="large" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🚲</div>
                            <p className={styles.emptyTitle}>No bicycles found</p>
                            <p className={styles.emptyText}>
                                Try adjusting your search or category filter.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.grid}>
                                {posts.map((post) => (
                                    <div
                                        key={post.postId}
                                        className={styles.card}
                                        onClick={() => goToDetail(post)}
                                    >
                                        {/* Image area */}
                                        <div className={styles.cardImageWrapper}>
                                            <span className={styles.cardImageIcon}></span>

                                            <span className={`${styles.statusBadge} ${getStatusClass(post.status)}`}>
                                                {getStatusLabel(post.status)}
                                            </span>

                                            {post.isInspected && (
                                                <span className={styles.inspectedBadge}>
                                                    <SafetyCertificateOutlined />
                                                    Inspected
                                                </span>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div className={styles.cardBody}>
                                            <h3 className={styles.cardTitle}>{post.title}</h3>

                                            <div className={styles.cardMeta}>
                                                {post.bicycle?.brand && (
                                                    <span className={styles.metaTag}>
                                                        Brand: {post.bicycle.brand}
                                                    </span>
                                                )}
                                                {post.bicycle?.frameSize && (
                                                    <span className={styles.metaTag}>
                                                        Frame size: {post.bicycle.frameSize}
                                                    </span>
                                                )}
                                                {post.bicycle?.conditionPercent != null && (
                                                    <span className={styles.metaTag}>
                                                        Condition: {post.bicycle.conditionPercent}%
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.cardPrice}>
                                                {formatPrice(post.price)}
                                                <span className={styles.priceCurrency}> VND</span>
                                            </div>

                                            <p className={styles.cardSeller}>
                                                <UserOutlined />
                                                {post.seller?.fullName || post.seller?.email || 'Unknown'}
                                            </p>

                                            <div className={styles.cardActions}>
                                                <Button
                                                    id={`view-detail-${post.postId}`}
                                                    className={styles.btnViewDetail}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        goToDetail(post);
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalElements > pageSize && (
                                <div className={styles.paginationWrapper}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {Array.from({ length: Math.ceil(totalElements / pageSize) }, (_, i) => (
                                            <Button
                                                key={i}
                                                type={currentPage === i ? 'primary' : 'default'}
                                                onClick={() => onPageChange(i)}
                                                style={{
                                                    borderRadius: 8,
                                                    minWidth: 36,
                                                    background: currentPage === i ? '#2D5A27' : undefined,
                                                    borderColor: currentPage === i ? '#2D5A27' : undefined,
                                                }}
                                            >
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Create Listing Modal ── */}
            <CreateListingModal
                isOpen={showAddPost}
                onClose={() => onToggleAddPost(false)}
                bicycles={myBicycles}
            />
        </>
    );
};

export default MarketplacePage;
