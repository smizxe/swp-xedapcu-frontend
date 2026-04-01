import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import MarketplacePage from './MarketplacePage';
import { getAllPosts, searchPosts, getMyPosts } from '../../../service/postService';
import { getPostImages, getThumbnail } from '../../../service/imageService';
import { isAuthenticated } from '../../../service/authService';
import { getMyBicycles } from '../../../service/bicycleService';

function MarketplaceContainer() {
    const [posts, setPosts] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [showAddPost, setShowAddPost] = useState(false);
    const [myBicycles, setMyBicycles] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [inspectedStatus, setInspectedStatus] = useState('all');
    const PAGE_SIZE = 12;

    // Fetch user's bicycles (for Create Listing modal)
    const refreshMyBicycles = useCallback(async () => {
        if (!isAuthenticated()) return;
        try {
            const [bikes, myPosts] = await Promise.all([
                getMyBicycles(),
                getMyPosts(),
            ]);
            const allBikes = bikes || [];
            const allMyPosts = Array.isArray(myPosts) ? myPosts : [];
            const postedBicycleIds = new Set(
                allMyPosts
                    .filter((p) => p.status !== 'SOLD' && p.bicycle?.bicycleId != null)
                    .map((p) => p.bicycle.bicycleId)
            );
            setMyBicycles(allBikes.filter((b) => !postedBicycleIds.has(b.bicycleId ?? b.id)));
        } catch {
            // Non-critical; silently ignore
        }
    }, []);

    useEffect(() => {
        refreshMyBicycles();
    }, [refreshMyBicycles]);

    // Attach thumbnail URLs to a list of posts
    const attachThumbnailUrls = async (list) => {
        return Promise.all(
            list.map(async (post) => {
                try {
                    const thumbnailResponse = await getThumbnail(post.postId);
                    const thumbnailUrl =
                        thumbnailResponse?.data?.imageUrl ||
                        thumbnailResponse?.imageUrl ||
                        null;
                    if (thumbnailUrl) return { ...post, thumbnailUrl };
                } catch { /* fall through */ }

                try {
                    const imagesResponse = await getPostImages(post.postId);
                    const images = imagesResponse?.data || [];
                    return { ...post, thumbnailUrl: images[0]?.imageUrl || null };
                } catch {
                    return { ...post, thumbnailUrl: null };
                }
            })
        );
    };

    /**
     * fetchPosts — always receives explicit sort/category args to avoid stale closures.
     *
     * Bugs that were fixed:
     *  1. sortBy was captured from closure at useCallback init time → stale value on sort change.
     *  2. category was the 3rd argument but the old signature only had (page, query) → silently dropped.
     */
    const fetchPosts = useCallback(
        async (page = 0, query = '', sort = 'newest', inspected = 'all') => {
            setIsLoading(true);
            try {
                let data;
                // If filtering by inspection, fetch a larger set so client-side pagination works better
                // Using 1000 to grab a large pool of items for client processing
                const fetchSize = (inspected !== 'all') ? 1000 : PAGE_SIZE;
                const fetchPage = (inspected !== 'all') ? 0 : page;

                if (query.trim()) {
                    data = await searchPosts(query.trim(), fetchPage, fetchSize);
                } else {
                    data = await getAllPosts(fetchPage, fetchSize);
                }

                const raw = Array.isArray(data) ? data : (data.posts || data.content || []);
                const totalFromApi = Array.isArray(data)
                    ? data.length
                    : (data.totalItems ?? data.totalElements ?? raw.length);

                // Client-side inspected filter
                const filtered = (inspected === 'all')
                    ? raw
                    : raw.filter((p) =>
                        inspected === 'inspected' ? p.isInspected === true : p.isInspected !== true
                    );

                // Client-side sort
                const sorted = [...filtered];
                if (sort === 'price_asc') {
                    sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                } else if (sort === 'price_desc') {
                    sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                } else {
                    sorted.sort(
                        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
                }

                // Push SOLD items to the end
                const active = sorted.filter((p) => p.status !== 'SOLD');
                const sold = sorted.filter((p) => p.status === 'SOLD');
                const finalList = [...active, ...sold];

                // Client-side pagination if filter is active
                let paginatedList = finalList;
                if (inspected !== 'all') {
                    const startIndex = page * PAGE_SIZE;
                    paginatedList = finalList.slice(startIndex, startIndex + PAGE_SIZE);
                    setTotalElements(finalList.length);
                } else {
                    setTotalElements(totalFromApi);
                }

                const withThumbnails = await attachThumbnailUrls(paginatedList);
                setPosts(withThumbnails);
            } catch {
                message.error('Failed to load listings. Please try again.');
            } finally {
                setIsLoading(false);
            }
        },
        [] // No deps — always called with explicit args, no stale-closure risk
    );

    // Reload whenever page, sort, or status changes
    useEffect(() => {
        fetchPosts(currentPage, searchQuery, sortBy, inspectedStatus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy, inspectedStatus]);

    const handleSearch = () => {
        setCurrentPage(0);
        fetchPosts(0, searchQuery, sortBy, inspectedStatus);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setCurrentPage(0);
        // useEffect triggers fetchPosts
    };

    const handleInspectedChange = (value) => {
        setInspectedStatus(value);
        setCurrentPage(0);
        // useEffect triggers fetchPosts
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
        fetchPosts(0, searchQuery, sortBy, inspectedStatus);
        refreshMyBicycles();
    };

    return (
        <MarketplacePage
            posts={posts}
            totalElements={totalElements}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            isLoading={isLoading}
            searchQuery={searchQuery}
            sortBy={sortBy}
            inspectedStatus={inspectedStatus}
            onSearch={handleSearch}
            onSearchChange={setSearchQuery}
            onSortChange={handleSortChange}
            onInspectedChange={handleInspectedChange}
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
