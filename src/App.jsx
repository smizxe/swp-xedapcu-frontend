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
      </Routes>
    </Router>
  )
}

export default App
