import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    CreditCard, 
    ArrowLeftRight, 
    CheckSquare, 
    Heart, 
    PieChart, 
    Target, 
    FileText, 
    Settings, 
    Menu, 
    X,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Timer
} from 'lucide-react';
import { useLifeOSStore } from '../store/useLifeOSStore';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { logout } = useLifeOSStore();

    // Map path names to user-friendly titles
    const pageTitles = {
        '/': 'PERSONAL DASHBOARD',
        '/subscriptions': 'SUBSCRIPTIONS AGGREGATOR',
        '/transactions': 'TRANSACTION LOGBOOK',
        '/tasks': 'DAILY TASKS & PRIORITIES',
        '/habits': 'HABITS STREAK HEATMAP',
        '/budget': 'EXPENSE CATEGORY BUDGETS',
        '/goals': 'GOALS & MILESTONES',
        '/report': 'MONTHLY ANALYSIS REPORT',
        '/settings': 'SYSTEM PREFERENCES',
        '/timer': 'FOCUS PROTOCOL TIMER'
    };

    const currentTitle = pageTitles[location.pathname] || 'LIFE OS';

    // All pages in the sidebar
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/tasks', label: 'Tasks', icon: CheckSquare },
        { path: '/habits', label: 'Habits', icon: Heart },
        { path: '/budget', label: 'Budget', icon: PieChart },
        { path: '/timer', label: 'Timer', icon: Timer },
        { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
        { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
        { path: '/goals', label: 'Goals', icon: Target },
        { path: '/report', label: 'Monthly Report', icon: FileText },
        { path: '/settings', label: 'Settings', icon: Settings }
    ];

    // Mobile tabs (5 tabs)
    const mobileTabs = [
        { path: '/', label: 'Dash', icon: LayoutDashboard },
        { path: '/tasks', label: 'Tasks', icon: CheckSquare },
        { path: '/habits', label: 'Habits', icon: Heart },
        { path: '/budget', label: 'Budget', icon: PieChart },
        { path: '/report', label: 'Report', icon: FileText }
    ];

    return (
        <div className="flex min-h-screen select-none bg-cream">
            {/* Sidebar (Desktop) */}
            <aside 
                className="hidden md:flex flex-col h-screen sticky top-0 bg-cream border-r-[2.5px] border-black transition-all duration-200 z-30"
                style={{ width: collapsed ? '56px' : '240px' }}
            >
                {/* Brand Logo / Title */}
                <div className="h-14 flex items-center justify-between px-4 border-b-[2.5px] border-black bg-white">
                    {!collapsed && (
                        <span className="font-sans font-black text-lg tracking-tight select-none">
                            LIFE <span className="bg-yellow px-1 py-0.5 border border-black">OS</span>
                        </span>
                    )}
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1 hover:bg-yellow border-[2.5px] border-transparent hover:border-black cursor-pointer ml-auto"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto px-2">
                    {navItems.map((item, idx) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        
                        // Anti-gravity alternating Y drift per item
                        const yDrift = idx % 2 === 0 ? '-2px' : '2px';

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 p-2.5 font-bold transition-all border-l-0 ${
                                    isActive 
                                        ? 'bg-black text-white border-l-[4px] border-l-yellow' 
                                        : 'hover:bg-yellow border-[2.5px] border-transparent hover:border-black'
                                }`}
                                style={{
                                    transform: isActive ? 'none' : `translateY(${yDrift})`,
                                    borderLeftWidth: isActive ? '4px' : '2.5px'
                                }}
                            >
                                <span className={isActive ? 'text-yellow' : 'text-black'}>
                                    <Icon size={20} />
                                </span>
                                {!collapsed && (
                                    <span className="font-sans text-sm tracking-wide">
                                        {item.label.toUpperCase()}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-2 border-t-[2.5px] border-black bg-white">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 p-2.5 font-bold transition-all border-[2.5px] border-transparent hover:border-black hover:bg-red hover:text-white w-full text-left cursor-pointer text-black"
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!collapsed && (
                            <span className="font-sans text-sm tracking-wide">
                                LOGOUT
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
                {/* Navbar (Top) */}
                <header className="h-14 bg-white border-b-[2.5px] border-black flex items-center justify-between px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-3">
                        <h2 className="font-sans font-black text-lg md:text-xl tracking-tight select-none text-black">
                            {currentTitle}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col text-right font-mono text-xs">
                            <span className="font-bold">STATUS: STABLE</span>
                            <span className="text-gray-500">SYS.2026.06.15</span>
                        </div>
                        {/* Mobile Menu Toggle Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-1.5 hover:bg-yellow border-[2.5px] border-black shadow-[2px_2px_0px_#000] cursor-pointer text-black"
                            title="Menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.15 }}
                            className="md:hidden fixed inset-x-0 top-14 bottom-16 bg-cream border-b-[2.5px] border-black z-30 flex flex-col p-4 space-y-2 overflow-y-auto shadow-[0_4px_0_#000]"
                        >
                            <span className="font-mono text-[10px] font-bold text-gray-500 pb-1 border-b border-black uppercase">
                                SYSTEM DIRECTORY
                            </span>
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 p-3 font-bold border-[2.5px] border-black shadow-[2px_2px_0px_#000] ${
                                            isActive ? 'bg-black text-white' : 'bg-white text-black'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-sans text-xs tracking-wide">
                                            {item.label.toUpperCase()}
                                        </span>
                                    </Link>
                                );
                            })}
                            
                            {/* Mobile Logout Button */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-3 p-3 font-bold border-[2.5px] border-black shadow-[2px_2px_0px_#000] bg-red text-white cursor-pointer mt-4"
                            >
                                <LogOut size={18} />
                                <span className="font-sans text-xs tracking-wide">
                                    LOGOUT
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Router Outlet with transitions */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15, rotate: -0.5 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, y: -15, rotate: 0.5 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Tab Bar (Bottom) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-cream border-t-[2.5px] border-black flex items-center justify-around z-40 px-2 shadow-[0_-4px_0_rgba(0,0,0,0.1)]">
                {mobileTabs.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-12 h-12 ${
                                isActive 
                                    ? 'bg-black text-white border-b-[3px] border-b-yellow p-1' 
                                    : 'text-black p-1'
                            }`}
                        >
                            <Icon size={20} />
                            <span className="font-mono text-[9px] font-bold mt-1 uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
