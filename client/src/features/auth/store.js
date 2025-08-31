// tiny global store without Redux
import { useEffect, useState } from 'react'

let listeners = []
let state = (() => {
  try { return JSON.parse(localStorage.getItem('lms-auth')) || null }
  catch { return null }
})()

function setAuth(payload) {
  // payload must include { access_token, user, ... }
  state = payload
  localStorage.setItem('lms-auth', JSON.stringify(payload))
  listeners.forEach(l => l(state))
}

function logout() {
  state = null
  localStorage.removeItem('lms-auth')
  listeners.forEach(l => l(state))
}

export function useAuth() {
  const [auth, set] = useState(state)
  useEffect(() => {
    const l = s => set(s)
    listeners.push(l)
    return () => { listeners = listeners.filter(x => x !== l) }
  }, [])
  return {
    user: auth?.user || null,
    token: auth?.access_token || null,
    setAuth,
    logout,
  }
}
