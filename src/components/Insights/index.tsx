'use client';

import { useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, PolarGrid,
    PolarAngleAxis, Radar, Cell,
} from 'recharts';
import {
    TrendingUp, TrendingDown, AlertCircle,
    Lightbulb, Trophy, Target, ArrowUpRight, Flame,
} from 'lucide-react';
import styles from './style.module.scss';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MONTHLY_COMPARE = [
    { month: 'Oct', income: 8200,  expenses: 5800 },
    { month: 'Nov', income: 8200,  expenses: 6200 },
    { month: 'Dec', income: 9100,  expenses: 7400 },
    { month: 'Jan', income: 9800,  expenses: 5300 },
    { month: 'Feb', income: 9800,  expenses: 5600 },
    { month: 'Mar', income: 11300, expenses: 5100 },
];

const CATEGORY_SPEND = [
    { category: 'Housing',       amount: 2800, budget: 3000, pct: 93 },
    { category: 'Food & Dining', amount: 1240, budget: 1200, pct: 103 },
    { category: 'Transport',     amount: 650,  budget: 800,  pct: 81 },
    { category: 'Utilities',     amount: 420,  budget: 500,  pct: 84 },
    { category: 'Entertainment', amount: 380,  budget: 300,  pct: 127 },
    { category: 'Health',        amount: 310,  budget: 400,  pct: 78 },
    { category: 'Shopping',      amount: 202,  budget: 300,  pct: 67 },
];

const RADAR_DATA = [
    { subject: 'Savings',       A: 78 },
    { subject: 'Budgeting',     A: 62 },
    { subject: 'Investment',    A: 45 },
    { subject: 'Debt Mgmt',     A: 90 },
    { subject: 'Spending Ctrl', A: 55 },
    { subject: 'Income Growth', A: 82 },
];

