import { useState } from 'react';
import { Modal, Input, DatePicker, TimePicker, Select, message } from 'antd';
import { createInspectionBooking } from '../../service/inspectionService';
import styles from './MySalesPage.module.css';

const { Option } = Select;

// antd v6 onChange(dayjs, dateString) - dateString can be string or string[]
const pickStr = (v) => (Array.isArray(v) ? v[0] : v) || '';

export default function InspectionBookingModal({ open, postId, onClose, onSuccess }) {
    const [form, setForm] = useState({
        location: '',
        bookingDate: null,   // "YYYY-MM-DD"
        startTime: null,     // "HH:mm"
        endTime: null,       // "HH:mm"
        paidBy: 'SELLER',
    });
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => setForm({
        location: '', bookingDate: null, startTime: null, endTime: null, paidBy: 'SELLER',
    });

    const handleSubmit = async () => {
        if (!form.location || !form.bookingDate || !form.startTime || !form.endTime) {
            message.warning('Please fill in all fields.');
            return;
        }

        // Backend expects LocalDate "YYYY-MM-DD" and LocalTime "HH:mm:ss"
        const payload = {
            postId,
            bookingDate: form.bookingDate,
            startTime: form.startTime.length === 5 ? form.startTime + ':00' : form.startTime,
            endTime: form.endTime.length === 5 ? form.endTime + ':00' : form.endTime,
            location: form.location,
            paidBy: form.paidBy,
        };

        console.log('Sending booking payload:', payload);

        setSubmitting(true);
        try {
            await createInspectionBooking(payload);
            message.success('Inspection booking created! Waiting for inspector assignment.');
            resetForm();
            onSuccess();
        } catch (err) {
            console.error('Booking error:', err.response?.status, err.response?.data);
            const errMsg = err.response?.data?.message || err.response?.data || 'Failed to create booking.';
            message.error(typeof errMsg === 'string' ? errMsg : 'Failed to create booking.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Book Inspection Appointment"
            open={open}
            onOk={handleSubmit}
            onCancel={() => { resetForm(); onClose(); }}
            confirmLoading={submitting}
            okText="Create Booking"
            okButtonProps={{ className: styles.btnSchedule }}
        >
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
                Schedule an inspection for this bicycle. An inspector will be assigned by admin.
            </p>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <Input
                    placeholder="Enter meeting location / address"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Booking Date</label>
                <DatePicker
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                    onChange={(_, dateStr) => setForm({ ...form, bookingDate: pickStr(dateStr) })}
                />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel}>Start Time</label>
                    <TimePicker
                        style={{ width: '100%' }}
                        format="HH:mm"
                        onChange={(_, timeStr) => setForm({ ...form, startTime: pickStr(timeStr) })}
                    />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel}>End Time</label>
                    <TimePicker
                        style={{ width: '100%' }}
                        format="HH:mm"
                        onChange={(_, timeStr) => setForm({ ...form, endTime: pickStr(timeStr) })}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.formLabel}>Inspection Fee Paid By</label>
                <Select
                    value={form.paidBy}
                    onChange={(val) => setForm({ ...form, paidBy: val })}
                    style={{ width: '100%' }}
                >
                    <Option value="SELLER">Seller</Option>
                    <Option value="BUYER">Buyer</Option>
                </Select>
            </div>
        </Modal>
    );
}
