import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './layouts/MainLayout'
import PatientPage from './pages/PatientPage'
import SessionPage from './pages/SessionPage'
import ViewSessionPage from './pages/ViewSessionPage'
import DashboardPage from './pages/DashboardPage'

import VideoCallPage from './pages/VideoCallPage'
import VideoCallLayout from './layouts/VideoCallLayout'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import Error404Page from './pages/Error404Page'

import { Navigate } from 'react-router-dom'


function Logout() {
  localStorage.clear()
  return <Navigate to="/login/" />
}


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Main app layout and its children */}
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <ProtectedRoute>
              <ViewSessionPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route element={<VideoCallLayout />}>
        <Route
          path="/video-call"
          element={
            <ProtectedRoute>
              <VideoCallPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Error404Page />} />
      <Route path="/logout" element={<Logout />} />
    </>
  )
)

function App() {
  return <RouterProvider router={router} />
}

export default App
