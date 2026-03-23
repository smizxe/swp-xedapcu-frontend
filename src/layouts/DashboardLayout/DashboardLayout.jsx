import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardLayout.module.css';
import {
    LayoutDashboard,
    ClipboardList,
    Folders,
    Users,
    FileText,
    Truck,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const DashboardLayout = () => {
    const { user, isAdmin, isInspector, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const adminMenu = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/posts', label: 'Posts', icon: FileText },
        { path: '/admin/delivery', label: 'Delivery', icon: Truck },
        { path: '/admin/inspections', label: 'Inspections', icon: ClipboardList },
        { path: '/admin/categories', label: 'Categories', icon: Folders },
    ];

    const inspectorMenu = [
        { path: '/inspector', label: 'My Tasks', icon: ClipboardList, exact: true },
    ];

    // Determine which menu to show based on role
    // If a user is both (rare), we can show admin menu, or combine. Let's show Admin if isAdmin
    const menuItems = isAdmin ? adminMenu : (isInspector ? inspectorMenu : []);

    return (
        <div className={styles.layout}>
            {/* Mobile Header */}
            <div className={styles.mobileHeader}>
                <div className={styles.logo}>
                    <span className={styles.logoAccent}>Eki</span>bdlo Admin
                </div>
                <button className={styles.menuButton} onClick={toggleSidebar}>
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoDesktop}>
                        <span className={styles.logoAccent}>Eki</span>bdlo Admin
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) =>
                                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                                }
                                onClick={() => setSidebarOpen(false)} // close on mobile
                            >
                                <Icon size={20} className={styles.navIcon} />
                                <span className={styles.navLabel}>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    {user && (
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                {(user.fullName || user.email || 'A')[0].toUpperCase()}
                            </div>
                            <div className={styles.userDetails}>
                                <div className={styles.userName}>{user.fullName || 'Admin User'}</div>
                                <div className={styles.userRole}>{user.role}</div>
                            </div>
                        </div>
                    )}
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <LogOut size={20} className={styles.logoutIcon} />
                        <span className={styles.logoutLabel}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.pageContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
