import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <HomePage />
      </main>
      <Footer />
    </div>
  )
}

export default App
