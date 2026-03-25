import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import styles from './BicyclePage.module.css';
import { createBicycle, deleteBicycle, getMyBicycles, updateBicycle } from '../../service/bicycleService';
import { getAllCategories } from '../../service/categoryService';
import { isAuthenticated } from '../../service/authService';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

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

function BicyclePage() {
    const navigate = useNavigate();
    const [bicycles, setBicycles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingBikeId, setEditingBikeId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

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

    const openCreateModal = () => {
        setEditingBikeId(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (bike) => {
        setEditingBikeId(bike.bicycleId ?? bike.id);
        setForm({
            brand: bike.brand ?? '',
            frameMaterial: bike.frameMaterial ?? '',
            frameSize: bike.frameSize ?? '',
            groupset: bike.groupset ?? '',
            wheelSize: bike.wheelSize ?? '',
            conditionPercent: Number(bike.conditionPercent ?? 50),
            categoryId: Number(bike.categoryId ?? bike.category_id ?? bike.category?.id ?? ''),
        });
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBikeId(null);
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

        if (!form.brand.trim()) {
            setFormError('Brand is required.');
            return;
        }
        if (!form.categoryId) {
            setFormError('Please select a category.');
            return;
        }

        try {
            setSubmitting(true);
            const selectedCat = categories.find(
                (c) => String(c.id ?? c.categoryId ?? '') === String(form.categoryId)
            );

            if (editingBikeId) {
                const updatedBike = await updateBicycle(editingBikeId, form);
                const enrichedBike = {
                    ...form,
                    ...updatedBike,
                    bicycleId: updatedBike?.bicycleId ?? updatedBike?.id ?? editingBikeId,
                    categoryName: updatedBike?.categoryName ?? selectedCat?.categoryName ?? selectedCat?.name ?? '',
                };
                setBicycles((prev) => prev.map((bike) => (
                    (bike.bicycleId ?? bike.id) === editingBikeId ? { ...bike, ...enrichedBike } : bike
                )));
            } else {
                const newBike = await createBicycle(form);
                const rawId = newBike?.bicycleId ?? newBike?.id ?? Date.now();
                const enrichedBike = {
                    ...form,
                    ...newBike,
                    bicycleId: rawId,
                    categoryName: newBike?.categoryName ?? selectedCat?.categoryName ?? selectedCat?.name ?? '',
                };
                setBicycles((prev) => [enrichedBike, ...prev]);
            }

            closeModal();
        } catch (err) {
            console.error('[BicyclePage] bicycle save error:', err);
            setFormError(
                err.response?.data?.message
                || err.response?.data
                || err.message
                || `Failed to ${editingBikeId ? 'update' : 'add'} bicycle.`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (bike) => {
        const bicycleId = bike.bicycleId ?? bike.id;
        const confirmed = window.confirm(`Delete bicycle "${bike.brand}"?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteBicycle(bicycleId);
            setBicycles((prev) => prev.filter((item) => (item.bicycleId ?? item.id) !== bicycleId));
        } catch (err) {
            console.error('[BicyclePage] delete error:', err);
            window.alert(err.response?.data?.message || err.response?.data || err.message || 'Failed to delete bicycle.');
        }
    };

    const getCategoryName = (id) => {
        if (id == null) return 'Unknown';
        const cat = categories.find(
            (c) => c.category_id === id
                || c.categoryId === id
                || c.id === id
                || c.category_id === Number(id)
                || c.id === Number(id)
        );
        return cat ? (cat.name ?? cat.categoryName) : `#${id}`;
    };

    const filteredBicycles = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = bicycles.filter((bike) => {
            const rawCategoryId = bike.categoryId ?? bike.category_id ?? bike.category?.id;
            const matchedCategory = categories.find((category) => (
                String(category.id ?? category.categoryId ?? category.category_id ?? '') === String(rawCategoryId ?? '')
            ));
            const bikeCategoryName = bike.categoryName ?? matchedCategory?.name ?? matchedCategory?.categoryName ?? `#${rawCategoryId}`;

            const matchesSearch = !normalizedSearch || [
                bike.brand,
                bike.frameMaterial,
                bike.frameSize,
                bike.groupset,
                bike.wheelSize,
                bikeCategoryName,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedSearch));

            const normalizedCategoryId = String(rawCategoryId ?? '');
            const matchesCategory = categoryFilter === 'ALL' || normalizedCategoryId === categoryFilter;

            return matchesSearch && matchesCategory;
        });

        return [...filtered].sort((a, b) => {
            if (sortOrder === 'OLDEST') {
                return (a.bicycleId ?? a.id ?? 0) - (b.bicycleId ?? b.id ?? 0);
            }
            if (sortOrder === 'CONDITION_HIGH') {
                return Number(b.conditionPercent ?? 0) - Number(a.conditionPercent ?? 0);
            }
            if (sortOrder === 'CONDITION_LOW') {
                return Number(a.conditionPercent ?? 0) - Number(b.conditionPercent ?? 0);
            }
            return (b.bicycleId ?? b.id ?? 0) - (a.bicycleId ?? a.id ?? 0);
        });
    }, [bicycles, categoryFilter, searchTerm, sortOrder, categories]);

    const renderBody = () => {
        if (isLoading) {
            return (
                <div className={styles.centered}>
                    <div className={styles.emptyIcon}>Loading</div>
                    <p>Loading your bicycles...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.centered}>
                    <div className={styles.emptyIcon}>Error</div>
                    <p>{error}</p>
                </div>
            );
        }

        if (bicycles.length === 0) {
            return (
                <div className={styles.centered}>
                    <p>You have not added any bicycles yet.</p>
                    <p>Click <strong>+ Add Bicycle</strong> to get started.</p>
                </div>
            );
        }

        if (filteredBicycles.length === 0) {
            return (
                <div className={styles.centered}>
                    <p>No bicycles match your current filters.</p>
                </div>
            );
        }

        return (
            <div className={styles.grid}>
                {filteredBicycles.map((bike) => (
                    <BicycleCard
                        key={bike.bicycleId ?? bike.id}
                        bike={bike}
                        categoryName={bike.categoryName ?? getCategoryName(
                            bike.categoryId ?? bike.category_id ?? bike.category?.id
                        )}
                        onEdit={() => openEditModal(bike)}
                        onDelete={() => handleDelete(bike)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={styles.pageWrapper}>
            <Header variant="dark" />

            <div className={styles.pageContent}>
                <div className={styles.pageHeader}>
                    <div className={styles.titles}>
                        <h1>My Bicycles</h1>
                        <p>Manage your bicycle collection</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className={styles.btnAdd} onClick={openCreateModal}>
                            + Add Bicycle
                        </button>
                    </div>
                </div>

                {!isLoading && bicycles.length > 0 && (
                    <div className={styles.toolbar}>
                        <input
                            className={styles.searchInput}
                            placeholder="Search by brand, groupset, frame size..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        <select
                            className={styles.toolbarSelect}
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.categoryName ?? category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className={styles.toolbarSelect}
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                        >
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                            <option value="CONDITION_HIGH">Best Condition</option>
                            <option value="CONDITION_LOW">Lowest Condition</option>
                        </select>
                    </div>
                )}

                {renderBody()}
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className={styles.modal}>
                        <h2>{editingBikeId ? 'Edit Bicycle' : 'Add New Bicycle'}</h2>

                        <form className={styles.form} onSubmit={handleSubmit}>
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
                                                {c.categoryName ?? c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

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

                            {formError && <p className={styles.errorMsg}>{formError}</p>}

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnCancel} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.btnSubmit} disabled={submitting}>
                                    {submitting ? (editingBikeId ? 'Saving...' : 'Adding...') : (editingBikeId ? 'Save Changes' : 'Add Bicycle')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function BicycleCard({ bike, categoryName, onEdit, onDelete }) {
    const condition = bike.conditionPercent;
    const condColor = getConditionColor(condition ?? 0);
    const specs = [
        { label: 'Frame Material', value: bike.frameMaterial },
        { label: 'Frame Size', value: bike.frameSize },
        { label: 'Groupset', value: bike.groupset },
        { label: 'Wheel Size', value: bike.wheelSize },
    ].filter((spec) => spec.value);

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>
                    <span className={styles.bikeIcon}>Brand</span>
                    {bike.brand}
                </p>
                <span className={styles.categoryBadge}>{categoryName}</span>
            </div>

            {specs.length > 0 && (
                <div className={styles.specGrid}>
                    {specs.map((spec) => (
                        <div key={spec.label} className={styles.spec}>
                            <span className={styles.specLabel}>{spec.label}</span>
                            <span className={styles.specValue}>{spec.value}</span>
                        </div>
                    ))}
                </div>
            )}

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
