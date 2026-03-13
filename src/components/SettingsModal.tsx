
import React, { useState } from 'react';
import { X, Bell, Volume2, Shield, Smartphone, Moon, Cpu, Globe, Lock, LogOut, Check, AlertTriangle, Trash2, GraduationCap, User } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SettingsTab = 'GENERAL' | 'NOTIFICATIONS' | 'SECURITY';

// Extracted Components to prevent re-renders and focus loss
const TabButton = ({
    id,
    label,
    icon,
    isActive,
    onClick
}: {
    id: SettingsTab,
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: (id: SettingsTab) => void
}) => (
    <button
        onClick={() => onClick(id)}
        className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left
        ${isActive
                ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
      `}
    >
        {icon}
        <span className="font-bold tracking-wide text-sm">{label}</span>
    </button>
);

const ToggleRow = ({ label, desc, isOn, onToggle }: { label: string, desc: string, isOn: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer" onClick={onToggle}>
        <div>
            <div className="font-bold text-sm text-white">{label}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">{desc}</div>
        </div>
        <button
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${isOn ? 'bg-neon-cyan' : 'bg-gray-700'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');

    // Local State for Toggles (Mock Functionality)
    const [settings, setSettings] = useState({
        sound: true,
        haptics: true,
        highPerformance: true,
        tradeNotifs: true,
        whaleAlerts: false,
        priceAlerts: true,
        biometrics: false
    });

    // Factory Reset State
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetInput, setResetInput] = useState('');

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFactoryReset = () => {
        // 1. Clear all Veltrex-specific data from LocalStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('veltrex_')) {
                localStorage.removeItem(key);
            }
        });

        // 2. Force Reload to reset application state to "New User"
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        // Updated: z-index increased to z-[60] to ensure it sits above the sidebars (z-50)
        <div className="fixed inset-0 left-[60px] z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl h-[600px] bg-[#0a0a16] border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in duration-300 mx-8">

                {/* Reset Confirmation Overlay */}
                {showResetConfirm && (
                    <div className="absolute inset-0 z-50 bg-[#0a0a16]/95 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-200">
                        <div className="max-w-md w-full bg-black border border-red-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Factory Data Reset</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                You are about to wipe all <strong>User Data</strong>, <strong>Trade History</strong>, and <strong>AI Models</strong>. <br />
                                The application will return to its initial state.
                            </p>

                            <div className="mb-6">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Type "DELETE" to confirm</label>
                                <input
                                    type="text"
                                    value={resetInput}
                                    onChange={(e) => setResetInput(e.target.value)}
                                    className="w-full bg-white/5 border border-red-500/30 focus:border-red-500 text-white font-mono text-center py-3 rounded-xl outline-none transition-all uppercase placeholder:text-gray-700"
                                    placeholder="DELETE"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowResetConfirm(false); setResetInput(''); }}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleFactoryReset}
                                    disabled={resetInput !== 'DELETE'}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                >
                                    CONFIRM RESET
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar */}
                <div className="w-64 bg-black/20 border-r border-white/5 p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-heading font-bold mb-8 text-white tracking-widest">SETTINGS</h2>
                        <div className="space-y-2">
                            <TabButton
                                id="GENERAL"
                                label="General"
                                icon={<Cpu size={18} />}
                                isActive={activeTab === 'GENERAL'}
                                onClick={setActiveTab}
                            />
                            <TabButton
                                id="NOTIFICATIONS"
                                label="Notifications"
                                icon={<Bell size={18} />}
                                isActive={activeTab === 'NOTIFICATIONS'}
                                onClick={setActiveTab}
                            />
                            <TabButton
                                id="SECURITY"
                                label="Security"
                                icon={<Shield size={18} />}
                                isActive={activeTab === 'SECURITY'}
                                onClick={setActiveTab}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="text-[10px] text-gray-500 font-mono mb-4">VELTREX TERMINAL v1.0.0</div>

                        {/* Author Credits */}
                        <div className="space-y-3">
                            <div className="group">
                                <div className="flex items-center gap-1.5 text-[8px] text-neon-cyan uppercase tracking-wider mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <User size={10} /> System Architects
                                </div>
                                <div className="text-xs text-white font-bold font-heading tracking-wide">ELMERIO S. TALARA</div>
                                <div className="text-xs text-white font-bold font-heading tracking-wide mt-1">TRISHA ANN DAHAB</div>
                                <div className="text-xs text-white font-bold font-heading tracking-wide mt-1">VENICE CABILLADA</div>
                            </div>

                            <div className="group">
                                <div className="flex items-center gap-1.5 text-[8px] text-gray-500 uppercase tracking-wider mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                    <GraduationCap size={10} /> Institution
                                </div>
                                <div className="text-[10px] text-gray-300 font-bold leading-tight">BOHOL ISLAND STATE UNIVERSITY</div>
                                <div className="text-[9px] text-gray-500">Main Campus</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-white/5">
                        <h3 className="text-xl font-bold font-heading text-white">
                            {activeTab === 'GENERAL' && 'System Preferences'}
                            {activeTab === 'NOTIFICATIONS' && 'Alert Configuration'}
                            {activeTab === 'SECURITY' && 'Account Security'}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                        {activeTab === 'GENERAL' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <h4 className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-4">Interface & Feedback</h4>
                                    <ToggleRow
                                        label="Sound Effects"
                                        desc="UI interactions and trade result sounds"
                                        isOn={settings.sound}
                                        onToggle={() => toggle('sound')}
                                    />
                                    <ToggleRow
                                        label="Haptic Feedback"
                                        desc="Vibrate on trade execution (Mobile only)"
                                        isOn={settings.haptics}
                                        onToggle={() => toggle('haptics')}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-4">Performance</h4>
                                    <ToggleRow
                                        label="High Refresh Rate"
                                        desc="Force 120Hz chart rendering (Uses more battery)"
                                        isOn={settings.highPerformance}
                                        onToggle={() => toggle('highPerformance')}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'NOTIFICATIONS' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="space-y-4">
                                    <h4 className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-4">Trading Activity</h4>
                                    <ToggleRow
                                        label="Trade Results"
                                        desc="Push notification when a trade closes"
                                        isOn={settings.tradeNotifs}
                                        onToggle={() => toggle('tradeNotifs')}
                                    />
                                    <ToggleRow
                                        label="Social Radar Alerts"
                                        desc="Notify when Whales place large bets (>₱50k)"
                                        isOn={settings.whaleAlerts}
                                        onToggle={() => toggle('whaleAlerts')}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-4">Market Watch</h4>
                                    <ToggleRow
                                        label="Significant Price Movement"
                                        desc="Alert when tracked assets move >5% in 1h"
                                        isOn={settings.priceAlerts}
                                        onToggle={() => toggle('priceAlerts')}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'SECURITY' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-green-400">Account Protected</div>
                                        <div className="text-xs text-gray-400">256-bit Encryption Active</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-neon-cyan text-xs font-bold uppercase tracking-widest mb-4">Access Control</h4>
                                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-cyan/50 hover:bg-white/10 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <Lock size={18} className="text-gray-400 group-hover:text-neon-cyan" />
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-white">Change PIN</div>
                                                <div className="text-[10px] text-gray-400">Update your 4-digit access code</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold bg-white/10 px-3 py-1 rounded group-hover:bg-neon-cyan group-hover:text-black transition-colors">UPDATE</div>
                                    </button>

                                    <ToggleRow
                                        label="Biometric Login"
                                        desc="Use FaceID / Fingerprint to unlock terminal"
                                        isOn={settings.biometrics}
                                        onToggle={() => toggle('biometrics')}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                                    <button className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold transition-colors w-fit">
                                        <LogOut size={14} /> Log out of all sessions
                                    </button>

                                    {/* DANGER ZONE */}
                                    <div className="mt-4 pt-6 border-t border-red-500/20">
                                        <h4 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <AlertTriangle size={14} /> Danger Zone
                                        </h4>

                                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h5 className="text-white font-bold text-sm">Factory Reset</h5>
                                                    <p className="text-[10px] text-gray-400 mt-1 max-w-xs">
                                                        Permanently delete your account, trading history, and all AI training models. This action cannot be undone.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => { setShowResetConfirm(true); setResetInput(''); }}
                                                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    RESET SYSTEM
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
