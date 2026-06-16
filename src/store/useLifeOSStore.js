import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../utils/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// Helper to format date as YYYY-MM-DD
export const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const defaultSubscriptions = [
    { id: 'sub-1', name: 'Spotify Premium', cost: 14.99, category: 'Entertainment', renewDate: '2026-06-20', active: true },
    { id: 'sub-2', name: 'Netflix 4K', cost: 22.99, category: 'Entertainment', renewDate: '2026-06-22', active: true },
    { id: 'sub-3', name: 'Adobe Creative Cloud', cost: 54.99, category: 'Work', renewDate: '2026-06-28', active: true },
    { id: 'sub-4', name: 'Local Fitness Club', cost: 45.00, category: 'Health', renewDate: '2026-07-01', active: true },
    { id: 'sub-5', name: 'GitHub Copilot Pro', cost: 10.00, category: 'Work', renewDate: '2026-06-15', active: true }
];

const defaultTransactions = [
    { id: 'tx-1', title: 'Monthly Salary Payment', amount: 4500.00, type: 'income', category: 'Salary', date: '2026-06-01' },
    { id: 'tx-2', title: 'Supermarket Groceries', amount: 145.20, type: 'expense', category: 'Food', date: '2026-06-12' },
    { id: 'tx-3', title: 'GitHub Copilot Sub', amount: 10.00, type: 'expense', category: 'Subscriptions', date: '2026-06-15' },
    { id: 'tx-4', title: 'Electric Utility Bill', amount: 98.40, type: 'expense', category: 'Utilities', date: '2026-06-10' },
    { id: 'tx-5', title: 'Freelance Design Work', amount: 650.00, type: 'income', category: 'Freelance', date: '2026-06-08' },
    { id: 'tx-6', title: 'Gas Station Fuel', amount: 52.00, type: 'expense', category: 'Transport', date: '2026-06-14' },
    { id: 'tx-7', title: 'Steakhouse Dinner', amount: 120.00, type: 'expense', category: 'Food', date: '2026-06-13' }
];

const defaultTasks = [
    { id: 'task-1', text: 'Configure Brutalist dashboard styles', completed: true, priority: 'high', date: '2026-06-15' },
    { id: 'task-2', text: 'Complete react router setup', completed: true, priority: 'high', date: '2026-06-15' },
    { id: 'task-3', text: 'Review subscriptions list costs', completed: false, priority: 'medium', date: '2026-06-15' },
    { id: 'task-4', text: 'Stretching exercises 15m', completed: false, priority: 'low', date: '2026-06-15' },
    { id: 'task-5', text: 'Buy items for healthy lunch prep', completed: false, priority: 'high', date: '2026-06-15' }
];

const defaultHabits = [
    { 
        id: 'habit-1', 
        name: 'Drink 3L of Water', 
        category: 'Health', 
        history: {
            '2026-06-11': true,
            '2026-06-12': true,
            '2026-06-13': true,
            '2026-06-14': true
        }
    },
    { 
        id: 'habit-2', 
        name: 'Write Code for 1 Hour', 
        category: 'Work', 
        history: {
            '2026-06-11': true,
            '2026-06-12': false,
            '2026-06-13': true,
            '2026-06-14': true
        }
    },
    { 
        id: 'habit-3', 
        name: 'Exercise/Walk 30m', 
        category: 'Health', 
        history: {
            '2026-06-11': false,
            '2026-06-12': true,
            '2026-06-13': false,
            '2026-06-14': true
        }
    },
    { 
        id: 'habit-4', 
        name: 'Read 10 Book Pages', 
        category: 'Mind', 
        history: {
            '2026-06-11': true,
            '2026-06-12': true,
            '2026-06-13': true,
            '2026-06-14': false
        }
    }
];

const defaultBudgets = [
    { category: 'Food', limit: 400.00 },
    { category: 'Subscriptions', limit: 160.00 },
    { category: 'Utilities', limit: 200.00 },
    { category: 'Transport', limit: 120.00 },
    { category: 'Entertainment', limit: 100.00 }
];

