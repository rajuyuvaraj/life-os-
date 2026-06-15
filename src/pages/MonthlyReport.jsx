import React, { useRef } from 'react';
import { useLifeOSStore, getTodayDateString } from '../store/useLifeOSStore';
import { FileText, Download, TrendingUp, TrendingDown, CheckSquare, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MonthlyReport() {
    const { 
        subscriptions, 
        transactions, 
        tasks, 
        habits, 
        budgets, 
        goals,
        addToast,
        getCurrencySymbol
    } = useLifeOSStore();

    const currencySymbol = getCurrencySymbol();

    const reportRef = useRef(null);
    const todayStr = getTodayDateString();

    // Financial calculations
    const incomeTotal = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotal = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const subBills = subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + s.cost, 0);

    const totalCashflowOut = expenseTotal + subBills;
    const netSavings = incomeTotal - totalCashflowOut;
    const savingsRate = incomeTotal > 0 ? Math.round((netSavings / incomeTotal) * 100) : 0;

    // Tasks calculations
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const taskSuccessRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Habits consistency
    const totalHabits = habits.length;
    let habitOverallRate = 0;
    if (totalHabits > 0) {
        const totalCheckedHistory = habits.reduce((sum, h) => {
            const checkedCount = Object.keys(h.history).filter(d => h.history[d]).length;
            return sum + checkedCount;
        }, 0);
        
        // Let's divide by total tracking entries (at least 1 to prevent division by zero)
        const totalEntries = habits.reduce((sum, h) => sum + Math.max(Object.keys(h.history).length, 1), 0);
        habitOverallRate = Math.round((totalCheckedHistory / totalEntries) * 100);
    }

    // Goals progress
    const activeGoals = goals.length;
    const completedGoals = goals.filter(g => g.current >= g.target).length;

    // PDF Export Function
    const handleExportPDF = () => {
        const element = reportRef.current;
        if (!element) return;

        addToast("Generating report PDF document. Please wait...", "info");

        // Use high-density canvas rendering settings for clean print styles
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#F5F0E8', // Match brutalist background
            logging: false
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            // Create PDF object (portrait mode)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2] // Scale to canvas dimension
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`life_os_report_${todayStr}.pdf`);
            
            addToast("Report exported successfully as PDF", "success");
        }).catch(err => {
            addToast("Failed to generate PDF document", "error");
        });
    };

    const flowData = [
        { name: 'INCOME', amount: incomeTotal },
        { name: 'EXPENSES', amount: expenseTotal },
        { name: 'SUBSCRIPTIONS', amount: subBills },
        { name: 'NET SAVINGS', amount: netSavings > 0 ? netSavings : 0 }
    ];

    return (
        <div className="space-y-10">
            {/* Header controls */}
            <div className="flex justify-between items-center pt-2">
                <h3 className="font-sans font-black text-xl tracking-wide uppercase">
                    MONTHLY PERFORMANCE SUMMARY
                </h3>
                <button onClick={handleExportPDF} className="btn-brutal bg-yellow">
                    <Download size={18} />
                    <span>EXPORT REPORT TO PDF</span>
                </button>
            </div>

            {/* Printable Report Wrapper */}
            <div 
                ref={reportRef} 
                id="report-print-container" 
                className="p-8 border-[3px] border-black bg-cream shadow-[6px_6px_0px_#000000] space-y-8"
            >
                {/* Archival Document Header */}
                <div className="border-b-[3px] border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-1">
                        <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5 border border-black uppercase">
                            CLASSIFIED REPORT
                        </span>
                        <h2 className="font-sans font-black text-3xl tracking-tight uppercase">
                            LIFE OS MONTHLY AUDIT
                        </h2>
                        <p className="font-mono text-xs text-gray-500 uppercase">
                            GENERATION DATE: {todayStr} | AUDIT LOG #902-B
                        </p>
                    </div>

                    <div className="font-mono text-xs text-left md:text-right font-bold uppercase space-y-1">
                        <div>AGENT STATUS: ACTIVE</div>
                        <div>SYSTEM INTEGRITY: STABLE</div>
                    </div>
                </div>

                {/* Grid 1: Key Metrics aggregates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_#000]">
                        <span className="font-mono text-[10px] text-gray-500 font-bold block uppercase">NET CASHFLOW</span>
                        <span className={`font-sans font-black text-2xl block mt-2 ${netSavings >= 0 ? 'text-green' : 'text-red'}`}>
                            {currencySymbol}{netSavings.toFixed(2)}
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 block uppercase mt-1">SAVINGS RATE: {savingsRate}%</span>
                    </div>

                    <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_#000]">
                        <span className="font-mono text-[10px] text-gray-500 font-bold block uppercase">TASKS DONE RATE</span>
                        <span className="font-sans font-black text-2xl block mt-2 text-black">
                            {taskSuccessRate}%
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 block uppercase mt-1">
                            {completedTasksCount}/{totalTasksCount} COMPLETED
                        </span>
                    </div>

                    <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_#000]">
                        <span className="font-mono text-[10px] text-gray-500 font-bold block uppercase">HABIT CONSISTENCY</span>
                        <span className="font-sans font-black text-2xl block mt-2 text-black">
                            {habitOverallRate}%
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 block uppercase mt-1">
                            LOGGED ENTRIES OVERALL
                        </span>
                    </div>

                    <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_#000]">
                        <span className="font-mono text-[10px] text-gray-500 font-bold block uppercase">GOALS MILESTONES</span>
                        <span className="font-sans font-black text-2xl block mt-2 text-black">
                            {completedGoals}/{activeGoals}
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 block uppercase mt-1">GOALS FULFILLED</span>
                    </div>
                </div>

                {/* Grid 2: Financial cashflow vs chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000] space-y-4">
                        <h4 className="font-sans font-black text-base uppercase border-b border-black pb-2 mb-4">
                            FINANCIAL FLOW METRICS
                        </h4>
                        
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="font-bold uppercase flex items-center gap-1.5"><TrendingUp size={14} className="text-green" /> TOTAL INCOME (+)</span>
                                <span className="font-bold text-green">{currencySymbol}{incomeTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="font-bold uppercase flex items-center gap-1.5"><TrendingDown size={14} className="text-red" /> LEDGER EXPENSES (-)</span>
                                <span className="font-bold text-red">-{currencySymbol}{expenseTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="font-bold uppercase flex items-center gap-1.5"><TrendingDown size={14} className="text-red" /> SUB BILLINGS (-)</span>
                                <span className="font-bold text-red">-{currencySymbol}{subBills.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 font-black border-t-2 border-black bg-cream p-2">
                                <span className="uppercase">NET SAVINGS DIFFERENTIAL</span>
                                <span className={netSavings >= 0 ? 'text-green' : 'text-red'}>
                                    {currencySymbol}{netSavings.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-black p-6 bg-white shadow-[4px_4px_0px_#000]">
                        <h4 className="font-sans font-black text-base uppercase border-b border-black pb-2 mb-4">
                            CASHFLOW HISTOGRAM
                        </h4>
                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#000" 
                                        tickLine={true}
                                        tick={{ fontFamily: 'Space Mono', fontSize: 9, fontWeight: 'bold' }} 
                                    />
                                    <YAxis 
                                        stroke="#000" 
                                        tickLine={true}
                                        tick={{ fontFamily: 'Space Mono', fontSize: 9, fontWeight: 'bold' }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#FFFFFF', 
                                            border: '2.5px solid #000',
                                            borderRadius: '0px',
                                            fontFamily: 'Space Mono',
                                            fontWeight: 'bold',
                                            boxShadow: '2px 2px 0px #000'
                                        }}
                                    />
                                    <Bar dataKey="amount" fill="#FFE566" stroke="#000" strokeWidth={2.5} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 3: Habits & Tasks Audits lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_#000] space-y-4">
                        <h4 className="font-sans font-black text-base uppercase border-b border-black pb-2 flex items-center gap-2">
                            <CheckSquare size={16} />
                            <span>OBJECTIVES RESOLUTION AUDIT</span>
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[10px] font-bold">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500 uppercase">No tasks recorded in index.</p>
                            ) : (
                                tasks.map(t => (
                                    <div key={t.id} className="flex justify-between items-center border border-black p-2 bg-cream uppercase">
                                        <span className="truncate max-w-[150px]">{t.text}</span>
                                        <span className={t.completed ? 'text-green' : 'text-red'}>
                                            {t.completed ? '[COMPLETED]' : '[PENDING]'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="border-2 border-black p-5 bg-white shadow-[3px_3px_0px_#000] space-y-4">
                        <h4 className="font-sans font-black text-base uppercase border-b border-black pb-2 flex items-center gap-2">
                            <Heart size={16} />
                            <span>HABITS CONSISTENCY AUDIT</span>
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[10px] font-bold">
                            {habits.length === 0 ? (
                                <p className="text-gray-500 uppercase">No habits recorded in index.</p>
                            ) : (
                                habits.map(h => {
                                    const checkedDays = Object.keys(h.history).filter(d => h.history[d]).length;
                                    const totalDays = Math.max(Object.keys(h.history).length, 1);
                                    const pct = Math.round((checkedDays / totalDays) * 100);
                                    
                                    return (
                                        <div key={h.id} className="flex justify-between items-center border border-black p-2 bg-cream uppercase">
                                            <span className="truncate max-w-[150px]">{h.name}</span>
                                            <span>{pct}% CONSISTENCY</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer notes on printable area */}
                <div className="border-t-[2.5px] border-black pt-4 text-center font-mono text-[9px] font-bold text-gray-500 uppercase">
                    SYSTEM: LIFE OS PORTAL REPORTING SERVICE © 2026. ALL METRICS EXTRACTED FROM ENCRYPTED LOCAL WORKSPACE.
                </div>
            </div>
        </div>
    );
}
