import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './BicyclePage.module.css';
import { getMyBicycles, createBicycle } from '../../service/bicycleService';
import { getAllCategories } from '../../service/categoryService';
import { isAuthenticated } from '../../service/authService';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

/* ── helpers ─────────────────────────────────────────── */
const getConditionColor = (pct) => {
    if (pct >= 80) return '#16a34a';
    if (pct >= 50) return '#d97706';
    return '#dc2626';
};

const EMPTY_FORM = {
    brand: '',
    frameMaterial: '',
    frameSize: '',
    groupset: '',
    wheelSize: '',
    conditionPercent: 50,
    categoryId: '',
};

/* ── BicyclePage ─────────────────────────────────────── */
function BicyclePage() {
    const navigate = useNavigate();

    /* data */
    const [bicycles, setBicycles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /* modal — Add Bicycle */
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    /* ── Auth guard ─────────────────────────────────── */
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

    /* ── Fetch bicycles + categories ─────────────────── */
    useEffect(() => {
        if (!isAuthenticated()) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [bikes, cats] = await Promise.all([
                    getMyBicycles(),
                    getAllCategories(),
                ]);
                const sorted = [...bikes].sort(
                    (a, b) => (b.bicycleId ?? b.id ?? 0) - (a.bicycleId ?? a.id ?? 0)
                );
                setBicycles(sorted);
                setCategories(cats);
            } catch (err) {
                console.error('Failed to load bicycles', err);
                setError('Failed to load your bicycles. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    /* ── Modal helpers ───────────────────────────────── */
    const openModal = () => {
        setForm(EMPTY_FORM);
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'conditionPercent' || name === 'categoryId' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        /* basic validation */
        if (!form.brand.trim()) { setFormError('Brand is required.'); return; }
        if (!form.categoryId) { setFormError('Please select a category.'); return; }

        try {
            setSubmitting(true);
            const newBike = await createBicycle(form);
            // The create response may not include categoryName, so enrich it locally
            const selectedCat = categories.find((c) => c.id === form.categoryId);
            const enrichedBike = {
                ...newBike,
                categoryName: newBike.categoryName ?? selectedCat?.categoryName ?? '',
            };
            setBicycles((prev) => [enrichedBike, ...prev]);
            closeModal();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to add bicycle.';
            setFormError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Category name helper ────────────────────────── */
    const getCategoryName = (id) => {
        if (id == null) return 'Unknown';
        const cat = categories.find(
            (c) => c.category_id === id || c.categoryId === id ||
                c.id === id || c.category_id === Number(id) ||
                c.id === Number(id)
        );
        return cat ? (cat.name ?? cat.categoryName) : `#${id}`;
    };

    /* ── Render states ───────────────────────────────── */
    const renderBody = () => {
        if (isLoading) {
            return (
                <div className={styles.centered}>
                    <div className={styles.emptyIcon}>⏳</div>
                    <p>Loading your bicycles…</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.centered}>
                    <div className={styles.emptyIcon}>⚠️</div>
                    <p>{error}</p>
                </div>
            );
        }

        if (bicycles.length === 0) {
            return (
                <div className={styles.centered}>
                    <p>You haven't added any bicycles yet.</p>
                    <p>Click <strong>+ Add Bicycle</strong> to get started!</p>
                </div>
            );
        }

        return (
            <div className={styles.grid}>
                {bicycles.map((bike) => (
                    <BicycleCard
                        key={bike.bicycleId ?? bike.id}
                        bike={bike}
                        categoryName={bike.categoryName ?? getCategoryName(
                            bike.categoryId ?? bike.category_id ?? bike.category?.id
                        )}
                        onEdit={() => console.log('Edit', bike.bicycleId ?? bike.id)}
                        onDelete={() => console.log('Delete', bike.bicycleId ?? bike.id)}
                    />
                ))}
            </div>
        );
    };

    /* ── JSX ─────────────────────────────────────────── */
    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />

            <div className={styles.pageContent}>
                {/* Header row */}
                <div className={styles.pageHeader}>
                    <div className={styles.titles}>
                        <h1>My Bicycles</h1>
                        <p>Manage your bicycle collection</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className={styles.btnAdd} onClick={openModal}>
                            + Add Bicycle
                        </button>
                    </div>
                </div>

                {/* Content */}
                {renderBody()}
            </div>

            {/* ── Add Bicycle Modal ──────────────────────────── */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className={styles.modal}>
                        <h2>🚲 Add New Bicycle</h2>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            {/* Row 1 */}
                            <div className={styles.formRow}>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="brand">Brand *</label>
                                    <input
                                        id="brand"
                                        name="brand"
                                        placeholder="e.g. Trek"
                                        value={form.brand}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="categoryId">Category *</label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={form.categoryId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className={styles.formRow}>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="frameMaterial">Frame Material</label>
                                    <input
                                        id="frameMaterial"
                                        name="frameMaterial"
                                        placeholder="e.g. Aluminum"
                                        value={form.frameMaterial}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="frameSize">Frame Size</label>
                                    <input
                                        id="frameSize"
                                        name="frameSize"
                                        placeholder="e.g. M / 54cm"
                                        value={form.frameSize}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className={styles.formRow}>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="groupset">Groupset</label>
                                    <input
                                        id="groupset"
                                        name="groupset"
                                        placeholder="e.g. Shimano 105"
                                        value={form.groupset}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label htmlFor="wheelSize">Wheel Size</label>
                                    <input
                                        id="wheelSize"
                                        name="wheelSize"
                                        placeholder='e.g. 700c / 29"'
                                        value={form.wheelSize}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Condition */}
                            <div className={styles.fieldGroup}>
                                <label htmlFor="conditionPercent">Condition (%) *</label>
                                <input
                                    id="conditionPercent"
                                    name="conditionPercent"
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="e.g. 85"
                                    value={form.conditionPercent}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Error */}
                            {formError && <p className={styles.errorMsg}>{formError}</p>}

                            {/* Actions */}
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                                    {submitting ? 'Adding…' : 'Add Bicycle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

/* ── BicycleCard ─────────────────────────────────────── */
function BicycleCard({ bike, categoryName, onEdit, onDelete }) {
    const condition = bike.conditionPercent;
    const condColor = getConditionColor(condition ?? 0);

    const specs = [
        { label: 'Frame Material', value: bike.frameMaterial },
        { label: 'Frame Size', value: bike.frameSize },
        { label: 'Groupset', value: bike.groupset },
        { label: 'Wheel Size', value: bike.wheelSize },
    ].filter((s) => s.value);

    return (
        <div className={styles.card}>
            {/* Card header */}
            <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>
                    <span className={styles.bikeIcon}>Brand</span>
                    {bike.brand}
                </p>
                <span className={styles.categoryBadge}>{categoryName}</span>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
                <div className={styles.specGrid}>
                    {specs.map((s) => (
                        <div key={s.label} className={styles.spec}>
                            <span className={styles.specLabel}>{s.label}</span>
                            <span className={styles.specValue}>{s.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Condition bar */}
            {condition != null && (
                <div className={styles.conditionWrap}>
                    <div className={styles.conditionHeader}>
                        <span className={styles.conditionLabelText}>Condition</span>
                        <span className={styles.conditionPct} style={{ color: condColor }}>
                            {condition}%
                        </span>
                    </div>
                    <div className={styles.conditionTrack}>
                        <div
                            className={styles.conditionFill}
                            style={{ width: `${condition}%`, background: condColor }}
                        />
                    </div>
                </div>
            )}

            {/* Card actions */}
            <div className={styles.cardActions}>
                <button className={styles.btnEdit} onClick={onEdit} title="Edit">
                    <EditOutlinedIcon fontSize="small" />
                </button>
                <button className={styles.btnDelete} onClick={onDelete} title="Delete">
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                </button>
            </div>
        </div>
    );
}

export default BicyclePage;
