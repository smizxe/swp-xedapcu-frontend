import api from './api';

// MOCK DATA - Used when backend is not ready
const MOCK_POSTS = [
    {
        postId: 1,
        title: "Giant TCR Advanced Pro 2024",
        price: 45000000,
        description: "Xe đạp đua chuyên nghiệp, khung carbon siêu nhẹ, group Ultegra R8000. Mới chạy 500km.",
        status: "APPROVED",
        isInspected: true,
        bicycle: {
            brand: "Giant",
            frameMaterial: "Carbon",
            frameSize: "M",
            wheelSize: "700c",
            conditionPercent: 95,
            category: { name: "Road Bike" }
        },
        seller: {
            fullName: "Nguyễn Văn A",
            ratingScore: 4.8
        },
        images: ["https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80"]
    },
    {
        postId: 2,
        title: "Trek Marlin 8 Gen 3",
        price: 18500000,
        description: "Xe địa hình MTB, phuộc hơi RockShox, 1x12 Deore. Còn bảo hành chính hãng.",
        status: "APPROVED",
        isInspected: false,
        bicycle: {
            brand: "Trek",
            frameMaterial: "Aluminum",
            frameSize: "L",
            wheelSize: "29 inch",
            conditionPercent: 90,
            category: { name: "Mountain Bike" }
        },
        seller: {
            fullName: "Trần Thị B",
            ratingScore: 5.0
        },
        images: ["https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800&q=80"]
    },
    {
        postId: 3,
        title: "Specialized Allez Sprint",
        price: 32000000,
        description: "Nữ hoàng khung nhôm, bản limited artist. Đã độ bánh carbon.",
        status: "APPROVED",
        isInspected: true,
        bicycle: {
            brand: "Specialized",
            frameMaterial: "Aluminum",
            frameSize: "52",
            wheelSize: "700c",
            conditionPercent: 98,
            category: { name: "Road Bike" }
        },
        seller: {
            fullName: "Le Cycling",
            ratingScore: 4.5
        },
        images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"]
    },
    {
        postId: 4,
        title: "Pinarello Dogma F12 Clone",
        price: 15000000,
        description: "Xe dựng giống 99%, group 105 R7000. Phù hợp anh em trải nghiệm.",
        status: "APPROVED",
        isInspected: false,
        bicycle: {
            brand: "Pinarello",
            frameMaterial: "Carbon",
            frameSize: "54",
            wheelSize: "700c",
            conditionPercent: 85,
            category: { name: "Road Bike" }
        },
        seller: {
            fullName: "Shop Xe Cũ HN",
            ratingScore: 4.2
        },
        images: ["https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80"]
    }
];

const postService = {
    // Get all posts with filters
    getAllPosts: async (params) => {
        try {
            // TODO: Uncomment when backend API is ready
            // const response = await api.get('/posts', { params });
            // return response.data;

            // Simulate API delay
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        posts: MOCK_POSTS,
                        total: MOCK_POSTS.length,
                        page: 1,
                        limit: 10
                    });
                }, 800);
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    },

    // Get post details
    getPostById: async (id) => {
        try {
            // return await api.get(`/posts/${id}`);
            const post = MOCK_POSTS.find(p => p.postId === parseInt(id));
            if (!post) throw new Error("Not Found");
            return { data: post };
        } catch (error) {
            throw error;
        }
    }
};

export default postService;
