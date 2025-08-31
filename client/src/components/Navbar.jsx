import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/store'

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <nav className="container flex h-14 items-center justify-between">
        <Link to="/" className="font-bold">LMS</Link>
        <div className="flex items-center gap-4 text-sm">
          {!user && (<>
            <Link to="/">Home</Link>
            <Link to="/auth/login">Login</Link>
            <Link to="/auth/register" className="btn">Sign Up</Link>
          </>)}

          {user && (<>
            <Link to="/dashboard">Dashboard</Link> {/* <-- unified */}
            {user.role === 'admin' && <Link to="/dashboard/admin">Admin</Link>}
            <button onClick={logout} className="btn">Logout</button>
          </>)}
        </div>
      </nav>
    </header>
  )
}
