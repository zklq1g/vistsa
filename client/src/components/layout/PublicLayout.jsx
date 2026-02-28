import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const PublicLayout = () => {
    return (
        <div className="has-custom-cursor" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            <footer style={{
                padding: 'var(--space-2xl) var(--space-xl)',
                borderTop: '1px solid var(--c-border)',
                textAlign: 'center',
                color: 'var(--c-text-muted)',
                fontSize: '0.875rem'
            }}>
                <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--c-text)', fontSize: '1.25rem', marginBottom: 'var(--space-sm)' }}>
                    VISTA
                </p>
                <p>A Computer Vision Initiative at KIIT University</p>
                <p style={{ marginTop: 'var(--space-lg)', opacity: 0.5 }}>© {new Date().getFullYear()} VISTA. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PublicLayout;
