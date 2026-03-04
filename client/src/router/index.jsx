import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/public/Login';
import PublicProjects from '../pages/public/Projects';

// Placeholders for phases 5 & 6
// Dashboard real components
import DashboardHome from '../pages/dashboard/Projects';
import Leaderboard from '../pages/dashboard/Leaderboard';
import StudyWing from '../pages/dashboard/StudyWing';
import Events from '../pages/dashboard/Events';
import AdminApprovalQueue from '../pages/admin/ApprovalQueue';
import AdminLeaderboard from '../pages/admin/ManageLeaderboard';
import AdminMembers from '../pages/admin/ManageMembers';
import AdminEvents from '../pages/admin/ManageEvents';
import AdminStudy from '../pages/admin/ManageStudy';
import AdminStats from '../pages/admin/ManageStats';
import ModeratorHome from '../pages/moderator/ModeratorHome';

// Import real Home page
import Home from '../pages/public/Home';

const AppRouter = () => {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/projects" element={<PublicProjects />} />
                </Route>

                {/* PROTECTED ROUTES - MEMBERS */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['MEMBER', 'MOD', 'ADMIN']}>
                            <DashboardLayout requireAdmin={false} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardHome />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="study" element={<StudyWing />} />
                    <Route path="events" element={<Events />} />
                </Route>

                {/* PROTECTED ROUTES - ADMIN */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['MOD', 'ADMIN']}>
                            <DashboardLayout requireAdmin={true} />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminApprovalQueue />} />
                    <Route path="leaderboard" element={<AdminLeaderboard />} />
                    <Route path="members" element={<AdminMembers />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="study" element={<AdminStudy />} />
                    <Route path="stats" element={<AdminStats />} />
                </Route>

                {/* PROTECTED ROUTES - MODERATOR */}
                <Route
                    path="/moderator"
                    element={
                        <ProtectedRoute allowedRoles={['MOD', 'ADMIN']}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ModeratorHome />} />
                    <Route path="approval" element={<AdminApprovalQueue />} />
                    <Route path="leaderboard" element={<AdminLeaderboard />} />
                    <Route path="members" element={<AdminMembers />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="study" element={<AdminStudy />} />
                </Route>

                {/* 404 FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AppRouter;
