// client/src/routes/dashboard/AdminDashboard.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../features/auth/store'

export function AdminDashboard() {
  const { user, token } = useAuth() // <-- wait for these

  // ===== State =====
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Users
  const [tab, setTab] = useState('instructor') // 'admin' | 'instructor' | 'student'
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ admins: 0, instructors: 0, students: 0, pending: 0 })

  // Courses
  const [courses, setCourses] = useState([])
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 350)

  // Create course form
  const [form, setForm] = useState({ title: '', description: '', is_published: true })
  const [creating, setCreating] = useState(false)

  // ===== Effects =====
  useEffect(() => {
    // only run once token & role=admin are present
    if (token && user?.role === 'admin') {
      bootstrap()
    }
  }, [token, user?.role])

  useEffect(() => {
    if (token && user?.role === 'admin') {
      loadUsers(tab)
    }
  }, [tab, token, user?.role])

  useEffect(() => {
    if (token && user?.role === 'admin') {
      loadCourses(debouncedQ)
    }
  }, [debouncedQ, token, user?.role])

  // ===== Handlers / API Calls =====
  async function bootstrap() {
    try {
      setLoading(true)
      setError('')
      const [admins, instructors, students] = await Promise.all([
        api.get('/users?role=admin'),
        api.get('/users?role=instructor'),
        api.get('/users?role=student'),
      ])
      const pending = (instructors.items || []).filter((u) => !u.is_approved).length
      setStats({
        admins: admins.total,
        instructors: instructors.total,
        students: students.total,
        pending,
      })
      setUsers(instructors.items || []) // default tab data
      await loadCourses('')
    } catch (e) {
      setError(e.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers(role) {
    try {
      setError('')
      const res = await api.get(`/users?role=${role}`)
      setUsers(res.items || [])
      if (role === 'instructor') {
        const pending = (res.items || []).filter((u) => !u.is_approved).length
        setStats((s) => ({ ...s, pending }))
      }
    } catch (e) {
      setError(e.message || 'Failed to load users')
    }
  }

  async function approveUser(id) {
    try {
      await api.patch(`/users/${id}/approve`, {})
      await loadUsers('instructor')
      const instructors = await api.get('/users?role=instructor')
      const pending = (instructors.items || []).filter((u) => !u.is_approved).length
      setStats((s) => ({ ...s, pending, instructors: instructors.total }))
    } catch (e) {
      alert(e.message || 'Approve failed')
    }
  }

  async function loadCourses(query = '') {
    try {
      setError('')
      const url = query ? `/courses?q=${encodeURIComponent(query)}` : '/courses'
      const res = await api.get(url)
      setCourses(res.items || [])
    } catch (e) {
      setError(e.message || 'Failed to load courses')
    }
  }

  async function createCourse(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      setCreating(true)
      await api.post('/courses', form)
      setForm({ title: '', description: '', is_published: true })
      await loadCourses(debouncedQ)
      alert('Course created ✅')
    } catch (e) {
      alert(e.message || 'Create course failed')
    } finally {
      setCreating(false)
    }
  }

  async function togglePublish(course) {
    try {
      await api.patch(`/courses/${course.id}`, { is_published: !course.is_published })
      await loadCourses(debouncedQ)
    } catch (e) {
      alert(e.message || 'Update failed')
    }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course? This cannot be undone.')) return
    try {
      await api.del(`/courses/${id}`)
      await loadCourses(debouncedQ)
    } catch (e) {
      alert(e.message || 'Delete failed')
    }
  }

  // ===== Derived =====
  const pendingInstructors = useMemo(
    () => (tab === 'instructor' ? users.filter((u) => !u.is_approved) : []),
    [users, tab]
  )

  // ===== Render =====
  if (!token) {
    return <div className="container">Loading session…</div>
  }
  if (user?.role !== 'admin') {
    return <div className="container">Unauthorized</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Admins" value={stats.admins} />
        <Stat label="Instructors" value={stats.instructors} />
        <Stat label="Students" value={stats.students} />
        <Stat label="Pending Approvals" value={stats.pending} />
      </section>

      {/* Users Management */}
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Users</h3>
        <div className="flex gap-2">
            <Tab label="Admins" active={tab === 'admin'} onClick={() => setTab('admin')} />
            <Tab
              label={`Instructors${stats.pending ? ` • ${stats.pending}` : ''}`}
              active={tab === 'instructor'}
              onClick={() => setTab('instructor')}
            />
            <Tab label="Students" active={tab === 'student'} onClick={() => setTab('student')} />
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users in this category.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <TH>ID</TH>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  {tab === 'instructor' && <TH>Approved</TH>}
                  {tab === 'instructor' && <TH>Action</TH>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <TD>{u.id}</TD>
                    <TD>{u.name}</TD>
                    <TD>{u.email}</TD>
                    <TD className="capitalize">{u.role}</TD>
                    {tab === 'instructor' && <TD>{u.is_approved ? 'Yes' : 'No'}</TD>}
                    {tab === 'instructor' && (
                      <TD>
                        {!u.is_approved ? (
                          <button className="btn" onClick={() => approveUser(u.id)}>
                            Approve
                          </button>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TD>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'instructor' && pendingInstructors.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
            {pendingInstructors.length} instructor(s) awaiting approval
          </div>
        )}
      </section>

      {/* Course Management */}
      <section className="card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold">Courses</h3>
          <input
            className="input md:w-80"
            placeholder="Search courses…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search courses"
          />
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-600">No courses found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <TH>ID</TH>
                  <TH>Title</TH>
                  <TH>Slug</TH>
                  <TH>Owner ID</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-t">
                    <TD>{c.id}</TD>
                    <TD className="font-medium">{c.title}</TD>
                    <TD className="text-gray-500">{c.slug}</TD>
                    <TD>{c.owner_id}</TD>
                    <TD>{c.is_published ? 'Published' : 'Draft'}</TD>
                    <TD>
                      <div className="flex gap-2">
                        <button className="btn" onClick={() => togglePublish(c)}>
                          {c.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          className="btn bg-red-600 hover:bg-red-700"
                          onClick={() => deleteCourse(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="h-px bg-gray-200" />

        {/* Quick Create Course */}
        <form onSubmit={createCourse} className="grid gap-3 md:grid-cols-2">
          <input
            className="input"
            placeholder="Course title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            aria-label="Course title"
          />
          <select
            className="input"
            value={form.is_published ? '1' : '0'}
            onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.value === '1' }))}
            aria-label="Publish status"
          >
            <option value="1">Published</option>
            <option value="0">Draft</option>
          </select>
          <textarea
            className="input md:col-span-2"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            aria-label="Course description"
          />
          <div className="md:col-span-2">
            <button className="btn" disabled={creating || !form.title.trim()}>
              {creating ? 'Creating…' : 'Create Course'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

/* ===== Helpers ===== */
function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function TH({ children }) {
  return <th className="p-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</th>
}

function TD({ children }) {
  return <td className="p-2 align-top">{children}</td>
}

function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

// Small debounce hook to reduce API calls while typing
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  const t = useRef(null)
  useEffect(() => {
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => setDebounced(value), delay)
    return () => t.current && clearTimeout(t.current)
  }, [value, delay])
  return debounced
}
