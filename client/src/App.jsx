import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewCampaign from "./pages/NewCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import PageLoader from "./components/PageLoader";
import { TooltipProvider } from "./components/Tooltip";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to="/dashboard" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(12px)",
                color: "#f1f5f9",
                border: "1px solid rgba(236, 72, 153, 0.3)",
                borderRadius: "16px",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "0.875rem",
                padding: "12px 16px",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#0f172a" },
                style: {
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#0f172a" },
                style: {
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                },
              },
            }}
          />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaign/new"
                element={
                  <PrivateRoute>
                    <Layout>
                      <NewCampaign />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/campaign/:id"
                element={
                  <PrivateRoute>
                    <Layout>
                      <CampaignDetail />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
