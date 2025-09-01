// import { useEffect, useMemo, useState } from 'react'
// import { Link } from 'react-router-dom'
// import api from '../../lib/api'

// export default function InstructorCourses() {
//   const [courses, setCourses] = useState([])
//   const [form, setForm] = useState({ title: '', description: '' })
//   const [loading, setLoading] = useState(false)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const role = (localStorage.getItem('role') || '').toLowerCase()

//   async function load() {
//     setError('')
//     setLoading(true)
//     try {
//       const { data } = await api.get('/courses')
//       setCourses(Array.isArray(data) ? data : [])
//     } catch (err) {
//       setError(err?.response?.data?.msg || 'Failed to load courses')
//       setCourses([])
//     } finally {
//       setLoading(false)
//     }
//   }
//   useEffect(() => { load() }, [])

//   async function create(e) {
//     e.preventDefault()
//     if (!form.title.trim()) return
//     setSaving(true)
//     setError('')
//     try {
//       await api.post('/courses', form)
//       setForm({ title: '', description: '' })
//       await load()
//     } catch (err) {
//       setError(err?.response?.data?.msg || 'Error creating course')
//     } finally {
//       setSaving(false)
//     }
//   }

//   async function remove(id, title) {
//     if (!window.confirm(`Delete course "${title}"? This cannot be undone.`)) return
//     setError('')
//     try {
//       await api.delete(`/courses/${id}`)
//       setCourses(prev => prev.filter(c => c.id !== id))
//     } catch (err) {
//       setError(err?.response?.data?.msg || 'Error deleting course')
//     }
//   }

//   // simple pleasant palette; choose by index for variety
//   const palette = useMemo(() => ([
//     '#6366F1', // indigo
//     '#22C55E', // emerald
//     '#F59E0B', // amber
//     '#EF4444', // red
//     '#3B82F6', // blue
//     '#A855F7', // violet
//     '#14B8A6', // teal
//     '#E11D48', // rose
//   ]), [])
//   const pickColor = (i) => palette[i % palette.length]

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="mx-auto max-w-6xl px-4 py-8">
//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-500">Dashboard</p>
//             <h2 className="text-2xl font-bold text-gray-900">
//               {role === 'admin' ? 'Admin' : 'Instructor'} · Courses
//             </h2>
//           </div>
//           <div className="hidden sm:block rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white">
//             {role === 'admin' ? 'Admin' : 'Instructor'}
//           </div>
//         </div>

//         {/* Error banner */}
//         {error && (
//           <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         {/* Create form */}
//         <div className="mb-8 rounded-xl bg-white p-6 shadow ring-1 ring-gray-200">
//           <h3 className="mb-4 text-lg font-semibold text-gray-900">Add a new course</h3>
//           <form onSubmit={create} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
//             <div className="sm:col-span-2 lg:col-span-2">
//               <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
//               <input
//                 placeholder="e.g. Introduction to Algorithms"
//                 value={form.title}
//                 onChange={e=>setForm({...form, title:e.target.value})}
//                 className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
//                 required
//               />
//             </div>
//             <div className="sm:col-span-2 lg:col-span-3">
//               <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
//               <input
//                 placeholder="Short description"
//                 value={form.description}
//                 onChange={e=>setForm({...form, description:e.target.value})}
//                 className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
//               />
//             </div>
//             <div className="flex items-end lg:col-span-1">
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-60"
//               >
//                 {saving ? 'Adding…' : 'Add course'}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Courses grid */}
//         <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
//           <div className="mb-4 flex items-center justify-between">
//             <h4 className="text-sm font-semibold text-gray-900">Your courses</h4>
//             <button
//               onClick={load}
//               className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//               Refresh
//             </button>
//           </div>

