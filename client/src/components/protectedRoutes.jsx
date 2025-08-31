import { Navigate } from 'react-router-dom'


export default function ProtectedRoute({ allowed, children }) {
const token = localStorage.getItem('token')
const role = localStorage.getItem('role')


if (!token) return <Navigate to="/login" />
if (allowed && !allowed.includes(role)) return <div>Forbidden</div>
return children
}