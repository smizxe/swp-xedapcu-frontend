import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginContainer from './pages/Auth/Login/LoginContainer.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import RegisterPageContainer from './pages/Auth/Register/RegisterPageContainer.jsx';
import HelpPage from './pages/HelpPage/HelpPage.jsx';
import AboutUsPage from './pages/AboutUsPage/AboutUsPage.jsx';
import ProfilePage from './pages/Profiles/ProfilePage.jsx';
import WalletPageContainer from './pages/Wallet/WalletPageContainer.jsx';
import MarketplaceContainer from './pages/Marketplace/MarketplacePage/MarketplaceContainer.jsx';
import PostDetailPage from './pages/Marketplace/PostDetail/PostDetailPage.jsx';
import BicyclePage from './pages/Bicycle/BicyclePage.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import CategoryManagement from './pages/Admin/CategoryManagement.jsx';
import SellerDashboard from './pages/Seller/SellerDashboard.jsx';
import SellBike from './pages/SellBike/SellBike.jsx';
import MyOrdersPage from './pages/Orders/MyOrdersPage.jsx';
import MySalesPage from './pages/Orders/MySalesPage.jsx';
import OrderDetailPage from './pages/Orders/OrderDetailPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginContainer />} />
        <Route path="/register" element={<RegisterPageContainer />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/wallet" element={<WalletPageContainer />} />
        <Route path="/marketplace" element={<MarketplaceContainer />} />
        <Route path="/marketplace/:postId" element={<PostDetailPage />} />
        <Route path="/:userId/bicycles" element={<BicyclePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/sell" element={<SellBike />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/my-sales" element={<MySalesPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
      </Routes>
    </Router>
  )
}

export default App
