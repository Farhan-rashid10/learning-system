import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'


export default function StudentCourses() {
const [courses, setCourses] = useState([])


async function load() {
const { data } = await api.get('/courses')
setCourses(data)
}
useEffect(() => { load() }, [])


async function enroll(id) {
await api.post(`/courses/${id}/enroll`)
alert('Enrolled')
}


return (
<div style={{ padding: 24 }}>
<h2>Student: Courses</h2>
<ul>
{courses.map(c => (
<li key={c.id}>
{c.title}
<button onClick={() => enroll(c.id)}>Enroll</button>
<Link to={`/courses/${c.id}/assignments`}>Assignments</Link>
</li>
))}
</ul>
</div>
)
}