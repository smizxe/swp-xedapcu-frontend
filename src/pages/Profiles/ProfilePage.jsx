import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Button, Input, Spin, message } from 'antd';
import {
    CheckCircleOutlined,
    EditOutlined,
    MailOutlined,
    SaveOutlined,
    UserOutlined,
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { getMyProfile, updateMyProfile } from '../../service/userService';
import styles from './ProfilePage.module.css';

const formatRoleLabel = (role) => {
    if (!role) return 'Member';
    return String(role).toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatProviderLabel = (provider) => {
    if (!provider) return 'Email / Password';
    return String(provider).replace(/\b\w/g, (char) => char.toUpperCase());
};

const getInitials = (profile) => {
    if (profile?.fullName) {
        return profile.fullName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }

    return profile?.email?.slice(0, 2).toUpperCase() || 'NA';
};

const ReadonlyField = ({ label, value, icon = null, subtle = false }) => (
    <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={`${styles.valueRow} ${styles.readonlyValueRow}`}>
            <div className={styles.fieldValueWrap}>
                {icon ? <span className={styles.fieldIcon}>{icon}</span> : null}
                <span className={subtle ? styles.subtleValue : styles.fieldValue}>{value}</span>
            </div>
        </div>
    </div>
);

const EditableField = ({ label, value, placeholder, onChange }) => (
    <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        <Input
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className={styles.modernInput}
            size="large"
        />
    </div>
);

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [draft, setDraft] = useState({ fullName: '', phoneNumber: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                setIsLoading(true);
                setError('');
                const data = await getMyProfile();

                if (!isMounted) {
                    return;
                }

                setProfile(data || null);
                setDraft({
                    fullName: data?.fullName || '',
                    phoneNumber: data?.phone || '',
                });
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }

                setError(loadError?.response?.data || loadError?.message || 'Failed to load profile.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();
        return () => {
            isMounted = false;
        };
    }, []);

    const hasChanges = useMemo(() => {
        return (
            (draft.fullName || '') !== (profile?.fullName || '') ||
            (draft.phoneNumber || '') !== (profile?.phone || '')
        );
    }, [draft, profile]);

    const handleCancelEdit = () => {
        setDraft({
            fullName: profile?.fullName || '',
            phoneNumber: profile?.phone || '',
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError('');

            const response = await updateMyProfile({
                fullName: draft.fullName.trim(),
                phoneNumber: draft.phoneNumber.trim(),
            });

            const updatedUser = response?.user || response;
            setProfile(updatedUser);
            setDraft({
                fullName: updatedUser?.fullName || '',
                phoneNumber: updatedUser?.phone || '',
            });
            setIsEditing(false);
            message.success('Profile updated successfully.');
        } catch (saveError) {
            setError(saveError?.response?.data || saveError?.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <Header variant="dark" />
            <div className={styles.profileContentWrapper}>
                <header className={styles.header}>
                    <div className={styles.headerCopy}>
                        <h1 className={styles.pageTitle}>Account Settings</h1>
                        <p className={styles.pageSubtitle}>
                            Manage the profile information currently supported by the backend.
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        {isEditing ? (
                            <>
                                <Button onClick={handleCancelEdit} className={styles.btnGhost}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    className={styles.btnBlack}
                                    onClick={handleSave}
                                    loading={isSaving}
                                    disabled={!hasChanges}
                                >
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button
                                icon={<EditOutlined />}
                                className={styles.btnOutline}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </header>

                {error ? (
                    <Alert
                        type="error"
                        showIcon
                        className={styles.alert}
                        message="Profile could not be processed"
                        description={error}
                    />
                ) : null}

                {isLoading ? (
                    <div className={styles.loadingWrapper}>
                        <Spin size="large" />
                        <p>Loading your profile...</p>
                    </div>
                ) : (
                    <div className={styles.infoGrid}>
                        <div className={styles.leftColumn}>
                            <div className={styles.avatarSection}>
                                <div className={styles.avatarContainer}>
                                    <Avatar
                                        size={120}
                                        src={profile?.picture || undefined}
                                        icon={!profile?.picture ? <UserOutlined /> : undefined}
                                        className={styles.mainAvatar}
                                    >
                                        {!profile?.picture ? getInitials(profile) : null}
                                    </Avatar>
                                </div>
                                <h3 className={styles.userNameDisplay}>{profile?.fullName || 'Member'}</h3>
                                <p className={styles.roleBadge}>{formatRoleLabel(profile?.role)}</p>
                            </div>

                            <div className={styles.securitySection}>
                                <label className={styles.fieldLabel}>Account Status</label>
                                <div className={styles.statusCard}>
                                    <div className={styles.statusRow}>
                                        <CheckCircleOutlined className={styles.statusIcon} />
                                        <span>{profile?.isActive === false ? 'Disabled' : 'Active'}</span>
                                    </div>
                                    <p className={styles.statusDescription}>
                                        Avatar, address, and bio still depend on future backend profile support.
                                    </p>
                                </div>
                                <ReadonlyField label="Login Provider" value={formatProviderLabel(profile?.provider)} subtle={!profile?.provider} />
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            {isEditing ? (
                                <>
                                    <EditableField
                                        label="Full Name"
                                        value={draft.fullName}
                                        placeholder="Enter your full name"
                                        onChange={(value) => setDraft((prev) => ({ ...prev, fullName: value }))}
                                    />
                                    <ReadonlyField
                                        label="Email Address"
                                        value={profile?.email || 'Not available'}
                                        icon={<MailOutlined />}
                                    />
                                    <EditableField
                                        label="Phone Number"
                                        value={draft.phoneNumber}
                                        placeholder="Enter your phone number"
                                        onChange={(value) => setDraft((prev) => ({ ...prev, phoneNumber: value }))}
                                    />
                                </>
                            ) : (
                                <>
                                    <ReadonlyField label="Full Name" value={profile?.fullName || 'Not updated'} />
                                    <ReadonlyField
                                        label="Email Address"
                                        value={profile?.email || 'Not available'}
                                        icon={<MailOutlined />}
                                    />
                                    <ReadonlyField
                                        label="Phone Number"
                                        value={profile?.phone || 'Not updated'}
                                    />
                                </>
                            )}

                            <ReadonlyField label="Role" value={formatRoleLabel(profile?.role)} />
                            <ReadonlyField
                                label="User ID"
                                value={profile?.userId != null ? String(profile.userId) : 'Not available'}
                            />
                            <ReadonlyField
                                label="Address / Bio"
                                value="Backend has not exposed stable read data for address or bio yet."
                                subtle
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
