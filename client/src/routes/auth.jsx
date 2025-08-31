import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { useAuth } from '../features/auth/store'
import { useState } from 'react'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['student', 'instructor']).default('student'),
})

export default function Auth() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
  )
}

function Login() {
  const nav = useNavigate()
  const { setAuth } = useAuth()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const res = await api.post('/auth/login', data)
      setAuth(res)
      nav('/dashboard') // role-based redirect happens there
    } catch (e) {
      setServerError(e.message || 'Invalid credentials')
    }
  }

  return (
    <div className="max-w-md mx-auto card space-y-3" role="region" aria-label="Login form">
      <h2 className="text-xl font-semibold">Login</h2>
      {serverError && <p className="text-red-600" role="alert">{serverError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            className="input"
            placeholder="Email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email || undefined}
            {...register('email')}
          />
        </label>
        {errors.email && <p className="text-red-600" role="alert">{errors.email.message}</p>}

        <label className="block">
          <span className="sr-only">Password</span>
          <input
            className="input"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password || undefined}
            {...register('password')}
          />
        </label>
        {errors.password && <p className="text-red-600" role="alert">{errors.password.message}</p>}

        <button className="btn w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="text-sm">
        No account? <Link className="underline" to="/auth/register">Register</Link>
      </p>
    </div>
  )
}

function Register() {
  const nav = useNavigate()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), mode: 'onBlur' })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      await api.post('/auth/register', data)
      nav('/auth/login')
    } catch (e) {
      setServerError(e.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto card space-y-3" role="region" aria-label="Register form">
      <h2 className="text-xl font-semibold">Create account</h2>
      {serverError && <p className="text-red-600" role="alert">{serverError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        <label className="block">
          <span className="sr-only">Full name</span>
          <input
            className="input"
            placeholder="Full name"
            aria-invalid={!!errors.name || undefined}
            {...register('name')}
          />
        </label>
        {errors.name && <p className="text-red-600" role="alert">{errors.name.message}</p>}

        <label className="block">
          <span className="sr-only">Email</span>
          <input
            className="input"
            placeholder="Email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email || undefined}
            {...register('email')}
          />
        </label>
        {errors.email && <p className="text-red-600" role="alert">{errors.email.message}</p>}

        <label className="block">
          <span className="sr-only">Password</span>
          <input
            className="input"
            placeholder="Password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password || undefined}
            {...register('password')}
          />
        </label>
        {errors.password && <p className="text-red-600" role="alert">{errors.password.message}</p>}

        <label className="block">
          <span className="sr-only">Role</span>
          <select className="input" {...register('role')}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </label>

        <button className="btn w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Register'}
        </button>
      </form>
      <p className="text-sm">
        Already have an account? <Link className="underline" to="/auth/login">Login</Link>
      </p>
    </div>
  )
}
