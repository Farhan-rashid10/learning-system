// src/pages/admin/AdminCourses.jsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { NavLink, useNavigate } from "react-router-dom";

export default function AdminCourses() {
  return (
    <PageShell>
      <CoursesContent />
    </PageShell>
  );
}

/* ---------- Layout (same as AdminStudents) ---------- */
function PageShell({ children }) {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    try {
      setMe(JSON.parse(localStorage.getItem("user") || "null"));
    } catch {}
  }, []);

  const role = (me?.role || localStorage.getItem("role") || "user").toLowerCase();
  const displayName =
    me?.name?.split(" ")[0] || role.charAt(0).toUpperCase() + role.slice(1);
  const initials = (me?.name || me?.email || displayName)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function logout() {
    localStorage.clear();
    nav("/login");
  }

  const linkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
  const linkActive = "bg-blue-50 text-blue-700";
  const linkIdle = "text-gray-700 hover:bg-gray-50";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 z-40 w-64 transform bg-white p-4 shadow-lg ring-1 ring-gray-200 transition-transform md:static md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="mb-6 flex items-center gap-2 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              GAU-GradeView
            </span>
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              onClick={() => setOpen(false)}
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/students"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              onClick={() => setOpen(false)}
            >
              Students
            </NavLink>
            <NavLink
              to="/admin/instructors"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              onClick={() => setOpen(false)}
            >
              Instructors
            </NavLink>
            <NavLink
              to="/admin/courses"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              onClick={() => setOpen(false)}
            >
              Courses
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

        {/* Content */}
        <div className="flex min-h-screen w-full flex-col md:ml-64">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">
                {initials}
              </div>
              <div>
                <div className="text-sm text-gray-500">Welcome</div>
                <div className="text-base font-semibold text-gray-900">
                  {displayName}
                </div>
              </div>
            </div>
            <button
              className="rounded-lg border px-3 py-2 text-sm font-medium md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
/* ---------- Courses Content (drop-in) ---------- */
function CoursesContent() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [instructorId, setInstructorId] = useState("");
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  // NEW: inline-expand state
  const [expandedId, setExpandedId] = useState(null);
  const [detailById, setDetailById] = useState({}); // { [id]: { loading: bool, data?: object, error?: string } }

  const { toast } = useToast();
  const navigate = useNavigate();

  const API = "http://127.0.0.1:5000";
  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users`, { headers: authHeader });
      const data = await res.json();
      setInstructors(data.filter((u) => u.role === "instructor"));
    } catch (err) {
      console.error("Failed to fetch instructors", err);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API}/api/admin/courses`, { headers: authHeader });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  // Create or update course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${API}/api/admin/courses/${editing}`
        : `${API}/api/admin/courses`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, instructor_id: instructorId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || "Failed to save course");
      }

      setTitle(""); setDescription(""); setInstructorId("");
      setEditing(null); setOpenForm(false);
      fetchCourses();
      toast({ title: editing ? "✅ Course updated" : "✅ Course created" });
    } catch (err) {
      toast({ title: "❌ Error", description: err.message });
    }
  };

  // Delete course
  const handleDelete = async (id, e) => {
    e?.stopPropagation?.();
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`${API}/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (!res.ok) throw new Error("Failed to delete course");
      // collapse if the expanded one was deleted
      if (expandedId === id) setExpandedId(null);
      fetchCourses();
      toast({ title: "🗑️ Course deleted" });
    } catch (err) {
      toast({ title: "❌ Error deleting", description: err.message });
    }
  };

  // Edit handler (populate form)
  const startEdit = (course, e) => {
    e?.stopPropagation?.();
    setTitle(course.title);
    setDescription(course.description);
    setInstructorId(course.instructor_id);
    setEditing(course.id);
    setOpenForm(true);
  };

  // Resolve instructor display
  const getInstructor = (courseOrDetail) => {
    const iid = courseOrDetail.instructor_id ?? courseOrDetail?.instructor?.id;
    const inst = instructors.find((u) => u.id === iid);
    if (inst) return `${inst.name} (${inst.email})`;
    return iid ? `ID ${iid}` : "—";
  };

  // Inline expand
  const toggleExpand = async (id) => {
    setExpandedId((cur) => (cur === id ? null : id));
    // fetch details if not cached
    setDetailById((m) => m[id] ? m : { ...m, [id]: { loading: true } });
    if (!detailById[id]) {
      try {
        let res = await fetch(`${API}/api/admin/courses/${id}`, { headers: authHeader });
        if (!res.ok) {
          res = await fetch(`${API}/api/courses/${id}`, { headers: authHeader });
        }
        if (res.ok) {
          const data = await res.json();
          setDetailById((m) => ({ ...m, [id]: { loading: false, data } }));
        } else {
          setDetailById((m) => ({ ...m, [id]: { loading: false, error: "Failed to load details" }}));
        }
      } catch (e) {
        setDetailById((m) => ({ ...m, [id]: { loading: false, error: "Failed to load details" }}));
      }
    }
  };

  useEffect(() => {
    fetchInstructors();
    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl">
      {/* Header with Add button */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Button onClick={() => setOpenForm(true)}>+ Add Course</Button>
      </div>

      {/* Popup Form (unchanged) */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Course Title"
              className="w-full rounded border p-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Course Description"
              className="w-full rounded border p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <select
              className="w-full rounded border p-2"
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              required
            >
              <option value="">Select Instructor</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.email})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button type="submit">
                {editing ? "Update Course" : "Add Course"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTitle(""); setDescription(""); setInstructorId("");
                  setEditing(null); setOpenForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Courses list — CARD CLICK to expand inline */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {courses.map((c) => {
          const expanded = expandedId === c.id;
          const detail = detailById[c.id];
          return (
            <Card
              key={c.id}
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
              onClick={() => toggleExpand(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleExpand(c.id);
              }}
              className="cursor-pointer space-y-2 p-4 shadow transition hover:shadow-md"
            >
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold">{c.title}</h2>
                  <p className="truncate text-gray-600">{c.description}</p>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  <Badge>Instructor ID: {c.instructor_id}</Badge>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Actions (don’t bubble) */}
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={(e) => startEdit(c, e)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={(e) => handleDelete(c.id, e)}>
                  Delete
                </Button>
              </div>

              {/* Inline details */}
              {expanded && (
                <div className="mt-3 rounded border p-3">
                  {!detail || detail.loading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
                    </div>
                  ) : detail.error ? (
                    <p className="text-sm text-red-600">{detail.error}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded border p-2">
                          <p className="text-xs text-gray-500">Instructor</p>
                          <p className="text-sm font-medium">{getInstructor(detail.data)}</p>
                        </div>
                        {detail.data.published !== undefined && (
                          <div className="rounded border p-2">
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="text-sm font-medium">
                              {detail.data.published ? "Published" : "Unpublished"}
                            </p>
                          </div>
                        )}
                      </div>

                      {detail.data.description && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="whitespace-pre-wrap text-sm text-gray-700">
                            {detail.data.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${detail.data.id}`);
                          }}
                        >
                          Open Course View
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTitle(detail.data.title || "");
                            setDescription(detail.data.description || "");
                            setInstructorId(detail.data.instructor_id || "");
                            setEditing(detail.data.id);
                            setOpenForm(true);
                          }}
                        >
                          Edit This Course
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
