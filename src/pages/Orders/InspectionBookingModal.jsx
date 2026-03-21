import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Modal, Input, DatePicker, Select, message } from 'antd';
import { createInspectionBooking } from '../../service/inspectionService';
import styles from './MySalesPage.module.css';

const { Option } = Select;
const INSPECTION_START_HOUR = 7;
const INSPECTION_LAST_START_HOUR = 18;

// antd v6 onChange(dayjs, dateString) - dateString can be string or string[]
const pickStr = (v) => (Array.isArray(v) ? v[0] : v) || '';
const padHour = (hour) => `${String(hour).padStart(2, '0')}:00`;
const getTodayDateString = () => dayjs().format('YYYY-MM-DD');

const getMinStartHourForDate = (bookingDate) => {
    if (!bookingDate) {
        return INSPECTION_START_HOUR;
    }

    if (bookingDate !== getTodayDateString()) {
        return INSPECTION_START_HOUR;
    }

    return Math.max(INSPECTION_START_HOUR, dayjs().hour() + 1);
};

const getAvailableHourOptions = (bookingDate) => {
    const options = [];
    const minHour = getMinStartHourForDate(bookingDate);

    for (let hour = minHour; hour <= INSPECTION_LAST_START_HOUR; hour += 1) {
        options.push({ value: padHour(hour), label: padHour(hour) });
    }

    return options;
};

export default function InspectionBookingModal({ open, postId, onClose, onSuccess }) {
    const [form, setForm] = useState({
        location: '',
        bookingDate: null,   // "YYYY-MM-DD"
        startTime: null,     // "HH:mm"
        endTime: null,       // "HH:mm"
    });
    const [submitting, setSubmitting] = useState(false);
    const availableStartTimes = useMemo(() => getAvailableHourOptions(form.bookingDate), [form.bookingDate]);

    const resetForm = () => setForm({
        location: '', bookingDate: null, startTime: null, endTime: null,
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
            paidBy: 'SELLER',
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
                    value={form.bookingDate ? dayjs(form.bookingDate, 'YYYY-MM-DD') : null}
                    disabledDate={(current) => current && current.startOf('day').isBefore(dayjs().startOf('day'))}
                    onChange={(_, dateStr) => {
                        const nextBookingDate = pickStr(dateStr);
                        const currentStartStillValid = getAvailableHourOptions(nextBookingDate)
                            .some((option) => option.value === form.startTime);
                        setForm((prev) => ({
                            ...prev,
                            bookingDate: nextBookingDate,
                            startTime: currentStartStillValid ? prev.startTime : null,
                            endTime: currentStartStillValid ? prev.endTime : null,
                        }));
                    }}
                />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel}>Start Time</label>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Select start time"
                        value={form.startTime}
                        onChange={(value) => {
                            const startHour = parseInt(value.split(':')[0], 10);
                            setForm((prev) => ({
                                ...prev,
                                startTime: value,
                                endTime: padHour(startHour + 1),
                            }));
                        }}
                    >
                        {availableStartTimes.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label className={styles.formLabel}>End Time</label>
                    <Select
                        style={{ width: '100%' }}
                        value={form.endTime}
                        disabled
                        placeholder="End time will be set automatically"
                    >
                        {form.endTime ? (
                            <Option value={form.endTime}>{form.endTime}</Option>
                        ) : undefined}
                    </Select>
                </div>
            </div>
        </Modal>
    );
}
