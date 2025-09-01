// import { useEffect, useState } from 'react'
// import api from '../lib/api'

// export default function AdminInstructors() {
//   const [rows, setRows] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   async function load() {
//     try {
//       setLoading(true)
//       const { data } = await api.get('/admin/users')
//       setRows((Array.isArray(data) ? data : []).filter(u => u.role === 'instructor'))
//       setError('')
//     } catch (err) {
//       setRows([])
//       setError(err?.response?.data?.msg || 'Failed to load instructors')
//     } finally {
//       setLoading(false)
//     }
//   }
//   useEffect(() => { load() }, [])

//   async function handleDelete(id, name) {
//     if (!window.confirm(`Delete instructor "${name}"? This cannot be undone.`)) return
//     try {
//       await api.delete(`/admin/users/${id}`) // requires backend DELETE
//       setRows(prev => prev.filter(r => r.id !== id))
//     } catch (err) {
//       setError(err?.response?.data?.msg || 'Error deleting instructor')
//     }
//   }

//   const badge = 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700'

//   return (
//     <div className="max-w-6xl">
//       <h2 className="mb-6 text-2xl font-bold text-gray-900">Admin · Instructors</h2>

//       {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

//       <div className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-200">
//         <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-3">
//           <div className="text-sm font-semibold text-gray-900">Instructors</div>
//           <button onClick={load} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Refresh</button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {loading ? (
//                 <tr><td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>Loading…</td></tr>
//               ) : rows.length === 0 ? (
//                 <tr><td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>No instructors found.</td></tr>
//               ) : (
//                 rows.map(u => (
//                   <tr key={u.id}>
//                     <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
//                     <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
//                     <td className="px-6 py-4"><span className={badge}>{u.role}</span></td>
//                     <td className="px-6 py-4 text-right">
//                       <button onClick={() => handleDelete(u.id, u.name)} className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1V5a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 001 1m-10 0h10" /></svg>
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }




// src/pages/AdminInstructors.jsx
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminInstructors() {
  return (
    <PageShell>
      <InstructorsContent />
    </PageShell>
  )
}

/* inline layout (same as other files) */
function PageShell({ children }) {
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState(null)
  const nav = useNavigate()
  useEffect(() => { try { setMe(JSON.parse(localStorage.getItem('user') || 'null')) } catch {} }, [])
  const role = (me?.role || localStorage.getItem('role') || 'user').toLowerCase()
  const displayName = (me?.name?.split(' ')[0]) || role.charAt(0).toUpperCase() + role.slice(1)
  const initials = (me?.name || me?.email || displayName).split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  function logout(){ localStorage.clear(); nav('/login') }
  const linkBase='flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition'
  const linkActive='bg-blue-50 text-blue-700'
  const linkIdle='text-gray-700 hover:bg-gray-50'
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className={`fixed inset-y-0 z-40 w-64 transform bg-white p-4 shadow-lg ring-1 ring-gray-200 transition-transform md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="mb-6 flex items-center gap-2 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white"><path d="M8 5v14l11-7-11-7z" /></svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">GAU-GradeView</span>
          </div>
          <nav className="space-y-1">
            <NavLink to="/admin/users" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>Users</NavLink>
            <NavLink to="/admin/students" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>Students</NavLink>
            <NavLink to="/admin/instructors" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>Instructors</NavLink>
            <NavLink to="/admin/courses" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`} onClick={()=>setOpen(false)}>Courses</NavLink>

          </nav>
          <div className="mt-6 border-t pt-4">
            <button onClick={logout} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50">Logout</button>
          </div>
        </aside>
        <div className="flex min-h-screen w-full flex-col md:ml-64">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">{initials}</div>
              <div>
                <div className="text-sm text-gray-500">Welcome</div>
                <div className="text-base font-semibold text-gray-900">{displayName}</div>
              </div>
            </div>
            <button className="rounded-lg border px-3 py-2 text-sm font-medium md:hidden" onClick={()=>setOpen(v=>!v)}>{open?'Close':'Menu'}</button>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

/* instructors content (filters role=instructor) */
function InstructorsContent() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/users') // get all
      setRows((Array.isArray(data) ? data : []).filter(u => u.role === 'instructor'))
      setError('')
    } catch (err) {
      setRows([])
      setError(err?.response?.data?.msg || 'Failed to load instructors')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete instructor "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/users/${id}`) // requires DELETE endpoint
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err?.response?.data?.msg || 'Error deleting instructor')
    }
  }

  return (
    <div className="max-w-6xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Admin · Instructors</h2>

      {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-3">
          <div className="text-sm font-semibold text-gray-900">Instructors</div>
          <button onClick={load} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Refresh</button>
        </div>
        <Table rows={rows} onDelete={handleDelete} badgeClass="bg-blue-100 text-blue-700" />
      </div>
    </div>
  )
}

function Table({ rows, onDelete, badgeClass }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length === 0 ? (
            <tr><td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>No records found.</td></tr>
          ) : rows.map(u => (
            <tr key={u.id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
              <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>{u.role}</span></td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(u.id, u.name)} className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1V5a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 001 1m-10 0h10"/></svg>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
