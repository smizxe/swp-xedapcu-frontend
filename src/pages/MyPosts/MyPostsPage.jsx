import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Empty, Popconfirm, Modal, Input, Select } from 'antd';
import {
    FileTextOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    StopOutlined,
    CheckCircleOutlined,
    PictureOutlined,
    SafetyCertificateOutlined,
    SendOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import ImageUploadModal from '../../components/ImageUpload/ImageUploadModal';
import InspectionBookingModal from '../Orders/InspectionBookingModal';
import { getMyPosts, deletePost, updatePost, updatePostStatus } from '../../service/postService';
import styles from './MyPostsPage.module.css';

const STATUS_COLOR = {
    DRAFT: 'default',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    SOLD: 'purple',
    HIDDEN: 'default',
};

const STATUS_LABEL = {
    DRAFT: 'Draft',
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    SOLD: 'Sold',
    HIDDEN: 'Hidden',
};

const formatPrice = (value) => (value != null ? Number(value).toLocaleString('vi-VN') : '—');

const canRequestReview = (status) => status === 'DRAFT' || status === 'REJECTED';

export default function MyPostsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [imageModal, setImageModal] = useState({ open: false, postId: null });
    const [verifyModal, setVerifyModal] = useState({ open: false, postId: null });
    const [editModal, setEditModal] = useState({ open: false, post: null });
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [savingEdit, setSavingEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');

    const fetchPosts = useCallback(() => {
        setLoading(true);
        getMyPosts()
            .then(setPosts)
            .catch(() => message.error('Failed to load your posts.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            fetchPosts();
        }, 0);

        return () => window.clearTimeout(timerId);
    }, [fetchPosts]);

    useEffect(() => {
        if (loading) return;

        const editPostId = location.state?.editPostId;
        const verifyPostId = location.state?.verifyPostId;

        if (!editPostId && !verifyPostId) return;

        const targetId = editPostId ?? verifyPostId;
        const targetPost = posts.find((post) => post.postId === targetId);

        if (!targetPost) {
            message.warning('The selected post could not be found.');
            navigate(location.pathname, { replace: true });
            return;
        }

        if (editPostId) {
            openEditModal(targetPost);
        } else {
            openVerifyModal(targetPost);
        }

        navigate(location.pathname, { replace: true });
    }, [loading, location.pathname, location.state, navigate, posts]);

    const openEditModal = (post) => {
        setEditModal({ open: true, post });
        setEditForm({
            title: post.title || '',
            description: post.description || '',
        });
    };

    const closeEditModal = () => {
        setEditModal({ open: false, post: null });
        setEditForm({ title: '', description: '' });
        setSavingEdit(false);
    };

    const openVerifyModal = (post) => {
        setVerifyModal({ open: true, postId: post.postId });
    };

    const handleDelete = async (postId) => {
        setActionId(postId);
        try {
            await deletePost(postId);
            message.success('Post deleted.');
            fetchPosts();
        } catch (err) {
            message.error(err.response?.data || 'Delete failed.');
        } finally {
            setActionId(null);
        }
    };

    const handleHide = async (postId, currentStatus) => {
        const nextStatus = currentStatus === 'HIDDEN' ? 'APPROVED' : 'HIDDEN';
        setActionId(postId);
        try {
            await updatePostStatus(postId, nextStatus);
            message.success(nextStatus === 'HIDDEN' ? 'Post hidden.' : 'Post visible again.');
            fetchPosts();
        } catch (err) {
            message.error(err.response?.data || 'Status update failed.');
        } finally {
            setActionId(null);
        }
    };

    const handleRequestReview = async (postId) => {
        setActionId(postId);
        try {
            await updatePostStatus(postId, 'PENDING');
            message.success('Review request submitted.');
            fetchPosts();
        } catch (err) {
            message.error(err.response?.data || 'Failed to submit review request.');
        } finally {
            setActionId(null);
        }
    };

    const handleSaveEdit = async () => {
        const targetPost = editModal.post;
        const title = editForm.title.trim();
        const description = editForm.description.trim();

        if (!targetPost?.postId || !targetPost?.bicycle?.bicycleId) {
            message.error('This post is missing bicycle information.');
            return;
        }

        if (!title) {
            message.warning('Please enter a post title.');
            return;
        }

        setSavingEdit(true);
        try {
            await updatePost(targetPost.postId, {
                bicycleId: targetPost.bicycle.bicycleId,
                title,
                description,
                price: targetPost.price,
            });
            message.success('Post updated.');
            closeEditModal();
            fetchPosts();
        } catch (err) {
            message.error(err.response?.data || 'Update failed.');
            setSavingEdit(false);
        }
    };

    const filteredPosts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = posts.filter((post) => {
            const matchesSearch = !normalizedSearch || [
                `post #${post.postId}`,
                post.title,
                post.description,
                post.bicycle?.brand,
                post.bicycle?.frameSize,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedSearch));

            const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return [...filtered].sort((a, b) => {
            const left = new Date(a.createdAt || 0).getTime();
            const right = new Date(b.createdAt || 0).getTime();
            return sortOrder === 'OLDEST' ? left - right : right - left;
        });
    }, [posts, searchTerm, statusFilter, sortOrder]);

    const postStatuses = Array.from(new Set(posts.map((post) => post.status).filter(Boolean)));

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}><FileTextOutlined /> My Posts</h1>
                        <p className={styles.pageSubtitle}>
                            Manage your marketplace posts separately from your bicycles.
                        </p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className={styles.btnCreate}
                        onClick={() => navigate('/marketplace')}
                    >
                        Create New Post
                    </Button>
                </div>

                {!loading && posts.length > 0 && (
                    <div className={styles.toolbar}>
                        <Input
                            className={styles.searchInput}
                            placeholder="Search by post title, brand, description..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            allowClear
                        />
                        <Select
                            className={styles.filterSelect}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'ALL', label: 'All Statuses' },
                                ...postStatuses.map((status) => ({
                                    value: status,
                                    label: STATUS_LABEL[status] || status,
                                })),
                            ]}
                        />
                        <Select
                            className={styles.filterSelect}
                            value={sortOrder}
                            onChange={setSortOrder}
                            options={[
                                { value: 'NEWEST', label: 'Newest First' },
                                { value: 'OLDEST', label: 'Oldest First' },
                                { value: 'PRICE_HIGH', label: 'Price High to Low' },
                                { value: 'PRICE_LOW', label: 'Price Low to High' },
                            ]}
                        />
                    </div>
                )}

                {loading ? (
                    <div className={styles.loadingWrapper}><Spin size="large" /></div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyWrapper}>
                        <Empty description="You do not have any posts yet." />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            className={styles.btnCreate}
                            onClick={() => navigate('/marketplace')}
                            style={{ marginTop: 16 }}
                        >
                            Go Create One
                        </Button>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className={styles.emptyWrapper}>
                        <Empty description="No posts match your current filters." />
                    </div>
                ) : (
                    <div className={styles.postList}>
                        {filteredPosts
                            .sort((a, b) => {
                                if (sortOrder === 'PRICE_HIGH') {
                                    return Number(b.price || 0) - Number(a.price || 0);
                                }
                                if (sortOrder === 'PRICE_LOW') {
                                    return Number(a.price || 0) - Number(b.price || 0);
                                }
                                return 0;
                            })
                            .map((post) => (
                            <div key={post.postId} className={styles.postCard}>
                                <div className={styles.postHeader}>
                                    <div className={styles.postMeta}>
                                        <span className={styles.postId}>Post #{post.postId}</span>
                                        {post.isInspected && (
                                            <span className={styles.inspectedBadge}>
                                                <CheckCircleOutlined /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <Tag color={STATUS_COLOR[post.status] || 'default'}>
                                        {STATUS_LABEL[post.status] || post.status}
                                    </Tag>
                                </div>

                                <div className={styles.postBody}>
                                    <h3 className={styles.postTitle}>{post.title || 'Untitled Post'}</h3>
                                    {post.bicycle && (
                                        <p className={styles.bikeInfo}>
                                            {post.bicycle.brand} · {post.bicycle.frameSize} · {post.bicycle.conditionPercent}%
                                        </p>
                                    )}
                                    <div className={styles.priceRow}>
                                        <span className={styles.price}>{formatPrice(post.price)} VND</span>
                                        {post.createdAt && (
                                            <span className={styles.dateMeta}>
                                                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.postActions}>
                                    <Button
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate(`/marketplace/${post.postId}`)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                        title={post.status === 'RESERVED' ? 'Cannot edit — a buyer has placed a deposit on this post' : post.status === 'SOLD' ? 'Cannot edit — this post has been sold' : undefined}
                                        onClick={() => openEditModal(post)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        icon={<PictureOutlined />}
                                        disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                        title={post.status === 'RESERVED' ? 'Cannot edit photos — a buyer has placed a deposit on this post' : post.status === 'SOLD' ? 'Cannot edit photos — this post has been sold' : undefined}
                                        onClick={() => setImageModal({ open: true, postId: post.postId })}
                                    >
                                        Photos
                                    </Button>
                                    {canRequestReview(post.status) && (
                                        <Button
                                            size="small"
                                            icon={<SendOutlined />}
                                            loading={actionId === post.postId}
                                            disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                            title={post.status === 'RESERVED' ? 'Cannot request review — a buyer has placed a deposit' : post.status === 'SOLD' ? 'Cannot request review — this post has been sold' : undefined}
                                            onClick={() => handleRequestReview(post.postId)}
                                        >
                                            Request Review
                                        </Button>
                                    )}
                                    {!post.isInspected && post.status !== 'SOLD' && (
                                        <Button
                                            size="small"
                                            icon={<SafetyCertificateOutlined />}
                                            disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                            title={post.status === 'RESERVED' ? 'Cannot request verify — a buyer has placed a deposit' : post.status === 'SOLD' ? 'Cannot request verify — this post has been sold' : undefined}
                                            onClick={() => openVerifyModal(post)}
                                        >
                                            Request Verify
                                        </Button>
                                    )}
                                    {(post.status === 'APPROVED' || post.status === 'HIDDEN') && (
                                        <Button
                                            size="small"
                                            icon={<StopOutlined />}
                                            loading={actionId === post.postId}
                                            onClick={() => handleHide(post.postId, post.status)}
                                        >
                                            {post.status === 'HIDDEN' ? 'Show Post' : 'Hide Post'}
                                        </Button>
                                    )}
                                    <Popconfirm
                                        title="Delete this post?"
                                        description="This action cannot be undone."
                                        onConfirm={() => handleDelete(post.postId)}
                                        okText="Delete"
                                        cancelText="Cancel"
                                        disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={actionId === post.postId}
                                            disabled={post.status === 'RESERVED' || post.status === 'SOLD'}
                                            title={post.status === 'RESERVED' ? 'Cannot delete — a buyer has placed a deposit' : post.status === 'SOLD' ? 'Cannot delete — this post has been sold' : undefined}
                                        >
                                            Delete
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ImageUploadModal
                open={imageModal.open}
                postId={imageModal.postId}
                onClose={() => setImageModal({ open: false, postId: null })}
            />

            <InspectionBookingModal
                open={verifyModal.open}
                postId={verifyModal.postId}
                onClose={() => setVerifyModal({ open: false, postId: null })}
                onSuccess={() => {
                    setVerifyModal({ open: false, postId: null });
                    fetchPosts();
                }}
            />

            <Modal
                title="Edit Post"
                open={editModal.open}
                onOk={handleSaveEdit}
                onCancel={closeEditModal}
                okText="Save Changes"
                cancelText="Cancel"
                confirmLoading={savingEdit}
            >
                <div className={styles.editFormGroup}>
                    <label className={styles.editLabel}>Post Title</label>
                    <Input
                        value={editForm.title}
                        placeholder="Enter post title"
                        onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                </div>

                <div className={styles.editFormGroup}>
                    <label className={styles.editLabel}>Description</label>
                    <Input.TextArea
                        value={editForm.description}
                        placeholder="Describe your bicycle"
                        autoSize={{ minRows: 4, maxRows: 7 }}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                    />
                </div>

                <p className={styles.editHint}>
                    Bicycle specs stay linked to your selected bicycle. This form updates the post title and description.
                </p>
            </Modal>
        </div>
    );
}
