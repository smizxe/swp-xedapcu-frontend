import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin, Button, Tag, message, Empty, Popconfirm } from 'antd';
import {
    FileTextOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    StopOutlined,
    CheckCircleOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import ImageUploadModal from '../../components/ImageUpload/ImageUploadModal';
import { getMyPosts, deletePost, updatePostStatus } from '../../service/postService';
import styles from './MyPostsPage.module.css';

const STATUS_COLOR = {
    DRAFT:    'default',
    PENDING:  'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    SOLD:     'purple',
    HIDDEN:   'default',
};

const STATUS_LABEL = {
    DRAFT:    'Bản nháp',
    PENDING:  'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    SOLD:     'Đã bán',
    HIDDEN:   'Ẩn',
};

const formatPrice = (v) => (v != null ? Number(v).toLocaleString('vi-VN') : '—');

export default function MyPostsPage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [imageModal, setImageModal] = useState({ open: false, postId: null });

    const fetchPosts = () => {
        setLoading(true);
        getMyPosts()
            .then(setPosts)
            .catch(() => message.error('Không thể tải danh sách bài đăng.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async (postId) => {
        setActionId(postId);
        try {
            await deletePost(postId);
            message.success('Đã xóa bài đăng.');
            fetchPosts();
        } catch (err) {
            message.error(err.response?.data || 'Xóa thất bại.');
        } finally {
            setActionId(null);
        }
    };

    const handleHide = async (postId, currentStatus) => {
        const nextStatus = currentStatus === 'HIDDEN' ? 'APPROVED' : 'HIDDEN';
        setActionId(postId);
        try {
            await updatePostStatus(postId, nextStatus);
            message.success(nextStatus === 'HIDDEN' ? 'Đã ẩn bài.' : 'Đã hiện lại bài.');
            fetchPosts();
        } catch (err) {
            message.error(err.response?.data || 'Cập nhật thất bại.');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />
            <div className={styles.pageContent}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}><FileTextOutlined /> My Posts</h1>
                        <p className={styles.pageSubtitle}>Quản lý các bài đăng xe của bạn.</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className={styles.btnCreate}
                        onClick={() => navigate('/sell')}
                    >
                        Đăng xe mới
                    </Button>
                </div>

                {loading ? (
                    <div className={styles.loadingWrapper}><Spin size="large" /></div>
                ) : posts.length === 0 ? (
                    <div className={styles.emptyWrapper}>
                        <Empty description="Bạn chưa có bài đăng nào." />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            className={styles.btnCreate}
                            onClick={() => navigate('/sell')}
                            style={{ marginTop: 16 }}
                        >
                            Đăng xe ngay
                        </Button>
                    </div>
                ) : (
                    <div className={styles.postList}>
                        {posts.map((post) => (
                            <div key={post.postId} className={styles.postCard}>
                                <div className={styles.postHeader}>
                                    <div className={styles.postMeta}>
                                        <span className={styles.postId}>Post #{post.postId}</span>
                                        {post.isInspected && (
                                            <span className={styles.inspectedBadge}>
                                                <CheckCircleOutlined /> Đã kiểm định
                                            </span>
                                        )}
                                    </div>
                                    <Tag color={STATUS_COLOR[post.status] || 'default'}>
                                        {STATUS_LABEL[post.status] || post.status}
                                    </Tag>
                                </div>

                                <div className={styles.postBody}>
                                    <h3 className={styles.postTitle}>{post.title || 'Không có tiêu đề'}</h3>
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
                                        Xem
                                    </Button>
                                    <Button
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => navigate(`/sell?edit=${post.postId}`)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        size="small"
                                        icon={<PictureOutlined />}
                                        onClick={() => setImageModal({ open: true, postId: post.postId })}
                                    >
                                        Photos
                                    </Button>
                                    {(post.status === 'APPROVED' || post.status === 'HIDDEN') && (
                                        <Button
                                            size="small"
                                            icon={<StopOutlined />}
                                            loading={actionId === post.postId}
                                            onClick={() => handleHide(post.postId, post.status)}
                                        >
                                            {post.status === 'HIDDEN' ? 'Hiện lại' : 'Ẩn bài'}
                                        </Button>
                                    )}
                                    <Popconfirm
                                        title="Xóa bài đăng?"
                                        description="Bạn chắc chắn muốn xóa? Hành động này không thể hoàn tác."
                                        onConfirm={() => handleDelete(post.postId)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={actionId === post.postId}
                                        >
                                            Xóa
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
        </div>
    );
}
