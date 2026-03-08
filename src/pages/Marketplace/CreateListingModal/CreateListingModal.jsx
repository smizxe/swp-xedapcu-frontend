import { useState } from 'react';
import styles from './CreateListingModal.module.css';
import { createPost } from '../../../service/postService';
import { createInspectionBooking } from '../../../service/inspectionService';
import {
    X, ArrowRight, ArrowLeft, Bike, CheckCircle, Shield,
    Calendar, Clock, MapPin, ChevronDown
} from 'lucide-react';

/* ── Step indicator ────────────────────────────────────── */
function StepIndicator({ current }) {
    return (
        <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${current === 1 ? styles.stepDotActive : styles.stepDotDone}`} />
            <div className={`${styles.stepLine} ${current === 2 ? styles.stepLineFilled : ''}`} />
            <div className={`${styles.stepDot} ${current === 2 ? styles.stepDotActive : ''}`} />
        </div>
    );
}

/* ── STEP 1: Pick a bicycle ─────────────────────────────── */
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
    return (
        <div className={styles.bikeGrid}>
            {bicycles.map((bike) => {
                const id = bike.bicycleId ?? bike.id;
                const isSelected = selectedId === id;
                return (
                    <div
                        key={id}
                        className={`${styles.bikeCard} ${isSelected ? styles.bikeCardSelected : ''}`}
                        onClick={() => onSelect(id)}
                        role="button" tabIndex={0}
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

/* ── STEP 2: Fill in listing details + inspection toggle ─── */
/* Hour options 07:00–18:00 for the time selects */
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => {
    const h = i + 7; // 7 to 18
    const label = `${String(h).padStart(2, '0')}:00`;
    return { value: label, label };
});

function StepFillDetails({ bicycles, selectedId, form, onChange, onInspectionToggle, inspectionEnabled, inspectionForm, onInspectionChange, error }) {
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
                        id="listing-title" name="title" type="text"
                        className={styles.input}
                        placeholder="e.g. Trek Domane SL 6 — Like New"
                        value={form.title} onChange={onChange} autoFocus required
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="listing-description">Description</label>
                    <textarea
                        id="listing-description" name="description"
                        className={styles.textarea}
                        placeholder="Describe the bicycle's condition, history, included accessories…"
                        value={form.description} onChange={onChange}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="listing-price">
                        Price (VND) <span className={styles.labelRequired}>*</span>
                    </label>
                    <input
                        id="listing-price" name="price" type="number"
                        min={0} step={50000} className={styles.input}
                        placeholder="e.g. 12000000"
                        value={form.price} onChange={onChange} required
                    />
                </div>

                {/* ── Professional Inspection Toggle ──────────── */}
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

                    {/* Slide-down booking fields */}
                    <div className={`${styles.inspectionFields} ${inspectionEnabled ? styles.inspectionFieldsOpen : ''}`}>
                        <div className={styles.inspectionFieldsInner}>
                            {/* Date + Fee badge row */}
                            <div className={styles.inspectionGrid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label} htmlFor="booking-date">
                                        <Calendar size={13} /> Inspection Date
                                    </label>
                                    <input
                                        id="booking-date" name="bookingDate" type="date"
                                        className={styles.input}
                                        value={inspectionForm.bookingDate}
                                        onChange={onInspectionChange}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        <Clock size={13} /> Fee Paid By
                                    </label>
                                    <div className={styles.paidByBadge}>
                                        Seller (You)
                                    </div>
                                </div>
                            </div>

                            {/* Time row */}
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
                                        {HOUR_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
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
                                        {inspectionForm.endTime || '—'}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="location">
                                    <MapPin size={13} /> Inspection Location
                                </label>
                                <input
                                    id="location" name="location" type="text"
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
                {/* ─────────────────────────────────────────────── */}

                {error && <p className={styles.errorMsg}>{error}</p>}
            </form>
        </>
    );
}

/* ── Success Modal ──────────────────────────────────────── */
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
                            Inspection Requested — Admin will assign an inspector shortly
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

/* ── Main component ─────────────────────────────────────── */
const EMPTY_FORM = { title: '', description: '', price: '' };
const EMPTY_INSPECTION = { bookingDate: '', startTime: '', endTime: '', location: '', paidBy: 'SELLER' };

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

    const reset = () => {
        setStep(1);
        setSelectedBicycleId(null);
        setForm(EMPTY_FORM);
        setInspectionEnabled(false);
        setInspectionForm(EMPTY_INSPECTION);
        setFormError('');
        setShowSuccess(false);
    };

    const handleClose = () => { reset(); onClose(); };
    const handleOverlayClick = (e) => { if (e.target === e.currentTarget) handleClose(); };

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (formError) setFormError('');
    };

    const handleInspectionChange = (e, fieldOverride) => {
        const field = fieldOverride ?? e.target.name;
        const value = e.target.value;

        if (field === 'startTime') {
            // Auto-compute endTime = startTime + 1 hour, capped at 18:00
            const startHour = parseInt(value.split(':')[0], 10);
            const endHour = Math.min(startHour + 1, 18);
            const endTime = `${String(endHour).padStart(2, '0')}:00`;
            setInspectionForm((prev) => ({ ...prev, startTime: value, endTime }));
        } else {
            setInspectionForm((prev) => ({ ...prev, [field]: value }));
        }
    };

    const goNext = () => { if (selectedBicycleId) { setFormError(''); setStep(2); } };
    const goBack = () => { setFormError(''); setStep(1); };

    const handleSubmit = async () => {
        if (!form.title.trim()) { setFormError('Title is required.'); return; }
        if (!form.price || Number(form.price) <= 0) { setFormError('Please enter a valid price.'); return; }

        setSubmitting(true);
        setFormError('');
        try {
            const postResult = await createPost({
                bicycleId: selectedBicycleId,
                title: form.title.trim(),
                description: form.description.trim(),
                price: Number(form.price),
            });

            // BE returns: { message: "...", post: { postId: ... } }
            const postId = postResult?.post?.postId
                ?? postResult?.postId
                ?? postResult?.id;

            if (inspectionEnabled && inspectionForm.bookingDate) {
                if (!postId) {
                    throw new Error('Could not retrieve post ID to book inspection.');
                }
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

            // Only refresh marketplace if NO inspection — post with inspection
            // should not appear until inspected & approved.
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

    const handleSuccessClose = () => { reset(); onClose(); };

    if (!isOpen) return null;

    const stepTitles = {
        1: { title: 'Choose a Bicycle', sub: 'Select the bicycle you want to list for sale' },
        2: { title: 'Listing Details', sub: 'Add title, description, price and optional inspection' },
    };

    return (
        <>
            <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
                <div className={styles.modal}>
                    {/* Header */}
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

                    {/* Step content */}
                    <div className={styles.step} key={step}>
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
                                onInspectionToggle={() => setInspectionEnabled((v) => !v)}
                                inspectionForm={inspectionForm}
                                onInspectionChange={handleInspectionChange}
                                error={formError}
                            />
                        )}
                    </div>

                    {/* Footer */}
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
                                {submitting ? 'Saving…' : 'Publish Listing'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <SuccessModal withInspection={submittedWithInspection} onClose={handleSuccessClose} />
            )}
        </>
    );
}

export default CreateListingModal;
