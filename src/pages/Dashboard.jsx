import React, { useState, useEffect } from 'react';
import { useLifeOSStore, getTodayDateString } from '../store/useLifeOSStore';
import CountUp from '../components/CountUp';
import { 
    CheckSquare, 
    CreditCard, 
    TrendingDown, 
    TrendingUp, 
    Calendar,
    Flame,
    Quote,
    X,
    Play,
    Pause,
    Square,
    Plus,
    Target,
    Smile,
    Activity,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { 
        subscriptions, 
        transactions, 
        tasks, 
        habits, 
        budgets, 
        goals,
        toggleTask,
        getCurrencySymbol,
        weeklyFocus,
        weeklyFocusCompleted,
        setWeeklyFocus,
        toggleWeeklyFocus,
        moodHistory,
        setTodayMood,
        addTransaction,
        timerLogs,
        user
    } = useLifeOSStore();

    const currencySymbol = getCurrencySymbol();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [detailModalType, setDetailModalType] = useState(null);

    // Pomodoro Timer State
    const [pomoMinutes, setPomoMinutes] = useState(25);
    const [pomoSeconds, setPomoSeconds] = useState(0);
    const [pomoIsActive, setPomoIsActive] = useState(false);
    const [pomoType, setPomoType] = useState('work'); // 'work' | 'break'

    // Quick transaction form State
    const [quickTitle, setQuickTitle] = useState('');
    const [quickAmount, setQuickAmount] = useState('');
    const [quickType, setQuickType] = useState('expense');
    const [quickCategory, setQuickCategory] = useState('Food');

    // Monolith focus edit state
    const [isEditingFocus, setIsEditingFocus] = useState(false);
    const [newFocusText, setNewFocusText] = useState(weeklyFocus);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Pomodoro Timer Logic
    useEffect(() => {
        let timer = null;
        if (pomoIsActive) {
            timer = setInterval(() => {
                if (pomoSeconds > 0) {
                    setPomoSeconds(pomoSeconds - 1);
                } else if (pomoMinutes > 0) {
                    setPomoMinutes(pomoMinutes - 1);
                    setPomoSeconds(59);
                } else {
                    clearInterval(timer);
                    setPomoIsActive(false);
                    const isWork = pomoType === 'work';
                    useLifeOSStore.getState().addToast(
                        isWork ? "POMODORO WORK PERIOD COMPLETE! REST NOW." : "BREAK COMPLETE! RETURN TO STATION.",
                        "success"
                    );
                    if (isWork) {
                        useLifeOSStore.getState().setConfetti(true);
                        setPomoType('break');
                        setPomoMinutes(5);
                    } else {
                        setPomoType('work');
                        setPomoMinutes(25);
                    }
                    setPomoSeconds(0);
                }
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [pomoIsActive, pomoMinutes, pomoSeconds, pomoType]);

    const handleQuickTransaction = (e) => {
        e.preventDefault();
        if (!quickTitle.trim() || !quickAmount) return;
        addTransaction({
            title: quickTitle.trim(),
            amount: parseFloat(quickAmount),
            type: quickType,
            category: quickCategory,
            date: todayStr
        });
        setQuickTitle('');
        setQuickAmount('');
    };

    const handleSaveFocus = (e) => {
        e.preventDefault();
        if (!newFocusText.trim()) return;
        setWeeklyFocus(newFocusText.trim());
        setIsEditingFocus(false);
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'GOOD MORNING';
        if (hour < 18) return 'GOOD AFTERNOON';
        return 'GOOD EVENING';
    };

    const todayStr = getTodayDateString();

    // Calculations
    const totalMonthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalMonthlyExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const subTotalMonthly = subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + s.cost, 0);

    // Tasks rates
    const todayTasks = tasks.filter(t => t.date === todayStr);
    const completedTasksCount = todayTasks.filter(t => t.completed).length;
    const tasksCompletionRate = todayTasks.length > 0 
        ? Math.round((completedTasksCount / todayTasks.length) * 100) 
        : 0;

    // Habit Streak
    const activeHabitStreaks = habits.map(h => {
        let streak = 0;
        const sortedDates = Object.keys(h.history).sort((a, b) => new Date(b) - new Date(a));
        for (let date of sortedDates) {
            if (h.history[date]) streak++;
            else break;
        }
        return { name: h.name, streak };
    });
    const maxStreak = activeHabitStreaks.length > 0 
        ? Math.max(...activeHabitStreaks.map(h => h.streak)) 
        : 0;

    // Subscriptions due soon (next 7 days)
    const upcomingSubs = subscriptions
        .filter(s => s.active)
        .slice(0, 3); // Seed data show some upcoming subs

    // Daily tasks preview
    const pendingTasks = todayTasks.filter(t => !t.completed).slice(0, 4);

    // Spending Chart Data (aggregated by date)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }).reverse();

    const chartData = last7Days.map(dateStr => {
        const dayExpense = transactions
            .filter(t => t.type === 'expense' && t.date === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Return format for chart
        return {
            date: dateStr.split('-')[2], // just day number
            amount: dayExpense
        };
    });

    const brutalQuotes = [
        "GRAVITY IS A CRUTCH. CONCRETE IS A STATE OF MIND.",
        "DISCIPLINE IS A MONOLITH. SHATTER SLOTH.",
        "NO SOFT SHADOWS IN THE PROCESS. HIGH CONTRAST EXECUTION.",
        "FLOAT ACCORDING TO PLAN. DEFRAUD ENTROPY.",
        "daily construction yields absolute structures.",
        "90 DEGREE EFFORT. ZERO BORDER RADIUS LAZINESS."
    ];
    
    // Seed quote based on day
    const randomQuote = brutalQuotes[new Date().getDate() % brutalQuotes.length];

    return (
        <div className="space-y-10">
            {/* Hello Raju Greeting Banner */}
            <div className="brutal-card bg-white p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="font-sans font-black text-4xl md:text-5xl tracking-tight uppercase leading-none">
                            HELLO {user?.name || 'OPERATOR'}
                        </h1>
                        <p className="font-mono text-xs font-bold text-gray-500 uppercase mt-2">
                            {getGreeting()} • WORKSPACE INTEGRATION ACTIVE
                        </p>
                    </div>
                    <div className="bg-black text-yellow px-4 py-2 border-2 border-black font-mono text-sm font-bold shadow-[3px_3px_0px_#FFE566]">
                        {currentTime.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* The Monolith: Weekly Focus Block */}
            <div className="brutal-card bg-white p-6 relative">
                <div className="floating-label">THE MONOLITH</div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <span className="font-mono text-[10px] text-gray-500 font-bold block uppercase tracking-tight">WEEKLY NON-NEGOTIABLE FOCUS</span>
                        {isEditingFocus ? (
                            <form onSubmit={handleSaveFocus} className="flex flex-wrap gap-2 w-full">
                                <input 
                                    type="text"
                                    value={newFocusText}
                                    onChange={(e) => setNewFocusText(e.target.value)}
                                    className="input-brutal flex-1 py-1.5 px-3 text-sm font-mono uppercase"
                                    required
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="btn-brutal bg-yellow py-1 px-4 text-xs font-bold font-mono">SAVE</button>
                                    <button type="button" onClick={() => setIsEditingFocus(false)} className="btn-brutal bg-white py-1 px-4 text-xs font-bold font-mono">CANCEL</button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h2 className={`font-sans font-black text-xl md:text-2xl uppercase tracking-tight ${weeklyFocusCompleted ? 'line-through text-gray-400' : ''}`}>
                                    {weeklyFocus}
                                </h2>
                                <button 
                                    onClick={() => {
                                        setNewFocusText(weeklyFocus);
                                        setIsEditingFocus(true);
                                    }} 
                                    className="font-mono text-[9px] font-bold text-gray-400 hover:text-black uppercase cursor-pointer"
                                >
                                    [EDIT]
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={toggleWeeklyFocus}
                        className={`btn-brutal py-2.5 px-5 text-xs font-black tracking-wide shrink-0 ${weeklyFocusCompleted ? 'bg-green' : 'bg-white'}`}
                    >
                        {weeklyFocusCompleted ? '✓ FOCUS COMPLETED' : 'MARK COMPLETED'}
                    </button>
                </div>
            </div>

            {/* Quote banner */}
            <div className="brutal-card bg-yellow p-4 flex items-center gap-3">
                <Quote className="shrink-0" size={24} />
                <span className="font-mono text-sm font-bold tracking-tight uppercase">
                    "{randomQuote}"
                </span>
            </div>

            {/* KPI Cards Grid - Anti-Gravity floating tilts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-4">
                {/* Income card */}
                <div onClick={() => setDetailModalType('income')} className="brutal-card bg-white p-6 tilt-1 tilt-hover z-10 block cursor-pointer">
                    <div className="floating-label">INFLOW</div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-mono text-xs uppercase">INCOME</span>
                        <TrendingUp className="text-green" size={20} />
                    </div>
                    <h3 className="font-sans font-black text-3xl tracking-tight">
                        <CountUp value={totalMonthlyIncome} prefix={currencySymbol} />
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 mt-2 uppercase">TOTAL ACCUMULATED</p>
                </div>

                {/* Expenses card */}
                <div onClick={() => setDetailModalType('expense')} className="brutal-card bg-white p-6 tilt-2 tilt-hover z-10 -mt-2 block cursor-pointer">
                    <div className="floating-label floating-label-red">OUTFLOW</div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-mono text-xs uppercase">EXPENSES</span>
                        <TrendingDown className="text-red" size={20} />
                    </div>
                    <h3 className="font-sans font-black text-3xl tracking-tight text-red">
                        <CountUp value={totalMonthlyExpense} prefix={currencySymbol} />
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 mt-2 uppercase">SPENT THIS MONTH</p>
                </div>

                {/* Subscriptions cost card */}
                <div className="brutal-card bg-white p-6 tilt-3 tilt-hover z-10">
                    <div className="floating-label">RECURRING</div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-mono text-xs uppercase">SUBSCRIPTION BILLS</span>
                        <CreditCard className="text-black" size={20} />
                    </div>
                    <h3 className="font-sans font-black text-3xl tracking-tight">
                        <CountUp value={subTotalMonthly} prefix={currencySymbol} />
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 mt-2 uppercase">PER MONTH RECURRING</p>
                </div>

                {/* Tasks Completion Card */}
                <div className="brutal-card bg-white p-6 tilt-4 tilt-hover z-10 -mt-3">
                    <div className="floating-label floating-label-green">TASKS</div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-mono text-xs uppercase">TODAY COMPLETION</span>
                        <CheckSquare className="text-green" size={20} />
                    </div>
                    <h3 className="font-sans font-black text-3xl tracking-tight">
                        <CountUp value={tasksCompletionRate} suffix="%" />
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 mt-2 uppercase">
                        {completedTasksCount}/{todayTasks.length} COMPLETED
                    </p>
                </div>

                {/* Habits Streak Card */}
                <div className="brutal-card bg-white p-6 tilt-5 tilt-hover z-10">
                    <div className="floating-label">STREAK</div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500 font-mono text-xs uppercase">ACTIVE STREAK</span>
                        <Flame className="text-yellowfill text-black fill-yellow" size={20} />
                    </div>
                    <h3 className="font-sans font-black text-3xl tracking-tight">
                        <CountUp value={maxStreak} suffix=" DAYS" />
                    </h3>
                    <p className="font-mono text-[10px] text-gray-500 mt-2 uppercase">MAX CURRENT STREAK</p>
                </div>
            </div>

            {/* Sub-sections grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Spending Chart & Subscriptions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Spending trends */}
                    <div className="brutal-card p-6 bg-white">
                        <div className="floating-label">MONITOR</div>
                        <h3 className="font-sans font-black text-xl mb-6 tracking-wide">
                            LAST 7 DAYS CASH OUTFLOW
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="date" 
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
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#000000" 
                                        strokeWidth={3} 
                                        fill="#FFE566" 
                                        fillOpacity={1}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subscriptions due soon preview */}
                    <div className="brutal-card p-6 bg-white">
                        <div className="floating-label">UPCOMING BILLS</div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-sans font-black text-xl tracking-wide">
                                ACTIVE SUBSCRIPTIONS
                            </h3>
                            <Link to="/subscriptions" className="btn-brutal text-xs px-3 py-1 bg-white">
                                MANAGE
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {upcomingSubs.length === 0 ? (
                                <p className="font-mono text-sm text-gray-500">NO ACTIVE SUBSCRIPTIONS.</p>
                            ) : (
                                upcomingSubs.map(sub => (
                                    <div key={sub.id} className="border-2 border-black p-4 flex items-center justify-between bg-cream">
                                        <div className="flex flex-col">
                                            <span className="font-sans font-black text-sm uppercase">{sub.name}</span>
                                            <span className="font-mono text-xs text-gray-500 uppercase">RENEWS: {sub.renewDate}</span>
                                        </div>
                                        <span className="font-mono font-bold bg-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                                            {currencySymbol}{sub.cost.toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Zine-Style Mood & Energy Tracker */}
                    <div className="brutal-card p-6 bg-white">
                        <div className="floating-label">VIBE CHECK</div>
                        <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                            7-DAY MOOD & ENERGY HISTOGRAM
                        </h3>
                        
                        <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center border-b-2 border-black pb-6 mb-6">
                            <span className="font-mono text-xs font-bold uppercase">LOG TODAY'S FREQUENCY:</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setTodayMood(todayStr, 'high')}
                                    className="btn-brutal text-xs py-1.5 px-3 bg-green font-mono font-bold"
                                >
                                    ▲ HIGH
                                </button>
                                <button 
                                    onClick={() => setTodayMood(todayStr, 'medium')}
                                    className="btn-brutal text-xs py-1.5 px-3 bg-yellow font-mono font-bold"
                                >
                                    ■ MED
                                </button>
                                <button 
                                    onClick={() => setTodayMood(todayStr, 'low')}
                                    className="btn-brutal text-xs py-1.5 px-3 bg-red font-mono font-bold"
                                >
                                    ▼ LOW
                                </button>
                            </div>
                        </div>

                        {/* Grid matrix */}
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - i);
                                const dateStr = d.toISOString().split('T')[0];
                                const mood = moodHistory[dateStr];
                                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                                const isToday = dateStr === todayStr;

                                let moodColor = 'bg-white';
                                let moodLabel = 'EMPTY';
                                if (mood === 'high') {
                                    moodColor = 'bg-green';
                                    moodLabel = 'HIGH';
                                } else if (mood === 'medium') {
                                    moodColor = 'bg-yellow';
                                    moodLabel = 'MED';
                                } else if (mood === 'low') {
                                    moodColor = 'bg-red';
                                    moodLabel = 'LOW';
                                }

                                return (
                                    <div 
                                        key={dateStr} 
                                        className={`border-2 border-black p-2 flex flex-col items-center justify-center bg-cream gap-1.5 ${
                                            isToday ? 'outline-2 outline-black outline-offset-1' : ''
                                        }`}
                                    >
                                        <span className="font-mono text-[9px] font-bold text-gray-500">{dayName}</span>
                                        <div className={`w-6 h-6 border-[2px] border-black ${moodColor}`} title={`Mood: ${moodLabel}`} />
                                    </div>
                                );
                            }).reverse()}
                        </div>
                    </div>
                </div>

                {/* Right Column: Tasks and Budgets overview */}
                <div className="space-y-8">
                    {/* Today's pending tasks checklist */}
                    <div className="brutal-card p-6 bg-white">
                        <div className="floating-label floating-label-green">DAILY CHECKLIST</div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-sans font-black text-xl tracking-wide">
                                PENDING TASKS
                            </h3>
                            <Link to="/tasks" className="btn-brutal text-xs px-3 py-1 bg-yellow">
                                OPEN LIST
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {pendingTasks.length === 0 ? (
                                <div className="text-center py-6 font-mono text-gray-500 text-sm border-2 border-dashed border-black">
                                    ALL DONE FOR TODAY!
                                </div>
                            ) : (
                                pendingTasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        onClick={() => toggleTask(task.id)}
                                        className="border-2 border-black p-3 flex items-center gap-3 bg-cream cursor-pointer hover:bg-white transition-colors"
                                    >
                                        <div className="w-5 h-5 border-[2.5px] border-black shrink-0 flex items-center justify-center bg-white">
                                            {task.completed && <span className="font-bold text-xs">✓</span>}
                                        </div>
                                        <span className={`font-mono text-xs uppercase truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                            {task.text}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Budgets category overview */}
                    <div className="brutal-card p-6 bg-white">
                        <div className="floating-label floating-label-red">LIMITS</div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-sans font-black text-xl tracking-wide">
                                BUDGET CAP STATS
                            </h3>
                            <Link to="/budget" className="btn-brutal text-xs px-3 py-1 bg-white">
                                DETAILS
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {budgets.slice(0, 4).map(b => {
                                // Calculate total spent for this category
                                const spent = transactions
                                    .filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
                                    .reduce((sum, t) => sum + t.amount, 0);
                                
                                const pct = Math.min(Math.round((spent / b.limit) * 100), 100);
                                const isOver = spent > b.limit;
                                const barColor = isOver ? 'bg-red' : 'bg-yellow';

                                return (
                                    <div key={b.category} className="space-y-1.5">
                                        <div className="flex justify-between font-mono text-xs font-bold uppercase">
                                            <span>{b.category}</span>
                                            <span>{currencySymbol}{spent.toFixed(0)} / {currencySymbol}{b.limit.toFixed(0)}</span>
                                        </div>
                                        <div className="h-4 border-[2px] border-black bg-white w-full">
                                            <div 
                                                className={`h-full ${barColor} transition-all duration-300`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Pomodoro Timer */}
                    <div className="brutal-card p-6 bg-white relative">
                        <div className="floating-label">TIMER</div>
                        <h3 className="font-sans font-black text-xl mb-4 tracking-wide uppercase">
                            FOCUS PROTOCOL
                        </h3>
                        <div className="flex flex-col items-center justify-center bg-cream border-2 border-black p-4 space-y-4">
                            <Clock size={32} className="text-black" />
                            <div className="text-center font-mono uppercase">
                                <span className="text-[10px] font-bold text-gray-500 block">SESSIONS LOGGED</span>
                                <span className="text-xl font-black">{(timerLogs || []).length} SESSIONS</span>
                            </div>
                            
                            <Link 
                                to="/timer"
                                className="btn-brutal bg-green w-full py-2.5 text-xs font-mono font-bold text-center justify-center"
                            >
                                <Play size={12} className="inline mr-1" /> START NEW TIMER
                            </Link>
                        </div>
                    </div>

                    {/* Quick Transaction Logger Widget */}
                    <div className="brutal-card p-6 bg-white relative">
                        <div className="floating-label">CASH LOG</div>
                        <h3 className="font-sans font-black text-xl mb-4 tracking-wide uppercase">
                            QUICK LEDGER ENTRY
                        </h3>
                        <form onSubmit={handleQuickTransaction} className="space-y-3">
                            <div className="space-y-1">
                                <label className="font-mono text-[9px] font-bold block uppercase">NAME</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. coffee, lunch..."
                                    value={quickTitle}
                                    onChange={(e) => setQuickTitle(e.target.value)}
                                    required
                                    className="input-brutal text-xs py-1"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="font-mono text-[9px] font-bold block uppercase">AMOUNT ({currencySymbol})</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        placeholder="5.00"
                                        value={quickAmount}
                                        onChange={(e) => setQuickAmount(e.target.value)}
                                        required
                                        className="input-brutal text-xs py-1"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-mono text-[9px] font-bold block uppercase">TYPE</label>
                                    <select 
                                        value={quickType}
                                        onChange={(e) => {
                                            setQuickType(e.target.value);
                                            setQuickCategory(e.target.value === 'income' ? 'Salary' : 'Food');
                                        }}
                                        className="input-brutal text-xs py-1 font-sans font-bold cursor-pointer"
                                    >
                                        <option value="expense">OUTFLOW</option>
                                        <option value="income">INFLOW</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-brutal bg-yellow w-full py-2 text-xs font-black tracking-wider mt-1">
                                <Plus size={14} className="inline mr-1" /> RECORD ENTRY
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {/* Detail Modal for Inflow / Outflow */}
            <AnimatePresence>
                {detailModalType && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-black/40 z-[990] flex items-end justify-center"
                            onClick={() => setDetailModalType(null)}
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
                                <span className="font-sans font-black tracking-wide text-sm uppercase">
                                    {detailModalType === 'income' ? 'INFLOW RECORDS' : 'OUTFLOW RECORDS'}
                                </span>
                                <button 
                                    onClick={() => setDetailModalType(null)}
                                    className="p-1 hover:bg-yellow hover:text-black border border-transparent hover:border-black cursor-pointer text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3 bg-white">
                                {transactions.filter(t => t.type === detailModalType).length === 0 ? (
                                    <p className="font-mono text-xs text-gray-500 uppercase text-center py-6">
                                        No records found.
                                    </p>
                                ) : (
                                    transactions
                                        .filter(t => t.type === detailModalType)
                                        .map(tx => (
                                            <div key={tx.id} className="border-2 border-black p-3 flex items-center justify-between bg-cream">
                                                <div className="flex flex-col">
                                                    <span className="font-sans font-black text-xs uppercase">{tx.title}</span>
                                                    <div className="flex gap-2 font-mono text-[9px] font-bold text-gray-500 uppercase mt-0.5">
                                                        <span>{tx.date}</span>
                                                        <span>•</span>
                                                        <span className="bg-white border border-black px-1">{tx.category}</span>
                                                    </div>
                                                </div>
                                                <span className={`font-mono font-bold text-xs ${detailModalType === 'income' ? 'text-green' : 'text-red'}`}>
                                                    {detailModalType === 'income' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
