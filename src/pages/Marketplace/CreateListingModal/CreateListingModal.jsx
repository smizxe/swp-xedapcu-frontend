import { useEffect, useRef, useState } from 'react';
import styles from './CreateListingModal.module.css';
import { createPost } from '../../../service/postService';
import { createInspectionBooking } from '../../../service/inspectionService';
import { uploadImage } from '../../../service/imageService';
import {
    X,
    ArrowRight,
    ArrowLeft,
    Bike,
    CheckCircle,
    Shield,
    Calendar,
    Clock,
    MapPin,
    ChevronDown,
    Camera,
    ImagePlus,
    Trash2,
    Star,
} from 'lucide-react';

const INSPECTION_START_HOUR = 7;
const INSPECTION_LAST_START_HOUR = 18;

const padHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getMinStartHourForDate = (bookingDate) => {
    if (!bookingDate) {
        return INSPECTION_START_HOUR;
    }

    if (bookingDate !== getTodayDateString()) {
        return INSPECTION_START_HOUR;
    }

    return Math.max(INSPECTION_START_HOUR, new Date().getHours() + 1);
};

const getAvailableHourOptions = (bookingDate) => {
    const minHour = getMinStartHourForDate(bookingDate);
    const options = [];

    for (let hour = minHour; hour <= INSPECTION_LAST_START_HOUR; hour += 1) {
        const label = padHour(hour);
        options.push({ value: label, label });
    }

    return options;
};

