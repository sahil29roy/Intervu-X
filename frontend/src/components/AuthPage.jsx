import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select"

export default function AuthPage({ onAuthSuccess }) {
  // Active Tab: "login" or "register"
  const [activeTab, setActiveTab] = useState("login")

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "candidate",
  })

  // Loading & general status states
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  // Handle Input Changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setGeneralError("")
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
    setGeneralError("")
  }

  const handleRoleChange = (value) => {
    setRegisterData((prev) => ({ ...prev, role: value }))
    setGeneralError("")
  }

  // Validate Forms
  const validateLogin = () => {
    const errors = {}
    if (!loginData.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      errors.email = "Invalid email format"
    }
    if (!loginData.password) {
      errors.password = "Password is required"
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegister = () => {
    const errors = {}
    if (!registerData.name.trim()) {
      errors.name = "Name is required"
    }
    if (!registerData.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      errors.email = "Invalid email format"
    }
    if (!registerData.password) {
      errors.password = "Password is required"
    } else if (registerData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long"
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setGeneralError("")
    if (!validateLogin()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Backend validation errors check
        if (data.errors) {
          setFieldErrors(data.errors)
        } else {
          setGeneralError(data.message || "Failed to log in")
        }
      } else {
        // Successful login
        localStorage.setItem("intervux_token", data.token)
        localStorage.setItem("intervux_user", JSON.stringify(data.user))
        if (onAuthSuccess) onAuthSuccess(data.user)
      }
    } catch (err) {
      setGeneralError("Cannot connect to server. Make sure backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  // Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setGeneralError("")
    if (!validateRegister()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors)
        } else {
          setGeneralError(data.message || "Registration failed")
        }
      } else {
        // Successful registration
        localStorage.setItem("intervux_token", data.token)
        localStorage.setItem("intervux_user", JSON.stringify(data.user))
        if (onAuthSuccess) onAuthSuccess(data.user)
      }
    } catch (err) {
      setGeneralError("Cannot connect to server. Make sure backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (val) => {
    setActiveTab(val)
    setFieldErrors({})
    setGeneralError("")
  }

  return (
    <div className="auth-page-container">
      <Card>
        <CardHeader>
          <CardTitle>Intervux</CardTitle>
          <CardDescription>
            {activeTab === "login"
              ? "Sign in to access your coding assessments."
              : "Create an account to get started."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {generalError && (
            <div className="form-alert form-alert-error">
              <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.49997 0.833313C3.81807 0.833313 0.833302 3.81807 0.833302 7.49997C0.833302 11.1819 3.81807 14.1666 7.49997 14.1666C11.1819 14.1666 14.1666 11.1819 14.1666 7.49997C14.1666 3.81807 11.1819 0.833313 7.49997 0.833313ZM7.49997 4.16665C7.9602 4.16665 8.3333 4.53974 8.3333 4.99998V8.33331C8.3333 8.79355 7.9602 9.16665 7.49997 9.16665C7.03973 9.16665 6.66663 8.79355 6.66663 8.33331V4.99998C6.66663 4.53974 7.03973 4.16665 7.49997 4.16665ZM7.49997 10C7.9602 10 8.3333 10.3731 8.3333 10.8333C8.3333 11.2936 7.9602 11.6666 7.49997 11.6666C7.03973 11.6666 6.66663 11.2936 6.66663 10.8333C6.66663 10.3731 7.03973 10 7.49997 10Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.email && (
                    <span className="error-message">{fieldErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Label htmlFor="login-password">Password</Label>
                    <span
                      className="auth-link"
                      onClick={() => setGeneralError("Password reset is not configured in this demo.")}
                    >
                      Forgot password?
                    </span>
                  </div>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.password && (
                    <span className="error-message">{fieldErrors.password}</span>
                  )}
                </div>

                <Button variant="default" type="submit" disabled={isLoading}>
                  {isLoading && <div className="spinner"></div>}
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.name && (
                    <span className="error-message">{fieldErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.email && (
                    <span className="error-message">{fieldErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.password && (
                    <span className="error-message">{fieldErrors.password}</span>
                  )}
                </div>

                <div className="form-group">
                  <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                  <Input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.phone && (
                    <span className="error-message">{fieldErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <Label>Register as</Label>
                  <Select
                    defaultValue="candidate"
                    value={registerData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger id="register-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">Candidate</SelectItem>
                      <SelectItem value="interviewer">Interviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="default" type="submit" disabled={isLoading}>
                  {isLoading && <div className="spinner"></div>}
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter>
          {activeTab === "login" ? (
            <span className="auth-footer-text">
              Don't have an account?{" "}
              <span className="auth-link" onClick={() => handleTabChange("register")}>
                Sign up
              </span>
            </span>
          ) : (
            <span className="auth-footer-text">
              Already have an account?{" "}
              <span className="auth-link" onClick={() => handleTabChange("login")}>
                Sign in
              </span>
            </span>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
