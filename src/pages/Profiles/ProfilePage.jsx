import { useState } from 'react';
import { Avatar, Button, Input, Spin } from 'antd';
import {
    EditOutlined,
    UserOutlined,
    SaveOutlined,
    CloseOutlined,
    LockOutlined,
} from '@ant-design/icons';
import styles from './ProfilePage.module.css';
import Header from '../../components/Header/Header';

const { TextArea } = Input;

const ProfilePage = ({
    userProfile,
    email,
    isNoPassword,
    isLoading = false,
    onSaveField, // Hàm callback khi nhấn Save một trường nào đó
    onCreatePassword, // Hàm callback khi tạo mật khẩu mới
    onAvatarChange // Hàm callback khi đổi ảnh đại diện
}) => {
    // State nội bộ phục vụ việc đóng/mở form edit và lưu giá trị tạm thời
    const [editingField, setEditingField] = useState(null); // 'fullName', 'phone', 'address', 'about', 'password'
    const [editForm, setEditForm] = useState({});

    const handleStartEdit = (field) => {
        setEditingField(field);
        setEditForm({ ...editForm, [field]: userProfile[field] || '' });
    };

    const handleCancel = () => {
        setEditingField(null);
    };

    const handleLocalSave = async (field) => {
        if (onSaveField) {
            await onSaveField(field, editForm[field]);
            setEditingField(null);
        }
    };

    // Hàm tạo initials cho Avatar
    const getInitials = () => {
        if (userProfile?.fullName) {
            return userProfile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        return email?.substring(0, 2).toUpperCase() || 'NA';
    };

    if (isLoading && !userProfile) {
        return (
            <div className={styles.loadingWrapper}>
                <Spin size="large" />
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div>
            <Header variant="dark" />
            <div className={styles.profileContentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>Account Settings</h1>
                    <p className={styles.pageSubtitle}>Manage your personal information and security on EkibDlo.</p>
                </header>

                <div className={styles.infoGrid}>
                    {/* Cột bên trái: Avatar & Bảo mật */}
                    <div className={styles.leftColumn}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarContainer}>
                                <Avatar size={120} icon={<UserOutlined />} className={styles.mainAvatar}>
                                    {getInitials()}
                                </Avatar>
                                <div className={styles.avatarEditIcon} onClick={onAvatarChange}>
                                    <EditOutlined />
                                </div>
                            </div>
                            <h3 className={styles.userNameDisplay}>{userProfile?.fullName || 'Member'}</h3>
                        </div>

                        <div className={styles.securitySection}>
                            <label className={styles.fieldLabel}>Security</label>
                            {isNoPassword ? (
                                <Button className={styles.btnBlack} onClick={() => setEditingField('password')}>
                                    Set Account Password
                                </Button>
                            ) : (
                                <Button className={styles.btnOutline} onClick={() => setEditingField('password')}>
                                    Change Password
                                </Button>
                            )}

                            {/* Password Change Form */}
                            {editingField === 'password' && (
                                <div className={styles.passwordChangeForm}>
                                    {!isNoPassword && (
                                        <div className={styles.passwordFieldGroup}>
                                            <label className={styles.passwordFieldLabel}>Current Password</label>
                                            <Input.Password
                                                prefix={<LockOutlined />}
                                                placeholder="Enter your current password"
                                                value={editForm.oldPassword || ''}
                                                onChange={(e) => setEditForm({ ...editForm, oldPassword: e.target.value })}
                                                className={styles.passwordInput}
                                            />
                                        </div>
                                    )}
                                    <div className={styles.passwordFieldGroup}>
                                        <label className={styles.passwordFieldLabel}>New Password</label>
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Enter your new password"
                                            value={editForm.newPassword || ''}
                                            onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                                            className={styles.passwordInput}
                                        />
                                    </div>
                                    <div className={styles.passwordFieldGroup}>
                                        <label className={styles.passwordFieldLabel}>Confirm New Password</label>
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Confirm your new password"
                                            value={editForm.confirmPassword || ''}
                                            onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                                            className={styles.passwordInput}
                                        />
                                    </div>
                                    <div className={styles.passwordActions}>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            onClick={() => handleLocalSave('password')}
                                            className={styles.btnBlack}
                                        >
                                            Save Password
                                        </Button>
                                        <Button
                                            icon={<CloseOutlined />}
                                            onClick={handleCancel}
                                            className={styles.btnCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cột bên phải: Các thông tin chi tiết */}
                    <div className={styles.rightColumn}>
                        {/* Item: Full Name */}
                        <ProfileField
                            label="Full Name"
                            field="fullName"
                            value={userProfile?.fullName}
                            isEditing={editingField === 'fullName'}
                            onEdit={() => handleStartEdit('fullName')}
                            onCancel={handleCancel}
                            onSave={handleLocalSave}
                            inputValue={editForm.fullName}
                            onInputChange={(val) => setEditForm({ ...editForm, fullName: val })}
                        />

                        {/* Item: Email (Readonly) */}
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Email Address</label>
                            <div className={styles.readonlyContainer}>
                                <span>{email}</span>
                            </div>
                        </div>

                        {/* Item: Phone */}
                        <ProfileField
                            label="Phone Number"
                            field="phone"
                            value={userProfile?.phone}
                            isEditing={editingField === 'phone'}
                            onEdit={() => handleStartEdit('phone')}
                            onCancel={handleCancel}
                            onSave={handleLocalSave}
                            inputValue={editForm.phone}
                            onInputChange={(val) => setEditForm({ ...editForm, phone: val })}
                        />

                        {/* Item: Address */}
                        <ProfileField
                            label="Residential Address"
                            field="address"
                            value={userProfile?.address}
                            isEditing={editingField === 'address'}
                            onEdit={() => handleStartEdit('address')}
                            onCancel={handleCancel}
                            onSave={handleLocalSave}
                            inputValue={editForm.address}
                            onInputChange={(val) => setEditForm({ ...editForm, address: val })}
                        />
                    </div>
                </div>

                {/* Section: About Me */}
                <div className={styles.aboutMeSection}>
                    <label className={styles.fieldLabel}>Bio / About Me</label>
                    {editingField === 'about' ? (
                        <div className={styles.editArea}>
                            <TextArea
                                rows={4}
                                value={editForm.about}
                                onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                                className={styles.modernInput}
                            />
                            <div className={styles.editActions}>
                                <Button type="primary" icon={<SaveOutlined />} onClick={() => handleLocalSave('about')} className={styles.btnBlackSmall}>Save</Button>
                                <Button icon={<CloseOutlined />} onClick={handleCancel} className={styles.btnCancel}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.valueRow} onClick={() => handleStartEdit('about')}>
                            <p className={userProfile?.about ? styles.aboutText : styles.placeholderText}>
                                {userProfile?.about || "Tell buyers about yourself..."}
                            </p>
                            <EditOutlined className={styles.inlineEditIcon} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component con phụ để hiển thị từng hàng thông tin
const ProfileField = ({ label, value, isEditing, onEdit, onCancel, onSave, inputValue, onInputChange }) => (
    <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>{label}</label>
        {isEditing ? (
            <div className={styles.editArea}>
                <Input
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    className={styles.modernInput}
                />
                <div className={styles.editActions}>
                    <Button type="primary" icon={<SaveOutlined />} onClick={onSave} className={styles.btnBlackSmall}>Save</Button>
                    <Button icon={<CloseOutlined />} onClick={onCancel} className={styles.btnCancel}>Cancel</Button>
                </div>
            </div>
        ) : (
            <div className={styles.valueRow} onClick={onEdit}>
                <span>{value || 'Not updated'}</span>
                <EditOutlined className={styles.inlineEditIcon} />
            </div>
        )}
    </div>
);

export default ProfilePage;