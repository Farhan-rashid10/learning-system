
// // // src/pages/AdminUsers.jsx
// import { useEffect, useMemo, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import api from '../lib/api'
// import AdminLayout from './AdminLayout'

// export default function AdminUsers() {
//   const { scope = 'users' } = useParams()

//   const view = useMemo(() => {
//     if (scope === 'students')    return { title: 'Students',     role: 'student',    showForm: false, isProfile: false }
//     if (scope === 'instructors') return { title: 'Instructors',  role: 'instructor', showForm: false, isProfile: false }
//     if (scope === 'admins')      return { title: 'Admins',       role: 'admin',      showForm: false, isProfile: false }
//     if (scope === 'profile')     return { title: 'My Profile',   role: null,         showForm: false, isProfile: true  }
//     return                          { title: 'Users',            role: null,         showForm: true,  isProfile: false }
//   }, [scope])

//   // table state
//   const [rows, setRows] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   // create form (users view only)
//   const [form, setForm] = useState({ name: '', email: '', password: '', role: 'instructor' })

//   // profile state
//   const [me, setMe] = useState(() => {
//     try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
//   })
//   const [meError, setMeError] = useState('')

//   // load table (skip when profile view)
//   async function loadTable() {
//     try {
//       setLoading(true)
//       const base = '/admin/users'
//       const url  = view.role ? `${base}?role=${encodeURIComponent(view.role)}` : base
//       const { data } = await api.get(url)
//       setRows(Array.isArray(data) ? data : [])
//       setError('')
//     } catch (err) {
//       setRows([])
//       setError(err?.response?.data?.msg || 'Failed to load users')
//     } finally {
//       setLoading(false)
//     }
//   }
//   useEffect(() => {
//     if (!view.isProfile) loadTable()
//   }, [view.role, view.isProfile])

//   // load profile (try API, fall back to localStorage info)
//   useEffect(() => {
//     if (!view.isProfile) return
//     ;(async () => {
//       try {
//         // try common endpoints; ignore if your API doesn’t have them
//         const { data } = await api.get('/auth/me').catch(async () => {
//           return await api.get('/users/me')
//         })
//         if (data) {
//           setMe(data)
//           localStorage.setItem('user', JSON.stringify(data))
//         }
//       } catch (e) {
//         // no /me endpoint -> rely on localStorage user
//         if (!me) setMeError('Could not fetch profile; please re-login.')
//       }
//     })()
//   }, [view.isProfile])

//   async function create(e) {
//     e.preventDefault()
//     setError('')
//     try {
//       await api.post('/admin/users', form)
//       setForm({ name: '', email: '', password: '', role: 'instructor' })
//       await loadTable()
//     } catch (err) {
//       setError(err?.response?.data?.msg || 'Error creating user')
//     }
//   }

//   async function handleDelete(id, name) {
//     if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
//     try {
//       await api.delete(`/admin/users/${id}`)
//       setRows(prev => prev.filter(r => r.id !== id))
//     } catch (err) {
//       setError(err?.response?.data?.msg || 'Error deleting user')
//     }
//   }

//   // small helpers
//   const initials = (me?.name || me?.email || 'U')
//     .split(' ')
//     .map(w => w[0])
//     .join('')
//     .slice(0,2)
//     .toUpperCase()

//   return (
//     <AdminLayout>
//       <h2 className="mb-6 text-2xl font-bold text-gray-900">Admin · {view.title}</h2>

//       {/* PROFILE VIEW */}
//       {view.isProfile ? (
//         <div className="max-w-3xl">
//           {meError && (
//             <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {meError}
//             </div>
//           )}
//           <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-gray-200">
//             <div className="flex items-center gap-4">
//               <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
//                 {initials}
//               </div>
//               <div>
//                 <div className="text-lg font-semibold text-gray-900">{me?.name || '—'}</div>
//                 <div className="text-sm text-gray-600">{me?.email || '—'}</div>
//                 <span className={
//                   'mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
//                   (me?.role === 'admin'
//                     ? 'bg-purple-100 text-purple-700'
//                     : me?.role === 'instructor'
//                     ? 'bg-blue-100 text-blue-700'
//                     : 'bg-emerald-100 text-emerald-700')
//                 }>
//                   {me?.role || 'user'}
//                 </span>
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div className="rounded-lg border border-gray-200 p-4">
//                 <div className="text-xs font-semibold uppercase text-gray-500">User ID</div>
//                 <div className="mt-1 text-sm text-gray-900">{me?.id || me?._id || '—'}</div>
//               </div>
//               <div className="rounded-lg border border-gray-200 p-4">
//                 <div className="text-xs font-semibold uppercase text-gray-500">Joined</div>
//                 <div className="mt-1 text-sm text-gray-900">{me?.created_at || me?.createdAt || '—'}</div>
//               </div>
//             </div>

//             <div className="mt-6 flex flex-wrap gap-3">
//               <a href="/admin/profile" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Refresh</a>
//               <a href="/change-password" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Change password</a>
//               <a href="/logout" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-black"
//                  onClick={(e)=>{ e.preventDefault(); localStorage.clear(); window.location.href='/login' }}
//               >
//                 Logout
//               </a>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <>
//           {error && (
//             <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {error}
//             </div>
//           )}

//           {/* Create form only on /admin/users */}
//           {view.showForm && (
//             <div className="mb-8 rounded-xl bg-white p-6 shadow ring-1 ring-gray-200">
//               <h3 className="mb-4 text-lg font-semibold text-gray-900">Create new user</h3>
//               <form onSubmit={create} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
//                 <div className="sm:col-span-1 lg:col-span-2">
//                   <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
//                   <input
//                     placeholder="Full name"
//                     value={form.name}
//                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                     className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                     required
//                   />
//                 </div>
//                 <div className="sm:col-span-1 lg:col-span-2">
//                   <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
//                   <input
//                     type="email"
//                     placeholder="name@company.com"
//                     value={form.email}
//                     onChange={(e) => setForm({ ...form, email: e.target.value })}
//                     className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
//                   <input
//                     type="password"
//                     placeholder="••••••••"
//                     value={form.password}
//                     onChange={(e) => setForm({ ...form, password: e.target.value })}
//                     className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
//                   <select
//                     value={form.role}
//                     onChange={(e) => setForm({ ...form, role: e.target.value })}
//                     className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   >
//                     <option value="instructor">Instructor</option>
//                     <option value="student">Student</option>
//                     <option value="admin">Admin</option>
//                   </select>
//                 </div>
//                 <div className="sm:col-span-2 lg:col-span-1 flex items-end">
//                   <button type="submit" className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300">
//                     Create
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {/* Table */}
//           <div className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-200">
//             <div className="border-b bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-900">{view.title}</div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
//                     <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Role</th>
//                     <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 bg-white">
//                   {loading ? (
//                     <tr><td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>Loading…</td></tr>
//                   ) : rows.length === 0 ? (
//                     <tr><td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>No records found.</td></tr>
//                   ) : (
//                     rows.map(u => (
//                       <tr key={u.id}>
//                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
//                         <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
//                         <td className="px-6 py-4">
//                           <span className={
//                             'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
//                             (u.role === 'admin'
//                               ? 'bg-purple-100 text-purple-700'
//                               : u.role === 'instructor'
//                               ? 'bg-blue-100 text-blue-700'
//                               : 'bg-emerald-100 text-emerald-700')
//                           }>
//                             {u.role}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-right">
//                           <button
//                             onClick={() => handleDelete(u.id, u.name)}
//                             className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1V5a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 001 1m-10 0h10" />
//                             </svg>
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </AdminLayout>
//   )
// }

