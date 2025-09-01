// import { Routes, Route, Navigate } from 'react-router-dom'
// import Home from './routes'
// import Auth from './routes/auth'
// import { StudentDashboard } from './routes/dashboard/StudentDashboard'
// import { InstructorDashboard } from './routes/dashboard/InstructorDashboard'
// import { AdminDashboard } from './routes/dashboard/AdminDashboard'
// import { useAuth } from './features/auth/store'
// import Navbar from './components/nav/Navbar'

// export default function App() {
//   return (
//     <div>
//       <Navbar />
//       <main className="container py-6">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/auth/*" element={<Auth />} />

//           {/* NEW: generic dashboard route that redirects by role */}
//           <Route path="/dashboard" element={<DashboardRedirect />} />

//           <Route
//             path="/dashboard/student"
//             element={
//               <Guard role="student">
//                 <StudentDashboard />
//               </Guard>
//             }
//           />
//           <Route
//             path="/dashboard/instructor"
//             element={
//               <Guard role="instructor">
//                 <InstructorDashboard />
//               </Guard>
//             }
//           />
//           <Route
//             path="/dashboard/admin"
//             element={
//               <Guard role="admin">
//                 <AdminDashboard />
//               </Guard>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </main>
//     </div>
//   )
// }

// function Guard({ children, role }) {
//   const { user } = useAuth()
//   if (!user) return <Navigate to="/auth/login" replace />
//   if (user.role !== role) return <div className="container">Unauthorized</div>
//   return children
// }

// function DashboardRedirect() {
//   const { user } = useAuth()
//   if (!user) return <Navigate to="/auth/login" replace />
//   if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />
//   if (user.role === 'instructor') return <Navigate to="/dashboard/instructor" replace />
//   return <Navigate to="/dashboard/student" replace />
// }

import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/login'
import AdminUsers from './components/admin/AdminUsers'
import InstructorCourses from './components/instructor/InstructorCourses'
import StudentCourses from './components/StudentCourses'
import ProtectedRoute from './components/protectedRoutes'
import AdminLayout from './components/admin/AdminLayout'
import AdminStudents from './components/admin/AdminStudents'
import AdminInstructors from './components/admin/AdminInstructors'
import AdminCourses from './components/admin/AdminCourses'
import { Toaster, useToast } from "@/components/ui/use-toast"
import Announcements from './components/instructor/Announcements'
import People from './components/instructor/People'
import Grades from './components/instructor/Grades'
import Home from './components/instructor/Home'
import CourseDetail from './components/instructor/CourseDetail'
import Assignments from './components/instructor/AssignmentSubmit'




export default function App() {
const role = localStorage.getItem('role')


return (
  <Toaster >
<Routes>
<Route path="/" element={<Navigate to="/login" />} />
<Route path="/login" element={<Login />} />


<Route
path="/admin/users"
element={
<ProtectedRoute allowed={["admin"]}>
<AdminUsers />
</ProtectedRoute>
}
/>


<Route
path="/instructor/courses"
element={
<ProtectedRoute allowed={["instructor", "admin"]}>
<InstructorCourses />
</ProtectedRoute>
}
/>


{/* <Route
path="/courses/:id/assignments"
element={
<ProtectedRoute allowed={["instructor", "admin", "student"]}>
<CourseAssignments />
</ProtectedRoute>
}
/> */}


<Route
path="/student/courses"
element={
<ProtectedRoute allowed={["student", "admin"]}>
<StudentCourses />
</ProtectedRoute>
}
/>



 <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/:scope" element={<AdminUsers />} /> {/* users | students | instructors | admins */}
        </Route>
        <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/instructors" element={<AdminInstructors />} />
          <Route path="/admin/courses" element={<AdminCourses />} />


        <Route path="/courses/:id" element={<CourseDetail />}>
        <Route index element={<Home />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="grades" element={<Grades />} />
        <Route path="people" element={<People />} />
       <Route path="announcements" element={<Announcements />} />

        </Route>  

<Route path="*" element={<div>Not found</div>} />
</Routes>
</Toaster>
)
}
