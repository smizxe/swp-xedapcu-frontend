import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import MarketplacePage from './MarketplacePage';
import { getAllPosts, searchPosts } from '../../../service/postService';
import { getAllCategories } from '../../../service/categoryService';
import { isAuthenticated } from '../../../service/authService';
import { getMyBicycles } from '../../../service/bicycleService';
import useLocalStorage from '../../../hooks/useLocalStorage';

function MarketplaceContainer() {
    const [posts, setPosts] = useState([]);
    const [apiPosts, setApiPosts] = useState([]);  // raw API posts
    const [categories, setCategories] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // localStorage listings
    const [localListings] = useLocalStorage('marketplace_listings', []);

    // Add Post modal state
    const [showAddPost, setShowAddPost] = useState(false);

    // User's own bicycles (for the Create Listing modal)
    const [myBicycles, setMyBicycles] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [sortBy, setSortBy] = useState('newest');

    const PAGE_SIZE = 12;

    // Fetch categories once on mount
    useEffect(() => {
        getAllCategories()
            .then(setCategories)
            .catch(() => {
                // Categories are optional; swallow errors silently
            });
    }, []);

    // Fetch user's bicycles once on mount (only when logged in)
    useEffect(() => {
        if (!isAuthenticated()) return;
        getMyBicycles()
            .then((bikes) => setMyBicycles(bikes || []))
            .catch(() => {
                // Non-critical; silently ignore
            });
    }, []);

    // Fetch posts whenever page changes
    const fetchPosts = useCallback(async (page = 0, query = '', category = undefined) => {
        setIsLoading(true);
        try {
            let data;
            if (query.trim()) {
                data = await searchPosts(query.trim(), page, PAGE_SIZE);
            } else {
                data = await getAllPosts(page, PAGE_SIZE);
            }

            // Handle both plain array and the backend’s paginated shape:
            // { posts: [], totalItems: N, totalPages: N, currentPage: N }
            if (Array.isArray(data)) {
                let filtered = [...data];

                // Client-side sort
                if (sortBy === 'price_asc') {
                    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (sortBy === 'price_desc') {
                    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                }

                setApiPosts(filtered);
                setTotalElements(filtered.length);
            } else {
                // Paginated response — backend uses "posts" + "totalItems"
                let items = data.posts || data.content || [];

                if (sortBy === 'price_asc') {
                    items = [...items].sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (sortBy === 'price_desc') {
                    items = [...items].sort((a, b) => (b.price || 0) - (a.price || 0));
                }

                setApiPosts(items);
                setTotalElements(data.totalItems ?? data.totalElements ?? items.length);
            }
        } catch (err) {
            message.error('Failed to load listings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [sortBy]);

    // Reload when page or sortBy changes
    useEffect(() => {
        fetchPosts(currentPage, searchQuery, selectedCategory);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy]);

    // Merge localStorage listings (priority) with API posts
    useEffect(() => {
        const merged = [...(localListings || []), ...apiPosts];
        setPosts(merged);
        setTotalElements(merged.length);
    }, [localListings, apiPosts]);

    const handleSearch = () => {
        setCurrentPage(0);
        fetchPosts(0, searchQuery, selectedCategory);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        setCurrentPage(0);
        fetchPosts(0, searchQuery, value);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setCurrentPage(0);
    };

    const handleBuyNow = (postId) => {
        if (!isAuthenticated()) {
            message.warning('Please log in to place a deposit.');
            return;
        }
        message.info(`Deposit flow for post #${postId} — coming soon!`);
    };

    return (
        <MarketplacePage
            posts={posts}
            categories={categories}
            totalElements={totalElements}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            isLoading={isLoading}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onPageChange={(page) => setCurrentPage(page)}
            onBuyNow={handleBuyNow}
            showAddPost={showAddPost}
            onToggleAddPost={setShowAddPost}
            myBicycles={myBicycles}
        />
    );
}

export default MarketplaceContainer;
