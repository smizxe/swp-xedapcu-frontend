import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import MarketplacePage from './MarketplacePage';
import { getAllPosts, searchPosts } from '../../../service/postService';
import { getAllCategories } from '../../../service/categoryService';
import { isAuthenticated } from '../../../service/authService';

function MarketplaceContainer() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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

            // Handle both plain array and the backend's paginated shape:
            // { posts: [], totalItems: N, totalPages: N, currentPage: N }
            if (Array.isArray(data)) {
                let filtered = [...data];

                // Client-side sort
                if (sortBy === 'price_asc') {
                    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (sortBy === 'price_desc') {
                    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                }

                setPosts(filtered);
                setTotalElements(filtered.length);
            } else {
                // Paginated response — backend uses "posts" + "totalItems"
                let items = data.posts || data.content || [];

                if (sortBy === 'price_asc') {
                    items = [...items].sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (sortBy === 'price_desc') {
                    items = [...items].sort((a, b) => (b.price || 0) - (a.price || 0));
                }

                setPosts(items);
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
        />
    );
}

export default MarketplaceContainer;
