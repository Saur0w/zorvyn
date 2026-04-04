'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Bell, ChevronDown, Plus, Search,
    Shield, Eye, Menu, X, Check,
} from 'lucide-react';
import styles from './style.module.scss';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'viewer';

interface Notification {
    id: number;
    title: string;
    desc: string;
    time: string;
    unread: boolean;
}

interface TopBarProps {
    role: Role;
    onRoleChange: (role: Role) => void;
    onMenuClick: () => void;
    pageTitle?: string;
}

// ─── Mock Notifications ──────────────────────────────────────────────────────

const NOTIFICATIONS: Notification[] = [
    { id: 1, title: 'Salary credited',       desc: '$9,800 has been deposited.',         time: '2m ago',  unread: true  },
    { id: 2, title: 'Spending alert',         desc: 'You hit 80% of food budget.',        time: '1h ago',  unread: true  },
    { id: 3, title: 'New transaction',        desc: 'Netflix charged $15.99.',            time: '3h ago',  unread: true  },
    { id: 4, title: 'Monthly report ready',   desc: 'March summary is available.',        time: '1d ago',  unread: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function TopBar({
                                   role,
                                   onRoleChange,
                                   onMenuClick,
                                   pageTitle = 'Overview',
                               }: TopBarProps) {
    const [roleOpen,   setRoleOpen]   = useState(false);
    const [notifOpen,  setNotifOpen]  = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query,      setQuery]      = useState('');

    const barRef      = useRef<HTMLElement>(null);
    const titleRef    = useRef<HTMLDivElement>(null);
    const actionsRef  = useRef<HTMLDivElement>(null);
    const searchRef   = useRef<HTMLInputElement>(null);
    const notifRef    = useRef<HTMLDivElement>(null);
    const roleRef     = useRef<HTMLDivElement>(null);

    const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

    // ── Entrance animation ───────────────────────────────────────────────────
    useEffect(() => {
        const run = async () => {
            const gsap = (await import('gsap')).default;
            if (!barRef.current) return;

            gsap.fromTo(
                barRef.current,
                { y: -56, opacity: 0 },
                { y: 0,   opacity: 1, duration: 0.55, ease: 'power3.out' }
            );

            if (titleRef.current) {
                gsap.fromTo(
                    titleRef.current,
                    { x: -16, opacity: 0 },
                    { x: 0,   opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.18 }
                );
            }

            if (actionsRef.current) {
                const items = actionsRef.current.querySelectorAll('[data-action]');
                gsap.fromTo(
                    items,
                    { y: -10, opacity: 0 },
                    { y: 0,   opacity: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.22 }
                );
            }
        };
        run();
    }, []);

    // ── Dropdown animation helper ────────────────────────────────────────────
    const animateDropdown = async (el: HTMLElement | null) => {
        if (!el) return;
        const gsap = (await import('gsap')).default;
        gsap.fromTo(
            el,
            { y: -8, opacity: 0, scale: 0.96 },
            { y: 0,  opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' }
        );
    };

    // Role dropdown open → animate
    useEffect(() => {
        if (roleOpen) animateDropdown(roleRef.current);
    }, [roleOpen]);

    // Notif dropdown open → animate
    useEffect(() => {
        if (notifOpen) animateDropdown(notifRef.current);
    }, [notifOpen]);

    // Search open → focus input
    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => searchRef.current?.focus(), 50);
        } else {
            setQuery('');
        }
    }, [searchOpen]);

    // Close all dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest('[data-role-dd]'))  setRoleOpen(false);
            if (!t.closest('[data-notif-dd]')) setNotifOpen(false);
            if (!t.closest('[data-search-dd]')) setSearchOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className={styles.bar} ref={barRef}>

            {/* ── Left ────────────────────────────────────────────────────────── */}
            <div className={styles.left}>
                {/* Hamburger — mobile only */}
                <button
                    className={styles.menuBtn}
                    onClick={onMenuClick}
                    aria-label="Toggle sidebar"
                    data-action
                >
                    <Menu size={18} />
                </button>

                {/* Page title */}
                <div className={styles.titleWrap} ref={titleRef}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <span className={styles.breadcrumb}>
            Finora <span className={styles.sep}>/</span> {pageTitle}
          </span>
                </div>
            </div>

            {/* ── Right ───────────────────────────────────────────────────────── */}
            <div className={styles.actions} ref={actionsRef}>

                {/* Search */}
                <div className={styles.searchWrap} data-search-dd data-action>
                    {searchOpen ? (
                        <div className={styles.searchBox}>
                            <Search size={13} className={styles.searchIcon} />
                            <input
                                ref={searchRef}
                                className={styles.searchInput}
                                placeholder="Search transactions…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                className={styles.searchClose}
                                onClick={() => setSearchOpen(false)}
                                aria-label="Close search"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className={styles.iconBtn}
                            onClick={() => setSearchOpen(true)}
                            aria-label="Open search"
                        >
                            <Search size={16} />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <div className={styles.notifWrap} data-notif-dd data-action>
                    <button
                        className={styles.iconBtn}
                        onClick={() => setNotifOpen(!notifOpen)}
                        aria-label={`Notifications (${unreadCount} unread)`}
                    >
                        <Bell size={16} />
                        {unreadCount > 0 && (
                            <span className={styles.badge}>{unreadCount}</span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className={styles.notifDropdown} ref={notifRef}>
                            <div className={styles.notifHeader}>
                                <span className={styles.notifTitle}>Notifications</span>
                                <span className={styles.notifCount}>{unreadCount} new</span>
                            </div>

                            <ul className={styles.notifList}>
                                {NOTIFICATIONS.map((n) => (
                                    <li
                                        key={n.id}
                                        className={`${styles.notifItem} ${n.unread ? styles.notifItemUnread : ''}`}
                                    >
                                        <div className={styles.notifDot}>
                                            {n.unread && <span className={styles.unreadDot} />}
                                        </div>
                                        <div className={styles.notifBody}>
                                            <span className={styles.notifItemTitle}>{n.title}</span>
                                            <span className={styles.notifDesc}>{n.desc}</span>
                                            <span className={styles.notifTime}>{n.time}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.notifFooter}>
                                <button className={styles.markAllBtn}>
                                    <Check size={11} /> Mark all as read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Role switcher */}
                <div className={styles.roleWrap} data-role-dd data-action>
                    <button
                        className={styles.roleBtn}
                        onClick={() => setRoleOpen(!roleOpen)}
                        aria-haspopup="listbox"
                        aria-expanded={roleOpen}
                    >
                        <span className={`${styles.rolePip} ${styles[`rolePip_${role}`]}`} />
                        <span className={styles.roleLabel}>
              {role === 'admin' ? 'Admin' : 'Viewer'}
            </span>
                        <ChevronDown
                            size={12}
                            className={`${styles.chevron} ${roleOpen ? styles.chevronOpen : ''}`}
                        />
                    </button>

                    {roleOpen && (
                        <div className={styles.roleDropdown} ref={roleRef} role="listbox">
                            {(['viewer', 'admin'] as Role[]).map((r) => (
                                <button
                                    key={r}
                                    className={`${styles.roleOption} ${role === r ? styles.roleOptionActive : ''}`}
                                    onClick={() => { onRoleChange(r); setRoleOpen(false); }}
                                    role="option"
                                    aria-selected={role === r}
                                >
                                    <span className={`${styles.rolePip} ${styles[`rolePip_${r}`]}`} />
                                    <span>
                    {r === 'admin'
                        ? <><Shield size={11} /> Admin</>
                        : <><Eye size={11} /> Viewer</>
                    }
                  </span>
                                    {role === r && <Check size={11} className={styles.checkIcon} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Transaction — admin only */}
                {role === 'admin' && (
                    <button className={styles.addBtn} data-action>
                        <Plus size={14} />
                        <span className={styles.addBtnLabel}>Add</span>
                    </button>
                )}

            </div>
        </header>
    );
}