//           {loading ? (
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {[...Array(6)].map((_,i)=>(
//                 <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
//                   <div className="h-24 w-full bg-gray-200" />
//                   <div className="space-y-3 p-4">
//                     <div className="h-4 w-3/5 rounded bg-gray-200" />
//                     <div className="h-3 w-4/5 rounded bg-gray-200" />
//                     <div className="h-8 w-24 rounded bg-gray-200" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : courses.length === 0 ? (
//             <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
//               <div className="h-12 w-12 rounded-full bg-gray-100 p-3">
//                 <svg viewBox="0 0 24 24" className="h-full w-full text-gray-400">
//                   <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
//                 </svg>
//               </div>
//               <p className="text-sm text-gray-600">No courses yet. Create your first course above.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {courses.map((c, idx) => (
//                 <div
//                   key={c.id}
//                   className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
//                 >
//                   {/* color banner */}
//                   <div
//                     className="h-2 w-full"
//                     style={{ backgroundColor: pickColor(idx) }}
//                     aria-hidden
//                   />
//                   <div className="p-4">
//                     <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900">
//                       {c.title}
//                     </h3>
//                     <p className="mb-4 line-clamp-2 text-sm text-gray-600">
//                       {c.description || 'No description provided.'}
//                     </p>

//                     <div className="flex items-center gap-2">
//                       <Link
//                         to={`/courses/${c.id}/assignments`}
//                         className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
//                       >
//                         Assignments
//                         <svg className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//                         </svg>
//                       </Link>

//                       <button
//                         onClick={() => remove(c.id, c.title)}
//                         className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100"
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 001-1V5a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 001 1m-10 0h10" />
//                         </svg>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/courses");
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    await api.post("/courses", form);
    setForm({ title: "", description: "" });
    load();
  }

  async function remove(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await api.delete(`/courses/${id}`);
    load();
  }

  // Canvas-like tile colors
  const palette = useMemo(
    () => ["#C2410C", "#1F2937", "#0F766E", "#3B82F6", "#A855F7", "#F59E0B", "#DC2626", "#14B8A6"],
    []
  );
  const pickColor = (i) => palette[i % palette.length];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {role === "admin" ? "Admin" : "Instructor"} · Dashboard
          </h2>
        </div>

        {/* Create form */}
        <form onSubmit={create} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2"
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Add
          </button>
        </form>

        {/* Courses grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border bg-white">
                <div className="h-36 w-full bg-gray-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/5 rounded bg-gray-200" />
                  <div className="h-3 w-4/5 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c, idx) => (
              <CourseTile
                key={c.id}
                color={pickColor(idx)}
                course={c}
                onOpen={() => navigate(`/courses/${c.id}`)}
                onDelete={() => remove(c.id, c.title)}
                onEdit={() => navigate(`/courses/${c.id}/edit`)} // no API change; just navigation
              />
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-gray-500">No courses yet. Create your first course above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Tile ------------------------------ */

function CourseTile({ color, course, onOpen, onDelete, onEdit }) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  // close menu on outside click / escape
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    }
    function onEsc(e) { if (e.key === "Escape") setOpenMenu(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
    >
      {/* colored cover */}
      <div className="h-36 w-full" style={{ backgroundColor: color }} />

      {/* 3-dots menu */}
      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          className="rounded-full bg-white/95 p-1.5 text-gray-700 shadow hover:bg-white"
          aria-haspopup="menu"
          aria-expanded={openMenu}
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenu((s) => !s);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {openMenu && (
          <div
            className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="block w-full px-3 py-2 text-left hover:bg-gray-50"
              onClick={() => { setOpenMenu(false); onEdit(); }}
              role="menuitem"
            >
              Edit
            </button>
            <button
              className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
              onClick={() => { setOpenMenu(false); onDelete(); }}
              role="menuitem"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900">{course.title}</h3>
        <p className="line-clamp-2 text-sm text-gray-600">
          {course.description || "No description provided."}
        </p>

        {/* quick actions like Canvas icons */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            to={`/courses/${course.id}/announcements`}
            onClick={(e) => e.stopPropagation()}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Announcements"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h11l4-4v12l-4-4H3z" />
            </svg>
          </Link>
          <Link
            to={`/courses/${course.id}/discussions`}
            onClick={(e) => e.stopPropagation()}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Discussions"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a4 4 0 01-4 4H7l-4 4V7a4 4 0 014-4h10a4 4 0 014 4z" />
            </svg>
          </Link>
          <Link
            to={`/courses/${course.id}/files`}
            onClick={(e) => e.stopPropagation()}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            title="Files"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 3H6a2 2 0 00-2 2v14l4-4h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
