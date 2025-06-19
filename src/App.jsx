import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PrivateRoute from './pages/PrivateRoute'
import TaskList from './pages/TaskList'
import Goals from './pages/Goals'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
        <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={
           <PrivateRoute>
           <Home />
          </PrivateRoute>
         } />

         <Route path="/tasks" element={
          <PrivateRoute>
          <TaskList />
         </PrivateRoute>
         }/>

         <Route path="/goals" element={
          <PrivateRoute>
          <Goals />
          </PrivateRoute>
         }/>

      </Routes>

      <ToastContainer position="top-right" autoClose={5000} />
    </Router>
  )
}

export default App
