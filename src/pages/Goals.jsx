import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { Target, Plus, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Goals() {
    const { goals, addGoal, updateGoalProgress, toggleMilestone, deleteGoal } = useLifeOSStore();
    
    // Form State
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalCurrent, setGoalCurrent] = useState('0');
    const [goalUnit, setGoalUnit] = useState('$');
    const [milestoneInputs, setMilestoneInputs] = useState(['', '']);

    const addMilestoneField = () => {
        setMilestoneInputs([...milestoneInputs, '']);
    };

    const updateMilestoneValue = (index, value) => {
        const nextList = [...milestoneInputs];
        nextList[index] = value;
        setMilestoneInputs(nextList);
    };

    const handleCreateGoal = (e) => {
        e.preventDefault();
        
        if (!goalTitle || !goalTarget) return;

        const filteredMilestones = milestoneInputs
            .filter(m => m.trim() !== '')
            .map(m => ({ text: m.trim() }));

        addGoal({
            title: goalTitle,
            target: parseInt(goalTarget),
            current: parseInt(goalCurrent) || 0,
            unit: goalUnit,
            milestones: filteredMilestones
        });

        // Reset
        setGoalTitle('');
        setGoalTarget('');
        setGoalCurrent('0');
        setGoalUnit('$');
        setMilestoneInputs(['', '']);
    };

    return (
        <div className="space-y-10">
            {/* Split Grid: Spawn goal & lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
                {/* Left Side: Create Goal Form */}
                <div className="brutal-card p-6 bg-white h-fit">
                    <div className="floating-label">PROPOSE</div>
                    <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                        SPAWN STRATEGIC GOAL
                    </h3>
                    <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">GOAL TITLE</label>
                            <input 
                                type="text"
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                placeholder="e.g. Save Emergency Fund, Read Novels..."
                                required
                                className="input-brutal"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="font-mono text-xs font-bold block uppercase">TARGET VALUE</label>
                                <input 
                                    type="number"
                                    value={goalTarget}
                                    onChange={(e) => setGoalTarget(e.target.value)}
                                    placeholder="10000"
                                    required
                                    className="input-brutal"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-mono text-xs font-bold block uppercase">MEASURE UNIT</label>
                                <input 
                                    type="text"
                                    value={goalUnit}
                                    onChange={(e) => setGoalUnit(e.target.value)}
                                    placeholder="$, books, km"
                                    required
                                    className="input-brutal"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">STARTING VALUE</label>
                            <input 
                                type="number"
                                value={goalCurrent}
                                onChange={(e) => setGoalCurrent(e.target.value)}
                                placeholder="0"
                                className="input-brutal"
                            />
                        </div>

                        {/* Milestones inputs */}
                        <div className="space-y-2 pt-2">
                            <label className="font-mono text-xs font-bold block uppercase">SUB-MILESTONES CHECKLIST</label>
                            {milestoneInputs.map((val, idx) => (
                                <input 
                                    key={idx}
                                    type="text"
                                    value={val}
                                    onChange={(e) => updateMilestoneValue(idx, e.target.value)}
                                    placeholder={`Milestone ${idx + 1}`}
                                    className="input-brutal text-xs py-1.5"
                                />
                            ))}
                            <button 
                                type="button" 
                                onClick={addMilestoneField}
                                className="btn-brutal btn-white text-[10px] py-1 px-2.5 mt-1 border-dashed"
                            >
                                + ADD MILESTONE STEP
                            </button>
                        </div>

                        <button type="submit" className="btn-brutal bg-green w-full py-3 mt-2">
                            <Plus size={18} />
                            <span>SPAWN GOAL</span>
                        </button>
                    </form>
                </div>

                {/* Right Side: Goals list */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-sans font-black text-xl tracking-wide uppercase">
                        ACTIVE LIFE OBJECTIVES
                    </h3>

                    {goals.length === 0 ? (
                        <div className="border-4 border-dashed border-black p-12 text-center bg-white font-mono text-sm text-gray-500 uppercase">
                            NO ACTIVE GOALS RECORDED. SPAWN ONE TO DEFINE TRACKING.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {goals.map((g) => {
                                const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
                                
                                // Progress Circle Math
                                const radius = 30;
                                const circumference = 2 * Math.PI * radius;
                                const strokeDashoffset = circumference - (pct / 100) * circumference;

                                return (
                                    <div key={g.id} className="brutal-card p-6 bg-white flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="space-y-4 flex-1 w-full min-w-0">
                                            <div className="flex items-center gap-3">
                                                <Target size={20} className="shrink-0 text-black" />
                                                <h4 className="font-sans font-black text-xl uppercase tracking-tight truncate">
                                                    {g.title}
                                                </h4>
                                            </div>

                                            {/* Progress slider inside card */}
                                            <div className="space-y-2">
                                                <label className="font-mono text-[9px] text-gray-500 font-bold block uppercase">
                                                    UPDATE PROGRESS VALUE
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <input 
                                                        type="range"
                                                        min="0"
                                                        max={g.target}
                                                        value={g.current}
                                                        onChange={(e) => updateGoalProgress(g.id, e.target.value)}
                                                        className="w-full h-3 bg-cream border-2 border-black outline-none accent-black"
                                                    />
                                                    <span className="font-mono text-xs font-bold min-w-[70px] text-right">
                                                        {g.current}/{g.target} {g.unit}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Milestones list */}
                                            {g.milestones.length > 0 && (
                                                <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-2">
                                                    <span className="font-mono text-[9px] text-gray-500 font-bold block uppercase">
                                                        MILESTONES STEPS CHECKLIST
                                                    </span>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {g.milestones.map(m => (
                                                            <div 
                                                                key={m.id} 
                                                                onClick={() => toggleMilestone(g.id, m.id)}
                                                                className="border border-black p-2 flex items-center gap-2 bg-cream cursor-pointer hover:bg-white transition-colors"
                                                            >
                                                                <div className="w-4 h-4 border-2 border-black shrink-0 bg-white flex items-center justify-center">
                                                                    {m.completed && <span className="font-black text-[9px]">✓</span>}
                                                                </div>
                                                                <span className={`font-mono text-[10px] uppercase truncate ${
                                                                    m.completed ? 'line-through text-gray-400' : 'font-bold'
                                                                }`}>
                                                                    {m.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Circular progress and actions */}
                                        <div className="flex items-center gap-6 justify-between md:justify-end border-t-2 border-black border-dashed pt-4 md:pt-0 md:border-t-0 shrink-0 self-stretch md:self-auto">
                                            {/* Progress Circle Ring */}
                                            <div className="relative w-20 h-20 shrink-0">
                                                <svg className="w-full h-full">
                                                    <circle
                                                        className="text-gray-200 stroke-current"
                                                        strokeWidth="6"
                                                        cx="40"
                                                        cy="40"
                                                        r={radius}
                                                        fill="transparent"
                                                    />
                                                    <circle
                                                        className="text-yellow stroke-current progress-ring-circle"
                                                        strokeWidth="6"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={strokeDashoffset}
                                                        cx="40"
                                                        cy="40"
                                                        r={radius}
                                                        fill="transparent"
                                                        strokeLinecap="square"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono font-bold leading-none">
                                                    <span className="text-sm">{pct}%</span>
                                                    <span className="text-[8px] text-gray-400 mt-1 uppercase">DONE</span>
                                                </div>
                                            </div>

                                            {/* Delete */}
                                            <button 
                                                onClick={() => deleteGoal(g.id)}
                                                className="p-3 hover:bg-red hover:text-white border-2 border-transparent hover:border-black cursor-pointer text-gray-500"
                                                title="Delete Goal"
                                            >
                                                <Trash2 size={18} />
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
