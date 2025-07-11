import { useState } from 'react'
import Auth from '../components/Auth'
import Chat from '../components/Chat'

interface User {
  id: string
  email: string
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <div className="h-screen overflow-hidden">
      {isLoggedIn && user ? (
        <Chat user={user} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen bg-gray-100">
          <Auth onLogin={handleLogin} />
        </div>
      )}
    </div>
  )
}
