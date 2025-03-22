import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import WalletConnect from './components/ConnectWallet'
import ClientDash from './components/ClientDash'
import Freedash from './components/Freedash'
import FreeProfile from './components/FreeProfile'
import FreeProfileEdit from './components/FreeProfileEdit'
import ProjectDescription from './components/Projectdesc'
import Login from './components/Login'
function App() {

  return (
    <>
    <Router>
    {/* <WalletConnect/> */}
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/clientdashboard" element={<ClientDash/>}/>
      <Route path="/freelancedashboard" element={<Freedash/>}/>
      <Route path="/profile" element={<FreeProfile/>}/>
      <Route path="/profile/edit" element={<FreeProfileEdit/>}/>
      <Route path="/project/projectdesc" element={<ProjectDescription/>}/>
    </Routes>
    </Router>
    </>
  )
}

export default App
