import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import NewCampaign from './pages/NewCampaign'
import CampaignDetail from './pages/CampaignDetail'
import Settings from './pages/Settings'
import Layout from './components/Layout'
import PageLoader from './components/PageLoader'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? <Navigate to="/dashboard" /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121e',
              color: '#d0d0e8',
              border: '1px solid #2e2e4a',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#c6f135', secondary: '#07070d' } },
            error: { iconTheme: { primary: '#ff5c3a', secondary: '#07070d' } },
          }}
        />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
            <Route path="/campaign/new" element={<PrivateRoute><Layout><NewCampaign /></Layout></PrivateRoute>} />
            <Route path="/campaign/:id" element={<PrivateRoute><Layout><CampaignDetail /></Layout></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  )
}