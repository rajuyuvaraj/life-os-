import React, { useState, useEffect, useRef } from 'react';
import { useLifeOSStore, getTodayDateString } from '../store/useLifeOSStore';
import { Play, Pause, RotateCcw, Save, Trash2, Maximize2, X, Terminal, Clock, Flame } from 'lucide-react';

export default function Timer() {
    const { timerLogs, addTimerLog, deleteTimerLog } = useLifeOSStore();
    
    // Core Timer States
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('FOCUS WORK');
    
    // Popup state
    const [showHugePopup, setShowHugePopup] = useState(false);
    
    // Inner session event logs
    const [sessionEvents, setSessionEvents] = useState([]);
    
    // Timer mode
    const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' | 'pomodoro'
    const [pomoStartMinutes, setPomoStartMinutes] = useState(25);
    
    const intervalRef = useRef(null);

    // Format seconds into HH:MM:SS
    const formatTime = (totalSecs) => {
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Format duration into readable text
    const formatDuration = (totalSecs) => {
        if (totalSecs < 60) return `${totalSecs}s`;
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    };

    const addEventLog = (message) => {
        const timeStr = new Date().toLocaleTimeString();
        setSessionEvents(prev => [`[${timeStr}] ${message}`, ...prev]);
    };

    // Timer Effect
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (timerMode === 'stopwatch') {
                    setSeconds(prev => prev + 1);
                } else {
                    // Pomodoro
                    setSeconds(prev => {
                        if (prev <= 1) {
                            setIsActive(false);
                            clearInterval(intervalRef.current);
                            addEventLog("POMODORO SESSION COMPLETE!");
                            // Trigger audio/toast
                            useLifeOSStore.getState().addToast(`Pomodoro complete: ${sessionTitle}`, "success");
                            useLifeOSStore.getState().setConfetti(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timerMode]);

    const handleStart = () => {
        if (!isActive) {
            if (seconds === 0 && timerMode === 'pomodoro') {
                setSeconds(pomoStartMinutes * 60);
            }
            setIsActive(true);
            setShowHugePopup(true);
            addEventLog(`Session "${sessionTitle}" initialized.`);
        }
    };

    const handlePause = () => {
        setIsActive(false);
        addEventLog(`Paused at ${formatTime(seconds)}`);
    };

    const handleResume = () => {
        setIsActive(true);
        addEventLog("Resumed session.");
    };

    const handleReset = () => {
        setIsActive(false);
        setSeconds(timerMode === 'stopwatch' ? 0 : pomoStartMinutes * 60);
        setSessionEvents([]);
    };

    const handleSaveSession = () => {
        setIsActive(false);
        const duration = timerMode === 'stopwatch' 
            ? seconds 
            : (pomoStartMinutes * 60) - seconds;
            
        if (duration > 0) {
            addTimerLog(sessionTitle.toUpperCase(), duration, getTodayDateString());
            addEventLog(`Session saved successfully.`);
        }
        setShowHugePopup(false);
        handleReset();
    };

    const handleCancelSession = () => {
        if (window.confirm("Abandon current focus session? Progress will not be logged.")) {
            setIsActive(false);
            setShowHugePopup(false);
            handleReset();
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Top Config Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="brutal-card p-6 bg-white space-y-6 lg:col-span-2">
                    <div className="floating-label">TIMER PARAMETERS</div>
                    
                    <div className="space-y-4">
                        {/* Selector tabs for mode */}
                        <div className="grid grid-cols-2 border-[2.5px] border-black">
                            <button
                                onClick={() => {
                                    setTimerMode('stopwatch');
                                    handleReset();
                                }}
                                className={`py-3 text-xs font-mono font-black uppercase transition-all border-r-[2.5px] border-black ${
                                    timerMode === 'stopwatch' ? 'bg-yellow text-black' : 'bg-white hover:bg-cream'
                                }`}
                            >
                                STOPWATCH (COUNT UP)
                            </button>
                            <button
                                onClick={() => {
                                    setTimerMode('pomodoro');
                                    setSeconds(pomoStartMinutes * 60);
                                    setIsActive(false);
                                }}
                                className={`py-3 text-xs font-mono font-black uppercase transition-all ${
                                    timerMode === 'pomodoro' ? 'bg-yellow text-black' : 'bg-white hover:bg-cream'
                                }`}
                            >
                                POMODORO (COUNT DOWN)
                            </button>
                        </div>

                        {/* Title input */}
                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">SESSION LABEL</label>
                            <input
                                type="text"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                className="input-brutal font-mono uppercase"
                                placeholder="e.g. CODING PORTFOLIO"
                            />
                        </div>

                        {/* Pomo selector minutes */}
                        {timerMode === 'pomodoro' && (
                            <div className="space-y-1">
                                <label className="font-mono text-xs font-bold block uppercase">FOCUS INTERVAL (MINUTES)</label>
                                <select
                                    value={pomoStartMinutes}
                                    onChange={(e) => {
                                        const mins = parseInt(e.target.value);
                                        setPomoStartMinutes(mins);
                                        setSeconds(mins * 60);
                                    }}
                                    className="input-brutal font-sans font-bold cursor-pointer"
                                >
                                    <option value="15">15 MINUTES</option>
                                    <option value="25">25 MINUTES (STANDARD)</option>
                                    <option value="45">45 MINUTES (DEEP WORK)</option>
                                    <option value="60">60 MINUTES (EXTREME)</option>
                                </select>
                            </div>
                        )}

                        {/* Mini preview & Start button */}
                        <div className="border-2 border-black p-6 bg-cream flex flex-col items-center justify-center space-y-4">
                            <h2 className="font-mono text-5xl font-black tracking-widest text-black">
                                {formatTime(seconds)}
                            </h2>
                            <span className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5 border border-black uppercase">
                                {timerMode === 'stopwatch' ? 'STOPWATCH READY' : `COUNTDOWN PRESET: ${pomoStartMinutes}m`}
                            </span>
                            
                            <button
                                onClick={handleStart}
                                className="btn-brutal bg-green w-full py-3.5 mt-2 text-sm font-mono tracking-wider font-bold"
                            >
                                <Play size={16} className="inline mr-1" /> LAUNCH FULLSCREEN SESSION
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info and statistics widget */}
                <div className="brutal-card p-6 bg-white space-y-6">
                    <div className="floating-label floating-label-green">PERFORMANCE</div>
                    <h3 className="font-sans font-black text-xl tracking-wide uppercase flex items-center gap-2">
                        <Flame size={20} className="fill-yellow" />
                        <span>SESSION INSIGHTS</span>
                    </h3>
                    
                    <div className="space-y-4 font-mono text-xs uppercase">
                        <div className="p-3 border-2 border-black bg-cream flex justify-between items-center">
                            <span>TOTAL LOGS</span>
                            <span className="font-black text-sm">{(timerLogs || []).length}</span>
                        </div>
                        <div className="p-3 border-2 border-black bg-cream flex justify-between items-center">
                            <span>TOTAL ACCUMULATED FOCUS</span>
                            <span className="font-black text-sm">
                                {formatDuration((timerLogs || []).reduce((sum, log) => sum + log.duration, 0))}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed pt-2">
                            THE MONOLITH DEMANDS QUANTIFIABLE PROGRESS. EVERY SECOND REGISTERED CONTRIBUTES TO TOTAL WORKSPACE INTEGRITY.
                        </p>
                    </div>
                </div>
            </div>

            {/* Logs List Section */}
            <div className="brutal-card p-6 bg-white space-y-6">
                <div className="floating-label">SYSTEM LOGBOOK</div>
                <h3 className="font-sans font-black text-xl tracking-wide uppercase flex items-center gap-2">
                    <Clock size={20} />
                    <span>FOCUS LEDGER RECORDINGS</span>
                </h3>
                
                <div className="space-y-3">
                    {(timerLogs || []).length === 0 ? (
                        <div className="border-2 border-dashed border-black p-10 text-center text-gray-500 font-mono text-sm uppercase">
                            NO LOGGED FOCUS SESSIONS YET. START A SESSION ABOVE.
                        </div>
                    ) : (
                        (timerLogs || []).map((log) => (
                            <div key={log.id} className="border-2 border-black p-4 flex items-center justify-between bg-cream hover:bg-white transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-sans font-black text-sm uppercase tracking-wide">{log.title}</span>
                                    <div className="flex gap-2 font-mono text-[9px] font-bold text-gray-500 uppercase mt-0.5">
                                        <span>{log.date}</span>
                                        <span>•</span>
                                        <span>{log.timestamp}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs font-black bg-yellow px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                                        {formatDuration(log.duration).toUpperCase()}
                                    </span>
                                    <button
                                        onClick={() => deleteTimerLog(log.id)}
                                        className="btn-brutal bg-red p-1.5 cursor-pointer text-white hover:bg-black"
                                        title="Delete log entry"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Huge Fullscreen overlay popup */}
            {showHugePopup && (
                <div className="fixed inset-0 bg-cream dark:bg-[#121212] z-[99999] flex flex-col p-6 md:p-10 select-none overflow-hidden">
                    {/* Header bar */}
                    <div className="flex justify-between items-center border-b-4 border-black dark:border-white pb-6 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="animate-pulse w-3 h-3 bg-red" />
                            <span className="font-mono text-sm font-black uppercase text-black dark:text-white">
                                SESSION ACTIVE: {sessionTitle}
                            </span>
                        </div>
                        <button
                            onClick={handleCancelSession}
                            className="btn-brutal bg-red text-white py-1 px-3 text-xs font-mono font-bold"
                        >
                            <X size={14} className="inline mr-1" /> ABANDON
                        </button>
                    </div>

                    {/* Middle giant timer container */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center">
                        {/* Huge ticking text */}
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6 w-full text-center">
                            <h1 className="font-sans font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] tracking-widest leading-none text-black dark:text-white font-black">
                                {formatTime(seconds)}
                            </h1>
                            <span className="font-mono text-xs font-bold uppercase tracking-widest bg-black text-yellow px-4 py-1.5 border-2 border-black dark:border-white dark:bg-white dark:text-black">
                                {timerMode.toUpperCase()} MODE
                            </span>
                            
                            {/* Controls */}
                            <div className="flex flex-wrap gap-4 justify-center pt-6 max-w-md w-full">
                                {isActive ? (
                                    <button
                                        onClick={handlePause}
                                        className="btn-brutal bg-yellow py-4 px-8 flex-1 text-sm font-mono font-black"
                                    >
                                        <Pause size={18} className="inline mr-1" /> PAUSE SESSION
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleResume}
                                        className="btn-brutal bg-green py-4 px-8 flex-1 text-sm font-mono font-black"
                                    >
                                        <Play size={18} className="inline mr-1" /> RESUME SESSION
                                    </button>
                                )}
                                
                                <button
                                    onClick={handleSaveSession}
                                    className="btn-brutal bg-white py-4 px-8 text-sm font-mono font-black border-2 border-black"
                                    disabled={seconds === 0 && timerMode === 'stopwatch'}
                                >
                                    <Save size={18} className="inline mr-1" /> SAVE & EXIT
                                </button>
                            </div>
                        </div>

                        {/* Real-time terminal log container */}
                        <div className="w-full lg:w-96 h-64 lg:h-full border-4 border-black dark:border-white bg-black p-4 flex flex-col font-mono text-xs text-green-400 select-text">
                            <div className="flex items-center gap-2 border-b border-gray-800 pb-2 mb-3 shrink-0">
                                <Terminal size={14} />
                                <span className="font-bold text-[10px] text-gray-400 uppercase">SESSION PROTOCOL LOG</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
                                {sessionEvents.length === 0 ? (
                                    <div className="text-gray-600 italic">No events logged yet.</div>
                                ) : (
                                    sessionEvents.map((evt, idx) => (
                                        <div key={idx} className="leading-relaxed">
                                            {evt}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
