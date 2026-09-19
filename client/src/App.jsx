import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Monitors from "./pages/Monitors";
import MonitorDetails from "./pages/MonitorDetails";
import Incidents from "./pages/Incidents";
import Maintenance from "./pages/Maintenance";
import PublicStatus from "./pages/PublicStatus";

export default function App() {
    return (
        <AuthProvider>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/status/:userId" element={<PublicStatus />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/monitors" element={
                        <ProtectedRoute><Monitors /></ProtectedRoute>
                    } />
                    <Route path="/monitors/:id" element={
                        <ProtectedRoute><MonitorDetails /></ProtectedRoute>
                    } />
                    <Route path="/incidents" element={
                        <ProtectedRoute><Incidents /></ProtectedRoute>
                    } />
                    <Route path="/maintenance" element={
                        <ProtectedRoute><Maintenance /></ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Layout>
        </AuthProvider>
    );
}
