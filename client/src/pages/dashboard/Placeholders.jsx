import React from 'react';

const PlaceholderPage = ({ title }) => {
    return (
        <div>
            <h1 style={{ marginBottom: 'var(--space-md)' }}>{title}</h1>
            <p style={{ color: 'var(--c-text-muted)' }}>This page is being implemented in Phase 5/6.</p>
        </div>
    );
};

export const DashboardHome = () => <PlaceholderPage title="Member Dashboard (Projects)" />;
export const Leaderboard = () => <PlaceholderPage title="Leaderboard" />;
export const StudyWing = () => <PlaceholderPage title="Study Resources" />;
export const Events = () => <PlaceholderPage title="Society Events" />;

export const AdminHome = () => <PlaceholderPage title="Admin Approval Queue" />;
export const AdminLeaderboard = () => <PlaceholderPage title="Manage Leaderboard" />;
export const AdminMembers = () => <PlaceholderPage title="Manage Members" />;
export const AdminEvents = () => <PlaceholderPage title="Manage Events" />;
export const AdminStudy = () => <PlaceholderPage title="Manage Study Resources" />;
