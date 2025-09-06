import { NavLink, Outlet } from "react-router-dom";
import {
  UserCircle,
  BookOpen,
  Calendar,
  HelpCircle,
  LogOut,
} from "lucide-react";

export default function InstructorLayout() {
  const linkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";
  const linkActive = "bg-blue-50 text-blue-700";
  const linkIdle = "text-gray-700 hover:bg-gray-50";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 w-64 bg-white border-r shadow-sm">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Instructor</h1>
          <nav className="space-y-1">
            <NavLink
              to="/instructor/account"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <UserCircle className="h-5 w-5" /> Account
            </NavLink>
            <NavLink
              to="/instructor/courses"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <BookOpen className="h-5 w-5" /> Courses
            </NavLink>
            <NavLink
              to="/instructor/calendar"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <Calendar className="h-5 w-5" /> Calendar
            </NavLink>
            <NavLink
              to="/instructor/help"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <HelpCircle className="h-5 w-5" /> Help
            </NavLink>
            <NavLink
              to="/logout"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              <LogOut className="h-5 w-5" /> Logout
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
