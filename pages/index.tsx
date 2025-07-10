import { useState } from 'react'
import Auth from '../components/Auth'
import Chat from '../components/Chat'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <Chat />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </div>
  )
}
