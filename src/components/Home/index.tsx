'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
    ArrowUpRight, ArrowDownRight, Wallet, TrendingUp,
    ShoppingCart, MoveRight, ChevronRight,
} from 'lucide-react';
import type { Context } from 'gsap';
import styles from './style.module.scss';
import Link from 'next/link';

type TxType = 'income' | 'expense';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: TxType;
}

interface SummaryCard {
    label: string;
    value: number;
    prefix: string;
    change: number;
    changeLabel: string;
    positive: boolean;
    icon: React.ElementType;
    accent: 'blue' | 'green' | 'red';
}

const BALANCE_TREND = [
    { month: 'Oct', balance: 42000 },
    { month: 'Nov', balance: 38500 },
    { month: 'Dec', balance: 45200 },
    { month: 'Jan', balance: 41800 },
    { month: 'Feb', balance: 51300 },
    { month: 'Mar', balance: 48700 },
    { month: 'Apr', balance: 56240 },
];

const SPENDING = [
    { name: 'Housing',       value: 2800, color: '#6366f1' },
    { name: 'Food & Dining', value: 1240, color: '#00d9b8' },
    { name: 'Transport',     value: 650,  color: '#f59e0b' },
    { name: 'Utilities',     value: 420,  color: '#8b5cf6' },
    { name: 'Entertainment', value: 380,  color: '#ec4899' },
    { name: 'Others',        value: 310,  color: '#475569' },
];

const TRANSACTIONS: Transaction[] = [
    { id: 1, date: 'Apr 01', description: 'Salary Deposit',       category: 'Income',       amount:  9800,  type: 'income'  },
    { id: 2, date: 'Mar 30', description: 'Rent Payment',         category: 'Housing',      amount: -2800,  type: 'expense' },
    { id: 3, date: 'Mar 29', description: 'Grocery Store',        category: 'Food & Dining',amount: -186,   type: 'expense' },
    { id: 4, date: 'Mar 28', description: 'Freelance Payment',    category: 'Income',       amount:  1500,  type: 'income'  },
    { id: 5, date: 'Mar 27', description: 'Netflix Subscription', category: 'Entertainment',amount: -15.99, type: 'expense' },
    { id: 6, date: 'Mar 26', description: 'Electric Bill',        category: 'Utilities',    amount: -124,   type: 'expense' },
];

const SUMMARY_CARDS: SummaryCard[] = [
    {
        label: 'Total Balance', value: 56240, prefix: '$',
        change: 15.4, changeLabel: 'vs last month',
        positive: true, icon: Wallet, accent: 'blue',
    },
    {
        label: 'Monthly Income', value: 9800, prefix: '$',
        change: 10.1, changeLabel: 'vs last month',
        positive: true, icon: TrendingUp, accent: 'green',
    },
    {
        label: 'Monthly Expenses', value: 5100, prefix: '$',
        change: 2.4, changeLabel: 'vs last month',
        positive: false, icon: ShoppingCart, accent: 'red',
    },
];

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
    });
}

// Fixed standard 'any' cast by explicitly setting standard Recharts Tooltip shape
interface CustomTooltipProps {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
}

const ChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipMonth}>{label}</span>
            <span className={styles.tooltipVal}>
        ${payload[0].value.toLocaleString()}
      </span>
        </div>
    );
};