const defaultGoals = [
    { 
        id: 'goal-1', 
        title: 'Emergency Fund Savings', 
        target: 10000, 
        current: 7500, 
        unit: '$',
        milestones: [
            { id: 'm-1-1', text: 'Reach $2,500', completed: true },
            { id: 'm-1-2', text: 'Reach $5,000', completed: true },
            { id: 'm-1-3', text: 'Reach $7,500', completed: true },
            { id: 'm-1-4', text: 'Reach $10,000', completed: false }
        ]
    },
    { 
        id: 'goal-2', 
        title: 'Read 12 Novels in 2026', 
        target: 12, 
        current: 5, 
        unit: 'books',
        milestones: [
            { id: 'm-2-1', text: 'Read 3 books', completed: true },
            { id: 'm-2-2', text: 'Read 6 books', completed: false },
            { id: 'm-2-3', text: 'Read 9 books', completed: false },
            { id: 'm-2-4', text: 'Read 12 books', completed: false }
        ]
    },
    { 
        id: 'goal-3', 
        title: 'Run 10K Endurance Time', 
        target: 10, 
        current: 8, 
        unit: 'km',
        milestones: [
            { id: 'm-3-1', text: 'Complete 5K non-stop', completed: true },
            { id: 'm-3-2', text: 'Complete 8K distance run', completed: true },
            { id: 'm-3-3', text: 'Run full 10K target', completed: false }
        ]
    }
];

const defaultBooks = [
    { id: 'book-1', title: 'The Brutalist Manifesto', status: 'completed', currentPage: 180, totalPages: 180 },
    { id: 'book-2', title: 'Designing Systems of Resistance', status: 'reading', currentPage: 45, totalPages: 250 },
    { id: 'book-3', title: 'Zero Gravity & Floating Concrete', status: 'want_to_read', currentPage: 0, totalPages: 300 }
];


