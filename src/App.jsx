import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import BrutalistConfetti from './components/BrutalistConfetti';
import { useLifeOSStore } from './store/useLifeOSStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

// Page Imports
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Transactions from './pages/Transactions';
import Tasks from './pages/Tasks';
import Habits from './pages/Habits';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import MonthlyReport from './pages/MonthlyReport';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  const isAuthenticated = useLifeOSStore(state => state.isAuthenticated);
  const { toasts, removeToast } = useLifeOSStore();

  return (
    <BrowserRouter>
      {/* Global Brutalist Confetti overlay */}
      <BrutalistConfetti />

      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="habits" element={<Habits />} />
            <Route path="budget" element={<Budget />} />
            <Route path="goals" element={<Goals />} />
            <Route path="report" element={<MonthlyReport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {/* Toast System (Bottom-Left, Rotated -1deg, Hard Shadow, Slides Up) */}
      <div className="fixed bottom-20 md:bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
          <AnimatePresence>
              {toasts.map((toast) => {
                  let bgColor = 'bg-white';
                  let textColor = 'text-black';
                  let borderColor = 'border-black';

                  if (toast.type === 'success') {
                      bgColor = 'bg-green';
                      textColor = 'text-black';
                  } else if (toast.type === 'warning') {
                      bgColor = 'bg-red';
                      textColor = 'text-white';
                  } else if (toast.type === 'error') {
                      bgColor = 'bg-red';
                      textColor = 'text-white';
                  }

                  return (
                      <motion.div
                          key={toast.id}
                          initial={{ opacity: 0, y: 50, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className={`pointer-events-auto p-4 border-[2.5px] ${borderColor} ${bgColor} ${textColor} flex items-center gap-3 shadow-[4px_4px_0px_#000]`}
                          style={{ transform: 'rotate(-1deg)' }}
                      >
                          <AlertCircle size={18} className="shrink-0" />
                          <span className="font-mono text-xs font-bold leading-tight">
                              {toast.message.toUpperCase()}
                          </span>
                          <button 
                              onClick={() => removeToast(toast.id)}
                              className="ml-auto hover:bg-black hover:text-white p-0.5 border border-transparent hover:border-white cursor-pointer"
                          >
                              <X size={14} />
                          </button>
                      </motion.div>
                  );
              })}
          </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
