import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../lib/api";

/* ============================ MODULES (HOME) ============================ */
function ModulesBoard({ courseId }) {
  const [modules, setModules] = useState([]);
  const [loadingMods, setLoadingMods] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const [openIndex, setOpenIndex] = useState(null); // null = list view
  const isDetail = openIndex !== null;
  const current = isDetail ? modules[openIndex] : null;

  async function fetchModules({ withItems = false } = {}) {
    setLoadingMods(true);
    try {
      const { data } = await api.get(
        `/courses/${courseId}/modules${withItems ? "?with_items=1" : ""}`
      );
      setModules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load modules", e);
      setModules([]);
    } finally {
      setLoadingMods(false);
    }
  }
  useEffect(() => {
    setOpenIndex(null);
    fetchModules();
  }, [courseId]);

  async function addModule() {
    const name = newName.trim();
    if (!name) return;
    try {
      const { data } = await api.post(`/courses/${courseId}/modules`, { title: name });
      setModules(prev => [data, ...prev]);
      setNewName("");
      setShowAdd(false);
    } catch (e) {
      console.error(e);
      alert("Failed to create module");
    }
  }

  async function renameModule(m) {
    const name = prompt("Rename module:", m.title);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const { data } = await api.patch(`/modules/${m.id}`, { title: trimmed });
      setModules(prev => prev.map(x => (x.id === m.id ? data : x)));
    } catch (e) {
      console.error(e);
      alert("Failed to rename module");
    }
  }

  async function deleteModule(m) {
    if (!window.confirm(`Delete module “${m.title}”?`)) return;
    try {
      const res = await api.delete(`/modules/${m.id}`);
      if (res.status !== 200 && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setModules(prev => {
        const next = prev.filter(x => x.id !== m.id);
        if (isDetail && current?.id === m.id) setOpenIndex(null);
        else if (isDetail) {
          const removedIdx = prev.findIndex(x => x.id === m.id);
          if (removedIdx > -1 && removedIdx < openIndex) setOpenIndex(i => Math.max(0, i - 1));
        }
        return next;
      });
    } catch (e) {
      console.error(e);
      alert("Failed to delete module");
    }
  }

  /* ---------- LIST VIEW ---------- */
  if (!isDetail) {
    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAdd(s => !s)}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            + Add Module
          </button>
        </div>

        {showAdd && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-900">New Module</div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Module name"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={addModule}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowAdd(false); setNewName(""); }}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimal list */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {loadingMods ? (
            <div className="p-4 space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
            </div>
          ) : modules.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No modules yet.</div>
          ) : (
            <ul className="divide-y">
              {modules.map((m, idx) => (
                <ModuleRow
                  key={m.id}
                  module={m}
                  onOpen={() => setOpenIndex(idx)}
                  onRename={() => renameModule(m)}
                  onDelete={() => deleteModule(m)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  /* ---------- DETAIL VIEW ---------- */
  const hasPrev = openIndex > 0;
  const hasNext = openIndex < modules.length - 1;

  return (
    <div className="space-y-4">
      {/* Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpenIndex(null)}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          title="Back"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ml-1">Back</span>
        </button>
      </div>

      {/* Big content card (75% width on lg+) */}
      <div className="flex w-full justify-center">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:w-3/4">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">{current?.title}</h2>
          <ModuleContentPanel moduleId={current?.id} />
        </div>
      </div>

      {/* Pager */}
      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={!hasPrev}
          onClick={() => hasPrev && setOpenIndex(openIndex - 1)}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>

        <button
          disabled={!hasNext}
          onClick={() => hasNext && setOpenIndex(openIndex + 1)}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
          <svg viewBox="0 0 24 24" className="ml-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ModuleRow({ module, onOpen, onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <li className="p-4">
      <div className="flex items-center justify-between">
        <button
          className="text-left text-base font-semibold text-blue-700 hover:underline"
          onClick={onOpen}
        >
          {module.title}
        </button>

        <div className="relative" ref={ref}>
          <button
            className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
            onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {open && (
            <div
              className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
              role="menu"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                onClick={() => { setOpen(false); onRename(); }}
              >
                Rename
              </button>
              <button
                className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                onClick={() => { setOpen(false); onDelete(); }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** ===================== ModuleContentPanel (items) ===================== */
function ModuleContentPanel({ moduleId }) {
  const [mode, setMode] = useState("idle"); // 'idle' | 'add' | 'update' | 'delete'
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const selected = items.find((i) => String(i.id) === String(selectedId)) || null;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function fetchItems() {
    setLoadingItems(true);
    try {
      const { data } = await api.get(`/modules/${moduleId}/items`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load items", e);
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  }
  useEffect(() => {
    setSelectedId("");
    setMode("idle");
    fetchItems();
  }, [moduleId]);

  useEffect(() => {
    if (mode === "add") {
      setSelectedId("");
      setTitle("");
      setBody("");
    } else if (mode === "update") {
      if (selected) {
        setTitle(selected.title);
        setBody(selected.body || "");
      } else {
        setTitle("");
        setBody("");
      }
    } else if (mode === "delete") {
      setTitle("");
      setBody("");
    }
  }, [mode, selected]);

  async function addContent() {
    const t = title.trim();
    if (!t) return;
    try {
      const { data } = await api.post(`/modules/${moduleId}/items`, { title: t, body: body.trim() });
      setItems(prev => [data, ...prev]);
      setMode("idle");        // hide the add form
      setTitle("");
      setBody("");
    } catch (e) {
      console.error(e);
      alert("Failed to add content");
    }
  }

  async function updateContent() {
    if (!selected) return;
    const t = title.trim();
    if (!t) return;
    try {
      const { data } = await api.patch(`/items/${selected.id}`, { title: t, body: body.trim() });
      setItems(prev => prev.map(it => (it.id === selected.id ? data : it)));
      setMode("idle");
      setSelectedId("");
    } catch (e) {
      console.error(e);
      alert("Failed to update content");
    }
  }

  async function deleteContent() {
    if (!selected) return;
    if (!window.confirm(`Delete “${selected.title}”?`)) return;
    try {
      const res = await api.delete(`/items/${selected.id}`);
      if (res.status !== 200 && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      setItems(prev => prev.filter(it => it.id !== selected.id));
      setSelectedId("");
      setMode("idle");
    } catch (e) {
      console.error(e);
      alert("Failed to delete content");
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: only show "+ Add Content" if empty */}
      <div className="flex flex-wrap items-center gap-4">
        {items.length === 0 && (
          <button
            onClick={() => setMode((s) => (s === "add" ? "idle" : "add"))}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            + Add Content
          </button>
        )}
        <button
          onClick={() => setMode((s) => (s === "update" ? "idle" : "update"))}
          className="text-sm font-medium text-gray-700 hover:underline"
        >
          Update
        </button>
        <button
          onClick={() => setMode((s) => (s === "delete" ? "idle" : "delete"))}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>

      {/* Action panel */}
      {mode !== "idle" && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 capitalize">{mode} content</p>
            <button onClick={() => setMode("idle")} className="text-sm text-gray-500 hover:underline">Close</button>
          </div>

          {(mode === "update" || mode === "delete") && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-medium text-gray-700">Select item</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">— choose —</option>
                {items.map((i) => (
                  <option key={i.id} value={String(i.id)}>{i.title}</option>
                ))}
              </select>
            </div>
          )}

          {(mode === "add" || (mode === "update" && selected)) && (
            <>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-700">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Content title"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-gray-700">Body</label>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Full content…"
                />
              </div>

              {mode === "add" ? (
                <button
                  onClick={addContent}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={updateContent}
                  disabled={!selected}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  Update
                </button>
              )}
            </>
          )}

          {mode === "delete" && (
            <button
              onClick={deleteContent}
              disabled={!selected}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Content list */}
      {loadingItems ? (
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="h-16 w-full animate-pulse rounded bg-gray-200" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">No content yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li key={it.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-semibold text-gray-900">{it.title}</p>
              {it.body && <p className="text-xs text-gray-600 whitespace-pre-wrap">{it.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =============================== PAGE (with SECONDARY SIDEBAR) =============================== */
export default function CourseDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        if (mounted) setCourse(data || null);
      } catch {
        if (mounted) setCourse(null);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // second (course) sidebar tabs — keep slugs the same
  const tabs = [
    { label: "Home", path: "" },
    { label: "Announcements", path: "announcements" },
    { label: "Assignments", path: "assignments" },
    { label: "Grades", path: "grades" },
    { label: "People", path: "people" },
  ];

  const linkBase =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition";
  const linkActive = "bg-blue-50 text-blue-700";
  const linkIdle = "text-gray-700 hover:bg-gray-50";

  const seg = location.pathname.split(`/instructor/courses/${id}/`)[1] || "";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:flex lg:gap-6">
        {/* SECONDARY (course) SIDEBAR — sits next to the main layout sidebar */}
        <aside className="sticky top-0 mb-6 h-max w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:mb-0 lg:w-64">
          <div className="mb-4">
            <p className="truncate text-sm font-semibold text-gray-900">
              {course?.title || `Course #${id}`}
            </p>
            <p className="text-xs text-gray-500">Course navigation</p>
          </div>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <NavLink
                key={t.path}
                to={`/instructor/courses/${id}/${t.path}`}
                end={t.path === ""}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 space-y-4">
          {seg === "" && <ModulesBoard courseId={id} />}
          {/* nested routes render here if you add them */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
