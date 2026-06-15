import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { Plus, Trash2, Check, Flame, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Habits() {
    const { 
        habits, 
        addHabit, 
        toggleHabitDate, 
        deleteHabit,
        books = [],
        addBook,
        updateBookStatus,
        updateBookPages,
        deleteBook
    } = useLifeOSStore();
    
    // Form State
    const [habitName, setFormName] = useState('');
    const [habitCategory, setFormCategory] = useState('Health');

    // Book Form State
    const [bookTitle, setBookTitle] = useState('');
    const [bookStatus, setBookStatus] = useState('want_to_read');
    const [bookCurrentPage, setBookCurrentPage] = useState(0);
    const [bookTotalPages, setBookTotalPages] = useState(100);

    const handleCreateHabit = (e) => {
        e.preventDefault();
        if (!habitName.trim()) return;
        addHabit(habitName.trim(), habitCategory);
        setFormName('');
    };

    const handleCreateBook = (e) => {
        e.preventDefault();
        if (!bookTitle.trim()) return;
        addBook(bookTitle.trim(), bookStatus, bookCurrentPage, bookTotalPages);
        setBookTitle('');
        setBookCurrentPage(0);
        setBookTotalPages(100);
    };

    // Helper: Generate list of last 28 days
    const getLast28Days = () => {
        return Array.from({ length: 28 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }).reverse();
    };

    const daysList = getLast28Days();
    const todayStr = new Date().toISOString().split('T')[0];

    // Helper: calculate stats for a habit
    const getHabitStats = (habit) => {
        const completedDates = Object.keys(habit.history).filter(d => habit.history[d]);
        const totalChecked = completedDates.length;
        
        // Streak calculation
        let currentStreak = 0;
        const sortedDates = [...completedDates].sort((a, b) => new Date(b) - new Date(a));
        
        // Check if today or yesterday was completed to count active streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const hasCompletedRecently = habit.history[todayStr] || habit.history[yesterdayStr];

        if (hasCompletedRecently) {
            let checkDate = new Date();
            // Start checking from today
            while (true) {
                const checkStr = checkDate.toISOString().split('T')[0];
                if (habit.history[checkStr]) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Completion rate over last 28 days
        const last28Checked = daysList.filter(d => habit.history[d]).length;
        const rate28 = Math.round((last28Checked / 28) * 100);

        return { totalChecked, currentStreak, rate28 };
    };

    return (
        <div className="space-y-10">
            {/* Split Grid: Add Habit & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                {/* Form column */}
                <div className="space-y-6">
                    {/* Add Habit Objective Card */}
                    <div className="brutal-card p-6 bg-white h-fit">
                        <div className="floating-label">MONITOR</div>
                        <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                            ADD HABIT OBJECTIVE
                        </h3>
                        <form onSubmit={handleCreateHabit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="font-mono text-xs font-bold block uppercase">HABIT TITLE</label>
                                <input 
                                    type="text"
                                    value={habitName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Drink 3L water, read 30m..."
                                    required
                                    className="input-brutal"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-mono text-xs font-bold block uppercase">CATEGORY</label>
                                <select 
                                    value={habitCategory} 
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    className="input-brutal cursor-pointer font-sans font-bold"
                                >
                                    <option value="Health">HEALTH</option>
                                    <option value="Work">WORK</option>
                                    <option value="Mind">MIND</option>
                                    <option value="Other">OTHER</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-brutal bg-yellow w-full py-3 mt-2">
                                <Plus size={18} />
                                <span>CREATE HABIT</span>
                            </button>
                        </form>
                    </div>

                    {/* Book Tracker Card */}
                    <div className="brutal-card p-6 bg-white h-fit">
                        <div className="floating-label">READING LIST</div>
                        <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                            BOOK ARCHIVE
                        </h3>
                        
                        {/* Add Book Form */}
                        <form onSubmit={handleCreateBook} className="space-y-4 border-b-2 border-black pb-6 mb-6">
                            <div className="space-y-1">
                                <label className="font-mono text-xs font-bold block uppercase">BOOK TITLE</label>
                                <input 
                                    type="text"
                                    value={bookTitle}
                                    onChange={(e) => setBookTitle(e.target.value)}
                                    placeholder="e.g. The Fountainhead..."
                                    required
                                    className="input-brutal text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-mono text-xs font-bold block uppercase">CURRENT PAGE</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        value={bookCurrentPage}
                                        onChange={(e) => setBookCurrentPage(parseInt(e.target.value) || 0)}
                                        className="input-brutal text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-mono text-xs font-bold block uppercase">TOTAL PAGES</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        value={bookTotalPages}
                                        onChange={(e) => setBookTotalPages(parseInt(e.target.value) || 100)}
                                        className="input-brutal text-xs"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-mono text-xs font-bold block uppercase">STATUS</label>
                                    <select 
                                        value={bookStatus} 
                                        onChange={(e) => setBookStatus(e.target.value)}
                                        className="input-brutal cursor-pointer font-mono font-bold text-xs"
                                    >
                                        <option value="want_to_read">WANT TO READ</option>
                                        <option value="reading">STILL READING</option>
                                        <option value="completed">COMPLETED</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" className="btn-brutal bg-yellow w-full py-2.5 text-xs">
                                        <Plus size={14} />
                                        <span>ADD BOOK</span>
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Book Records List */}
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {books.length === 0 ? (
                                <p className="font-mono text-xs text-gray-500 uppercase text-center py-6 border-2 border-dashed border-black bg-cream">
                                    No books logged.
                                </p>
                            ) : (
                                books.map((book) => {
                                    let statusBg = 'bg-cream';
                                    let statusText = 'WANT TO READ';
                                    if (book.status === 'reading') {
                                        statusBg = 'bg-yellow';
                                        statusText = 'STILL READING';
                                    } else if (book.status === 'completed') {
                                        statusBg = 'bg-green';
                                        statusText = 'COMPLETED';
                                    }

                                    const total = book.totalPages || 100;
                                    const current = book.currentPage || 0;
                                    const pct = Math.min(Math.round((current / total) * 100), 100);

                                    return (
                                        <div key={book.id} className="border-2 border-black p-3 bg-cream flex flex-col gap-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-mono font-bold text-xs uppercase tracking-tight break-all">
                                                    {book.title}
                                                </span>
                                                <button 
                                                    onClick={() => deleteBook(book.id)}
                                                    className="p-1 hover:bg-red hover:text-white border border-transparent hover:border-black cursor-pointer text-gray-500 shrink-0"
                                                    title="Delete book entry"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>

                                            {/* Progress bar and inputs */}
                                            <div className="space-y-1.5 my-1">
                                                <div className="flex justify-between font-mono text-[9px] font-bold uppercase items-center">
                                                    <span>PROGRESS: {pct}%</span>
                                                    <div className="flex items-center gap-1 font-mono">
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            max={total}
                                                            value={current}
                                                            onChange={(e) => updateBookPages(book.id, e.target.value, total)}
                                                            className="w-10 text-center border border-black bg-white py-0.5 text-[9px] font-bold"
                                                        />
                                                        <span>/</span>
                                                        <input 
                                                            type="number"
                                                            min="1"
                                                            value={total}
                                                            onChange={(e) => updateBookPages(book.id, current, e.target.value)}
                                                            className="w-10 text-center border border-black bg-white py-0.5 text-[9px] font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="h-2.5 border border-black bg-white w-full">
                                                    <div 
                                                        className={`h-full ${book.status === 'completed' ? 'bg-green' : 'bg-yellow'} transition-all duration-300`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 mt-1 border-t border-black border-dashed pt-2">
                                                <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 border border-black uppercase ${statusBg}`}>
                                                    {statusText}
                                                </span>

                                                <select
                                                    value={book.status}
                                                    onChange={(e) => updateBookStatus(book.id, e.target.value)}
                                                    className="input-brutal w-auto py-0.5 px-1 bg-white font-bold font-mono text-[9px] cursor-pointer"
                                                >
                                                    <option value="want_to_read">WANT TO READ</option>
                                                    <option value="reading">STILL READING</option>
                                                    <option value="completed">COMPLETED</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* List column */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-sans font-black text-xl tracking-wide uppercase">
                        HABIT METRICS & STREAKS
                    </h3>

                    {habits.length === 0 ? (
                        <div className="border-4 border-dashed border-black p-12 text-center bg-white font-mono text-sm text-gray-500 uppercase">
                            NO HABITS TO TRACK. SPAWN SOME TO BEGIN.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {habits.map((habit) => {
                                const { totalChecked, currentStreak, rate28 } = getHabitStats(habit);
                                const isCheckedToday = habit.history[todayStr] || false;

                                // Progress Circle Math
                                const radius = 28;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - (rate28 / 100) * circumference;

                                return (
                                    <div key={habit.id} className="brutal-card p-6 bg-white flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[9px] font-bold bg-black text-white px-2 py-0.5 border border-black uppercase">
                                                    {habit.category}
                                                </span>
                                                <span className="font-mono text-xs text-gray-500 font-bold">
                                                    STREAK: {currentStreak} DAYS
                                                </span>
                                            </div>
                                            <h4 className="font-sans font-black text-lg uppercase tracking-tight">
                                                {habit.name}
                                            </h4>
                                            
                                            {/* Heatmap grid */}
                                            <div className="space-y-1">
                                                <span className="font-mono text-[9px] text-gray-500 font-bold block uppercase">
                                                    LAST 28 DAYS ACTIVITY
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {daysList.map(date => {
                                                        const active = habit.history[date];
                                                        const isToday = date === todayStr;
                                                        
                                                        let blockColor = 'bg-white';
                                                        if (active) blockColor = 'bg-green';
                                                        
                                                        return (
                                                            <div 
                                                                key={date} 
                                                                onClick={() => toggleHabitDate(habit.id, date)}
                                                                className={`w-3.5 h-3.5 border border-black cursor-pointer transition-all hover:scale-125 hover:z-10 ${blockColor} ${
                                                                    isToday ? 'outline-2 outline-black outline-offset-1' : ''
                                                                }`}
                                                                title={`Date: ${date} | Status: ${active ? 'COMPLETED' : 'PENDING'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions & Rings */}
                                        <div className="flex items-center gap-6 self-stretch justify-between md:justify-end border-t-2 border-black border-dashed pt-4 md:pt-0 md:border-t-0 shrink-0">
                                            {/* Circular Progress Ring */}
                                            <div className="relative w-16 h-16 shrink-0" title={`Consistency rate: ${rate28}%`}>
                                                <svg className="w-full h-full">
                                                    <circle
                                                        className="text-gray-200 stroke-current"
                                                        strokeWidth="5"
                                                        cx="32"
                                                        cy="32"
                                                        r={radius}
                                                        fill="transparent"
                                                    />
                                                    <circle
                                                        className="text-green stroke-current progress-ring-circle"
                                                        strokeWidth="5"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={strokeDashoffset}
                                                        cx="32"
                                                        cy="32"
                                                        r={radius}
                                                        fill="transparent"
                                                        strokeLinecap="square"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold">
                                                    {rate28}%
                                                </div>
                                            </div>

                                            {/* Daily checkoff button */}
                                            <button 
                                                onClick={() => toggleHabitDate(habit.id, todayStr)}
                                                className={`w-12 h-12 border-2 border-black flex items-center justify-center shrink-0 cursor-pointer shadow-[3px_3px_0_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                                                    isCheckedToday ? 'bg-green text-black' : 'bg-white hover:bg-cream'
                                                }`}
                                            >
                                                <Check size={20} className={isCheckedToday ? 'stroke-[3px]' : 'text-gray-400'} />
                                            </button>

                                            {/* Delete */}
                                            <button 
                                                onClick={() => deleteHabit(habit.id)}
                                                className="p-2.5 hover:bg-red hover:text-white border-2 border-transparent hover:border-black cursor-pointer text-gray-500"
                                                title="Remove habit"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
