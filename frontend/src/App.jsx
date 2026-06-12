import React, { useState, useEffect } from 'react'
import AuthPage from './components/AuthPage'
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
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2 className="dashboard-title">Welcome to Intervux</h2>
        <p className="dashboard-welcome">You have successfully logged into the platform.</p>
        
        <div className="dashboard-info-section">
          <div className="info-row">
            <span className="info-label">Full Name</span>
            <span className="info-value">{user.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email Address</span>
            <span className="info-value">{user.email}</span>
          </div>
          {user.phone && (
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{user.phone}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Account Role</span>
            <span className="info-value">
              <span className="role-badge">{user.role}</span>
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="ui-button ui-button-outline"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default App
