// src/layouts/AdminLayout.jsx
import { useEffect, useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    try { setMe(JSON.parse(localStorage.getItem('user') || 'null')) } catch {}
  }, [])

  const role = (me?.role || localStorage.getItem('role') || 'user').toLowerCase()
  const displayName = (me?.name?.split(' ')[0]) || role.charAt(0).toUpperCase() + role.slice(1)
  const initials = (me?.name || me?.email || displayName)
    .split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  function logout() {
    localStorage.clear()
    nav('/login')
  }

  const linkBase = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition'
  const linkActive = 'bg-blue-50 text-blue-700'
  const linkIdle = 'text-gray-700 hover:bg-gray-50'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 z-40 w-64 transform bg-white p-4 shadow-lg ring-1 ring-gray-200 transition-transform md:static md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="mb-6 flex items-center gap-2 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white"><path d="M8 5v14l11-7-11-7z" /></svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">GAU-GradeView</span>
          </div>

          <nav className="space-y-1">
            <NavLink to="/admin/users" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>
              Users
            </NavLink>
            <NavLink to="/admin/students" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>
              Students
            </NavLink>
            <NavLink to="/admin/instructors" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>
              Instructors
            </NavLink>
             <NavLink to="/admin/courses" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>
              courses
            </NavLink>
            {/* optional: profile */}
            <NavLink to="/admin/profile" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>
              Profile
            </NavLink>
          </nav>

          <div className="mt-6 border-t pt-4">
            <button
              onClick={logout}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-h-screen w-full flex-col md:ml-64">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">
                {initials}
              </div>
              <div>
                <div className="text-sm text-gray-500">Welcome</div>
                <div className="text-base font-semibold text-gray-900">{displayName}</div>
              </div>
            </div>
            <button
              className="rounded-lg border px-3 py-2 text-sm font-medium md:hidden"
              onClick={() => setOpen(v => !v)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
          </header>

          <main className="p-6">
            <Outlet /> {/* your AdminUsers/AdminStudents/AdminInstructors render here */}
          </main>
        </div>
      </div>
    </div>
  )
}
