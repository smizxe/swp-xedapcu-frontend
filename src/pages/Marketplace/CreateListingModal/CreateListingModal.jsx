import { useState } from 'react';
import styles from './CreateListingModal.module.css';
import useLocalStorage from '../../../hooks/useLocalStorage';

/* ── SVG Icons (no emoji) ─────────────────────────── */
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" className={styles.checkIcon}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={styles.closeBtnIcon}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ArrowRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const ArrowLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const BikeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyBikesIcon}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
    </svg>
);

/* ── STEP 1: Pick a bicycle ───────────────────────── */
function StepPickBike({ bicycles, selectedId, onSelect }) {
    if (bicycles.length === 0) {
        return (
            <div className={styles.emptyBikes}>
                <BikeIcon />
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
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelect(id)}
                        aria-pressed={isSelected}
                    >
                        {isSelected && (
                            <span className={styles.checkBadge}>
                                <CheckIcon />
                            </span>
                        )}

                        <p className={styles.bikeBrand}>{bike.brand || 'Unknown Brand'}</p>

                        {bike.frameMaterial && (
                            <p className={styles.bikeSpec}>{bike.frameMaterial}</p>
                        )}
                        {bike.frameSize && (
                            <p className={styles.bikeSpec}>Size: {bike.frameSize}</p>
                        )}
                        {bike.wheelSize && (
                            <p className={styles.bikeSpec}>Wheel: {bike.wheelSize}</p>
                        )}
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

/* ── STEP 2: Fill in details ──────────────────────── */
function StepFillDetails({ bicycles, selectedId, form, onChange, error }) {
    const selectedBike = bicycles.find(
        (b) => (b.bicycleId ?? b.id) === selectedId
    );

    return (
        <>
            {/* Show which bike is selected */}
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
                        placeholder="e.g. Trek Domane SL 6 — Like New"
                        value={form.title}
                        onChange={onChange}
                        autoFocus
                        required
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="listing-description">
                        Description
                    </label>
                    <textarea
                        id="listing-description"
                        name="description"
                        className={styles.textarea}
                        placeholder="Describe the bicycle's condition, history, included accessories…"
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
                </div>

                {error && <p className={styles.errorMsg}>{error}</p>}
            </form>
        </>
    );
}

/* ── Step indicator ───────────────────────────────── */
function StepIndicator({ current }) {
    return (
        <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${current === 1 ? styles.stepDotActive : ''}`} />
            <div className={styles.stepLine} />
            <div className={`${styles.stepDot} ${current === 2 ? styles.stepDotActive : ''}`} />
        </div>
    );
}

/* ── Main component ───────────────────────────────── */
const EMPTY_FORM = { title: '', description: '', price: '' };

/**
 * CreateListingModal
 *
 * @param {boolean}   isOpen
 * @param {Function}  onClose
 * @param {Array}     bicycles   — array of bicycle objects from My Bicycles
 */
function CreateListingModal({ isOpen, onClose, bicycles = [] }) {
    const [step, setStep] = useState(1);
    const [selectedBicycleId, setSelectedBicycleId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // localStorage hook — key: 'marketplace_listings'
    const [listings, setListings] = useLocalStorage('marketplace_listings', []);

    /* Reset everything when modal opens */
    const handleOpen = () => {
        setStep(1);
        setSelectedBicycleId(null);
        setForm(EMPTY_FORM);
        setFormError('');
    };

    const handleClose = () => {
        handleOpen(); // reset state
        onClose();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
    };

    /* Step 1 → 2 */
    const goNext = () => {
        if (!selectedBicycleId) return;
        setFormError('');
        setStep(2);
    };

    /* Step 2 → 1 */
    const goBack = () => {
        setFormError('');
        setStep(1);
    };

    /* Submit */
    const handleSubmit = () => {
        if (!form.title.trim()) {
            setFormError('Title is required.');
            return;
        }
        if (!form.price || Number(form.price) <= 0) {
            setFormError('Please enter a valid price.');
            return;
        }

        setSubmitting(true);
        try {
            const newListing = {
                postId: `local-${Date.now()}`,
                bicycleId: selectedBicycleId,
                title: form.title.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                status: 'ACTIVE',
                isLocal: true, // marker so UI knows it's from localStorage
                createdAt: new Date().toISOString(),
                // Enrich with bicycle info for Marketplace display
                bicycle: bicycles.find(
                    (b) => (b.bicycleId ?? b.id) === selectedBicycleId
                ) || null,
            };

            setListings((prev) => [newListing, ...prev]);
            handleClose();
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const stepTitles = {
        1: { title: 'Choose a Bicycle', sub: 'Select the bicycle you want to list for sale' },
        2: { title: 'Listing Details', sub: 'Add title, description and asking price' },
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <StepIndicator current={step} />
                        <h2 className={styles.headerTitle}>{stepTitles[step].title}</h2>
                        <p className={styles.headerSub}>{stepTitles[step].sub}</p>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        <CloseIcon />
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
                            error={formError}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className={styles.actions}>
                    {step === 2 && (
                        <button className={styles.btnBack} onClick={goBack}>
                            <ArrowLeft /> Back
                        </button>
                    )}

                    {step === 1 ? (
                        <button
                            className={styles.btnNext}
                            onClick={goNext}
                            disabled={!selectedBicycleId}
                        >
                            Next <ArrowRight />
                        </button>
                    ) : (
                        <button
                            className={styles.btnSubmit}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Saving…' : 'Add Listing'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateListingModal;
