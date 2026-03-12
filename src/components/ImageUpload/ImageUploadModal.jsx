import { useState, useEffect } from 'react';
import { Modal, Upload, Button, message, Image, Spin, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { uploadImage, getPostImages, setThumbnail, deleteImage } from '../../service/imageService';
import styles from './ImageUploadModal.module.css';

export default function ImageUploadModal({ open, postId, onClose }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchImages = async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const res = await getPostImages(postId);
            setImages(res.data || []);
        } catch {
            message.error('Failed to load images.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && postId) fetchImages();
    }, [open, postId]);

    const handleUpload = async (file) => {
        setUploading(true);
        try {
            const isThumbnail = images.length === 0; // First image is thumbnail
            await uploadImage(postId, file, isThumbnail);
            message.success('Image uploaded!');
            fetchImages();
        } catch (err) {
            message.error(err.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
        }
        return false; // Prevent antd default upload
    };

    const handleSetThumbnail = async (imageId) => {
        try {
            await setThumbnail(postId, imageId);
            message.success('Thumbnail set!');
            fetchImages();
        } catch {
            message.error('Failed to set thumbnail.');
        }
    };

    const handleDelete = async (imageId) => {
        try {
            await deleteImage(postId, imageId);
            message.success('Image deleted.');
            fetchImages();
        } catch {
            message.error('Failed to delete image.');
        }
    };

    return (
        <Modal
            title={`Manage Images — Post #${postId}`}
            open={open}
            onCancel={onClose}
            footer={<Button onClick={onClose}>Close</Button>}
            width={640}
            centered
        >
            {loading ? (
                <div className={styles.loadingWrapper}><Spin /></div>
            ) : (
                <>
                    <div className={styles.imageGrid}>
                        {images.map((img) => (
                            <div key={img.imageId} className={styles.imageCard}>
                                <Image
                                    src={img.imageUrl}
                                    alt={`Post ${postId} image`}
                                    className={styles.imagePreview}
                                    width={140}
                                    height={105}
                                    style={{ objectFit: 'cover', borderRadius: 8 }}
                                />
                                <div className={styles.imageActions}>
                                    <Button
                                        size="small"
                                        type={img.isThumbnail ? 'primary' : 'default'}
                                        icon={img.isThumbnail ? <StarFilled /> : <StarOutlined />}
                                        onClick={() => !img.isThumbnail && handleSetThumbnail(img.imageId)}
                                        className={img.isThumbnail ? styles.btnThumbnailActive : ''}
                                        title={img.isThumbnail ? 'Current thumbnail' : 'Set as thumbnail'}
                                    >
                                        {img.isThumbnail ? 'Thumbnail' : 'Set'}
                                    </Button>
                                    <Popconfirm
                                        title="Delete this image?"
                                        onConfirm={() => handleDelete(img.imageId)}
                                        okText="Delete"
                                        cancelText="Cancel"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button size="small" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.uploadSection}>
                        <Upload
                            accept="image/*"
                            showUploadList={false}
                            beforeUpload={handleUpload}
                            multiple={false}
                        >
                            <Button
                                icon={<PlusOutlined />}
                                loading={uploading}
                                className={styles.btnUpload}
                            >
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                        </Upload>
                        <p className={styles.uploadHint}>
                            Supports JPG, PNG, WebP. Max 10MB per image.
                        </p>
                    </div>
                </>
            )}
        </Modal>
    );
}
