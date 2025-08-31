import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function InstructorCourses() {
const [courses, setCourses] = useState([])
const [form, setForm] = useState({ title: '', description: '' })
const role = localStorage.getItem('role')


async function load() {
const { data } = await api.get('/courses')
setCourses(data)
}
useEffect(() => { load() }, [])


async function create(e) {
e.preventDefault()
await api.post('/courses', form)
setForm({ title: '', description: '' })
load()
}


async function remove(id) {
await api.delete(`/courses/${id}`)
load()
}


return (
<div style={{ padding: 24 }}>
<h2>{role === 'admin' ? 'Admin' : 'Instructor'}: Courses</h2>
<form onSubmit={create}>
<input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
<input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
<button type="submit">Add</button>
</form>


<ul>
{courses.map(c => (
<li key={c.id}>
{c.title} — <Link to={`/courses/${c.id}/assignments`}>Assignments</Link>
<button onClick={() => remove(c.id)}>Delete</button>
</li>
))}
</ul>
</div>
)
}