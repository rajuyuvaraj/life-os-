import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { ShieldAlert, Plus, Edit2, Check, TrendingDown, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Budget() {
    const { budgets, transactions, updateBudgetLimit, getCurrencySymbol } = useLifeOSStore();
    const currencySymbol = getCurrencySymbol();
    
    // Inline editing state for budget limits
    const [editingCategory, setEditingCategory] = useState(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = (category, currentLimit) => {
        setEditingCategory(category);
        setEditValue(currentLimit.toString());
    };

    const saveEdit = (category) => {
        const parsedVal = parseFloat(editValue);
        if (isNaN(parsedVal) || parsedVal < 0) return;
        updateBudgetLimit(category, parsedVal);
        setEditingCategory(null);
    };

    // Calculate spent totals per category
    const getCategorySpent = (category) => {
        return transactions
            .filter(t => t.type === 'expense' && t.category.toLowerCase() === category.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);
    };

    return (
        <div className="space-y-10">
            {/* Alert Banner if any budget category is exceeded */}
            {budgets.some(b => getCategorySpent(b.category) > b.limit) && (
                <div className="brutal-card bg-red text-white p-5 flex items-start gap-4 animate-pulse">
                    <ShieldAlert size={28} className="shrink-0 rotate-12" />
                    <div>
                        <h4 className="font-sans font-black text-lg uppercase tracking-wider">BUDGET BREACH WARNING</h4>
                        <p className="font-mono text-xs mt-1 uppercase">
                            One or more category budget caps have been exceeded. Review limits or adjust spending!
                        </p>
                    </div>
                </div>
            )}

            {/* Budget List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {budgets.map((b) => {
                    const spent = getCategorySpent(b.category);
                    const isOver = spent > b.limit;
                    const pct = Math.min((spent / b.limit) * 100, 100);
                    
                    // Progressive color states
                    let barColor = 'bg-green';
                    if (pct > 70 && pct <= 100) barColor = 'bg-yellow';
                    if (isOver) barColor = 'bg-red';

                    const isEditing = editingCategory === b.category;

                    return (
                        <div 
                            key={b.category} 
                            className={`brutal-card p-6 flex flex-col justify-between ${
                                isOver ? 'bg-white border-red shadow-[4px_4px_0px_#FF4444]' : 'bg-white'
                            }`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5 border border-black uppercase">
                                        {b.category}
                                    </span>
                                    
                                    {isOver && (
                                        <span className="font-mono text-[9px] font-black text-red bg-red/10 border border-red px-1.5 uppercase">
                                            OVER LIMIT
                                        </span>
                                    )}
                                </div>

                                <h4 className="font-sans font-black text-2xl uppercase tracking-tight mb-2">
                                    {b.category}
                                </h4>

                                {/* Limit controls */}
                                <div className="flex items-center gap-3 mb-6">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 w-full">
                                            <input 
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="input-brutal py-1 text-sm max-w-[120px]"
                                                autoFocus
                                            />
                                            <button 
                                                onClick={() => saveEdit(b.category)}
                                                className="p-1 hover:bg-green border border-black cursor-pointer bg-white"
                                                title="Save changes"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-gray-500 font-bold uppercase">
                                                LIMIT: {currencySymbol}{b.limit.toFixed(2)}
                                            </span>
                                            <button 
                                                onClick={() => startEditing(b.category, b.limit)}
                                                className="p-1 hover:bg-cream border border-transparent hover:border-black cursor-pointer text-gray-500"
                                                title="Edit limit"
                                            >
                                                <Edit2 size={11} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Aggregated progress metrics */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="font-mono text-xs font-bold text-gray-500 uppercase">SPENT</span>
                                    <span className="font-mono font-bold text-base">
                                        {currencySymbol}{spent.toFixed(2)} <span className="text-xs text-gray-400">/ {pct.toFixed(0)}%</span>
                                    </span>
                                </div>

                                {/* Custom thick 8px brutal progress bar with black border */}
                                <div className="h-5 border-[2.5px] border-black bg-cream w-full relative">
                                    <div 
                                        className={`h-full ${barColor} transition-all duration-300`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sub Ledger category breakdown */}
            <div className="brutal-card p-6 bg-white">
                <div className="floating-label">SEGREGATE LOGS</div>
                <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                    CATEGORY EXPENSES breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map(b => {
                        const catExpenses = transactions.filter(
                            t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase()
                        );
                        
                        return (
                            <div key={b.category} className="border-2 border-black p-4 bg-cream flex flex-col justify-between">
                                <h4 className="font-sans font-black text-base uppercase border-b-2 border-black pb-2 mb-3">
                                    {b.category} Logs
                                </h4>
                                <div className="space-y-2 h-40 overflow-y-auto pr-1">
                                    {catExpenses.length === 0 ? (
                                        <p className="font-mono text-[10px] text-gray-500 uppercase py-2">No transactions recorded.</p>
                                    ) : (
                                        catExpenses.map(e => (
                                            <div key={e.id} className="flex justify-between font-mono text-[10px] font-bold border border-black p-1.5 bg-white uppercase">
                                                <span className="truncate max-w-[120px]">{e.title}</span>
                                                <span className="text-red">-{currencySymbol}{e.amount.toFixed(2)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
