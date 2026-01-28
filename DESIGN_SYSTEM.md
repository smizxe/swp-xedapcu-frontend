
### ✅ New Components
- **BikeCard**: Glassmorphism style, displays bike info, price, verified badge.
- **Marketplace**: Main page with Hero section, Filters, and Grid layout.

### 🔌 API Integration
Since backend is missing `PostController`, created `src/services/postService.js` with **MOCK DATA**:
```javascript
const MOCK_POSTS = [
    { title: "Giant TCR Advanced Pro 2024", price: 45000000, ... },
    { title: "Trek Marlin 8 Gen 3", price: 18500000, ... }
];
```
Once backend is ready, just uncomment the API call in `postService.js`.

### 🎨 Design Updates
- Added `Marketplace` to routing (`/home`).
- Used MUI + Custom Styled Components for consistent look.
