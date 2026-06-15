import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { ArrowLeftRight, Download, Plus, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

export default function Transactions() {
    const { transactions, addTransaction, deleteTransaction, getCurrencySymbol } = useLifeOSStore();
    const currencySymbol = getCurrencySymbol();

    const [searchParams, setSearchParams] = useSearchParams();
    const typeParam = searchParams.get('type') || 'all';

    // Filters
    const [filterType, setFilterType] = useState(typeParam);
    const [filterCategory, setFilterCategory] = useState('all');

    React.useEffect(() => {
        setFilterType(typeParam);
    }, [typeParam]);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formType, setFormType] = useState('expense');
    const [formCategory, setFormCategory] = useState('Food');
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

    const openAddModal = () => {
        setFormTitle('');
        setFormAmount('');
        setFormType('expense');
        setFormCategory('Food');
        setFormDate(new Date().toISOString().split('T')[0]);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (!formTitle || !formAmount || !formDate) return;

        addTransaction({
            title: formTitle,
            amount: parseFloat(formAmount),
            type: formType,
            category: formCategory,
            date: formDate
        });

        setIsModalOpen(false);
    };

    // Export to CSV Functionality
    const exportToCSV = () => {
        const headers = ['ID', 'TITLE', 'AMOUNT', 'TYPE', 'CATEGORY', 'DATE'];
        const csvRows = [headers.join(',')];

        filteredTransactions.forEach(t => {
            const row = [
                t.id,
                `"${t.title.replace(/"/g, '""')}"`,
                t.amount.toFixed(2),
                t.type,
                t.category,
                t.date
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `life_os_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filtered transaction list
    const filteredTransactions = transactions.filter(t => {
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = filterCategory === 'all' || t.category.toLowerCase() === filterCategory.toLowerCase();
        return matchesType && matchesCategory;
    });

    // Unique Categories list for dropdowns
    const categories = Array.from(new Set(transactions.map(t => t.category)));

    // Format aggregate data for chart
    const dailyAggregates = transactions.reduce((acc, t) => {
        const dateKey = t.date.split('-')[2]; // day of month
        const existing = acc.find(item => item.day === dateKey);
        
        if (existing) {
            if (t.type === 'income') existing.income += t.amount;
            else existing.expense += t.amount;
        } else {
            acc.push({
                day: dateKey,
                income: t.type === 'income' ? t.amount : 0,
                expense: t.type === 'expense' ? t.amount : 0
            });
        }
        return acc;
    }, []);

    // Sort by day number
    dailyAggregates.sort((a, b) => parseInt(a.day) - parseInt(b.day));

    return (
        <div className="space-y-10">
            {/* Header Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 font-mono text-xs">
                    <select 
                        value={filterType} 
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilterType(val);
                            if (val === 'all') {
                                setSearchParams({});
                            } else {
                                setSearchParams({ type: val });
                            }
                        }}
                        className="input-brutal w-auto py-1 px-3 bg-white font-bold"
                    >
                        <option value="all">ALL TYPES</option>
                        <option value="income">INFLOW (+)</option>
                        <option value="expense">OUTFLOW (-)</option>
                    </select>

                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="input-brutal w-auto py-1 px-3 bg-white font-bold"
                    >
                        <option value="all">ALL CATEGORIES</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c.toUpperCase()}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="btn-brutal bg-white text-xs py-2">
                        <Download size={16} />
                        <span>EXPORT CSV</span>
                    </button>
                    <button onClick={openAddModal} className="btn-brutal bg-yellow text-xs py-2">
                        <Plus size={16} />
                        <span>LOG TRANSACTION</span>
                    </button>
                </div>
            </div>

            {/* Combined Cashflow Trends Chart */}
            <div className="brutal-card p-6 bg-white">
                <div className="floating-label">ANALYZE</div>
                <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                    CASHFLOW TRENDS (BY DAY)
                </h3>
                <div className="h-72 w-full">
                    {dailyAggregates.length === 0 ? (
                        <p className="font-mono text-sm text-gray-500 uppercase">NO TRANSACTIONS TO VISUALIZE</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyAggregates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis 
                                    dataKey="day" 
                                    stroke="#000" 
                                    tickLine={true}
                                    tick={{ fontFamily: 'Space Mono', fontSize: 10, fontWeight: 'bold' }} 
                                />
                                <YAxis 
                                    stroke="#000" 
                                    tickLine={true}
                                    tick={{ fontFamily: 'Space Mono', fontSize: 10, fontWeight: 'bold' }} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#FFFFFF', 
                                        border: '2.5px solid #000',
                                        borderRadius: '0px',
                                        fontFamily: 'Space Mono',
                                        fontWeight: 'bold',
                                        boxShadow: '3px 3px 0px #000'
                                    }}
                                />
                                <Legend 
                                    wrapperStyle={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 'bold' }}
                                />
                                <Bar dataKey="income" name="INCOME (+)" fill="#44CC88" stroke="#000" strokeWidth={2} />
                                <Bar dataKey="expense" name="EXPENSES (-)" fill="#FF4444" stroke="#000" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Ledger List */}
            <div className="brutal-card p-6 bg-white">
                <div className="floating-label">LEDGER</div>
                <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                    TRANSACTIONS LOGS
                </h3>
                <div className="divide-y-2 divide-black border-2 border-black max-h-[450px] overflow-y-auto">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center font-mono text-sm text-gray-500 uppercase bg-cream">
                            No matching logs found in this scope.
                        </div>
                    ) : (
                        filteredTransactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between bg-cream hover:bg-white transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 border-[2px] border-black flex items-center justify-center shrink-0 ${
                                        tx.type === 'income' ? 'bg-green' : 'bg-red'
                                    }`}>
                                        {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-sans font-black text-sm uppercase tracking-tight">{tx.title}</span>
                                        <div className="flex gap-2 font-mono text-[9px] font-bold text-gray-500 uppercase mt-0.5">
                                            <span>{tx.date}</span>
                                            <span>•</span>
                                            <span className="bg-white border border-black px-1">{tx.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={`font-mono font-bold text-sm ${
                                         tx.type === 'income' ? 'text-green' : 'text-red'
                                     }`}>
                                         {tx.type === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                                     </span>
                                    <button 
                                        onClick={() => deleteTransaction(tx.id)}
                                        className="p-1.5 hover:bg-red hover:text-white border border-transparent hover:border-black cursor-pointer text-gray-500"
                                        title="Delete log entry"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal: Slide up Form */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black/40 z-[990] flex items-end justify-center"
                            onClick={() => setIsModalOpen(false)}
                        />
                        
                        {/* Slide up Container */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-[3px] border-x-[3px] border-black z-[999] shadow-[0_-8px_20px_rgba(0,0,0,0.15)]"
                        >
                            {/* Black Header Bar */}
                            <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
                                <span className="font-sans font-black tracking-wide text-sm">
                                    LOG NEW TRANSACTION
                                </span>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 hover:bg-yellow hover:text-black border border-transparent hover:border-black cursor-pointer text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* White Form Area */}
                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="font-mono text-xs font-bold block uppercase">TRANSACTION NAME</label>
                                    <input 
                                        type="text" 
                                        value={formTitle} 
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="e.g. Weekly Grocery Run, Freelance Work"
                                        required 
                                        className="input-brutal"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-mono text-xs font-bold block uppercase">AMOUNT ({currencySymbol})</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={formAmount} 
                                            onChange={(e) => setFormAmount(e.target.value)}
                                            placeholder="45.50"
                                            required 
                                            className="input-brutal"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-mono text-xs font-bold block uppercase">TRANSACTION TYPE</label>
                                        <select 
                                            value={formType} 
                                            onChange={(e) => {
                                                setFormType(e.target.value);
                                                // auto swap default category
                                                setFormCategory(e.target.value === 'income' ? 'Salary' : 'Food');
                                            }}
                                            className="input-brutal cursor-pointer font-sans font-bold"
                                        >
                                            <option value="expense">EXPENSE (OUTFLOW)</option>
                                            <option value="income">INCOME (INFLOW)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-mono text-xs font-bold block uppercase">CATEGORY</label>
                                        {formType === 'expense' ? (
                                            <select 
                                                value={formCategory} 
                                                onChange={(e) => setFormCategory(e.target.value)}
                                                className="input-brutal cursor-pointer font-sans font-bold"
                                            >
                                                <option value="Food">FOOD</option>
                                                <option value="Subscriptions">SUBSCRIPTIONS</option>
                                                <option value="Utilities">UTILITIES</option>
                                                <option value="Transport">TRANSPORT</option>
                                                <option value="Entertainment">ENTERTAINMENT</option>
                                                <option value="Other">OTHER</option>
                                            </select>
                                        ) : (
                                            <select 
                                                value={formCategory} 
                                                onChange={(e) => setFormCategory(e.target.value)}
                                                className="input-brutal cursor-pointer font-sans font-bold"
                                            >
                                                <option value="Salary">SALARY</option>
                                                <option value="Freelance">FREELANCE</option>
                                                <option value="Refund">REFUND</option>
                                                <option value="Other">OTHER</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-mono text-xs font-bold block uppercase">DATE</label>
                                        <input 
                                            type="date" 
                                            value={formDate} 
                                            onChange={(e) => setFormDate(e.target.value)}
                                            required 
                                            className="input-brutal"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn-brutal btn-white flex-1"
                                    >
                                        CANCEL
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-brutal bg-yellow flex-1"
                                    >
                                        LOG ENTRY
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
