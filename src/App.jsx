import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/Login/LoginPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import RegisterPage from './pages/Auth/Register/RegisterPage.jsx';
import HelpPage from './pages/HelpPage/HelpPage.jsx';
import AboutUsPage from './pages/AboutUsPage/AboutUsPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutUsPage />} />
      </Routes>
    </Router>
  )
}

export default App
