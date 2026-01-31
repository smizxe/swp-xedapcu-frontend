import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Auth/Login/LoginPage.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';
import RegisterPage from './pages/Auth/Register/RegisterPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  )
}

export default App
