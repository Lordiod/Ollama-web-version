import { useState } from 'react'
import Auth from '../components/Auth'
import Chat from '../components/Chat'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <Chat />
      ) : (
        <Auth onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  )
}
