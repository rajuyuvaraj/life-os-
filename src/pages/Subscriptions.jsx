import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { CreditCard, Trash2, Plus, Calendar, Settings, Tag, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function Subscriptions() {
    const { subscriptions, addSubscription, updateSubscription, deleteSubscription, getCurrencySymbol } = useLifeOSStore();
    const currencySymbol = getCurrencySymbol();
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [formName, setFormName] = useState('');
    const [formCost, setFormCost] = useState('');
    const [formCategory, setFormCategory] = useState('Entertainment');
    const [formRenewDate, setFormRenewDate] = useState('');

    const openAddModal = () => {
        setEditingSub(null);
        setFormName('');
        setFormCost('');
        setFormCategory('Entertainment');
        setFormRenewDate('');
        setIsModalOpen(true);
    };

    const openEditModal = (sub) => {
        setEditingSub(sub);
        setFormName(sub.name);
        setFormCost(sub.cost);
        setFormCategory(sub.category);
        setFormRenewDate(sub.renewDate);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (!formName || !formCost || !formRenewDate) return;

        const subData = {
            name: formName,
            cost: parseFloat(formCost),
            category: formCategory,
            renewDate: formRenewDate,
            active: true
        };

        if (editingSub) {
            updateSubscription({ ...editingSub, ...subData });
        } else {
            addSubscription(subData);
        }

        setIsModalOpen(false);
    };

    const toggleActiveStatus = (sub) => {
        updateSubscription({ ...sub, active: !sub.active });
    };

    // Calculate aggregated values
    const monthlyTotal = subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + s.cost, 0);

    const yearlyTotal = monthlyTotal * 12;

    // Chart breakdown
    const categoriesData = subscriptions
        .filter(s => s.active)
        .reduce((acc, s) => {
            const existing = acc.find(item => item.name === s.category);
            if (existing) {
                existing.value += s.cost;
            } else {
                acc.push({ name: s.category, value: s.cost });
            }
            return acc;
        }, []);

    const COLORS = ['#FFE566', '#FF4444', '#44CC88', '#000000', '#9CA3AF'];

    return (
        <div className="space-y-10">
            {/* Aggregate Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="brutal-card p-6 bg-white tilt-1 tilt-hover">
                    <div className="floating-label">MONTHLY BILL</div>
                    <span className="text-gray-500 font-mono text-xs block mb-2 uppercase">RECURRING OUTFLOW</span>
                    <h3 className="font-sans font-black text-3xl">{currencySymbol}{monthlyTotal.toFixed(2)}</h3>
                </div>

                <div className="brutal-card p-6 bg-white tilt-2 tilt-hover -mt-1">
                    <div className="floating-label floating-label-red">EST. ANNUALLY</div>
                    <span className="text-gray-500 font-mono text-xs block mb-2 uppercase">12-MONTH PROJECTION</span>
                    <h3 className="font-sans font-black text-3xl text-red">{currencySymbol}{yearlyTotal.toFixed(2)}</h3>
                </div>

                <div className="brutal-card p-6 bg-yellow tilt-3 tilt-hover">
                    <div className="floating-label">COUNT</div>
                    <span className="text-black font-mono text-xs block mb-2 uppercase">ACTIVE MEMBERSHIPS</span>
                    <h3 className="font-sans font-black text-3xl">
                        {subscriptions.filter(s => s.active).length} / {subscriptions.length}
                    </h3>
                </div>
            </div>

            {/* Layout Split: Chart and Grid list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Pie Chart Breakdown */}
                <div className="brutal-card p-6 bg-white h-fit">
                    <div className="floating-label">SEGREGATE</div>
                    <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                        CATEGORY DISTRIBUTION
                    </h3>
                    <div className="h-64 flex justify-center items-center">
                        {categoriesData.length === 0 ? (
                            <p className="font-mono text-sm text-gray-500 uppercase">NO ACTIVE SUBS TO CHART</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoriesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoriesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2.5} />
                                        ))}
                                    </Pie>
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
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs">
                        {categoriesData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className="w-3 h-3 border border-black inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="font-bold uppercase">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side: CRUD Grid list */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-sans font-black text-xl tracking-wide uppercase">
                            MEMBERSHIP DETAILS
                        </h3>
                        <button onClick={openAddModal} className="btn-brutal bg-green">
                            <Plus size={18} />
                            <span>ADD SUBSCRIPTION</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {subscriptions.map((sub, idx) => {
                                const yOffset = idx % 2 === 0 ? 'translateY(-2px)' : 'translateY(2px)';
                                
                                return (
                                    <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                        animate={{ opacity: 1, scale: 1, rotate: sub.active ? 0 : 0.5 }}
                                        exit={{ 
                                            opacity: 0, 
                                            scale: 0.8, 
                                            rotate: -8, 
                                            x: -100, 
                                            transition: { duration: 0.25 } 
                                        }}
                                        className={`brutal-card p-5 flex flex-col justify-between ${
                                            sub.active ? 'bg-white' : 'bg-gray-200 opacity-60'
                                        }`}
                                        style={{ transform: sub.active ? yOffset : 'none' }}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="font-mono text-[10px] font-bold bg-yellow px-2 py-0.5 border border-black uppercase">
                                                    {sub.category}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(sub)}
                                                        className="p-1 hover:bg-cream border border-transparent hover:border-black cursor-pointer text-gray-700"
                                                        title="Edit subscription"
                                                    >
                                                        <Settings size={14} />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteSubscription(sub.id)}
                                                        className="p-1 hover:bg-red hover:text-white border border-transparent hover:border-black cursor-pointer text-red"
                                                        title="Delete subscription"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="font-sans font-black text-lg uppercase tracking-tight mb-2">
                                                {sub.name}
                                            </h4>
                                            <div className="font-mono text-xs text-gray-500 space-y-1 mb-6 uppercase">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} />
                                                    <span>RENEWS: {sub.renewDate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-400">
                                            <button 
                                                onClick={() => toggleActiveStatus(sub)}
                                                className={`font-mono text-[10px] font-black border-2 border-black px-2.5 py-1 cursor-pointer shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 ${
                                                    sub.active ? 'bg-black text-white' : 'bg-white text-black'
                                                }`}
                                            >
                                                {sub.active ? 'ACTIVE' : 'PAUSED'}
                                            </button>
                                            <span className="font-mono font-bold text-lg">
                                                {currencySymbol}{sub.cost.toFixed(2)}/mo
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modal: Slide up from bottom with full-black header */}
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
                                    {editingSub ? 'EDIT SUBSCRIPTION' : 'ADD NEW MEMBERSHIP'}
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
                                    <label className="font-mono text-xs font-bold block uppercase">MEMBERSHIP NAME</label>
                                    <input 
                                        type="text" 
                                        value={formName} 
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="e.g. Spotify, Gym"
                                        required 
                                        className="input-brutal"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-mono text-xs font-bold block uppercase">MONTHLY COST ({currencySymbol})</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={formCost} 
                                            onChange={(e) => setFormCost(e.target.value)}
                                            placeholder="14.99"
                                            required 
                                            className="input-brutal"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-mono text-xs font-bold block uppercase">CATEGORY</label>
                                        <select 
                                            value={formCategory} 
                                            onChange={(e) => setFormCategory(e.target.value)}
                                            className="input-brutal cursor-pointer font-sans font-bold"
                                        >
                                            <option value="Entertainment">ENTERTAINMENT</option>
                                            <option value="Work">WORK</option>
                                            <option value="Health">HEALTH</option>
                                            <option value="Utilities">UTILITIES</option>
                                            <option value="Other">OTHER</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="font-mono text-xs font-bold block uppercase">RENEWAL / BILLING DATE</label>
                                    <input 
                                        type="date" 
                                        value={formRenewDate} 
                                        onChange={(e) => setFormRenewDate(e.target.value)}
                                        required 
                                        className="input-brutal"
                                    />
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
                                        SAVE MEMBERSHIP
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
