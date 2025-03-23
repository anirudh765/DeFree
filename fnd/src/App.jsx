import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import WalletConnect from './components/ConnectWallet'
import ClientDashboard from './components/ClientDash'
import Freedash from './components/Freedash'
import Profile from './components/FreeProfile'
import FreeProfileEdit from './components/FreeProfileEdit'
import ProjectDescription from './components/Projectdesc'
import Login from './components/Login'
import RaiseDispute from "./components/raisedispute";
import DisputeResolution from "./components/DisputeRes";
import WalletConnect from './components/ConnectWallet'
import CreateJob from './components/CreateJob';
import FreelancerRequests from './components/RequlistFree';

function App() {

  return (
    <>
    <Router>
    
    <Routes>
      <Route path="/" element={<WalletConnect/>} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/clientdashboard" element={<ClientDashboard/>}/>
      <Route path="/freelancedashboard" element={<Freedash/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/profile/edit" element={<FreeProfileEdit/>}/>
      <Route path="/project/projectdesc" element={<ProjectDescription/>}/>
      {/* <Route path="/raisedispute" element={<RaiseDispute/>}/> */}
      <Route path="/dispute-resolution" element={<DisputeResolution/>}/>
      <Route path="/createjob" element={<CreateJob/>}/>
      <Route path="/project/reqlst/${job.id}" element={<FreelancerRequests />}/>
    </Routes>
    </Router>
    </>
  )
}

export default App
