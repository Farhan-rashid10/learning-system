import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../lib/api'


export default function CourseAssignments() {
const { id } = useParams()
const role = localStorage.getItem('role')
const [items, setItems] = useState([])
const [form, setForm] = useState({ title: '', description: '', due_date: '', points: 100 })


async function load() {
const { data } = await api.get(`/courses/${id}/assignments`)
setItems(data)
}
useEffect(() => { load() }, [id])


async function create(e) {
e.preventDefault()
await api.post(`/courses/${id}/assignments`, form)
setForm({ title: '', description: '', due_date: '', points: 100 })
load()
}


async function remove(aid) {
await api.delete(`/assignments/${aid}`)
load()
}


return (
<div style={{ padding: 24 }}>
<h2>Assignments</h2>


{(role === 'admin' || role === 'instructor') && (
<form onSubmit={create}>
<input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
<input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
<input placeholder="Due ISO (YYYY-MM-DDTHH:MM)" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} />
<input type="number" placeholder="Points" value={form.points} onChange={e=>setForm({...form, points:e.target.value})} />
<button type="submit">Add</button>
</form>
)}


<ul>
{items.map(a => (
<li key={a.id}>
{a.title} ({a.points})
{(role === 'admin' || role === 'instructor') && (
<button onClick={() => remove(a.id)}>Delete</button>
)}
</li>
))}
</ul>
</div>
)
}