'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/Topbar';
import type { Role } from '@/components/Topbar';
import styles from './layout.module.scss';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [role,        setRole]        = useState<Role>('viewer');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const PAGE_TITLES: Record<string, string> = {
        '/':              'Overview',
        '/transactions':  'Transactions',
        '/insights':      'Insights',
        '/settings':      'Settings',
        '/users':         'Users',
    };
    const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

    return (
        <div className={styles.shell}>
            <Sidebar
                role={role}
                activeRoute={pathname}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className={styles.body}>
                <TopBar
                    role={role}
                    onRoleChange={setRole}
                    onMenuClick={() => setSidebarOpen(true)}
                    pageTitle={pageTitle}
                />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}