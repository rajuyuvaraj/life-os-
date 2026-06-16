import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { Target, Key, UserPlus } from 'lucide-react';

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
                    {isRegister ? 'SYS.REG.REQ' : 'SYS.AUTH.REQ'}
                </div>
                
                <div className="floating-label">
                    {isRegister ? 'CREATE IDENTITY' : 'ACCESS STATION'}
                </div>

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

                {/* Switch Login / Register link */}
                <div className="mt-6 text-center">
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
            
            <div className="mt-8 font-mono text-[9px] font-bold text-gray-500 uppercase">
                LIFE OS reporting service © 2026. all rights restricted to local terminal database.
            </div>
        </div>
    );
}
