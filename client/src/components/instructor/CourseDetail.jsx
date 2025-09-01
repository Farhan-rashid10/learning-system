import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

/* ----------------------- localStorage helpers ----------------------- */
const storeKey = (courseId) => `courseScratch:${courseId}`;
const defaultState = { home: [], assignments: [], people: [], grades: [] };

function loadState(courseId) {
  try {
    const raw = localStorage.getItem(storeKey(courseId));
    return raw ? JSON.parse(raw) : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}
function saveState(courseId, data) {
  localStorage.setItem(storeKey(courseId), JSON.stringify(data));
}
function uid() {
  return (crypto && crypto.randomUUID) ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/* ============================ MODULES (HOME) ============================ */
/** ModulesBoard:
 * - Top: "Add Module" (name only)
 * - List: each module as a link title + 3-dot menu (Rename/Delete)
 * - Clicking a title opens ModuleContentPanel for that module
 */
function ModulesBoard({ courseId }) {
  const [state, setState] = useState(() => loadState(courseId));
  const modules = state.home || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [openModuleId, setOpenModuleId] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { saveState(courseId, state); }, [courseId, state]);

  // close any open menu on outside click/esc
  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpenFor(null);
    }
    function onEsc(e) { if (e.key === "Escape") setMenuOpenFor(null); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, []);

  function addModule() {
    const name = newName.trim();
    if (!name) return;
    const mod = { id: uid(), title: name, contents: [], createdAt: Date.now() };
    setState((prev) => ({ ...prev, home: [mod, ...(prev.home || [])] }));
    setNewName("");
    setShowAdd(false);
  }

  function renameModule(m) {
    const name = prompt("Rename module:", m.title);
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      home: prev.home.map((x) => (x.id === m.id ? { ...x, title: trimmed } : x)),
    }));
    setMenuOpenFor(null);
  }

  function deleteModule(m) {
    if (!window.confirm(`Delete module “${m.title}”?`)) return;
    setState((prev) => ({ ...prev, home: prev.home.filter((x) => x.id !== m.id) }));
    if (openModuleId === m.id) setOpenModuleId(null);
    setMenuOpenFor(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: Add Module (name only) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="text-sm font-medium text-blue-600 hover:underline"
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

      {/* Modules list */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {modules.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No modules yet.</div>
        ) : (
          <ul className="divide-y">
            {modules.map((m) => (
              <li key={m.id} className="p-4">
                <div className="flex items-center justify-between">
                  <button
                    className="text-left text-sm font-semibold text-blue-700 hover:underline"
                    onClick={() => setOpenModuleId((id) => (id === m.id ? null : m.id))}
                  >
                    {m.title}
                  </button>

                  {/* 3-dot menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
                      onClick={() => setMenuOpenFor((v) => (v === m.id ? null : m.id))}
                      aria-haspopup="menu"
                      aria-expanded={menuOpenFor === m.id}
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    </button>

                    {menuOpenFor === m.id && (
                      <div
                        className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg"
                        role="menu"
                      >
                        <button
                          className="block w-full px-3 py-2 text-left hover:bg-gray-50"
                          onClick={() => renameModule(m)}
                        >
                          Rename
                        </button>
                        <button
                          className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
                          onClick={() => deleteModule(m)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opened module: show content panel */}
                {openModuleId === m.id && (
                  <div className="mt-4">
                    <ModuleContentPanel
                      courseId={courseId}
                      module={m}
                      updateModule={(updater) =>
                        setState((prev) => ({
                          ...prev,
                          home: prev.home.map((x) => (x.id === m.id ? updater(x) : x)),
                        }))
                      }
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** ModuleContentPanel:
 * - Top links: Add Content / Update / Delete
 * - Editor appears when a link is clicked
 * - List of content items is displayed below the toolbar
 */
function ModuleContentPanel({ courseId, module, updateModule }) {
  const [mode, setMode] = useState("idle"); // 'idle' | 'add' | 'update' | 'delete'
  const [selectedId, setSelectedId] = useState("");
  const items = module.contents || [];

  const selected = items.find((i) => i.id === selectedId) || null;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

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

  function addContent() {
    const t = title.trim();
    if (!t) return;
    const newItem = { id: uid(), title: t, body: body.trim(), createdAt: Date.now() };
    updateModule((m) => ({ ...m, contents: [newItem, ...(m.contents || [])] }));
    setMode("idle");
  }

  function updateContent() {
    if (!selected) return;
    const t = title.trim();
    if (!t) return;
    updateModule((m) => ({
      ...m,
      contents: m.contents.map((it) => (it.id === selected.id ? { ...it, title: t, body: body.trim() } : it)),
    }));
    setMode("idle");
  }

  function deleteContent() {
    if (!selected) return;
    if (!window.confirm(`Delete “${selected.title}”?`)) return;
    updateModule((m) => ({ ...m, contents: m.contents.filter((it) => it.id !== selected.id) }));
    setSelectedId("");
    setMode("idle");
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Toolbar links above content */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => setMode((s) => (s === "add" ? "idle" : "add"))}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Add Content
        </button>
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
                  <option key={i.id} value={i.id}>{i.title}</option>
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
                  rows={4}
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

      {/* Displayed content list */}
      {items.length === 0 ? (
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

/* =============================== PAGE =============================== */
export default function CourseDetail() {
  const { id } = useParams();
  const location = useLocation();

  const tabs = [
    { label: "Home", path: "" },
    { label: "Announcements", path: "announcements" },
    { label: "Assignments", path: "assignments" },
    { label: "Grades", path: "grades" },
    { label: "People", path: "people" },
  ];

  const linkBase =
    "flex items-center justify-between w-full px-3 py-2 text-sm rounded hover:bg-gray-100";
  const activeClass = "font-semibold text-gray-900";
  const idleClass = "text-gray-700";

  const seg = location.pathname.split(`/courses/${id}/`)[1] || "";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-12 lg:gap-6">
        {/* LEFT NAV */}
        <aside className="mb-6 border-r pr-4 lg:col-span-2 lg:mb-0">
          <div className="mb-4">
            <p className="truncate text-sm font-semibold text-blue-700">Software EIT-FT01</p>
            <p className="text-xs text-gray-500">› Modules</p>
          </div>
          <nav className="flex flex-col gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.path}
                to={`/courses/${id}/${t.path}`}
                end={t.path === ""}
                className={({ isActive }) => `${linkBase} ${isActive ? activeClass : idleClass}`}
              >
                <span>{t.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* CENTER */}
        <main className="lg:col-span-10 space-y-4">
          {seg === "" && <ModulesBoard courseId={id} />}
          {/* keep your nested routes working */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
