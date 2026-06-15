import React, { useState } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';
import { Download, Upload, RefreshCw, User, ShieldAlert, Check } from 'lucide-react';

export default function Settings() {
    const { 
        subscriptions, 
        transactions, 
        tasks, 
        habits, 
        budgets, 
        goals,
        importData, 
        factoryReset,
        currency: storeCurrency,
        setCurrency: setStoreCurrency,
        addToast 
    } = useLifeOSStore();

    // Profile preferences
    const [agentName, setAgentName] = useState(() => {
        return localStorage.getItem('life-os-agent-name') || 'OPERATOR-01';
    });
    const [currency, setCurrency] = useState(storeCurrency);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        localStorage.setItem('life-os-agent-name', agentName);
        setStoreCurrency(currency);
        addToast("Operator configuration updated", "success");
    };

    // Export entire localStorage state to JSON
    const handleExportBackup = () => {
        const backupData = {
            subscriptions,
            transactions,
            tasks,
            habits,
            budgets,
            goals
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
        
        const exportFileDefaultName = `life_os_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        addToast("Backup JSON file exported", "success");
    };

    // Import localStorage from JSON file
    const handleImportBackup = (e) => {
        const fileReader = new FileReader();
        const files = e.target.files;
        if (!files || files.length === 0) return;

        fileReader.onload = (event) => {
            const fileContent = event.target.result;
            const success = importData(fileContent);
            if (success) {
                // Refresh settings form values
                const name = localStorage.getItem('life-os-agent-name');
                if (name) setAgentName(name);
            }
        };

        fileReader.readAsText(files[0]);
    };

    // Reset warnings
    const [confirmReset, setConfirmReset] = useState(false);

    const handleFactoryReset = () => {
        if (!confirmReset) {
            setConfirmReset(true);
            addToast("Click again to confirm total system wipe!", "warning");
            return;
        }

        factoryReset();
        localStorage.removeItem('life-os-agent-name');
        setAgentName('OPERATOR-01');
        setConfirmReset(false);
    };

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                {/* Profile panel */}
                <div className="brutal-card p-6 bg-white space-y-6">
                    <div className="floating-label">PREFERENCES</div>
                    <h3 className="font-sans font-black text-xl tracking-wide uppercase flex items-center gap-2">
                        <User size={20} />
                        <span>OPERATOR IDENTITY</span>
                    </h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">OPERATOR NAME CODE</label>
                            <input 
                                type="text"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value.toUpperCase())}
                                placeholder="OPERATOR-01"
                                required
                                className="input-brutal"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="font-mono text-xs font-bold block uppercase">PREFFERED CURRENCY</label>
                            <select 
                                value={currency} 
                                onChange={(e) => setCurrency(e.target.value)}
                                className="input-brutal cursor-pointer font-sans font-bold"
                            >
                                <option value="USD">USD ($) - UNITED STATES DOLLAR</option>
                                <option value="INR">INR (₹) - INDIAN RUPEE</option>
                                <option value="EUR">EUR (€) - EURO</option>
                                <option value="GBP">GBP (£) - BRITISH POUND</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-brutal bg-green w-full py-3 mt-2">
                            <Check size={18} />
                            <span>SAVE SETTINGS</span>
                        </button>
                    </form>
                </div>

                {/* Import / Export Panel */}
                <div className="brutal-card p-6 bg-white space-y-6">
                    <div className="floating-label">MAINTENANCE</div>
                    <h3 className="font-sans font-black text-xl tracking-wide uppercase flex items-center gap-2">
                        <RefreshCw size={20} />
                        <span>BACKUP & RECOVERY</span>
                    </h3>
                    
                    <p className="font-mono text-xs text-gray-500 uppercase leading-relaxed">
                        Export your database index contents as a JSON document to store locally or restore previously saved configurations.
                    </p>

                    <div className="space-y-4 pt-2">
                        {/* Export Button */}
                        <button 
                            onClick={handleExportBackup} 
                            className="btn-brutal btn-white w-full py-3 justify-center"
                        >
                            <Download size={18} />
                            <span>DOWNLOAD BACKUP JSON</span>
                        </button>

                        {/* Import Container */}
                        <div className="border-[2.5px] border-dashed border-black p-4 bg-cream text-center relative hover:bg-white transition-colors cursor-pointer">
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={handleImportBackup}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center gap-2 font-mono text-xs font-bold uppercase">
                                <Upload size={20} />
                                <span>UPLOAD RESTORE JSON</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone: Wiping */}
            <div className="brutal-card p-6 bg-white border-red shadow-[4px_4px_0px_#FF4444] space-y-6">
                <div className="floating-label floating-label-red">DANGER ZONE</div>
                <h3 className="font-sans font-black text-xl text-red tracking-wide uppercase flex items-center gap-2">
                    <ShieldAlert size={20} />
                    <span>SYSTEM RESET</span>
                </h3>

                <p className="font-mono text-xs text-red uppercase leading-relaxed font-bold">
                    WARNING: THIS ACTION WIPES LOCAL STORAGE AND RE-INITIALIZES MOCK DATA TEMPLATES. THIS CANNOT BE UNDONE.
                </p>

                <button 
                    onClick={handleFactoryReset}
                    className={`btn-brutal text-sm py-3 px-6 ${
                        confirmReset ? 'bg-black text-white hover:bg-red hover:text-white' : 'bg-red text-white'
                    }`}
                >
                    {confirmReset ? 'CONFIRM COMPLETE SYSTEM WIPE' : 'FACTORY RESET'}
                </button>
            </div>
        </div>
    );
}
