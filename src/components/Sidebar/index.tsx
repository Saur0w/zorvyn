'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    LayoutDashboard, CreditCard, BarChart3,
    Users, Settings, LogOut, Shield, Eye,
    ChevronRight, TrendingUp,
} from 'lucide-react';
import styles from './style.module.scss';

export type Role = 'admin' | 'viewer';

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
    badge?: number;
    adminOnly?: boolean;
}

interface SidebarProps {
    role: Role;
    activeRoute?: string;
    isOpen: boolean;
    onClose: () => void;
}

const NAV_MAIN: NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview',     href: '/'              },
    { icon: CreditCard,      label: 'Transactions', href: '/transactions', badge: 3 },
    { icon: BarChart3,       label: 'Insights',     href: '/insights'      },
];

const NAV_MANAGE: NavItem[] = [
    { icon: Users,    label: 'Users',    href: '/users',    adminOnly: true },
    { icon: Settings, label: 'Settings', href: '/settings'                  },
];

function NavGroup({
                      label,
                      items,
                      role,
                      activeRoute,
                  }: {
    label: string;
    items: NavItem[];
    role: Role;
    activeRoute: string;
}) {
    const visible = items.filter((it) => !it.adminOnly || role === 'admin');
    if (!visible.length) return null;

    return (
        <div className={styles.navGroup}>
            <span className={styles.navGroupLabel}>{label}</span>
            {visible.map((item) => {
                const active = activeRoute === item.href;
                return (
                    <a
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                        aria-current={active ? 'page' : undefined}
                    >
            <span className={`${styles.navIcon} ${active ? styles.navIconActive : ''}`}>
              <item.icon size={15} />
            </span>

                        <span className={styles.navLabel}>{item.label}</span>

                        {item.badge ? (
                            <span className={styles.navBadge}>{item.badge}</span>
                        ) : active ? (
                            <ChevronRight size={12} className={styles.navChevron} />
                        ) : null}
                    </a>
                );
            })}
        </div>
    );
}

export default function Sidebar({ role, activeRoute = '/', isOpen, onClose }: SidebarProps) {
    const sidebarRef  = useRef<HTMLElement>(null);
    const logoRef     = useRef<HTMLDivElement>(null);
    const navRef      = useRef<HTMLDivElement>(null);
    const footerRef   = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const run = async () => {
            const gsap = (await import('gsap')).default;

            if (!logoRef.current || !navRef.current || !footerRef.current) return;

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(
                logoRef.current,
                { x: -24, opacity: 0 },
                { x: 0,   opacity: 1, duration: 0.5 }
            )
                .fromTo(
                    navRef.current.querySelectorAll('[data-nav]'),
                    { x: -18, opacity: 0 },
                    { x: 0,   opacity: 1, duration: 0.45, stagger: 0.055 },
                    '-=0.25'
                )
                .fromTo(
                    footerRef.current,
                    { y: 12, opacity: 0 },
                    { y: 0,  opacity: 1, duration: 0.4 },
                    '-=0.2'
                );
        };

        run();
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    return (
        <>
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                ref={sidebarRef}
                className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${mounted ? styles.sidebarMounted : ''}`}
                aria-label="Main navigation"
            >
                <div className={styles.logo} ref={logoRef}>
                    <div className={styles.logoMark}>
                        <TrendingUp size={14} strokeWidth={2.5} />
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.logoName}>Finora</span>
                        <span className={styles.logoTagline}>Finance</span>
                    </div>
                </div>

                <div className={styles.balanceSnap} data-nav>
                    <span className={styles.bsLabel}>Total Balance</span>
                    <span className={styles.bsValue}>$56,240</span>
                    <div className={styles.bsBar}>
                        <div className={styles.bsBarFill} style={{ width: '68%' }} />
                    </div>
                    <span className={styles.bsHint}>68% of monthly goal</span>
                </div>
                <nav className={styles.nav} ref={navRef} aria-label="Site navigation">
                    <div data-nav>
                        <NavGroup
                            label="Menu"
                            items={NAV_MAIN}
                            role={role}
                            activeRoute={activeRoute}
                        />
                    </div>
                    <div data-nav>
                        <NavGroup
                            label="Manage"
                            items={NAV_MANAGE}
                            role={role}
                            activeRoute={activeRoute}
                        />
                    </div>
                </nav>

                <div className={styles.footer} ref={footerRef}>
                    <div className={`${styles.roleBadge} ${styles[`roleBadge_${role}`]}`}>
                        {role === 'admin'
                            ? <><Shield size={11} /> Admin access</>
                            : <><Eye size={11} /> View only</>
                        }
                    </div>
                    <div className={styles.userRow}>
                        <div className={styles.avatar}>
                            <span>SA</span>
                            <span className={styles.avatarOnline} />
                        </div>

                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Saurow</span>
                            <span className={styles.userEmail}>sauroww@gmail.com</span>
                        </div>

                        <button className={styles.logoutBtn} aria-label="Log out" title="Log out">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}