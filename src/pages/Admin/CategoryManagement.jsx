import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import categoryService from '../../services/categoryService';
import styles from './CategoryManagement.module.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAllCategories();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setError('');
            await categoryService.createCategory({ name: newCategoryName });
            setSuccess('Category created successfully');
            setNewCategoryName('');
            setDialogOpen(false);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            setError('');
            await categoryService.deleteCategory(id);
            setSuccess('Category deleted successfully');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Container maxWidth="md">
                {/* Header */}
                <Box className={styles.header}>
                    <Typography variant="h3" className={styles.title}>
                        CATEGORY MANAGEMENT
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                        className={styles.addButton}
                    >
                        ADD CATEGORY
                    </Button>
                </Box>

                {/* Alerts */}
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Table */}
                <Paper className={styles.tableCard}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={styles.tableHeader}>ID</TableCell>
                                        <TableCell className={styles.tableHeader}>NAME</TableCell>
                                        <TableCell className={styles.tableHeader} align="right">ACTIONS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No categories found. Create one!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((cat) => (
                                            <TableRow key={cat.categoryId} className={styles.tableRow}>
                                                <TableCell>{cat.categoryId}</TableCell>
                                                <TableCell className={styles.categoryName}>
                                                    {cat.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(cat.categoryId)}
                                                        className={styles.deleteButton}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* Create Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    PaperProps={{ className: styles.dialog }}
                >
                    <DialogTitle className={styles.dialogTitle}>
                        ADD NEW CATEGORY
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Category Name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            sx={{ mt: 1 }}
                            placeholder="e.g., Road, Mountain, Hybrid"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setDialogOpen(false)}
                            className={styles.cancelButton}
                        >
                            CANCEL
                        </Button>
                        <Button
                            onClick={handleCreate}
                            variant="contained"
                            className={styles.confirmButton}
                        >
                            CREATE
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
};

export default CategoryManagement;
