import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import MarketplacePage from './MarketplacePage';
import { getAllPosts, searchPosts, getMyPosts } from '../../../service/postService';
import { getAllCategories } from '../../../service/categoryService';
import { getPostImages, getThumbnail } from '../../../service/imageService';
import { isAuthenticated } from '../../../service/authService';
import { getMyBicycles } from '../../../service/bicycleService';


function MarketplaceContainer() {
    const [posts, setPosts] = useState([]);
    const [apiPosts, setApiPosts] = useState([]);  // raw API posts
    const [categories, setCategories] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);


    // Add Post modal state
    const [showAddPost, setShowAddPost] = useState(false);

    // User's own bicycles (for the Create Listing modal)
    const [myBicycles, setMyBicycles] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(undefined);
    const [sortBy, setSortBy] = useState('newest');
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const PAGE_SIZE = 12;

    // Fetch categories once on mount
    useEffect(() => {
        getAllCategories()
            .then(setCategories)
            .catch(() => {
                // Categories are optional; swallow errors silently
            });
    }, []);

    // Fetch user's bicycles and posts once on mount (only when logged in)
    const refreshMyBicycles = useCallback(async () => {
        if (!isAuthenticated()) return;
        try {
            const [bikes, myPosts] = await Promise.all([
                getMyBicycles(),
                getMyPosts(),
            ]);
            const allBikes = bikes || [];
            const allMyPosts = Array.isArray(myPosts) ? myPosts : [];
            // Collect bicycle IDs that already have an active post (ignore SOLD)
            const postedBicycleIds = new Set(
                allMyPosts
                    .filter((p) => p.status !== 'SOLD' && p.bicycle?.bicycleId != null)
                    .map((p) => p.bicycle.bicycleId)
            );
            // Only show bicycles that do NOT have an active post yet
            setMyBicycles(allBikes.filter((b) => !postedBicycleIds.has(b.bicycleId ?? b.id)));
        } catch {
            // Non-critical; silently ignore
        }
    }, []);

    useEffect(() => {
        refreshMyBicycles();
    }, [refreshMyBicycles]);

    // Fetch posts whenever page changes
    const fetchPosts = useCallback(async (page = 0, query = '') => {
        setIsLoading(true);
        try {
            let data;
            if (query.trim()) {
                data = await searchPosts(query.trim(), page, PAGE_SIZE);
            } else {
                data = await getAllPosts(page, PAGE_SIZE);
            }

            // Sort helper:
            //  1. SOLD items always sink to the bottom
            //  2. Within each group, apply the user's chosen sort (default: newest first from BE)
            const applySort = (list) => {
                let items = [...list];

                if (sortBy === 'price_asc') {
                    items.sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (sortBy === 'price_desc') {
                    items.sort((a, b) => (b.price || 0) - (a.price || 0));
                } else {
                    // newest first — sort by createdAt descending (BE already does this,
                    // but re-applying ensures correctness after any client-side manipulation)
                    items.sort(
                        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                }

                // Push SOLD items to the end, preserving their relative order
                const active = items.filter((p) => p.status !== 'SOLD');
                const sold = items.filter((p) => p.status === 'SOLD');
                return [...active, ...sold];
            };

            const attachThumbnailUrls = async (list) => {
                return Promise.all(list.map(async (post) => {
                    try {
                        const thumbnailResponse = await getThumbnail(post.postId);
                        const thumbnailUrl =
                            thumbnailResponse?.data?.imageUrl ||
                            thumbnailResponse?.imageUrl ||
                            null;

                        if (thumbnailUrl) {
                            return { ...post, thumbnailUrl };
                        }
                    } catch {
                        // Fall back to the first uploaded image below.
                    }

                    try {
                        const imagesResponse = await getPostImages(post.postId);
                        const images = imagesResponse?.data || [];
                        return { ...post, thumbnailUrl: images[0]?.imageUrl || null };
                    } catch {
                        return { ...post, thumbnailUrl: null };
                    }
                }));
            };

            // Handle both plain array and the backend's paginated shape:
            // { posts: [], totalItems: N, totalPages: N, currentPage: N }
            if (Array.isArray(data)) {
                const sorted = applySort(data);
                const postsWithThumbnails = await attachThumbnailUrls(sorted);
                setApiPosts(postsWithThumbnails);
                setTotalElements(postsWithThumbnails.length);
                setHasLoadedOnce(true);
            } else {
                // Paginated response — backend uses "posts" + "totalItems"
                const raw = data.posts || data.content || [];
                const sorted = applySort(raw);
                const postsWithThumbnails = await attachThumbnailUrls(sorted);
                setApiPosts(postsWithThumbnails);
                setTotalElements(data.totalItems ?? data.totalElements ?? postsWithThumbnails.length);
                setHasLoadedOnce(true);
            }
        } catch {
            if (!hasLoadedOnce && apiPosts.length === 0) {
                message.error('Failed to load listings. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [apiPosts.length, hasLoadedOnce, sortBy]);

    // Reload when page or sortBy changes
    useEffect(() => {
        fetchPosts(currentPage, searchQuery, selectedCategory);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy]);

    // Sync displayed posts from API data
    useEffect(() => {
        setPosts(apiPosts);
    }, [apiPosts]);

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

    const handleAddPostSuccess = () => {
        setCurrentPage(0);
        fetchPosts(0, searchQuery, selectedCategory);
        // Re-filter bicycles so the newly posted one disappears from the list
        refreshMyBicycles();
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
            onAddPostSuccess={handleAddPostSuccess}
        />
    );
}

export default MarketplaceContainer;
