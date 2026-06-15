import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { Target, Key, Flame } from 'lucide-react';

export default function Login() {
    const { login } = useLifeOSStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
            {/* Chaotic abstract backdrop blocks for zine vibe */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-yellow border-2 border-black -rotate-12 pointer-events-none opacity-20" />
            <div className="absolute bottom-20 right-10 w-32 h-16 bg-black border-2 border-yellow rotate-45 pointer-events-none opacity-20" />
            <div className="absolute top-1/4 right-20 w-16 h-16 bg-cream border-[3px] border-dashed border-black rotate-12 pointer-events-none" />

            {/* Login Monolith Card */}
            <div 
                className="w-full max-w-md bg-white border-[3px] border-black shadow-[6px_6px_0px_#000000] p-8 relative transition-transform duration-300 hover:rotate-0"
                style={{ transform: 'rotate(-2deg)' }}
            >
                {/* Visual stamps */}
                <div className="absolute -top-3.5 -right-3.5 bg-black text-yellow border-2 border-black px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest rotate-6 uppercase">
                    SYS.AUTH.REQ
                </div>
                
                <div className="floating-label">ACCESS STATION</div>

                <div className="text-center mb-8 border-b-2 border-black pb-4">
                    <h1 className="font-sans font-black text-4xl tracking-tighter uppercase leading-none">
                        LIFE <span className="bg-yellow px-1.5 py-0.5 border-2 border-black">OS</span>
                    </h1>
                    <p className="font-mono text-[10px] text-gray-500 font-bold uppercase mt-2">
                        SECURE LOGON PROTOCOL // AGENT PORTAL
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="font-mono text-xs font-bold block uppercase flex items-center gap-1.5">
                            <Target size={14} />
                            <span>OPERATOR NAME</span>
                        </label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. RAJU"
                            required
                            className="input-brutal font-mono uppercase"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-mono text-xs font-bold block uppercase flex items-center gap-1.5">
                            <Key size={14} />
                            <span>PASSCODE</span>
                        </label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="input-brutal font-mono"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-brutal bg-yellow w-full py-3 font-sans font-black tracking-wide text-sm mt-3 uppercase"
                    >
                        INITIATE SESSION
                    </button>
                </form>

                {/* Hints panel */}
                <div className="mt-6 border border-black border-dashed p-3 bg-cream font-mono text-[10px] space-y-1">
                    <div className="font-bold uppercase text-gray-600">[AUTHENTICATION PARAMETERS]</div>
                    <div>• USERNAME: <span className="font-black text-black bg-white px-1">RAJU</span></div>
                    <div>• PASSCODE: <span className="font-black text-black bg-white px-1">BRUTALIST</span></div>
                </div>
            </div>
            
            <div className="mt-8 font-mono text-[9px] font-bold text-gray-500 uppercase">
                LIFE OS reporting service © 2026. all rights restricted to local terminal database.
            </div>
        </div>
    );
}
