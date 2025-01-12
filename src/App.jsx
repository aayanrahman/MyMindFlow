import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SideBar from './components/sidebar/sidebar'
import UserChats from './components/userchats/userChats'

function App() {
  return (
    <div>
      <SideBar />
      <UserChats />
    </div>
  )
}

export default App