const INSIGHTS = [
    {
        icon: Flame,
        color: 'red' as const,
        label: 'Highest Category',
        title: 'Housing at $2,800',
        desc: '54.9% of your total monthly expenses — within target range.',
    },
    {
        icon: TrendingUp,
        color: 'green' as const,
        label: 'Best Month',
        title: 'March — $6,200 saved',
        desc: 'Your highest savings month this half-year. Income up 37%.',
    },
    {
        icon: AlertCircle,
        color: 'amber' as const,
        label: 'Over Budget',
        title: 'Entertainment +27%',
        desc: 'Spent $380 against a $300 budget. Consider reviewing subscriptions.',
    },
    {
        icon: Trophy,
        color: 'blue' as const,
        label: 'Savings Rate',
        title: '47.9% this month',
        desc: 'Well above the recommended 20%. You\'re building strong reserves.',
    },
    {
        icon: Target,
        color: 'purple' as const,
        label: 'Net Worth Trend',
        title: '+15.4% MoM growth',
        desc: 'Consistent upward trajectory over the last 7 months.',
    },
    {
        icon: Lightbulb,
        color: 'green' as const,
        label: 'Tip',
        title: 'Redirect entertainment savings',
        desc: 'Cutting $80/mo from entertainment adds ~$960/yr to investments.',
    },
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <span className={styles.tooltipLabel}>{label}</span>
            {payload.map((p: any) => (
                <div key={p.name} className={styles.tooltipRow}>
                    <span className={styles.tooltipDot} style={{ background: p.fill }} />
                    <span className={styles.tooltipName}>{p.name}</span>
                    <span className={styles.tooltipVal}>${p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Insights() {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const run = async () => {
            const gsap = (await import('gsap')).default;
            const { ScrollTrigger } = await import('gsap/ScrollTrigger');
            gsap.registerPlugin(ScrollTrigger);

            if (!rootRef.current) return;

            // Stagger top sections
            const els = rootRef.current.querySelectorAll('[data-anim]');
            gsap.fromTo(els,
                { y: 32, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: 'power3.out' }
            );

            // Budget bars animate width on scroll
            const bars = rootRef.current.querySelectorAll('[data-bar]');
            bars.forEach((bar) => {
                const target = (bar as HTMLElement).dataset.bar || '0';
                gsap.fromTo(bar,
                    { width: '0%' },
                    {
                        width: `${Math.min(parseInt(target), 100)}%`,
                        duration: 1.1,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: bar, start: 'top 90%' },
                    }
                );
            });
        };
        run();
    }, []);

    const lastMonth   = MONTHLY_COMPARE[MONTHLY_COMPARE.length - 1];
    const prevMonth   = MONTHLY_COMPARE[MONTHLY_COMPARE.length - 2];
    const savingsRate = Math.round(((lastMonth.income - lastMonth.expenses) / lastMonth.income) * 100);
    const momChange   = Math.round(((lastMonth.income - prevMonth.income) / prevMonth.income) * 100);

    return (
        <div className={styles.root} ref={rootRef}>

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className={styles.header} data-anim>
                <div>
                    <h2 className={styles.heading}>Insights</h2>
                    <p className={styles.subheading}>Financial health overview · Mar 2025</p>
                </div>
            </div>

            {/* ── KPI Strip ───────────────────────────────────────────────────── */}
            <div className={styles.kpiStrip} data-anim>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Savings Rate</span>
                    <span className={styles.kpiValue}>{savingsRate}%</span>
                    <span className={`${styles.kpiChange} ${styles.kpiChangeUp}`}>
            <ArrowUpRight size={11} /> Excellent
          </span>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Income MoM</span>
                    <span className={styles.kpiValue}>+{momChange}%</span>
                    <span className={`${styles.kpiChange} ${styles.kpiChangeUp}`}>
            <TrendingUp size={11} /> Growing
          </span>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Top Expense</span>
                    <span className={styles.kpiValue}>Housing</span>
                    <span className={`${styles.kpiChange} ${styles.kpiChangeNeutral}`}>
            $2,800 / mo
          </span>
                </div>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Over Budget</span>
                    <span className={styles.kpiValue}>2 cats</span>
                    <span className={`${styles.kpiChange} ${styles.kpiChangeDown}`}>
            <TrendingDown size={11} /> Needs review
          </span>
                </div>
            </div>

            {/* ── Charts Row ──────────────────────────────────────────────────── */}
            <div className={styles.chartsRow}>

                {/* Monthly Income vs Expenses */}
                <div className={styles.chartCard} data-anim>
                    <div className={styles.chartHead}>
                        <div>
                            <h3 className={styles.chartTitle}>Income vs Expenses</h3>
                            <span className={styles.chartSub}>Last 6 months</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={MONTHLY_COMPARE} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}
                                  barGap={3} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }}
                                   axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }}
                                   axisLine={false} tickLine={false}
                                   tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="income"   name="Income"   fill="#22d3a5" radius={[4,4,0,0]} maxBarSize={32} />
                            <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4,4,0,0]} maxBarSize={32} />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className={styles.chartLegend}>
                        <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#22d3a5'}}/>Income</span>
                        <span className={styles.legendItem}><span className={styles.legendDot} style={{background:'#f87171'}}/>Expenses</span>
                    </div>
                </div>

                {/* Financial Health Radar */}
                <div className={styles.chartCard} data-anim>
                    <div className={styles.chartHead}>
                        <div>
                            <h3 className={styles.chartTitle}>Financial Health</h3>
                            <span className={styles.chartSub}>Score breakdown</span>
                        </div>
                        <div className={styles.healthScore}>
                            <span className={styles.healthScoreVal}>72</span>
                            <span className={styles.healthScoreLabel}>/100</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius={75}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'DM Sans' }}
                            />
                            <Radar
                                name="Score" dataKey="A"
                                stroke="#6366f1" fill="#6366f1" fillOpacity={0.2}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.budgetCard} data-anim>
                <div className={styles.chartHead}>
                    <div>
                        <h3 className={styles.chartTitle}>Budget vs Actual</h3>
                        <span className={styles.chartSub}>This month by category</span>
                    </div>
                </div>

                <div className={styles.budgetList}>
                    {CATEGORY_SPEND.map((item) => {
                        const over = item.pct > 100;
                        return (
                            <div key={item.category} className={styles.budgetRow}>
                                <div className={styles.budgetMeta}>
                                    <span className={styles.budgetCat}>{item.category}</span>
                                    <div className={styles.budgetAmts}>
                    <span className={`${styles.budgetSpent} ${over ? styles.budgetSpentOver : ''}`}>
                      ${item.amount.toLocaleString()}
                    </span>
                                        <span className={styles.budgetOf}>/ ${item.budget.toLocaleString()}</span>
                                        <span className={`${styles.budgetPct} ${over ? styles.budgetPctOver : ''}`}>
                      {item.pct}%
                    </span>
                                    </div>
                                </div>

                                <div className={styles.budgetTrack}>
                                    <div className={styles.budgetTrackBg}>
                                        <div
                                            className={`${styles.budgetTrackFill} ${over ? styles.budgetTrackFillOver : ''}`}
                                            data-bar={item.pct}
                                            style={{ width: '0%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Insight Cards ────────────────────────────────────────────────── */}
            <div className={styles.insightsGrid} data-anim>
                {INSIGHTS.map((ins) => (
                    <div key={ins.title} className={`${styles.insightCard} ${styles[`insightCard_${ins.color}`]}`}>
                        <div className={`${styles.insightIcon} ${styles[`insightIcon_${ins.color}`]}`}>
                            <ins.icon size={14} />
                        </div>
                        <span className={styles.insightLabel}>{ins.label}</span>
                        <h4 className={styles.insightTitle}>{ins.title}</h4>
                        <p className={styles.insightDesc}>{ins.desc}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}