export const useLifeOSStore = create(
    persist(
        (set, get) => ({
            // State fields
            subscriptions: defaultSubscriptions,
            transactions: defaultTransactions,
            tasks: defaultTasks,
            habits: defaultHabits,
            budgets: defaultBudgets,
            goals: defaultGoals,
            books: defaultBooks,
            weeklyFocus: 'FLOAT ACCORDING TO PLAN. DEFRAUD ENTROPY.',
            weeklyFocusCompleted: false,
            moodHistory: {},
            currency: 'USD',
            theme: 'light',
            isAuthenticated: false,
            user: null,
            syncStatus: 'offline',
            timerLogs: [],
            
            // Toasts & UI triggers
            toasts: [],
            triggerConfetti: false,

            addTimerLog: (title, duration, dateStr) => {
                const newLog = {
                    id: 'timer-log-' + Date.now(),
                    title: title || 'UNNAMED FOCUS SESSION',
                    duration: parseInt(duration) || 0,
                    date: dateStr || getTodayDateString(),
                    timestamp: new Date().toLocaleTimeString()
                };
                set(state => ({
                    timerLogs: [newLog, ...state.timerLogs]
                }));
                get().addToast(`Focus session recorded: ${newLog.title}`, 'success');
            },
            deleteTimerLog: (id) => {
                set(state => ({
                    timerLogs: state.timerLogs.filter(log => log.id !== id)
                }));
                get().addToast("Focus session log removed", "warning");
            },

            setTheme: (t) => {
                set({ theme: t });
                document.documentElement.classList.toggle('dark', t === 'dark');
            },
            setCurrency: (c) => set({ currency: c }),
            getCurrencySymbol: () => {
                const c = get().currency;
                if (c === 'INR') return '₹';
                if (c === 'EUR') return '€';
                if (c === 'GBP') return '£';
                return '$';
            },

            // Toast functions
            addToast: (message, type = 'info') => {
                const id = 'toast-' + Math.random().toString(36).substr(2, 9);
                set(state => ({
                    toasts: [...state.toasts, { id, message, type }]
                }));
                // Auto dismiss toast after 4s
                setTimeout(() => {
                    get().removeToast(id);
                }, 4000);
            },
            removeToast: (id) => {
                set(state => ({
                    toasts: state.toasts.filter(t => t.id !== id)
                }));
            },

            setConfetti: (val) => set({ triggerConfetti: val }),

            // Subscriptions CRUD
            addSubscription: (sub) => {
                const newSub = { ...sub, id: 'sub-' + Date.now() };
                set(state => ({
                    subscriptions: [...state.subscriptions, newSub]
                }));
                get().addToast(`Subscription "${newSub.name}" added`, 'success');
            },
            updateSubscription: (updatedSub) => {
                set(state => ({
                    subscriptions: state.subscriptions.map(s => s.id === updatedSub.id ? updatedSub : s)
                }));
                get().addToast(`Subscription "${updatedSub.name}" updated`, 'success');
            },
            deleteSubscription: (id) => {
                const sub = get().subscriptions.find(s => s.id === id);
                set(state => ({
                    subscriptions: state.subscriptions.filter(s => s.id !== id)
                }));
                if (sub) {
                    get().addToast(`Subscription "${sub.name}" deleted`, 'warning');
                }
            },

            // Transactions CRUD
            addTransaction: (tx) => {
                const newTx = { ...tx, id: 'tx-' + Date.now() };
                set(state => ({
                    transactions: [...state.transactions, newTx]
                }));
                get().addToast(`Transaction "${newTx.title}" added`, 'success');
            },
            deleteTransaction: (id) => {
                const tx = get().transactions.find(t => t.id === id);
                set(state => ({
                    transactions: state.transactions.filter(t => t.id !== id)
                }));
                if (tx) {
                    get().addToast(`Transaction "${tx.title}" deleted`, 'warning');
                }
            },

            // Tasks CRUD
            addTask: (text, priority = 'medium') => {
                const newTask = {
                    id: 'task-' + Date.now(),
                    text,
                    completed: false,
                    priority,
                    date: getTodayDateString()
                };
                set(state => ({
                    tasks: [newTask, ...state.tasks]
                }));
                get().addToast(`Task added: "${text.substring(0, 15)}..."`, 'success');
            },
            toggleTask: (id) => {
                let allCompletedNow = false;
                set(state => {
                    const updatedTasks = state.tasks.map(t => {
                        if (t.id === id) {
                            const newCompleted = !t.completed;
                            return { ...t, completed: newCompleted };
                        }
                        return t;
                    });
                    
                    // Filter tasks for today
                    const todayStr = getTodayDateString();
                    const todayTasks = updatedTasks.filter(t => t.date === todayStr);
                    if (todayTasks.length > 0 && todayTasks.every(t => t.completed)) {
                        allCompletedNow = true;
                    }

                    return { tasks: updatedTasks };
                });

                if (allCompletedNow) {
                    set({ triggerConfetti: true });
                    get().addToast("Daily Checklist Completed! Confetti Released!", "success");
                }
            },
            deleteTask: (id) => {
                set(state => ({
                    tasks: state.tasks.filter(t => t.id !== id)
                }));
            },

            // Habits CRUD
            addHabit: (name, category = 'Health') => {
                const newHabit = {
                    id: 'habit-' + Date.now(),
                    name,
                    category,
                    history: {}
                };
                set(state => ({
                    habits: [...state.habits, newHabit]
                }));
                get().addToast(`New Habit created: "${name}"`, 'success');
            },
            toggleHabitDate: (id, dateStr) => {
                set(state => ({
                    habits: state.habits.map(h => {
                        if (h.id === id) {
                            const currentHistory = { ...h.history };
                            currentHistory[dateStr] = !currentHistory[dateStr];
                            return { ...h, history: currentHistory };
                        }
                        return h;
                    })
                }));
            },
            deleteHabit: (id) => {
                set(state => ({
                    habits: state.habits.filter(h => h.id !== id)
                }));
                get().addToast("Habit deleted", "warning");
            },

            // Budget CRUD
            updateBudgetLimit: (category, limit) => {
                set(state => ({
                    budgets: state.budgets.map(b => b.category === category ? { ...b, limit: parseFloat(limit) } : b)
                }));
                get().addToast(`Budget for ${category} updated to $${limit}`, 'success');
            },

            // Goals CRUD
            addGoal: (goal) => {
                const newGoal = {
                    id: 'goal-' + Date.now(),
                    ...goal,
                    milestones: goal.milestones.map((m, i) => ({ id: `m-${Date.now()}-${i}`, text: m.text, completed: false }))
                };
                set(state => ({
                    goals: [...state.goals, newGoal]
                }));
                get().addToast(`New Goal created: "${goal.title}"`, 'success');
            },
            updateGoalProgress: (id, val) => {
                set(state => ({
                    goals: state.goals.map(g => {
                        if (g.id === id) {
                            const newCur = Math.min(Math.max(0, parseInt(val) || 0), g.target);
                            return { ...g, current: newCur };
                        }
                        return g;
                    })
                }));
            },
            toggleMilestone: (goalId, milestoneId) => {
                set(state => ({
                    goals: state.goals.map(g => {
                        if (g.id === goalId) {
                            const updatedMilestones = g.milestones.map(m => {
                                if (m.id === milestoneId) {
                                    const nextCompleted = !m.completed;
                                    if (nextCompleted) {
                                        // Trigger toast for milestone completion
                                        setTimeout(() => {
                                            get().addToast(`Milestone completed: "${m.text}"`, 'success');
                                        }, 100);
                                    }
                                    return { ...m, completed: nextCompleted };
                                }
                                return m;
                            });
                            return { ...g, milestones: updatedMilestones };
                        }
                        return g;
                    })
                }));
            },
            deleteGoal: (id) => {
                set(state => ({
                    goals: state.goals.filter(g => g.id !== id)
                }));
                get().addToast("Goal removed", "warning");
            },

            // Books CRUD
            addBook: (title, status = 'want_to_read', currentPage = 0, totalPages = 100) => {
                const newBook = {
                    id: 'book-' + Date.now(),
                    title,
                    status,
                    currentPage: parseInt(currentPage) || 0,
                    totalPages: parseInt(totalPages) || 100
                };
                set(state => ({
                    books: [...state.books, newBook]
                }));
                get().addToast(`Book "${title}" added`, 'success');
            },
            updateBookStatus: (id, status) => {
                set(state => ({
                    books: state.books.map(b => {
                        if (b.id === id) {
                            const updated = { ...b, status };
                            if (status === 'completed') updated.currentPage = b.totalPages;
                            return updated;
                        }
                        return b;
                    })
                }));
                get().addToast("Book status updated", 'success');
            },
            updateBookPages: (id, currentPage, totalPages) => {
                set(state => ({
                    books: state.books.map(b => {
                        if (b.id === id) {
                            const cur = Math.max(0, parseInt(currentPage) || 0);
                            const tot = Math.max(1, parseInt(totalPages) || 100);
                            const finalCur = Math.min(cur, tot);
                            const nextStatus = finalCur === tot ? 'completed' : b.status;
                            return { ...b, currentPage: finalCur, totalPages: tot, status: nextStatus };
                        }
                        return b;
                    })
                }));
            },
            deleteBook: (id) => {
                const book = get().books.find(b => b.id === id);
                set(state => ({
                    books: state.books.filter(b => b.id !== id)
                }));
                if (book) {
                    get().addToast(`Book "${book.title}" removed`, 'warning');
                }
            },

            // Focus and Mood Actions
            setWeeklyFocus: (focus) => {
                set({ weeklyFocus: focus, weeklyFocusCompleted: false });
                get().addToast("Weekly focus updated", "success");
            },
            toggleWeeklyFocus: () => {
                set(state => {
                    const nextVal = !state.weeklyFocusCompleted;
                    if (nextVal) {
                        setTimeout(() => get().addToast("Weekly focus completed! Nice work.", "success"), 100);
                    }
                    return { weeklyFocusCompleted: nextVal };
                });
            },
            setTodayMood: (dateStr, mood) => {
                set(state => {
                    const newHist = { ...state.moodHistory };
                    newHist[dateStr] = mood;
                    return { moodHistory: newHist };
                });
            },

            // Authentication Actions
            register: async (username, password) => {
                if (!db) {
                    get().addToast("Registration Offline: Firebase config missing.", "error");
                    return false;
                }
                const trimmedUsername = username.trim();
                const nameKey = trimmedUsername.toLowerCase();
                
                if (nameKey === 'raju') {
                    get().addToast("Username 'raju' is reserved.", "error");
                    return false;
                }
                
                if (trimmedUsername.length < 3) {
                    get().addToast("Username must be at least 3 characters long.", "error");
                    return false;
                }

                if (!password || password.length < 6) {
                    get().addToast("Passcode must be at least 6 characters long.", "error");
                    return false;
                }

                try {
                    const userRef = doc(db, "users", nameKey);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        get().addToast("Username already registered.", "error");
                        return false;
                    }

                    // Securely hash password before writing to the database
                    const encoder = new TextEncoder();
                    const data = encoder.encode(password);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashedPassword = Array.from(new Uint8Array(hashBuffer))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');

                    await setDoc(userRef, {
                        username: trimmedUsername,
                        password: hashedPassword
                    });
                    get().addToast("Registration successful! Please log in.", "success");
                    return true;
                } catch (e) {
                    console.error("Registration error:", e);
                    get().addToast(`Registration failed: ${e.message}`, "error");
                    return false;
                }
            },
            login: async (username, password) => {
                const nameKey = username.trim().toLowerCase();
                
                // Helper to wipe local data before loading new user session
                const resetDataForNewUser = () => {
                    set({
                        subscriptions: [],
                        transactions: [],
                        tasks: [],
                        habits: [],
                        budgets: [],
                        goals: [],
                        books: [],
                        weeklyFocus: 'FLOAT ACCORDING TO PLAN. DEFRAUD ENTROPY.',
                        weeklyFocusCompleted: false,
                        moodHistory: {},
                        timerLogs: []
                    });
                };

                // Helper to load defaults for Raju
                const resetDataToDefaults = () => {
                    set({
                        subscriptions: defaultSubscriptions,
                        transactions: defaultTransactions,
                        tasks: defaultTasks,
                        habits: defaultHabits,
                        budgets: defaultBudgets,
                        goals: defaultGoals,
                        books: defaultBooks,
                        weeklyFocus: 'FLOAT ACCORDING TO PLAN. DEFRAUD ENTROPY.',
                        weeklyFocusCompleted: false,
                        moodHistory: {},
                        timerLogs: []
                    });
                };

                if (nameKey !== 'raju') {
                    resetDataForNewUser();
                } else {
                    resetDataToDefaults();
                }

                if (nameKey === 'raju' && password.toLowerCase() === 'brutalist') {
                    set({ isAuthenticated: true, user: { name: 'Raju' } });
                    get().addToast("Authentication successful. Welcome Raju.", "success");
                    return true;
                }
                if (!db) {
                    get().addToast("Login Offline: Firebase config missing.", "error");
                    return false;
                }
                try {
                    const userRef = doc(db, "users", nameKey);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const dbPassword = userSnap.data().password;
                        
                        // Hash incoming password to check match
                        const encoder = new TextEncoder();
                        const data = encoder.encode(password);
                        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                        const hashedPassword = Array.from(new Uint8Array(hashBuffer))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join('');

                        // Verify against hashed password or fallback plaintext password (for backward compatibility)
                        const isValid = dbPassword === hashedPassword || dbPassword === password;
                        if (isValid) {
                            // If user was using plain password, auto-upgrade it to hashed version
                            if (dbPassword === password) {
                                await setDoc(userRef, {
                                    username: userSnap.data().username,
                                    password: hashedPassword
                                }, { merge: true });
                            }
                            const originalName = userSnap.data().username;
                            set({ isAuthenticated: true, user: { name: originalName } });
                            get().addToast(`Authentication successful. Welcome ${originalName}.`, "success");
                            return true;
                        }
                    }
                    get().addToast("Invalid operator credentials.", "error");
                    return false;
                } catch (e) {
                    console.error("Login error:", e);
                    get().addToast(`Login failed: ${e.message}`, "error");
                    return false;
                }
            },
            logout: () => {
                set({ 
                    isAuthenticated: false, 
                    user: null,
                    subscriptions: defaultSubscriptions,
                    transactions: defaultTransactions,
                    tasks: defaultTasks,
                    habits: defaultHabits,
                    budgets: defaultBudgets,
                    goals: defaultGoals,
                    books: defaultBooks,
                    weeklyFocus: 'FLOAT ACCORDING TO PLAN. DEFRAUD ENTROPY.',
                    weeklyFocusCompleted: false,
                    moodHistory: {},
                    timerLogs: []
                });
                get().addToast("Logged out from system.", "info");
            },

            // Global Import / Export / Reset
            importData: (jsonData) => {
                try {
                    const data = JSON.parse(jsonData);
                    const updatedState = {};
                    if (data.subscriptions) updatedState.subscriptions = data.subscriptions;
                    if (data.transactions) updatedState.transactions = data.transactions;
                    if (data.tasks) updatedState.tasks = data.tasks;
                    if (data.habits) updatedState.habits = data.habits;
                    if (data.budgets) updatedState.budgets = data.budgets;
                    if (data.goals) updatedState.goals = data.goals;
                    if (data.books) updatedState.books = data.books;
                    if (data.weeklyFocus) updatedState.weeklyFocus = data.weeklyFocus;
                    if (data.weeklyFocusCompleted !== undefined) updatedState.weeklyFocusCompleted = data.weeklyFocusCompleted;
                    if (data.moodHistory) updatedState.moodHistory = data.moodHistory;

                    set(updatedState);
                    get().addToast("Backup imported successfully!", "success");
                    return true;
                } catch (e) {
                    get().addToast("Error parsing backup JSON", "error");
                    return false;
                }
            },
            factoryReset: () => {
                set({
                    subscriptions: defaultSubscriptions,
                    transactions: defaultTransactions,
                    tasks: defaultTasks,
                    habits: defaultHabits,
                    budgets: defaultBudgets,
                    goals: defaultGoals,
                    books: defaultBooks,
                    weeklyFocus: 'FLOAT ACCORDING TO PLAN. DEFRAUD ENTROPY.',
                    weeklyFocusCompleted: false,
                    moodHistory: {},
                    currency: 'USD',
                    isAuthenticated: false,
                    user: null,
                    toasts: []
                });
                get().addToast("System reset to defaults", "warning");
            },
            clearAllData: () => {
                set({
                    subscriptions: [],
                    transactions: [],
                    tasks: [],
                    habits: [],
                    budgets: [],
                    goals: [],
                    books: [],
                    weeklyFocus: '',
                    weeklyFocusCompleted: false,
                    moodHistory: {}
                });
                get().addToast("All database values cleared (set to 0)", "warning");
            }
        }),
        {
            name: 'life-os-store-data',
            partialize: (state) => ({
                subscriptions: state.subscriptions,
                transactions: state.transactions,
                tasks: state.tasks,
                habits: state.habits,
                budgets: state.budgets,
                goals: state.goals,
                books: state.books,
                weeklyFocus: state.weeklyFocus,
                weeklyFocusCompleted: state.weeklyFocusCompleted,
                moodHistory: state.moodHistory,
                currency: state.currency,
                theme: state.theme,
                timerLogs: state.timerLogs,
                isAuthenticated: state.isAuthenticated,
                user: state.user
            })
        }
    )
);

