
import React, { useState } from 'react';
import { X, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, PieChart as PieIcon, ChevronLeft, PhilippinePeso, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Wallet } from '../types';

interface VaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    wallet: Wallet;
    onUpdateBalance: (amount: number) => void;
}

type Mode = 'MAIN' | 'DEPOSIT' | 'WITHDRAW';

const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose, wallet, onUpdateBalance }) => {
    const [mode, setMode] = useState<Mode>('MAIN');
    const [amountInput, setAmountInput] = useState('');
    const [gcashNumber, setGcashNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const pnlData = [
        { name: 'Wins', value: wallet.pnl.won, color: '#00F0FF' },
        { name: 'Losses', value: wallet.pnl.lost, color: '#FF0055' },
    ];

    const handleTransaction = () => {
        const val = parseFloat(amountInput);
        if (isNaN(val) || val <= 0) return;

        if (mode === 'WITHDRAW') {
            if (val > wallet.balance) return;
            if (gcashNumber.length < 11) return;
        }

        setIsLoading(true);

        // Simulate network delay for realism
        setTimeout(() => {
            if (mode === 'DEPOSIT') {
                onUpdateBalance(val);
                setSuccessMsg(`Successfully deposited ₱${val.toLocaleString()}`);
            } else {
                onUpdateBalance(-val);
                setSuccessMsg(`Successfully withdrew ₱${val.toLocaleString()} to ${gcashNumber}`);
            }

            setIsLoading(false);
            setAmountInput('');
            setGcashNumber('');

            // Reset after success
            setTimeout(() => {
                setSuccessMsg('');
                setMode('MAIN');
            }, 1500);
        }, 1000);
    };

    const handleQuickAdd = (val: number) => {
        const current = parseFloat(amountInput) || 0;
        setAmountInput((current + val).toString());
    };

    const reset = () => {
        setMode('MAIN');
        setAmountInput('');
        setGcashNumber('');
        setSuccessMsg('');
    };

    return (
        // Updated: left-[60px] to not cover sidebar, z-40 to stay below sidebar (z-50)
        <div className="fixed inset-0 left-[60px] z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0a0a16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 mx-4">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors duration-300 ${mode === 'DEPOSIT' ? 'bg-neon-cyan/20 text-neon-cyan' : mode === 'WITHDRAW' ? 'bg-neon-magenta/20 text-neon-magenta' : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'}`}>
                            <WalletIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold tracking-wide">
                                {mode === 'MAIN' ? 'THE VAULT' : mode === 'DEPOSIT' ? 'ADD FUNDS' : 'WITHDRAW'}
                            </h2>
                            <p className="text-gray-400 text-xs uppercase tracking-widest">
                                {mode === 'MAIN' ? 'Asset Management System' : 'Secure Transaction Gateway'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-gray-400 hover:text-white" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 min-h-[400px]">

                    {/* LEFT COLUMN: DYNAMIC CONTENT */}
                    <div className="space-y-6 flex flex-col justify-between">

                        {/* --- VIEW: MAIN OVERVIEW --- */}
                        {mode === 'MAIN' && (
                            <div className="flex-1 flex flex-col justify-between animate-in slide-in-from-left-4 duration-300">
                                <div>
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 mb-6">
                                        <span className="text-gray-400 text-sm">Total Balance</span>
                                        <div className="text-4xl font-mono font-bold mt-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                            ₱{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setMode('DEPOSIT')}
                                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 hover:bg-neon-cyan/20 transition-all group hover:border-neon-cyan/50"
                                        >
                                            <ArrowDownLeft className="mb-2 text-neon-cyan group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold text-neon-cyan">DEPOSIT</span>
                                        </button>
                                        <button
                                            onClick={() => setMode('WITHDRAW')}
                                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 hover:bg-neon-magenta/20 transition-all group hover:border-neon-magenta/50"
                                        >
                                            <ArrowUpRight className="mb-2 text-neon-magenta group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold text-neon-magenta">WITHDRAW</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-4 mt-auto">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                        <PieIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-yellow-500 font-bold uppercase">Pro Membership</div>
                                        <div className="text-sm text-gray-300">Active until Dec 2025</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- VIEW: TRANSACTION FORM (DEPOSIT / WITHDRAW) --- */}
                        {(mode === 'DEPOSIT' || mode === 'WITHDRAW') && (
                            <div className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
                                <button onClick={reset} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-4 transition-colors w-fit">
                                    <ChevronLeft size={14} /> Back to Overview
                                </button>

                                {!successMsg ? (
                                    <>
                                        <div className="relative mb-6">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                <PhilippinePeso size={24} className={mode === 'DEPOSIT' ? 'text-neon-cyan' : 'text-neon-magenta'} />
                                            </div>
                                            <input
                                                type="number"
                                                value={amountInput}
                                                onChange={(e) => setAmountInput(e.target.value)}
                                                placeholder="0.00"
                                                className={`
                                            w-full bg-black/40 border rounded-2xl py-6 pl-12 pr-6 text-3xl font-mono font-bold text-white focus:outline-none transition-all
                                            ${mode === 'DEPOSIT' ? 'focus:border-neon-cyan border-white/10' : 'focus:border-neon-magenta border-white/10'}
                                        `}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Quick Chips */}
                                        <div className="grid grid-cols-4 gap-2 mb-4">
                                            {[100, 500, 1000, 5000].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleQuickAdd(val)}
                                                    className="py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-xs font-bold text-gray-300 transition-all"
                                                >
                                                    +{val / 1000}k
                                                </button>
                                            ))}
                                        </div>

                                        {/* GCash Input for Withdrawals */}
                                        {mode === 'WITHDRAW' && (
                                            <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                                    <Smartphone size={10} /> Gcash Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={gcashNumber}
                                                    onChange={(e) => setGcashNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                                    placeholder="0917xxxxxxx"
                                                    maxLength={11}
                                                    className="w-full bg-black/40 border border-white/10 focus:border-neon-magenta text-white px-4 py-3 rounded-xl outline-none transition-all font-mono tracking-widest text-sm"
                                                />
                                            </div>
                                        )}

                                        {/* Validation Message for Withdraw */}
                                        {mode === 'WITHDRAW' && parseFloat(amountInput) > wallet.balance && (
                                            <div className="flex items-center gap-2 text-neon-magenta text-xs font-bold mb-4 animate-pulse">
                                                <AlertCircle size={14} /> Insufficient Balance
                                            </div>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">
                                                <span>Current Balance</span>
                                                <span>₱{wallet.balance.toLocaleString()}</span>
                                            </div>
                                            <button
                                                onClick={handleTransaction}
                                                disabled={
                                                    !amountInput ||
                                                    parseFloat(amountInput) <= 0 ||
                                                    (mode === 'WITHDRAW' && (parseFloat(amountInput) > wallet.balance || gcashNumber.length < 11)) ||
                                                    isLoading
                                                }
                                                className={`
                                            w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${mode === 'DEPOSIT'
                                                        ? 'bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:bg-[#33f2ff]'
                                                        : 'bg-neon-magenta text-white shadow-[0_0_20px_rgba(255,0,85,0.3)] hover:bg-[#ff1a66]'}
                                        `}
                                            >
                                                {isLoading ? 'Processing...' : `Confirm ${mode}`}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${mode === 'DEPOSIT' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-magenta/20 text-neon-magenta'}`}>
                                            <CheckCircle size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Transaction Complete</h3>
                                        <p className="text-gray-400 text-sm">{successMsg}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: ANALYTICS (STATIC) */}
                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center relative">
                        <h3 className="absolute top-4 left-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Performance (PnL)</h3>
                        <div className="w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pnlData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pnlData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#05050F', borderColor: '#333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                            <span className="text-2xl font-bold font-heading">{wallet.pnl.totalTrades > 0 ? ((wallet.pnl.won / wallet.pnl.totalTrades) * 100).toFixed(0) : 0}%</span>
                            <span className="text-[10px] text-gray-400 uppercase">Win Rate</span>
                        </div>

                        <div className="flex w-full justify-between mt-4 px-4">
                            <div className="text-center">
                                <div className="text-neon-cyan font-bold">{wallet.pnl.won}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Wins</div>
                            </div>
                            <div className="text-center">
                                <div className="text-neon-magenta font-bold">{wallet.pnl.lost}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Losses</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaultModal;
