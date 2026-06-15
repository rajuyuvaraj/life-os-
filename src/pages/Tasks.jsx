import React, { useState } from 'react';
import { useLifeOSStore, getTodayDateString } from '../store/useLifeOSStore';
import { Plus, Trash2, Award, Flame, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tasks() {
    const { tasks, addTask, toggleTask, deleteTask } = useLifeOSStore();
    
    // Form State
    const [taskText, setTaskText] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!taskText.trim()) return;
        addTask(taskText.trim(), taskPriority);
        setTaskText('');
    };

    const todayStr = getTodayDateString();
    
    // Filter tasks for today
    const todayTasks = tasks.filter(t => t.date === todayStr);
    const completedTasks = todayTasks.filter(t => t.completed);
    const pendingTasks = todayTasks.filter(t => !t.completed);
    
    // Sort tasks: high priority first, then medium, then low
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const sortedTasks = [...todayTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1; // completed go to the bottom
        }
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    // Simple streak estimation based on completion history (tasks marked as completed on previous dates)
    const completionRate = todayTasks.length > 0 
        ? Math.round((completedTasks.length / todayTasks.length) * 100) 
        : 0;

    return (
        <div className="space-y-10">
            {/* Stats header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="brutal-card p-6 bg-white tilt-1 tilt-hover">
                    <div className="floating-label">COMPLETION</div>
                    <span className="text-gray-500 font-mono text-xs block mb-2 uppercase">TODAY'S COMPLETION RATE</span>
                    <h3 className="font-sans font-black text-3xl">{completionRate}%</h3>
                    {/* Visual progress bar */}
                    <div className="h-2 border border-black bg-white w-full mt-3">
                        <div className="h-full bg-yellow" style={{ width: `${completionRate}%` }} />
                    </div>
                </div>

                <div className="brutal-card p-6 bg-white tilt-2 tilt-hover -mt-2">
                    <div className="floating-label floating-label-red">PENDING</div>
                    <span className="text-gray-500 font-mono text-xs block mb-2 uppercase">UNCOMPLETED OBJECTIVES</span>
                    <h3 className="font-sans font-black text-3xl text-red">{pendingTasks.length}</h3>
                </div>

                <div className="brutal-card p-6 bg-yellow tilt-3 tilt-hover">
                    <div className="floating-label">DONE</div>
                    <span className="text-black font-mono text-xs block mb-2 uppercase">SOLVED OBJECTIVES</span>
                    <h3 className="font-sans font-black text-3xl">{completedTasks.length} / {todayTasks.length}</h3>
                </div>
            </div>

            {/* Split Grid: Form and Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to spawn tasks */}
                <div className="brutal-card p-6 bg-white h-fit">
                    <div className="floating-label">CONSTRUCT</div>
                    <h3 className="font-sans font-black text-xl mb-6 tracking-wide uppercase">
                        SPAWN DAILY OBJECTIVE
                    </h3>
                    <form onSubmit={handleAddTask} className="space-y-4">
                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">OBJECTIVE DESCRIPTION</label>
                            <input 
                                type="text"
                                value={taskText}
                                onChange={(e) => setTaskText(e.target.value)}
                                placeholder="e.g. Finish building goals UI, stretch 15m..."
                                required
                                className="input-brutal"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">CRITICALITY / PRIORITY</label>
                            <select 
                                value={taskPriority} 
                                onChange={(e) => setTaskPriority(e.target.value)}
                                className="input-brutal cursor-pointer font-sans font-bold"
                            >
                                <option value="high">HIGH PRIORITY (RED)</option>
                                <option value="medium">MEDIUM PRIORITY (YELLOW)</option>
                                <option value="low">LOW PRIORITY (WHITE)</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-brutal bg-green w-full py-3 mt-2">
                            <Plus size={18} />
                            <span>SPAWN OBJECTIVE</span>
                        </button>
                    </form>
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-sans font-black text-xl tracking-wide uppercase">
                            TODAY'S WORKLIST
                        </h3>
                        <span className="font-mono text-[11px] font-bold bg-black text-white px-3 py-1 border border-black">
                            DATE: {todayStr}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {sortedTasks.length === 0 ? (
                            <div className="border-4 border-dashed border-black p-12 text-center bg-white flex flex-col items-center justify-center gap-4">
                                <AlertOctagon size={48} className="text-gray-400 rotate-12" />
                                <span className="font-sans font-black text-2xl tracking-tight text-gray-400">NOTHING HERE</span>
                                <span className="font-mono text-xs text-gray-500 uppercase">NO TASKS LOGGED FOR TODAY.</span>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {sortedTasks.map((task) => {
                                    // Custom rotation/strikethrough when checked
                                    const cardClass = task.completed 
                                        ? 'checked-card-tilt border-dashed opacity-60' 
                                        : 'bg-white hover:bg-cream';
                                    
                                    // Set tag color based on priority
                                    let tagBg = 'bg-white';
                                    if (task.priority === 'high') tagBg = 'bg-red text-white';
                                    else if (task.priority === 'medium') tagBg = 'bg-yellow';

                                    return (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20, rotate: -0.5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ 
                                                opacity: 0, 
                                                scale: 0.8, 
                                                rotate: 6, 
                                                x: 200, 
                                                transition: { duration: 0.22 } 
                                            }}
                                            className={`brutal-card p-4 flex items-center justify-between transition-all select-none ${cardClass}`}
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                {/* Bold custom check box */}
                                                <button 
                                                    onClick={() => toggleTask(task.id)}
                                                    className="w-7 h-7 border-[2.5px] border-black flex items-center justify-center bg-white shrink-0 hover:bg-yellow cursor-pointer"
                                                >
                                                    {task.completed && <span className="font-black text-lg text-black">✓</span>}
                                                </button>

                                                <div className="flex flex-col min-w-0">
                                                    <span className={`font-mono text-sm font-bold uppercase truncate ${
                                                        task.completed ? 'checked-text text-gray-500' : 'text-black'
                                                    }`}>
                                                        {task.text}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`font-mono text-[9px] font-bold px-2 py-0.5 border border-black uppercase ${tagBg}`}>
                                                    {task.priority}
                                                </span>
                                                <button 
                                                    onClick={() => deleteTask(task.id)}
                                                    className="p-1.5 hover:bg-red hover:text-white border border-transparent hover:border-black cursor-pointer text-gray-500"
                                                    title="Remove task"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