export default function Overview() {
    const [isMounted, setIsMounted] = useState(false);
    const greetRef      = useRef<HTMLSpanElement>(null);
    const nameRef       = useRef<HTMLSpanElement>(null);
    const cardsRef      = useRef<HTMLDivElement>(null);
    const chartsRef     = useRef<HTMLElement>(null);
    const txRef         = useRef<HTMLElement>(null);
    const counterRefs   = useRef<(HTMLSpanElement | null)[]>([]);

    // Prevent hydration mismatch for dynamic charts
    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!isMounted) return;

        let ctx: Context;

        const run = async () => {
            const gsapMod = await import('gsap');
            const gsap = gsapMod.default;
            const { SplitText } = await import('gsap/SplitText');
            const { ScrollTrigger } = await import('gsap/ScrollTrigger');

            gsap.registerPlugin(SplitText, ScrollTrigger);
            ctx = gsap.context(() => {
                if (greetRef.current && nameRef.current) {
                    const splitGreet = new SplitText(greetRef.current, { type: 'chars' });
                    const splitName  = new SplitText(nameRef.current,  { type: 'chars' });

                    gsap.fromTo(
                        splitGreet.chars,
                        { y: 32, opacity: 0, rotateX: -60 },
                        {
                            y: 0, opacity: 1, rotateX: 0,
                            duration: 0.7,
                            stagger: 0.028,
                            ease: 'power3.out',
                            transformOrigin: '50% 100%',
                        }
                    );

                    gsap.fromTo(
                        splitName.chars,
                        { y: 32, opacity: 0, rotateX: -60 },
                        {
                            y: 0, opacity: 1, rotateX: 0,
                            duration: 0.7,
                            stagger: 0.032,
                            ease: 'power3.out',
                            transformOrigin: '50% 100%',
                            delay: 0.18,
                        }
                    );
                }

                counterRefs.current.forEach((el, i) => {
                    if (!el) return;
                    const target = SUMMARY_CARDS[i].value;
                    // FIX TS2554: gsap.to takes 2 args, gsap.fromTo takes 3. Using object to avoid 'this' issues.
                    const counter = { val: 0 };

                    gsap.to(counter, {
                        val: target,
                        duration: 1.6,
                        delay: 0.55 + i * 0.12,
                        ease: 'power2.out',
                        onUpdate: () => {
                            if (el) {
                                el.textContent = Math.round(counter.val).toLocaleString();
                            }
                        },
                    });
                });

                if (cardsRef.current) {
                    const cards = cardsRef.current.querySelectorAll('[data-card]');
                    gsap.fromTo(
                        cards,
                        { y: 40, opacity: 0, scale: 0.97 },
                        {
                            y: 0, opacity: 1, scale: 1,
                            duration: 0.65,
                            stagger: 0.1,
                            ease: 'power3.out',
                            delay: 0.45,
                        }
                    );
                }

                if (chartsRef.current) {
                    const children = chartsRef.current.querySelectorAll('[data-scroll]');
                    gsap.fromTo(
                        children,
                        { y: 50, opacity: 0 },
                        {
                            y: 0, opacity: 1,
                            duration: 0.7,
                            stagger: 0.12,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: chartsRef.current,
                                start: 'top 85%',
                            },
                        }
                    );
                }

                if (txRef.current) {
                    const rows = txRef.current.querySelectorAll('[data-tx]');
                    gsap.fromTo(
                        rows,
                        { x: -20, opacity: 0 },
                        {
                            x: 0, opacity: 1,
                            duration: 0.5,
                            stagger: 0.07,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: txRef.current,
                                start: 'top 88%',
                            },
                        }
                    );
                }
            });
        };

        run();
        return () => ctx?.revert();
    }, [isMounted]);

    const totalSpend = SPENDING.reduce((a, b) => a + b.value, 0);

    return (
        <div className={styles.root}>
            <header className={styles.hero}>
                <div className={styles.heroLeft}>
                    <div className={styles.greetingWrap}>
                        <p className={styles.greeting}>
                            {/* suppressHydrationWarning added for Next.js SSR compatibility */}
                            <span ref={greetRef} className={styles.greetText} suppressHydrationWarning>
                {getGreeting()},
              </span>
                            {' '}
                            <span ref={nameRef} className={styles.greetName}>Saurow</span>
                        </p>
                    </div>
                    <p className={styles.dateLine} suppressHydrationWarning>{formatDate()}</p>
                    <p className={styles.heroSubtitle}>
                        Here&apos;s what&rsquo;s happening with your money today.
                    </p>
                </div>

                <div className={styles.heroRight}>
                    <div className={styles.netWorthPill}>
                        <span className={styles.nwLabel}>Net Worth</span>
                        <span className={styles.nwValue}>$56,240</span>
                        <span className={styles.nwChange}>
              <ArrowUpRight size={12} /> 15.4%
            </span>
                    </div>
                </div>
            </header>

            <section className={styles.cardsGrid} ref={cardsRef}>
                {SUMMARY_CARDS.map((card, i) => (
                    <div
                        key={card.label}
                        className={`${styles.card} ${styles[`card_${card.accent}`]}`}
                        data-card
                    >
                        <div className={styles.cardTop}>
                            <span className={styles.cardLabel}>{card.label}</span>
                            <div className={`${styles.cardIconWrap} ${styles[`cardIconWrap_${card.accent}`]}`}>
                                <card.icon size={14} />
                            </div>
                        </div>

                        <div className={styles.cardValueRow}>
                            <span className={styles.cardPrefix}>{card.prefix}</span>
                            <span
                                className={styles.cardValue}
                                ref={(el) => { counterRefs.current[i] = el; }}
                            >
                0
              </span>
                        </div>

                        <div className={`${styles.cardChange} ${card.positive ? styles.cardChangePos : styles.cardChangeNeg}`}>
                            {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            <span>{card.change}% {card.changeLabel}</span>
                        </div>

                        <div className={`${styles.cardBar} ${styles[`cardBar_${card.accent}`]}`} />
                    </div>
                ))}
            </section>

            {/* Only render charts when mounted to prevent recharts hydration mismatch */}
            {isMounted && (
                <section className={styles.chartsSection} ref={chartsRef}>
                    <div className={styles.chartBlock} data-scroll>
                        <div className={styles.chartHead}>
                            <div>
                                <h3 className={styles.chartTitle}>Balance Trend</h3>
                                <span className={styles.chartSub}>Oct 2024 – Apr 2025</span>
                            </div>
                            <div className={styles.liveBadge}>
                                <span className={styles.liveDot} />
                                Live
                            </div>
                        </div>

                        <div className={styles.chartArea}>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={BALANCE_TREND} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
                                    <defs>
                                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0}   />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }}
                                        axisLine={false} tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }}
                                        axisLine={false} tickLine={false}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.25)', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone" dataKey="balance"
                                        stroke="#6366f1" strokeWidth={2}
                                        fill="url(#grad)" dot={false}
                                        activeDot={{ r: 4, fill: '#6366f1', stroke: '#060810', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={styles.chartBlock} data-scroll>
                        <div className={styles.chartHead}>
                            <div>
                                <h3 className={styles.chartTitle}>Spending</h3>
                                <span className={styles.chartSub}>This month</span>
                            </div>
                            <span className={styles.spendTotal}>${totalSpend.toLocaleString()}</span>
                        </div>

                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={SPENDING} cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={72}
                                    paddingAngle={3} dataKey="value"
                                    startAngle={90} endAngle={-270}
                                >
                                    {SPENDING.map((s, i) => (
                                        <Cell key={i} fill={s.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    // Fixed Recharts Types by allowing union parameters
                                    formatter={(value: number | string | (number | string)[]) => {
                                        const parsed = typeof value === 'number' ? value : Number(value);
                                        return [`$${parsed.toLocaleString()}`, ''];
                                    }}
                                    contentStyle={{
                                        background: '#0f1625',
                                        border: '1px solid rgba(99,102,241,0.25)',
                                        borderRadius: '8px',
                                        color: '#f1f5f9',
                                        fontSize: '12px',
                                        fontFamily: 'DM Sans',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <ul className={styles.legend}>
                            {SPENDING.map((s) => (
                                <li key={s.name} className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: s.color }} />
                                    <span className={styles.legendName}>{s.name}</span>
                                    <span className={styles.legendVal}>${s.value.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className={styles.txSection} ref={txRef}>
                <div className={styles.txHead}>
                    <div>
                        <h3 className={styles.chartTitle}>Recent Transactions</h3>
                        <span className={styles.chartSub}>Last 6 entries</span>
                    </div>
                    <Link href="/transactions" className={styles.viewAll}>
                        View all <MoveRight size={13} />
                    </Link>
                </div>

                <div className={styles.txList}>
                    {TRANSACTIONS.map((tx) => (
                        <div key={tx.id} className={styles.txRow} data-tx>
                            <div className={`${styles.txIcon} ${tx.type === 'income' ? styles.txIconIn : styles.txIconOut}`}>
                                {tx.type === 'income' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            </div>

                            <div className={styles.txBody}>
                                <span className={styles.txDesc}>{tx.description}</span>
                                <span className={styles.txMeta}>
                  {tx.category}
                                    <span className={styles.txDot}>·</span>
                                    {tx.date}
                </span>
                            </div>

                            <span className={`${styles.txAmt} ${tx.type === 'income' ? styles.txAmtIn : styles.txAmtOut}`}>
                {tx.type === 'income' ? '+' : '−'}${Math.abs(tx.amount).toLocaleString()}
              </span>

                            <ChevronRight size={13} className={styles.txArrow} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}