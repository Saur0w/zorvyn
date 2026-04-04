'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
    Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight,
    ArrowUpDown, ArrowUp, ArrowDown, Plus, Pencil, Trash2,
    X, ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import styles from './style.module.scss';

// ─── Types ──────────────────────────────────────────────────────────────────

type TxType     = 'income' | 'expense';
type SortField  = 'date' | 'amount' | 'description' | 'category';
type SortDir    = 'asc' | 'desc';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: TxType;
}

interface Props {
    role?: 'admin' | 'viewer';
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const ALL_TRANSACTIONS: Transaction[] = [
    { id:  1, date: '2025-04-01', description: 'Salary Deposit',        category: 'Income',        amount:  9800,   type: 'income'  },
    { id:  2, date: '2025-03-30', description: 'Rent Payment',          category: 'Housing',       amount: -2800,   type: 'expense' },
    { id:  3, date: '2025-03-29', description: 'Grocery Store',         category: 'Food & Dining', amount: -186.5,  type: 'expense' },
    { id:  4, date: '2025-03-28', description: 'Freelance Payment',     category: 'Income',        amount:  1500,   type: 'income'  },
    { id:  5, date: '2025-03-27', description: 'Netflix Subscription',  category: 'Entertainment', amount: -15.99,  type: 'expense' },
    { id:  6, date: '2025-03-26', description: 'Electric Bill',         category: 'Utilities',     amount: -124,    type: 'expense' },
    { id:  7, date: '2025-03-25', description: 'Spotify Premium',       category: 'Entertainment', amount: -9.99,   type: 'expense' },
    { id:  8, date: '2025-03-24', description: 'Uber Ride',             category: 'Transport',     amount: -18.4,   type: 'expense' },
    { id:  9, date: '2025-03-23', description: 'Online Course',         category: 'Education',     amount: -49,     type: 'expense' },
    { id: 10, date: '2025-03-22', description: 'Dividend Payment',      category: 'Income',        amount:  320,    type: 'income'  },
    { id: 11, date: '2025-03-21', description: 'Restaurant Dinner',     category: 'Food & Dining', amount: -74.2,   type: 'expense' },
    { id: 12, date: '2025-03-20', description: 'Internet Bill',         category: 'Utilities',     amount: -59,     type: 'expense' },
    { id: 13, date: '2025-03-19', description: 'Gym Membership',        category: 'Health',        amount: -45,     type: 'expense' },
    { id: 14, date: '2025-03-18', description: 'Amazon Purchase',       category: 'Shopping',      amount: -112.3,  type: 'expense' },
    { id: 15, date: '2025-03-17', description: 'Side Project Revenue',  category: 'Income',        amount:  750,    type: 'income'  },
    { id: 16, date: '2025-03-16', description: 'Pharmacy',              category: 'Health',        amount: -32.5,   type: 'expense' },
    { id: 17, date: '2025-03-15', description: 'Coffee Shop',           category: 'Food & Dining', amount: -6.8,    type: 'expense' },
    { id: 18, date: '2025-03-14', description: 'Bus Pass',              category: 'Transport',     amount: -30,     type: 'expense' },
    { id: 19, date: '2025-03-13', description: 'Water Bill',            category: 'Utilities',     amount: -28,     type: 'expense' },
    { id: 20, date: '2025-03-12', description: 'Clothing Store',        category: 'Shopping',      amount: -89.99,  type: 'expense' },
];

const CATEGORIES = ['All', 'Income', 'Housing', 'Food & Dining', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Shopping', 'Education'];
const PAGE_SIZE  = 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtAmt(n: number) {
    const abs = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n >= 0 ? `+$${abs}` : `−$${abs}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Transactions({ role = 'viewer' }: Props) {
    const rootRef    = useRef<HTMLDivElement>(null);

    const [query,      setQuery]      = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | TxType>('all');
    const [catFilter,  setCatFilter]  = useState('All');
    const [sortField,  setSortField]  = useState<SortField>('date');
    const [sortDir,    setSortDir]    = useState<SortDir>('desc');
    const [page,       setPage]       = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [data,       setData]       = useState<Transaction[]>(ALL_TRANSACTIONS);

    // Entrance animation
    useEffect(() => {
        const run = async () => {
            const gsap = (await import('gsap')).default;
            if (!rootRef.current) return;
            const els = rootRef.current.querySelectorAll('[data-anim]');
            gsap.fromTo(els,
                { y: 28, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }
            );
        };
        run();
    }, []);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [query, typeFilter, catFilter, sortField, sortDir]);

    // ── Derived data ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let rows = [...data];

        if (query)
            rows = rows.filter(r =>
                r.description.toLowerCase().includes(query.toLowerCase()) ||
                r.category.toLowerCase().includes(query.toLowerCase())
            );

        if (typeFilter !== 'all')
            rows = rows.filter(r => r.type === typeFilter);

        if (catFilter !== 'All')
            rows = rows.filter(r => r.category === catFilter);

        rows.sort((a, b) => {
            let av: any = a[sortField];
            let bv: any = b[sortField];
            if (sortField === 'amount') { av = Math.abs(a.amount); bv = Math.abs(b.amount); }
            if (sortField === 'date')   { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); }
            if (av < bv) return sortDir === 'asc' ? -1 :  1;
            if (av > bv) return sortDir === 'asc' ?  1 : -1;
            return 0;
        });

        return rows;
    }, [data, query, typeFilter, catFilter, sortField, sortDir]);

    const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalIncome = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense= data.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

    // ── Sort toggle ──────────────────────────────────────────────────────────
    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className={styles.sortIconIdle} />;
        return sortDir === 'asc'
            ? <ArrowUp   size={12} className={styles.sortIconActive} />
            : <ArrowDown size={12} className={styles.sortIconActive} />;
    };

    // ── CSV export ───────────────────────────────────────────────────────────
    const exportCSV = () => {
        const header = 'Date,Description,Category,Type,Amount';
        const rows   = filtered.map(t =>
            `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`
        );
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: 'transactions.csv' });
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Delete (admin) ───────────────────────────────────────────────────────
    const handleDelete = (id: number) => {
        setData(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className={styles.root} ref={rootRef}>

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className={styles.header} data-anim>
                <div>
                    <h2 className={styles.heading}>Transactions</h2>
                    <p className={styles.subheading}>{filtered.length} entries found</p>
                </div>

                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={exportCSV}>
                        <Download size={13} /> Export CSV
                    </button>
                    {role === 'admin' && (
                        <button className={styles.addBtn}>
                            <Plus size={14} /> Add Transaction
                        </button>
                    )}
                </div>
            </div>

            {/* ── Summary Strip ───────────────────────────────────────────────── */}
            <div className={styles.summaryStrip} data-anim>
                <div className={`${styles.summaryCard} ${styles.summaryCardGreen}`}>
                    <span className={styles.summaryLabel}>Total Income</span>
                    <span className={styles.summaryValue}>+${totalIncome.toLocaleString()}</span>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryCardRed}`}>
                    <span className={styles.summaryLabel}>Total Expenses</span>
                    <span className={styles.summaryValue}>−${totalExpense.toLocaleString()}</span>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryCardBlue}`}>
                    <span className={styles.summaryLabel}>Net</span>
                    <span className={styles.summaryValue}>
            ${(totalIncome - totalExpense).toLocaleString()}
          </span>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryCardNeutral}`}>
                    <span className={styles.summaryLabel}>Transactions</span>
                    <span className={styles.summaryValue}>{data.length}</span>
                </div>
            </div>

            {/* ── Filters ─────────────────────────────────────────────────────── */}
            <div className={styles.filterBar} data-anim>
                {/* Search */}
                <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search by name or category…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {query && (
                        <button className={styles.clearBtn} onClick={() => setQuery('')}>
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Type pills */}
                <div className={styles.typePills}>
                    {(['all', 'income', 'expense'] as const).map(t => (
                        <button
                            key={t}
                            className={`${styles.typePill} ${typeFilter === t ? styles.typePillActive : ''} ${t !== 'all' ? styles[`typePill_${t}`] : ''}`}
                            onClick={() => setTypeFilter(t)}
                        >
                            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Category filter */}
                <button
                    className={`${styles.filterBtn} ${showFilter ? styles.filterBtnActive : ''}`}
                    onClick={() => setShowFilter(s => !s)}
                >
                    <SlidersHorizontal size={13} />
                    {catFilter !== 'All' ? catFilter : 'Category'}
                </button>
            </div>

            {/* Category chips */}
            {showFilter && (
                <div className={styles.catChips} data-anim>
                    {CATEGORIES.map(c => (
                        <button
                            key={c}
                            className={`${styles.catChip} ${catFilter === c ? styles.catChipActive : ''}`}
                            onClick={() => { setCatFilter(c); setShowFilter(false); }}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className={styles.tableWrap} data-anim>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th className={styles.th} onClick={() => toggleSort('date')}>
                            <span className={styles.thInner}>Date <SortIcon field="date" /></span>
                        </th>
                        <th className={styles.th} onClick={() => toggleSort('description')}>
                            <span className={styles.thInner}>Description <SortIcon field="description" /></span>
                        </th>
                        <th className={`${styles.th} ${styles.thHideSmall}`} onClick={() => toggleSort('category')}>
                            <span className={styles.thInner}>Category <SortIcon field="category" /></span>
                        </th>
                        <th className={styles.th}>
                            <span className={styles.thInner}>Type</span>
                        </th>
                        <th className={styles.th} onClick={() => toggleSort('amount')}>
                            <span className={`${styles.thInner} ${styles.thRight}`}>Amount <SortIcon field="amount" /></span>
                        </th>
                        {role === 'admin' && <th className={styles.th} />}
                    </tr>
                    </thead>

                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td colSpan={role === 'admin' ? 6 : 5} className={styles.emptyRow}>
                                <div className={styles.emptyState}>
                                    <Search size={28} className={styles.emptyIcon} />
                                    <span>No transactions match your filters</span>
                                    <button
                                        className={styles.clearFiltersBtn}
                                        onClick={() => { setQuery(''); setTypeFilter('all'); setCatFilter('All'); }}
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        paginated.map((tx, i) => (
                            <tr key={tx.id} className={styles.row} style={{ animationDelay: `${i * 0.04}s` }}>
                                <td className={styles.td}>
                                    <span className={styles.dateCell}>{fmtDate(tx.date)}</span>
                                </td>

                                <td className={styles.td}>
                                    <div className={styles.descCell}>
                                        <div className={`${styles.txDot} ${tx.type === 'income' ? styles.txDotIn : styles.txDotOut}`}>
                                            {tx.type === 'income'
                                                ? <ArrowUpRight size={11} />
                                                : <ArrowDownRight size={11} />}
                                        </div>
                                        <span className={styles.txDesc}>{tx.description}</span>
                                    </div>
                                </td>

                                <td className={`${styles.td} ${styles.tdHideSmall}`}>
                                    <span className={styles.catBadge}>{tx.category}</span>
                                </td>

                                <td className={styles.td}>
                    <span className={`${styles.typeBadge} ${tx.type === 'income' ? styles.typeBadgeIn : styles.typeBadgeOut}`}>
                      {tx.type}
                    </span>
                                </td>

                                <td className={styles.td}>
                    <span className={`${styles.amtCell} ${tx.type === 'income' ? styles.amtIn : styles.amtOut}`}>
                      {fmtAmt(tx.amount)}
                    </span>
                                </td>

                                {role === 'admin' && (
                                    <td className={styles.td}>
                                        <div className={styles.rowActions}>
                                            <button className={styles.editBtn} aria-label="Edit">
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                aria-label="Delete"
                                                onClick={() => handleDelete(tx.id)}
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className={styles.pagination} data-anim>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages} · {filtered.length} results
          </span>

                    <div className={styles.pageControls}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                            .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('...');
                                acc.push(n);
                                return acc;
                            }, [])
                            .map((n, i) =>
                                n === '...'
                                    ? <span key={`dots-${i}`} className={styles.pageDots}>…</span>
                                    : <button
                                        key={n}
                                        className={`${styles.pageNumBtn} ${page === n ? styles.pageNumBtnActive : ''}`}
                                        onClick={() => setPage(n as number)}
                                    >
                                        {n}
                                    </button>
                            )
                        }

                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}