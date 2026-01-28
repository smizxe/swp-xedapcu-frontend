import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/Login/LoginPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import Marketplace from './pages/Marketplace/Marketplace.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Marketplace />} />
      </Routes>
    </Router>
  )
}

export default App
