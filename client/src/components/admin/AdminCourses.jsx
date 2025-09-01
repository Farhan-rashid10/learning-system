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

/* ---------- Courses Content ---------- */
function CoursesContent() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [instructorId, setInstructorId] = useState("");
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  const { toast } = useToast();

  // Fetch instructors
  const fetchInstructors = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setInstructors(data.filter((u) => u.role === "instructor"));
    } catch (err) {
      console.error("Failed to fetch instructors", err);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/admin/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
        ? `http://127.0.0.1:5000/api/admin/courses/${editing}`
        : "http://127.0.0.1:5000/api/admin/courses";

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          instructor_id: instructorId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || "Failed to save course");
      }

      setTitle("");
      setDescription("");
      setInstructorId("");
      setEditing(null);
      setOpenForm(false);
      fetchCourses();

      toast({ title: editing ? "✅ Course updated" : "✅ Course created" });
    } catch (err) {
      toast({ title: "❌ Error", description: err.message });
    }
  };

  // Delete course
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/admin/courses/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete course");
      fetchCourses();
      toast({ title: "🗑️ Course deleted" });
    } catch (err) {
      toast({ title: "❌ Error deleting", description: err.message });
    }
  };

  // Edit handler (populate form)
  const startEdit = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setInstructorId(course.instructor_id);
    setEditing(course.id);
    setOpenForm(true);
  };

  useEffect(() => {
    fetchInstructors();
    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl">
      {/* Header with Add button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Button onClick={() => setOpenForm(true)}>+ Add Course</Button>
      </div>

      {/* Popup Form */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Course Title"
              className="border p-2 w-full rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Course Description"
              className="border p-2 w-full rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <select
              className="border p-2 w-full rounded"
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
                  setTitle("");
                  setDescription("");
                  setInstructorId("");
                  setEditing(null);
                  setOpenForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Courses list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((c) => (
          <Card key={c.id} className="p-4 shadow space-y-2">
            <h2 className="text-xl font-semibold">{c.title}</h2>
            <p className="text-gray-600">{c.description}</p>
            <Badge>Instructor ID: {c.instructor_id}</Badge>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => startEdit(c)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(c.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
