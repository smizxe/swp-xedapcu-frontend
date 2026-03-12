import React from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminTabs = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine the current tab value based on the pathname
    // We do simple matching here to keep the active tab highlighted
    let currentTab = location.pathname;

    // In case the path has trailing slashes or extra segments, normalize it to match our tabs
    if (!['/admin', '/admin/categories', '/admin/inspections'].includes(currentTab)) {
        // Fallback default or exact matching logic could go here
        if (currentTab.startsWith('/admin/categories')) currentTab = '/admin/categories';
        else if (currentTab.startsWith('/admin/inspections')) currentTab = '/admin/inspections';
        else currentTab = '/admin'; // Default fallback
    }

    const handleChange = (event, newValue) => {
        navigate(newValue);
    };

    return (
        <Box sx={{ width: '100%', mb: 4, mt: 2 }}>
            <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
                <Tabs
                    value={currentTab}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        label="User Management"
                        value="/admin"
                        sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
                    />
                    <Tab
                        label="Category Management"
                        value="/admin/categories"
                        sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
                    />
                    <Tab
                        label="Inspection Assignment"
                        value="/admin/inspections"
                        sx={{ fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
                    />
                </Tabs>
            </Paper>
        </Box>
    );
};

export default AdminTabs;