let isSyncingFromRemote = false;
let unsubscribe = null;

const startFirebaseListener = (store) => {
    if (!db) {
        store.setState({ syncStatus: 'offline' });
        console.warn("Firebase Firestore is not initialized. Sync is disabled.");
        return;
    }
    if (unsubscribe) return;
    
    const user = store.getState().user;
    if (!user || !user.name) return;
    const nameKey = user.name.toLowerCase();
    
    store.setState({ syncStatus: 'connecting' });
    const docRef = doc(db, "sync", nameKey);
    
    unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const remoteData = docSnap.data();
            isSyncingFromRemote = true;
            
            store.setState({
                subscriptions: remoteData.subscriptions || [],
                transactions: remoteData.transactions || [],
                tasks: remoteData.tasks || [],
                habits: remoteData.habits || [],
                budgets: remoteData.budgets || [],
                goals: remoteData.goals || [],
                books: remoteData.books || [],
                weeklyFocus: remoteData.weeklyFocus || '',
                weeklyFocusCompleted: remoteData.weeklyFocusCompleted || false,
                moodHistory: remoteData.moodHistory || {},
                currency: remoteData.currency || 'USD',
                timerLogs: remoteData.timerLogs || [],
                syncStatus: 'synced'
            });
            
            isSyncingFromRemote = false;
        } else {
            store.setState({ syncStatus: 'synced' });
        }
    }, (error) => {
        console.error("Firestore sync subscription error:", error);
        store.setState({ syncStatus: 'error' });
        store.getState().addToast(`Sync connection failed: ${error.message}`, "error");
    });
};

