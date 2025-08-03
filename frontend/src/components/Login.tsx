import {  useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { useToast } from './ui/use-toast'
import { useAuthStore } from '../store/auth'
import { login, getCurrentUser } from '../services/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { setToken, setIsAdmin } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { access } = await login(username, password)
      setToken(access)
      const user = await getCurrentUser(username)
      
      console.log(access)
      setIsAdmin(user.is_staff)
      navigate(user.is_staff ? '/users' : '/')
      toast('Logged in successfully' ,{ title: 'Success', description: 'Logged in successfully' })
    } catch (error) {
      toast('Invalid credentials',{ title: 'Error', description: 'Invalid credentials', variant: 'destructive' })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Task Manager</CardTitle>
          <CardDescription>Sign in to manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}