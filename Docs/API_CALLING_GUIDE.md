# 📚 HƯỚNG DẪN GỌI API

> **Dự án:** EkibDlo - Bicycle Marketplace  
> **Ngày:** 03/02/2026

---

## 🎯 CÁCH GỌI API - 3 BƯỚC ĐON GIẢN

### **BƯỚC 1: Thêm endpoint vào `apiConfig.jsx`**

```javascript
// File: src/config/apiConfig.jsx

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',  // ← Thêm endpoint mới ở đây
  },
}
```

---

### **BƯỚC 2: Tạo function trong service file**

```javascript
// File: src/service/authService.js

import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/apiConfig';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Hàm gọi API mới
export const registerUser = async (userData) => {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'API call failed');
    }
};
```

---

### **BƯỚC 3: Sử dụng trong React Component**

```javascript
// File: src/pages/Auth/Register/RegisterContainer.jsx

import { useState } from 'react';
import { registerUser } from '../../../service/authService';

function RegisterContainer() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        
        try {
            const response = await registerUser(formData);
            console.log('Success:', response);
            // Xử lý khi thành công
            
        } catch (error) {
            console.error('Error:', error);
            // Xử lý khi có lỗi
            
        } finally {
            setIsLoading(false);
        }
    };

    return <RegisterPage onSubmit={handleSubmit} />;
}
```

---

## 📝 VÍ DỤ CÁC LOẠI API

### **POST Request (Gửi dữ liệu)**
```javascript
export const createProduct = async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
};
```

### **GET Request (Lấy dữ liệu)**
```javascript
export const getAllProducts = async () => {
    const response = await api.get('/api/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
};
```

### **PUT Request (Cập nhật)**
```javascript
export const updateProduct = async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
};
```

### **DELETE Request (Xóa)**
```javascript
export const deleteProduct = async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
};
```

---

## 💾 LƯU DỮ LIỆU VỚI LOCALSTORAGE

```javascript
// Lưu
localStorage.setItem('authToken', token);

// Đọc
const token = localStorage.getItem('authToken');

// Xóa
localStorage.removeItem('authToken');

// Kiểm tra
const isLoggedIn = !!localStorage.getItem('authToken');
```

---

## 🔧 THÊM TOKEN VÀO API (Tùy chọn)

```javascript
// Tự động thêm token vào mọi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

---

## ✅ CHECKLIST KHI THÊM API MỚI

- [ ] Thêm endpoint vào `apiConfig.jsx`
- [ ] Tạo function trong service file
- [ ] Sử dụng trong component với try/catch
- [ ] Thêm loading state
- [ ] Test với backend

---

## 🚀 TÓM TẮT

```
apiConfig.jsx → authService.js → Component
   (Endpoint)      (API Call)      (Use API)
```

**Luôn nhớ:**
1. Endpoint trong `apiConfig.jsx`
2. Function trong service file
3. Try/catch khi gọi API
4. Loading state cho UX tốt

---

📞 **Backend URL:** `http://localhost:8080`  
📅 **Cập nhật:** 03/02/2026
