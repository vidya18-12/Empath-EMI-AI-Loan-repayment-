import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BorrowerDirectory from './pages/BorrowerDirectory';
import CallHistory from './pages/CallHistory';
import BehaviorAnalysis from './pages/BehaviorAnalysis';
import AIChatbot from './pages/AIChatbot';

import BorrowerDashboard from './pages/BorrowerDashboard';
import BorrowerPlan from './pages/BorrowerPlan';
import FieldDashboard from './pages/FieldDashboard';
import VisitHistory from './pages/VisitHistory';
import Layout from './components/Layout';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/*"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/field-dashboard" element={<FieldDashboard />} />
                                        <Route path="/visits" element={<VisitHistory />} />
                                        <Route path="/borrower-dashboard" element={<BorrowerDashboard />} />
                                        <Route path="/borrower-plan" element={<BorrowerPlan />} />
                                        <Route path="/borrowers" element={<BorrowerDirectory />} />
                                        <Route path="/analysis" element={<BehaviorAnalysis />} />
                                        <Route path="/ai-chatbot" element={<AIChatbot />} />
                                        <Route path="/calls" element={<CallHistory />} />

                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
