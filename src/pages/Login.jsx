import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { Target, Key, UserPlus, HelpCircle, Activity, ShieldCheck, Database } from 'lucide-react';

export default function Login() {
    const { login, register } = useLifeOSStore();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isRegister) {
            const success = await register(username, password);
            if (success) {
                setIsRegister(false); // Switch to login after successful register
                setPassword('');
            }
        } else {
            await login(username, password);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 select-none relative overflow-y-auto py-12">
            {/* Chaotic abstract backdrop blocks for zine vibe */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-yellow border-2 border-black -rotate-12 pointer-events-none opacity-20" />
            <div className="absolute bottom-20 right-10 w-32 h-16 bg-black border-2 border-yellow rotate-45 pointer-events-none opacity-20" />
            <div className="absolute top-1/4 right-20 w-16 h-16 bg-cream border-[3px] border-dashed border-black rotate-12 pointer-events-none" />

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl w-full z-10 items-stretch">
                
                {/* Login Monolith Card */}
                <div 
                    className="bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-8 relative transition-transform duration-300 hover:rotate-0 flex flex-col justify-between"
                    style={{ transform: 'rotate(-1.5deg)' }}
                >
                    {/* Visual stamps */}
                    <div className="absolute -top-3.5 -right-3.5 bg-black text-yellow border-2 border-black px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest rotate-6 uppercase">
                        {isRegister ? 'SYS.REG.REQ' : 'SYS.AUTH.REQ'}
                    </div>
                    
                    <div className="floating-label">
                        {isRegister ? 'CREATE IDENTITY' : 'ACCESS STATION'}
                    </div>

                    <div>
                        <div className="text-center mb-8 border-b-2 border-black pb-4">
                            <h1 className="font-sans font-black text-4xl tracking-tighter uppercase leading-none">
                                LIFE <span className="bg-yellow px-1.5 py-0.5 border-2 border-black">OS</span>
                            </h1>
                            <p className="font-mono text-[10px] text-gray-500 font-bold uppercase mt-2">
                                {isRegister ? 'NEW OPERATOR SIGNUP' : 'SECURE LOGON PROTOCOL // AGENT PORTAL'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="font-mono text-xs font-bold block uppercase flex items-center gap-1.5 text-black">
                                    <Target size={14} />
                                    <span>OPERATOR NAME / GMAIL</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. OPERATOR@GMAIL.COM"
                                    required
                                    className="input-brutal font-mono uppercase bg-white text-black"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs font-bold block uppercase flex items-center gap-1.5 text-black">
                                    <Key size={14} />
                                    <span>PASSCODE</span>
                                </label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="input-brutal font-mono bg-white text-black"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn-brutal bg-yellow w-full py-3 font-sans font-black tracking-wide text-sm mt-3 uppercase text-black"
                            >
                                {isRegister ? 'CONFIRM SIGNUP' : 'INITIATE SESSION'}
                            </button>
                        </form>
                    </div>

                    {/* Switch Login / Register link */}
                    <div className="mt-8 text-center pt-4 border-t border-dashed border-gray-300">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setUsername('');
                                setPassword('');
                            }}
                            className="font-mono text-[11px] font-bold text-black hover:underline uppercase flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                        >
                            <UserPlus size={12} />
                            {isRegister ? 'Already have an identity? Log in' : 'Create new operator identity'}
                        </button>
                    </div>
                </div>

                {/* Onboarding Directive Board */}
                <div 
                    className="bg-black text-white border-[3px] border-black shadow-[6px_6px_0px_#FFE566] p-8 relative transition-transform duration-300 hover:rotate-0 flex flex-col justify-between"
                    style={{ transform: 'rotate(1.5deg)' }}
                >
                    <div className="floating-label bg-yellow text-black">SYSTEM DIRECTIVE</div>
                    
                    <div className="space-y-6">
                        <div className="border-b-2 border-yellow pb-4">
                            <h2 className="font-sans font-black text-2xl md:text-3xl tracking-tight uppercase flex items-center gap-2">
                                <HelpCircle className="text-yellow" size={28} />
                                <span>WHAT IS LIFE OS?</span>
                            </h2>
                            <p className="font-mono text-[10px] text-yellow uppercase tracking-widest mt-1">
                                PERSONAL PERFORMANCE MONOLITH
                            </p>
                        </div>

                        <p className="font-mono text-xs leading-relaxed text-gray-300">
                            LIFE OS IS A SECURE, HIGH-CONTRAST TERMINAL DESIGNED TO CONSOLIDATE AND STREAMLINE YOUR LIFELONG METRICS. ALL DATA IS ISOLATED PER USER ACCOUNT AND AUTO-SYNCS ON EVERY LOCAL TERMINAL CHANGE.
                        </p>

                        <div className="space-y-4 pt-2">
                            <div className="flex gap-3 items-start">
                                <span className="bg-yellow text-black font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black shrink-0">01</span>
                                <div>
                                    <h4 className="font-sans font-black text-sm uppercase text-white tracking-wide">THE MONOLITH DASHBOARD</h4>
                                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">DAILY mood logging, weekly non-negotiable focus, and real-time checklist tracking.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <span className="bg-yellow text-black font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black shrink-0">02</span>
                                <div>
                                    <h4 className="font-sans font-black text-sm uppercase text-white tracking-wide">FINANCIAL CONTROL DECK</h4>
                                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">Budget boundaries, recurring subscription alerts, and transaction logs.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <span className="bg-yellow text-black font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black shrink-0">03</span>
                                <div>
                                    <h4 className="font-sans font-black text-sm uppercase text-white tracking-wide">FOCUS PROTOCOLS</h4>
                                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">Brutalist Pomodoro clocks with full statistics, goal milestones, and habit streaking.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-yellow/30 flex flex-wrap gap-4 justify-between items-center text-[9px] font-mono text-gray-400 uppercase">
                        <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-yellow" /> SHA-256 SECURED</span>
                        <span className="flex items-center gap-1"><Database size={11} className="text-yellow" /> FIREBASE CLOUD STORAGE</span>
                    </div>
                </div>

            </div>
            
            <div className="mt-12 z-10 font-mono text-[9px] font-bold text-gray-500 uppercase text-center">
                LIFE OS reporting service © 2026. all rights restricted to local terminal database.
            </div>
        </div>
    );
}
