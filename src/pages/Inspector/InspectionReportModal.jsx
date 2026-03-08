import { useState } from 'react';
import styles from './InspectionReportModal.module.css';
import { submitReport } from '../../service/inspectionService';
import {
    X, Shield, FileText, Star, CheckCircle,
    Loader, AlertCircle
} from 'lucide-react';

/* ── Rating row (1–10 dots) ──────────────────────────────── */
function RatingDots({ value, onChange, max = 10 }) {
    return (
        <div className={styles.ratingRow}>
            {Array.from({ length: max }, (_, i) => {
                const v = i + 1;
                return (
                    <button
                        key={v}
                        type="button"
                        className={`${styles.ratingDot} ${v <= value ? styles.ratingDotFilled : ''}`}
                        onClick={() => onChange(v)}
                        title={`${v}/10`}
                    />
                );
            })}
            <span className={styles.ratingLabel}>{value > 0 ? `${value}/10` : 'Not rated'}</span>
        </div>
    );
}

/* ── Section rating block ────────────────────────────────── */
function SectionBlock({ title, name, value, onTextChange, score, onScore, icon: Icon, scoreLabel }) {
    return (
        <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIconWrap}><Icon size={16} /></div>
                <span className={styles.sectionTitle}>{title}</span>
                <div className={styles.sectionScoreMini}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <button
                            key={s} type="button"
                            className={`${styles.starBtn} ${s <= score ? styles.starBtnFilled : ''}`}
                            onClick={() => onScore(s)}
                        >
                            <Star size={14} fill={s <= score ? 'currentColor' : 'none'} />
                        </button>
                    ))}
                </div>
            </div>
            <textarea
                name={name}
                placeholder={`Describe the ${title.toLowerCase()} condition…`}
                className={styles.sectionTextarea}
                value={value}
                onChange={onTextChange}
            />
            {scoreLabel && score > 0 && (
                <p className={styles.scoreHint}>{scoreLabel[score - 1]}</p>
            )}
        </div>
    );
}

const FRAME_LABELS  = ['Poor','Below Average','Average','Good','Excellent'];
const BRAKE_LABELS  = ['Worn Out','Weak','Functional','Responsive','Crisp & Sharp'];
const DRIVE_LABELS  = ['Skipping','Rough','OK','Smooth','Factory-fresh'];

/* ── Frame / Brake SVG icons (lucide-compatible wrappers) ── */
const FrameIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="8" width="20" height="8" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>;
const BrakeIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v9"/></svg>;
const DriveIcon  = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M5 19V12l7-4 7 4v7"/></svg>;

/* ── Main modal ──────────────────────────────────────────── */
export default function InspectionReportModal({ inspection, onDone, onClose }) {
    const [form, setForm] = useState({
        frameStatus:      '',
        brakeStatus:      '',
        drivetrainStatus: '',
        overallRating:    0,
        reportFileUrl:    '',
        notes:            '',
    });
    const [scores, setScores] = useState({ frame: 0, brake: 0, drivetrain: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.frameStatus.trim() || !form.brakeStatus.trim() || !form.drivetrainStatus.trim()) {
            setError('Please fill in all three inspection sections.'); return;
        }
        if (form.overallRating === 0) {
            setError('Please provide an overall rating.'); return;
        }
        setSubmitting(true); setError('');
        try {
            await submitReport(inspection.inspectionId, {
                frameStatus:      form.frameStatus.trim(),
                brakeStatus:      form.brakeStatus.trim(),
                drivetrainStatus: form.drivetrainStatus.trim(),
                overallRating:    form.overallRating,
                reportFileUrl:    form.reportFileUrl.trim() || null,
                notes:            form.notes.trim() || null,
            });
            onDone?.();
        } catch (e) {
            setError(e?.response?.data?.error || e.message || 'Failed to submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}><Shield size={20} /></div>
                        <div>
                            <h2 className={styles.headerTitle}>Inspection Report</h2>
                            <p className={styles.headerSub}>
                                {inspection.postTitle || `Post #${inspection.postId}`} · #{inspection.inspectionId}
                            </p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    <div className={styles.qualityChecklist}>
                        <div className={styles.checklistHeader}>
                            <FileText size={16} />
                            <span>Quality Checklist</span>
                        </div>

                        <SectionBlock
                            title="Frame & Structure"
                            name="frameStatus"
                            value={form.frameStatus}
                            onTextChange={handleChange}
                            score={scores.frame}
                            onScore={(v) => setScores((s) => ({ ...s, frame: v }))}
                            icon={FrameIcon}
                            scoreLabel={FRAME_LABELS}
                        />
                        <SectionBlock
                            title="Brakes"
                            name="brakeStatus"
                            value={form.brakeStatus}
                            onTextChange={handleChange}
                            score={scores.brake}
                            onScore={(v) => setScores((s) => ({ ...s, brake: v }))}
                            icon={BrakeIcon}
                            scoreLabel={BRAKE_LABELS}
                        />
                        <SectionBlock
                            title="Drivetrain"
                            name="drivetrainStatus"
                            value={form.drivetrainStatus}
                            onTextChange={handleChange}
                            score={scores.drivetrain}
                            onScore={(v) => setScores((s) => ({ ...s, drivetrain: v }))}
                            icon={DriveIcon}
                            scoreLabel={DRIVE_LABELS}
                        />
                    </div>

                    {/* Overall rating */}
                    <div className={styles.overallBlock}>
                        <label className={styles.overallLabel}>
                            <Star size={15} /> Overall Condition Rating
                        </label>
                        <RatingDots
                            value={form.overallRating}
                            onChange={(v) => setForm((p) => ({ ...p, overallRating: v }))}
                        />
                    </div>

                    {/* Extra fields */}
                    <div className={styles.extraFields}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Notes (optional)</label>
                            <textarea
                                name="notes"
                                className={styles.textarea}
                                placeholder="Any additional observations or recommendations…"
                                value={form.notes}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Report PDF URL (optional)</label>
                            <input
                                name="reportFileUrl"
                                type="url"
                                className={styles.input}
                                placeholder="https://drive.google.com/…"
                                value={form.reportFileUrl}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMsg}>
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
                        {submitting
                            ? <><Loader size={14} className={styles.spin} /> Submitting…</>
                            : <><CheckCircle size={14} /> Submit Report</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
