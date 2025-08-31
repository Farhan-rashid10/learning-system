import { useState } from "react"

export function useAuth() {
  const [auth, setAuthState] = useState(() => {
    const stored = localStorage.getItem("lms-auth")
    return stored ? JSON.parse(stored) : null
  })

  const setAuth = (data) => {
    setAuthState(data)
    localStorage.setItem("lms-auth", JSON.stringify(data))
  }

  const logout = () => {
    setAuthState(null)
    localStorage.removeItem("lms-auth")
  }

  return { auth, setAuth, logout }
}
