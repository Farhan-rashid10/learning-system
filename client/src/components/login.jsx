// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import api from '../lib/api'

// export default function Login() {
// const [email, setEmail] = useState('')
// const [password, setPassword] = useState('')
// const [error, setError] = useState('')
// const nav = useNavigate()


// async function onSubmit(e) {
// e.preventDefault()
// setError('')
// try {
// const { data } = await api.post('/auth/login', { email, password })
// localStorage.setItem('token', data.access_token)
// localStorage.setItem('role', data.user.role)
// api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
// if (data.user.role === 'admin') nav('/admin/users')
// else if (data.user.role === 'instructor') nav('/instructor/courses')
// else nav('/student/courses')
// } catch (err) {
// setError(err.response?.data?.msg || 'Login failed')
// }
// }


// return (
// <div style={{ maxWidth: 360, margin: '80px auto' }}>
// <h2>Login</h2>
// <form onSubmit={onSubmit}>
// <div>
// <label>Email</label>
// <input value={email} onChange={e=>setEmail(e.target.value)} />
// </div>
// <div>
// <label>Password</label>
// <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
// </div>
// <button type="submit">Sign in</button>
// </form>
// {error && <p style={{ color: 'red' }}>{error}</p>}
// </div>
// )
// }



// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('role', data.user.role)
      localStorage.setItem('user', JSON.stringify(data.user))
      api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`
      if (data.user.role === 'admin') nav('/admin/users')
      else if (data.user.role === 'instructor') nav('/instructor/courses')
      else nav('/student/courses')
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed')
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      {/* Brand header */}
      <a href="/" className="mb-8 flex items-center gap-2 text-2xl font-semibold text-gray-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" aria-hidden="true">
            <path d="M8 5v14l11-7-11-7z" />
          </svg>
        </span>
        <span>GAU-GradeView</span>
      </a>

      {/* Card */}
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md ring-1 ring-gray-200">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in to your account</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
              Your email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              Remember me
            </label>

            <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Sign in
          </button>

          <p className="text-sm text-gray-500">
            Don’t have an account yet?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </section>
  )
}
