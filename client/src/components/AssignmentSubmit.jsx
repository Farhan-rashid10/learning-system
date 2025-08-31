import { useParams } from 'react-router-dom'
import { useState } from 'react'
import api from '../lib/api'


export default function AssignmentSubmit() {
const { id } = useParams()
const [content, setContent] = useState('')
const [msg, setMsg] = useState('')


async function submit(e) {
e.preventDefault()
try {
await api.post(`/assignments/${id}/submissions`, { content })
setMsg('Submitted!')
setContent('')
} catch (err) {
setMsg(err.response?.data?.msg || 'Submit failed')
}
}


return (
<div style={{ padding: 24 }}>
<h2>Submit Assignment</h2>
<form onSubmit={submit}>
<textarea rows={6} value={content} onChange={e=>setContent(e.target.value)} placeholder="Paste URL or write your answer" />
<button type="submit">Submit</button>
</form>
{msg && <p>{msg}</p>}
</div>
)
}