const stopFirebaseListener = () => {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
};

export const setupSync = (store) => {
    // If already authenticated on load
    const initialState = store.getState();
    if (initialState.isAuthenticated && initialState.user?.name) {
        if (!db) {
            store.setState({ syncStatus: 'offline' });
            setTimeout(() => {
                store.getState().addToast("Sync Offline: Firebase config missing on server.", "error");
            }, 1500);
        } else {
            startFirebaseListener(store);
        }
    }

    // Listen to changes in authentication status
    store.subscribe((state, prevState) => {
        const authChanged = state.isAuthenticated !== prevState.isAuthenticated;
        if (authChanged) {
            if (state.isAuthenticated && state.user?.name) {
                if (!db) {
                    state.setState({ syncStatus: 'offline' });
                    state.addToast("Sync Offline: Firebase config missing on server.", "error");
                } else {
                    startFirebaseListener(store);
                }
            } else {
                stopFirebaseListener();
                store.setState({ syncStatus: 'offline' });
            }
        }
    });

    // Push local updates to Firebase
    store.subscribe((state, prevState) => {
        if (isSyncingFromRemote) return;
        if (!state.isAuthenticated || !state.user?.name) return;

        const hasChanged = 
            state.subscriptions !== prevState.subscriptions ||
            state.transactions !== prevState.transactions ||
            state.tasks !== prevState.tasks ||
            state.habits !== prevState.habits ||
            state.budgets !== prevState.budgets ||
            state.goals !== prevState.goals ||
            state.books !== prevState.books ||
            state.weeklyFocus !== prevState.weeklyFocus ||
            state.weeklyFocusCompleted !== prevState.weeklyFocusCompleted ||
            state.moodHistory !== prevState.moodHistory ||
            state.currency !== prevState.currency ||
            state.timerLogs !== prevState.timerLogs;

        if (hasChanged) {
            if (!db) {
                console.warn("Sync failed: db is not initialized.");
                return;
            }
            const nameKey = state.user.name.toLowerCase();
            const docRef = doc(db, "sync", nameKey);
            
            store.setState({ syncStatus: 'connecting' });
            setDoc(docRef, {
                subscriptions: state.subscriptions,
                transactions: state.transactions,
                tasks: state.tasks,
                habits: state.habits,
                budgets: state.budgets,
                goals: state.goals,
                books: state.books,
                weeklyFocus: state.weeklyFocus,
                weeklyFocusCompleted: state.weeklyFocusCompleted,
                moodHistory: state.moodHistory,
                currency: state.currency,
                timerLogs: state.timerLogs,
                updatedAt: Date.now()
            })
            .then(() => {
                store.setState({ syncStatus: 'synced' });
            })
            .catch(err => {
                console.error("Error syncing to Firebase:", err);
                store.setState({ syncStatus: 'error' });
                store.getState().addToast(`Sync write failed: ${err.message}`, "error");
            });
        }
    });
};

// Start setup
setupSync(useLifeOSStore);

// Apply initial theme from persisted state
const initialTheme = useLifeOSStore.getState().theme || 'light';
document.documentElement.classList.toggle('dark', initialTheme === 'dark');

