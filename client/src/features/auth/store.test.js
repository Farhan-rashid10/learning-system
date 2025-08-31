import { describe, it, expect } from 'vitest'
import { useAuth } from './store'

describe('auth store', () => {
  it('sets and clears auth', () => {
    useAuth.getState().setAuth({ user:{id:1,name:'A',email:'a@a',role:'student'}, access_token:'x', refresh_token:'y' })
    expect(useAuth.getState().user?.email).toBe('a@a')
    useAuth.getState().logout()
    expect(useAuth.getState().user).toBeNull()
  })
})