function StepIndicator({ current }) {
    return (
        <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${current === 1 ? styles.stepDotActive : styles.stepDotDone}`} />
            <div className={`${styles.stepLine} ${current === 2 ? styles.stepLineFilled : ''}`} />
            <div className={`${styles.stepDot} ${current === 2 ? styles.stepDotActive : ''}`} />
        </div>
    );
}

function StepPickBike({ bicycles, selectedId, onSelect }) {
    if (bicycles.length === 0) {
        return (
            <div className={styles.emptyBikes}>
                <Bike size={48} strokeWidth={1} className={styles.emptyBikesIcon} />
                <p>You have no bicycles yet.</p>
                <p>Add a bicycle from <strong>My Bicycles</strong> page first.</p>
            </div>
        );
    }

    const sortedBicycles = [...bicycles].sort((a, b) => {
        const idA = a.bicycleId ?? a.id ?? 0;
        const idB = b.bicycleId ?? b.id ?? 0;
        return idB - idA;
    });

    return (
        <div className={styles.bikeGrid}>
            {sortedBicycles.map((bike) => {
                const id = bike.bicycleId ?? bike.id;
                const isSelected = selectedId === id;

                return (
                    <div
                        key={id}
                        className={`${styles.bikeCard} ${isSelected ? styles.bikeCardSelected : ''}`}
                        onClick={() => onSelect(id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelect(id)}
                        aria-pressed={isSelected}
                    >
                        {isSelected && (
                            <span className={styles.checkBadge}>
                                <CheckCircle size={14} />
                            </span>
                        )}
                        <p className={styles.bikeBrand}>{bike.brand || 'Unknown Brand'}</p>
                        {bike.frameMaterial && <p className={styles.bikeSpec}>{bike.frameMaterial}</p>}
                        {bike.frameSize && <p className={styles.bikeSpec}>Size: {bike.frameSize}</p>}
                        {bike.wheelSize && <p className={styles.bikeSpec}>Wheel: {bike.wheelSize}</p>}
                        {bike.conditionPercent != null && (
                            <p className={styles.bikeSpec}>Condition: {bike.conditionPercent}%</p>
                        )}
                        {bike.categoryName && (
                            <span className={styles.bikeCategoryBadge}>{bike.categoryName}</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function StepFillDetails({
    bicycles,
    selectedId,
    form,
    onChange,
    onInspectionToggle,
    inspectionEnabled,
    inspectionForm,
    onInspectionChange,
    error,
    imageFiles,
    thumbnailIndex,
    onPickImages,
    onRemoveImage,
    onSetThumbnail,
    availableStartTimes,
    minBookingDate,
}) {
    const selectedBike = bicycles.find((b) => (b.bicycleId ?? b.id) === selectedId);

    return (
        <>
            {selectedBike && (
                <div className={styles.selectedBikePill}>
                    <span className={styles.selectedBikeLabel}>Bicycle:</span>
                    <span className={styles.selectedBikeName}>
                        {selectedBike.brand}
                        {selectedBike.frameSize ? ` · ${selectedBike.frameSize}` : ''}
                        {selectedBike.categoryName ? ` · ${selectedBike.categoryName}` : ''}
                    </span>
                </div>
            )}

            <form className={styles.form} id="create-listing-form">
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="listing-title">
                        Title <span className={styles.labelRequired}>*</span>
                    </label>
                    <input
                        id="listing-title"
                        name="title"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Trek Domane SL 6 - Like New"
                        value={form.title}
                        onChange={onChange}
                        autoFocus
                        required
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="listing-description">Description</label>
                    <textarea
                        id="listing-description"
                        name="description"
                        className={styles.textarea}
                        placeholder="Describe the bicycle's condition, history, included accessories..."
                        value={form.description}
                        onChange={onChange}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="listing-price">
                        Price (VND) <span className={styles.labelRequired}>*</span>
                    </label>
                    <input
                        id="listing-price"
                        name="price"
                        type="number"
                        min={0}
                        step={50000}
                        className={styles.input}
                        placeholder="e.g. 12000000"
                        value={form.price}
                        onChange={onChange}
                        required
                    />
                    <p className={styles.feeNotice}>
                        A <strong>5% posting fee</strong> of the listing price will be deducted from your wallet when you publish this post.
                        {form.price && Number(form.price) > 0 && (
                            <> &nbsp;(Fee: <strong>{Math.round(Number(form.price) * 0.05).toLocaleString('vi-VN')} VND</strong>)</>
                        )}
                    </p>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>
                        <Camera size={13} /> Photos
                    </label>
                    <div className={styles.imagePickerCard}>
                        <button
                            type="button"
                            className={styles.imagePickerBtn}
                            onClick={onPickImages}
                        >
                            <ImagePlus size={18} />
                            Add Images
                        </button>
                        <p className={styles.imagePickerHint}>
                            Images stay in this form and will be uploaded right after the post is created.
                        </p>

                        {imageFiles.length > 0 ? (
                            <div className={styles.imageGrid}>
                                {imageFiles.map((image, index) => (
                                    <div key={image.id} className={styles.imageCard}>
                                        <img
                                            src={image.previewUrl}
                                            alt={image.file.name}
                                            className={styles.imagePreview}
                                        />
                                        <div className={styles.imageMeta}>
                                            <span className={styles.imageName} title={image.file.name}>
                                                {image.file.name}
                                            </span>
                                            <span className={styles.imageSize}>
                                                {(image.file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className={styles.imageActionsRow}>
                                            <button
                                                type="button"
                                                className={`${styles.imageActionBtn} ${thumbnailIndex === index ? styles.imageActionBtnActive : ''}`}
                                                onClick={() => onSetThumbnail(index)}
                                            >
                                                <Star size={14} />
                                                {thumbnailIndex === index ? 'Thumbnail' : 'Set Cover'}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.imageDeleteBtn}
                                                onClick={() => onRemoveImage(index)}
                                            >
                                                <Trash2 size={14} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.imageEmptyState}>
                                No images selected yet. You can still publish without photos.
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.inspectionToggleCard}>
                    <div className={styles.inspectionToggleHeader} onClick={onInspectionToggle}>
                        <div className={styles.inspectionToggleLeft}>
                            <div className={styles.inspectionIconWrap}>
                                <Shield size={22} />
                            </div>
                            <div>
                                <p className={styles.inspectionToggleTitle}>Professional Inspection Service</p>
                                <p className={styles.inspectionToggleSub}>
                                    Get a certified inspector to verify your bicycle's quality
                                </p>
                            </div>
                        </div>
                        <div className={styles.inspectionToggleRight}>
                            <div className={`${styles.toggle} ${inspectionEnabled ? styles.toggleOn : ''}`}>
                                <div className={styles.toggleHandle} />
                            </div>
                            <ChevronDown
                                size={16}
                                className={`${styles.chevron} ${inspectionEnabled ? styles.chevronOpen : ''}`}
                            />
                        </div>
                    </div>

                    <div className={`${styles.inspectionFields} ${inspectionEnabled ? styles.inspectionFieldsOpen : ''}`}>
                        <div className={styles.inspectionFieldsInner}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="booking-date">
                                    <Calendar size={13} /> Inspection Date
                                </label>
                                <input
                                    id="booking-date"
                                    name="bookingDate"
                                    type="date"
                                    className={styles.input}
                                    value={inspectionForm.bookingDate}
                                    onChange={onInspectionChange}
                                    min={minBookingDate}
                                />
                            </div>

                            <div className={styles.inspectionGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="start-time">
                                        <Clock size={13} /> Start Time
                                    </label>
                                    <select
                                        id="start-time"
                                        className={styles.input}
                                        value={inspectionForm.startTime}
                                        onChange={(e) => onInspectionChange(e, 'startTime')}
                                    >
                                        <option value="">-- Select --</option>
                                        {availableStartTimes.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="end-time">
                                        <Clock size={13} /> End Time
                                    </label>
                                    <div
                                        id="end-time"
                                        className={`${styles.input} ${styles.endTimeDisplay}`}
                                    >
                                        {inspectionForm.endTime || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="location">
                                    <MapPin size={13} /> Inspection Location
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    className={styles.input}
                                    placeholder="e.g. 123 Nguyen Trai, District 1, HCMC"
                                    value={inspectionForm.location}
                                    onChange={onInspectionChange}
                                />
                            </div>

                            <div className={styles.inspectionNote}>
                                Admin will assign an inspector after your post is published.
                                You'll be notified once scheduled.
                            </div>
                        </div>
                    </div>
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}
            </form>
        </>
    );
}

function SuccessModal({ withInspection, onClose }) {
    return (
        <div className={styles.successOverlay} onClick={onClose}>
            <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.successIconWrap}>
                    <CheckCircle size={48} className={styles.successIcon} />
                </div>
                <h2 className={styles.successTitle}>Post Created!</h2>
                {withInspection ? (
                    <>
                        <p className={styles.successText}>
                            Your listing is submitted and <strong>pending admin review</strong>.
                        </p>
                        <div className={styles.successInspectionBadge}>
                            <Shield size={15} />
                            Inspection Requested - Admin will assign an inspector shortly
                        </div>
                    </>
                ) : (
                    <p className={styles.successText}>
                        Your listing is now live on the marketplace.
                    </p>
                )}
                <button className={styles.successBtn} onClick={onClose}>
                    Done
                </button>
            </div>
        </div>
    );
}

const EMPTY_FORM = { title: '', description: '', price: '' };
const EMPTY_INSPECTION = {
    bookingDate: '',
    startTime: '',
    endTime: '',
    location: '',
};

function CreateListingModal({ isOpen, onClose, bicycles = [], onSuccess }) {
    const [step, setStep] = useState(1);
    const [selectedBicycleId, setSelectedBicycleId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [inspectionEnabled, setInspectionEnabled] = useState(false);
    const [inspectionForm, setInspectionForm] = useState(EMPTY_INSPECTION);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedWithInspection, setSubmittedWithInspection] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    const fileInputRef = useRef(null);
    const minBookingDate = getTodayDateString();
    const availableStartTimes = getAvailableHourOptions(inspectionForm.bookingDate);

    const clearImagePreviews = () => {
        imageFiles.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };

    const reset = () => {
        clearImagePreviews();
        setStep(1);
        setSelectedBicycleId(null);
        setForm(EMPTY_FORM);
        setInspectionEnabled(false);
        setInspectionForm(EMPTY_INSPECTION);
        setFormError('');
        setShowSuccess(false);
        setImageFiles([]);
        setThumbnailIndex(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => () => {
        imageFiles.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    }, [imageFiles]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (formError) {
            setFormError('');
        }
    };

    const handleInspectionChange = (e, fieldOverride) => {
        const field = fieldOverride ?? e.target.name;
        const value = e.target.value;

        if (field === 'bookingDate') {
            const nextOptions = getAvailableHourOptions(value);
            const currentStartStillValid = nextOptions.some((option) => option.value === inspectionForm.startTime);
            setInspectionForm((prev) => ({
                ...prev,
                bookingDate: value,
                startTime: currentStartStillValid ? prev.startTime : '',
                endTime: currentStartStillValid ? prev.endTime : '',
            }));
            return;
        }

        if (field === 'startTime') {
            const startHour = parseInt(value.split(':')[0], 10);
            const endHour = startHour + 1;
            const endTime = `${String(endHour).padStart(2, '0')}:00`;
            setInspectionForm((prev) => ({ ...prev, startTime: value, endTime }));
            return;
        }

        setInspectionForm((prev) => ({ ...prev, [field]: value }));
    };

    const goNext = () => {
        if (selectedBicycleId) {
            setFormError('');
            setStep(2);
        }
    };

    const goBack = () => {
        setFormError('');
        setStep(1);
    };

    const handlePickImages = () => {
        fileInputRef.current?.click();
    };

    const handleImagesSelected = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) {
            return;
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const hasInvalidFile = files.some(
            (file) => !validImageTypes.includes(file.type) || file.size > 10 * 1024 * 1024
        );

        if (hasInvalidFile) {
            setFormError('Only JPG, PNG, or WebP images up to 10MB are allowed.');
            e.target.value = '';
            return;
        }

        setImageFiles((prev) => [
            ...prev,
            ...files.map((file) => ({
                id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ]);
        setFormError('');
        e.target.value = '';
    };

    const handleRemoveImage = (indexToRemove) => {
        setImageFiles((prev) => {
            const nextImages = [...prev];
            const [removedImage] = nextImages.splice(indexToRemove, 1);
            if (removedImage) {
                URL.revokeObjectURL(removedImage.previewUrl);
            }
            return nextImages;
        });

        setThumbnailIndex((prev) => {
            if (indexToRemove === prev) {
                return 0;
            }
            if (indexToRemove < prev) {
                return prev - 1;
            }
            return prev;
        });
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            setFormError('Title is required.');
            return;
        }

        if (!form.price || Number(form.price) <= 0) {
            setFormError('Please enter a valid price.');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            const postResult = await createPost({
                bicycleId: selectedBicycleId,
                title: form.title.trim(),
                description: form.description.trim(),
                price: Number(form.price),
            });

            const postId =
                postResult?.post?.postId ??
                postResult?.postId ??
                postResult?.id;

            if (!postId) {
                throw new Error('Could not retrieve post ID after creating the post.');
            }

            if (imageFiles.length > 0) {
                const coverImage = imageFiles[thumbnailIndex] ?? imageFiles[0];
                const uploadQueue = [
                    coverImage,
                    ...imageFiles.filter((_, index) => index !== thumbnailIndex),
                ];

                for (let index = 0; index < uploadQueue.length; index += 1) {
                    await uploadImage(postId, uploadQueue[index].file, index === 0);
                }
            }

            if (inspectionEnabled && inspectionForm.bookingDate) {
                await createInspectionBooking({
                    postId,
                    bookingDate: inspectionForm.bookingDate,
                    startTime: inspectionForm.startTime || null,
                    endTime: inspectionForm.endTime || null,
                    location: inspectionForm.location,
                    paidBy: 'SELLER',
                });
            }

            setSubmittedWithInspection(inspectionEnabled);
            setShowSuccess(true);

            if (!inspectionEnabled) {
                onSuccess?.();
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                (typeof err?.response?.data === 'string' ? err.response.data : null) ||
                err?.message ||
                'Failed to create post. Please try again.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSuccessClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const stepTitles = {
        1: { title: 'Choose a Bicycle', sub: 'Select the bicycle you want to list for sale' },
        2: { title: 'Listing Details', sub: 'Add title, description, price, photos and optional inspection' },
    };

    return (
        <>
            <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <StepIndicator current={step} />
                            <h2 className={styles.headerTitle}>{stepTitles[step].title}</h2>
                            <p className={styles.headerSub}>{stepTitles[step].sub}</p>
                        </div>
                        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close modal">
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.step} key={step}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className={styles.hiddenInput}
                            onChange={handleImagesSelected}
                        />

                        {step === 1 ? (
                            <StepPickBike
                                bicycles={bicycles}
                                selectedId={selectedBicycleId}
                                onSelect={setSelectedBicycleId}
                            />
                        ) : (
                            <StepFillDetails
                                bicycles={bicycles}
                                selectedId={selectedBicycleId}
                                form={form}
                                onChange={handleChange}
                                inspectionEnabled={inspectionEnabled}
                                onInspectionToggle={() => setInspectionEnabled((value) => !value)}
                                inspectionForm={inspectionForm}
                                onInspectionChange={handleInspectionChange}
                                error={formError}
                                imageFiles={imageFiles}
                                thumbnailIndex={thumbnailIndex}
                                onPickImages={handlePickImages}
                                onRemoveImage={handleRemoveImage}
                                onSetThumbnail={setThumbnailIndex}
                                availableStartTimes={availableStartTimes}
                                minBookingDate={minBookingDate}
                            />
                        )}
                    </div>

                    <div className={styles.actions}>
                        {step === 2 && (
                            <button className={styles.btnBack} onClick={goBack}>
                                <ArrowLeft size={14} /> Back
                            </button>
                        )}
                        {step === 1 ? (
                            <button className={styles.btnNext} onClick={goNext} disabled={!selectedBicycleId}>
                                Next <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button className={styles.btnSubmit} onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Publish Listing'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showSuccess && (
                <SuccessModal withInspection={submittedWithInspection} onClose={handleSuccessClose} />
            )}
        </>
    );
}

export default CreateListingModal;
