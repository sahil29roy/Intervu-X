import React, { useState, useEffect } from 'react'
import AuthPage from './components/AuthPage'
import ProfilePage from './components/ProfilePage'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("intervux_user")
    const storedToken = localStorage.getItem("intervux_token")
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("intervux_user")
        localStorage.removeItem("intervux_token")
      }
    }
    setIsInitializing(false)
  }, [])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("intervux_user")
    localStorage.removeItem("intervux_token")
    setUser(null)
  }

  if (isInitializing) {
    return (
      <div className="auth-page-container">
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <ProfilePage onLogout={handleLogout} />
  )
}

export default App
