import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl font-bold">Welcome to the LMS</h1>
        <p className="text-gray-600">Learn, teach, and manage courses with ease.</p>
        <div className="mt-4 space-x-2">
          <Link to="/auth/register" className="btn">Get Started</Link>
          <Link to="/auth/login" className="btn bg-gray-800 hover:bg-gray-900">Login</Link>
        </div>
      </section>
    </div>
  )
}
