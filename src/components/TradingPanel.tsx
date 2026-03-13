
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, Clock, PhilippinePeso, Bot, Target, Info, Sparkles, Brain, Zap, Activity, Cpu, Layers, GitMerge, Database, ShieldCheck, History, Timer, Lock, AlertTriangle } from 'lucide-react';
import { Asset } from '../types';
import GlassButton from './GlassButton';

interface TradingPanelProps {
    onTrade: (direction: 'CALL' | 'PUT', amount: number, duration: number, currentReturn: number) => void;
    asset: Asset;
    onSensorUpdate: (sensors: { rsi: number; volatility: number; delta: number }) => void;
}

// Q-Learning Types
type MarketState = 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
type Action = 'CALL' | 'PUT' | 'HOLD';

interface QTable {
    [key: string]: {
        CALL: number;
        PUT: number;
        HOLD: number;
    }
}

// EXPERIENCE REPLAY: Store past experiences to break correlation
interface Experience {
    state: MarketState;
    action: Action;
    reward: number;
    nextState: MarketState;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ onTrade, asset, onSensorUpdate }) => {
    const [amount, setAmount] = useState(100);
    const [duration, setDuration] = useState(60); // seconds
    const [isAutomated, setIsAutomated] = useState(false);
    const [isBoosting, setIsBoosting] = useState(false);

    // Dynamic Payout State
    const [profitPercentage, setProfitPercentage] = useState(85);

    // AI Internal State
    const [aiDuration, setAiDuration] = useState(30);
    const [aiTimeframe, setAiTimeframe] = useState(15); // The Analysis Window the Model chose (e.g. 15s, 30s)
    const [aiConfidence, setAiConfidence] = useState(0);
    const [aiStrategy, setAiStrategy] = useState<'EXPLORE' | 'EXPLOIT' | 'GATHERING'>('EXPLOIT');
    const [activeNetwork, setActiveNetwork] = useState<'MAIN' | 'TARGET'>('MAIN');
    const [syncProgress, setSyncProgress] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0); // For UI visualization of Replay Buffer

    // Reset Security State
    const [isResetVerifying, setIsResetVerifying] = useState(false);
    const [resetPin, setResetPin] = useState('');
    const [resetError, setResetError] = useState('');

    // Rate Limiting
    const lastTradeTimeRef = useRef<number>(0);

    // Internal Price Buffer for Independent Analysis
    const priceHistory = useRef<{ time: number, price: number }[]>([]);

    // Q-Learning State - Initialize from LocalStorage if available
    const [qTable, setQTable] = useState<QTable>(() => {
        try {
            const saved = localStorage.getItem(`veltrex_q_table_${asset.symbol}`);
            return saved ? JSON.parse(saved) : {
                BULLISH: { CALL: 0.5, PUT: -0.2, HOLD: 0.1 },
                BEARISH: { CALL: -0.3, PUT: 0.6, HOLD: 0.1 },
                SIDEWAYS: { CALL: 0.1, PUT: 0.1, HOLD: 0.4 }
            };
        } catch (e) {
            return {
                BULLISH: { CALL: 0.5, PUT: -0.2, HOLD: 0.1 },
                BEARISH: { CALL: -0.3, PUT: 0.6, HOLD: 0.1 },
                SIDEWAYS: { CALL: 0.1, PUT: 0.1, HOLD: 0.4 }
            };
        }
    });

    // Target Network State (For Stability - Updates less frequently)
    const [targetQTable, setTargetQTable] = useState<QTable>(qTable);

    // EXPERIENCE REPLAY BUFFER
    const replayBuffer = useRef<Experience[]>([]);
    const MAX_MEMORY = 2000;
    const BATCH_SIZE = 64;
    const MIN_REPLAY_SIZE = 64;

    const [epoch, setEpoch] = useState(() => {
        try {
            const saved = localStorage.getItem(`veltrex_epoch_${asset.symbol}`);
            return saved ? parseInt(saved) : 0;
        } catch (e) { return 0; }
    });

    // REFS FOR PERSISTENCE (To access latest state in event listeners)
    const qTableRef = useRef(qTable);
    const epochRef = useRef(epoch);

    useEffect(() => {
        qTableRef.current = qTable;
    }, [qTable]);

    useEffect(() => {
        epochRef.current = epoch;
    }, [epoch]);

    const [currentMarketState, setCurrentMarketState] = useState<MarketState>('SIDEWAYS');
    const [lastAction, setLastAction] = useState<Action | null>(null);
    const [lastReward, setLastReward] = useState<number | null>(null);
    const [botLog, setBotLog] = useState<string>(`Initializing Deep Replay Buffer...`);

    const [modelTradeAmount, setModelTradeAmount] = useState(50);

    const potentialProfit = (amount * (profitPercentage / 100)).toFixed(2);
    const totalPayout = (amount + Number(potentialProfit)).toFixed(2);

    // --- INITIALIZATION & PERSISTENCE ---

    // Load Replay Buffer on Mount
    useEffect(() => {
        try {
            const savedBuffer = localStorage.getItem(`veltrex_replay_buffer_${asset.symbol}`);
            if (savedBuffer) {
                const parsed = JSON.parse(savedBuffer);
                if (Array.isArray(parsed)) {
                    replayBuffer.current = parsed;
                    setMemoryUsage((parsed.length / MAX_MEMORY) * 100);
                }
            }
        } catch (e) {
            console.error("Failed to load replay buffer", e);
        }
    }, [asset.symbol]);

    // ROBUST SAVE SYSTEM (Unload, Logout, Crash Safety + Periodic Autosave)
    useEffect(() => {
        const saveData = () => {
            if (qTableRef.current) {
                localStorage.setItem(`veltrex_q_table_${asset.symbol}`, JSON.stringify(qTableRef.current));
            }
            if (epochRef.current !== undefined) {
                localStorage.setItem(`veltrex_epoch_${asset.symbol}`, epochRef.current.toString());
            }
            if (replayBuffer.current.length > 0) {
                // Save last 500 items to ensure continuity without exceeding storage quotas
                const bufferToSave = replayBuffer.current.slice(-500);
                localStorage.setItem(`veltrex_replay_buffer_${asset.symbol}`, JSON.stringify(bufferToSave));
            }
            // Console log removed to prevent spam during auto-save
        };

        // 1. Periodic Autosave (Protects against crashes/freezes)
        // Saves every 5 seconds so max data loss is minimal
        const autoSaveInterval = setInterval(saveData, 5000);

        // 2. Listener for Tab Close / Refresh
        window.addEventListener('beforeunload', saveData);

        // 3. Listener/Cleanup for Component Unmount (Logout / Nav Change)
        return () => {
            clearInterval(autoSaveInterval);
            window.removeEventListener('beforeunload', saveData);
            saveData();
        };
    }, [asset.symbol]);

    // Calculate Dynamic Payout based on Volatility
    useEffect(() => {
        const baseRate = 70;
        const volatilityBonus = asset.volatility * 20;
        const calculatedRate = Math.floor(baseRate + volatilityBonus);

        setProfitPercentage(calculatedRate);

        const fluctuationInterval = setInterval(() => {
            const randomFluctuation = Math.floor(Math.random() * 5) - 2;
            setProfitPercentage(prev => {
                const next = calculatedRate + randomFluctuation;
                return Math.min(99, Math.max(50, next));
            });
        }, 5000);

        return () => clearInterval(fluctuationInterval);
    }, [asset.id, asset.volatility]);

    // Update Price Buffer on every tick
    useEffect(() => {
        const now = Date.now();
        priceHistory.current.push({ time: now, price: asset.price });
        if (priceHistory.current.length > 500) {
            priceHistory.current.shift();
        }
    }, [asset.price]);

    // -------------------------------------------------------------------------
    // THE BRAIN: Simulation Loop (DDQN + Experience Replay + Dynamic Timeframe)
    // -------------------------------------------------------------------------
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isAutomated) {
            interval = setInterval(() => {

                // 1. DYNAMIC TIMEFRAME SELECTION
                const currentVol = asset.volatility + (Math.random() * 0.1);

                let optimalTimeframe = 60;
                if (currentVol > 0.8) optimalTimeframe = 15;
                else if (currentVol > 0.5) optimalTimeframe = 30;

                setAiTimeframe(optimalTimeframe);

                // 2. FEATURE ENGINEERING
                const now = Date.now();
                const pastThreshold = now - (optimalTimeframe * 1000);
                const pastPoint = priceHistory.current.find(p => p.time >= pastThreshold) || priceHistory.current[0];

                let modelDelta = 0;
                if (pastPoint && priceHistory.current.length > 0) {
                    const currentPrice = priceHistory.current[priceHistory.current.length - 1].price;
                    modelDelta = ((currentPrice - pastPoint.price) / pastPoint.price) * 100;
                } else {
                    modelDelta = asset.change;
                }

                const simulatedRSI = Math.min(100, Math.max(0, 50 + (modelDelta * 50) + (Math.random() * 10 - 5)));

                onSensorUpdate({
                    rsi: simulatedRSI,
                    volatility: currentVol,
                    delta: modelDelta
                });

                // 3. STATE DETERMINATION
                let newState: MarketState = 'SIDEWAYS';
                const threshold = optimalTimeframe === 15 ? 0.01 : 0.03;

                if (modelDelta > threshold && simulatedRSI < 75) newState = 'BULLISH';
                else if (modelDelta < -threshold && simulatedRSI > 25) newState = 'BEARISH';
                else if (modelDelta > (threshold / 2)) newState = 'BULLISH';
                else if (modelDelta < -(threshold / 2)) newState = 'BEARISH';

                if (newState === 'SIDEWAYS' && currentVol > 0.8) {
                    newState = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
                }

                setCurrentMarketState(newState);

                // 4. DECIDE TRADE DURATION
                const decidedDuration = optimalTimeframe;
                setAiDuration(decidedDuration);

                // 5. CHOOSE ACTION (Epsilon-Greedy)
                const epsilon = 0.10;
                let action: Action;
                let logMsg = "";
                let strategy: 'EXPLORE' | 'EXPLOIT' | 'GATHERING' = 'EXPLOIT';
                let confidence = 0;

                if (replayBuffer.current.length < MIN_REPLAY_SIZE) {
                    strategy = 'GATHERING';
                    const actions: Action[] = ['CALL', 'PUT', 'HOLD'];
                    action = actions[Math.floor(Math.random() * actions.length)];
                    logMsg = `BUFFER FILLING: ${replayBuffer.current.length}/${MIN_REPLAY_SIZE}`;
                    confidence = 0;
                } else if (Math.random() < epsilon) {
                    const actions: Action[] = ['CALL', 'PUT', 'HOLD'];
                    action = actions[Math.floor(Math.random() * actions.length)];
                    logMsg = `EXPLORE: Sampling random vector...`;
                    strategy = 'EXPLORE';
                    confidence = Math.floor(Math.random() * 40);
                } else {
                    const stateValues = qTable[newState];
                    // @ts-ignore
                    action = Object.keys(stateValues).reduce((a, b) => stateValues[a] > stateValues[b] ? a : b) as Action;
                    const value = stateValues[action];

                    logMsg = `EXPLOIT: ${newState} pattern identified.`;
                    confidence = Math.min(99, Math.floor((Math.abs(value) + 0.2) * 100));
                }

                setLastAction(action);
                setBotLog(logMsg);
                setAiStrategy(strategy);
                setAiConfidence(confidence);

                // 6. LIVE EXECUTION
                const nowMs = Date.now();
                const timeSinceLastTrade = nowMs - lastTradeTimeRef.current;
                const COOLDOWN = 5000;

                if (timeSinceLastTrade > COOLDOWN && action !== 'HOLD') {
                    if (strategy === 'EXPLOIT' && confidence > 50) {
                        setBotLog(`>> EXECUTION: ${action} SIGNAL DETECTED`);
                        onTrade(action, modelTradeAmount, decidedDuration, profitPercentage);
                        lastTradeTimeRef.current = nowMs;
                    }
                    else if (strategy === 'GATHERING' && Math.random() > 0.8) {
                        setBotLog(`>> PROBE: Testing ${action} execution...`);
                        onTrade(action, modelTradeAmount, decidedDuration, profitPercentage);
                        lastTradeTimeRef.current = nowMs;
                    }
                }

                // 7. REWARD SHAPING
                let reward = 0;
                if (action === 'HOLD') {
                    reward = -0.05;
                } else {
                    let isWin = false;
                    if (action === 'CALL' && modelDelta > 0) isWin = true;
                    if (action === 'PUT' && modelDelta < 0) isWin = true;

                    const volatilityPenalty = currentVol * 0.2;
                    const magnitudeBonus = Math.abs(modelDelta) * 10;

                    if (isWin) {
                        reward = 1.0 + magnitudeBonus - volatilityPenalty;
                        if (strategy !== 'GATHERING') setBotLog(`> TRAINING: +${reward.toFixed(2)} (Correct Pred.)`);
                    } else {
                        reward = -1.0 - volatilityPenalty;
                        if (strategy !== 'GATHERING') setBotLog(`> TRAINING: ${reward.toFixed(2)} (Incorrect)`);
                    }
                }
                setLastReward(Number(reward.toFixed(2)));

                // 8. EXPERIENCE REPLAY & TRAINING (DDQN)
                const experience: Experience = { state: newState, action, reward, nextState: newState };
                replayBuffer.current.push(experience);
                if (replayBuffer.current.length > MAX_MEMORY) replayBuffer.current.shift();

                setMemoryUsage((replayBuffer.current.length / MAX_MEMORY) * 100);

                if (replayBuffer.current.length >= MIN_REPLAY_SIZE) {
                    setEpoch(e => e + 1);

                    setSyncProgress(prev => {
                        if (prev >= 100) {
                            setTargetQTable(JSON.parse(JSON.stringify(qTable))); // Deep Copy
                            return 0;
                        }
                        return prev + 5;
                    });

                    const alpha = 0.1;
                    const gamma = 0.9;

                    setQTable(prev => {
                        const newTable = { ...prev };
                        const trainingBatch = Array.from({ length: BATCH_SIZE }, () => replayBuffer.current[Math.floor(Math.random() * replayBuffer.current.length)]);

                        trainingBatch.forEach(exp => {
                            const currentQ = newTable[exp.state][exp.action];
                            const nextStateValuesMain = newTable[exp.nextState];
                            // @ts-ignore
                            const bestNextAction = Object.keys(nextStateValuesMain).reduce((a, b) => nextStateValuesMain[a] > nextStateValuesMain[b] ? a : b) as Action;
                            const targetValue = targetQTable[exp.nextState][bestNextAction];
                            const updatedQ = currentQ + alpha * (exp.reward + gamma * targetValue - currentQ);
                            newTable[exp.state][exp.action] = Number(updatedQ.toFixed(3));
                        });

                        return newTable;
                    });
                }

            }, 1500);
        }

        return () => clearInterval(interval);
    }, [isAutomated, qTable, targetQTable, modelTradeAmount, profitPercentage, onSensorUpdate]);

    const getValueColor = (val: number, isTarget: boolean) => {
        if (isTarget) {
            if (val > 1.2) return 'text-purple-400 font-extrabold shadow-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,1)]';
            if (val > 0.5) return 'text-purple-400 font-bold';
            if (val > 0) return 'text-purple-300';
            if (val < -1.2) return 'text-pink-600 font-extrabold drop-shadow-[0_0_8px_rgba(219,39,119,1)]';
            return 'text-gray-500';
        }

        if (val > 1.5) return 'text-neon-cyan font-extrabold shadow-neon-cyan drop-shadow-[0_0_10px_rgba(0,240,255,1)] text-[11px]';
        if (val > 0.8) return 'text-neon-cyan font-bold drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]';
        if (val > 0) return 'text-green-400';
        if (val < -1.5) return 'text-neon-magenta font-extrabold drop-shadow-[0_0_10px_rgba(255,0,85,1)] text-[11px]';
        return 'text-gray-500';
    };

    const handleResetRequest = () => {
        setIsResetVerifying(true);
        setResetError('');
        setResetPin('');
    };

    const verifyAndReset = () => {
        const savedData = localStorage.getItem('veltrex_user_profile');
        if (savedData) {
            const user = JSON.parse(savedData);
            if (resetPin === user.pin) {
                executeReset();
            } else {
                setResetError('ACCESS DENIED');
                setResetPin('');
                setTimeout(() => setResetError(''), 2000);
            }
        }
    };

    const executeReset = () => {
        setQTable({
            BULLISH: { CALL: 0.5, PUT: -0.2, HOLD: 0.1 },
            BEARISH: { CALL: -0.3, PUT: 0.6, HOLD: 0.1 },
            SIDEWAYS: { CALL: 0.1, PUT: 0.1, HOLD: 0.4 }
        });
        setTargetQTable({
            BULLISH: { CALL: 0.5, PUT: -0.2, HOLD: 0.1 },
            BEARISH: { CALL: -0.3, PUT: 0.6, HOLD: 0.1 },
            SIDEWAYS: { CALL: 0.1, PUT: 0.1, HOLD: 0.4 }
        });
        setEpoch(0);
        replayBuffer.current = [];
        setMemoryUsage(0);
        localStorage.removeItem(`veltrex_q_table_${asset.symbol}`);
        localStorage.removeItem(`veltrex_epoch_${asset.symbol}`);
        localStorage.removeItem(`veltrex_replay_buffer_${asset.symbol}`);
        priceHistory.current = [];
        setIsResetVerifying(false);
    };

    const handleBoostLearning = () => {
        setIsBoosting(true);
        setBotLog(">> INJECTING SYNTHETIC DATA BATCH...");

        setTimeout(() => {
            const newQTable = { ...qTable };

            for (let i = 0; i < 100; i++) {
                const randomChange = (Math.random() - 0.5) * (asset.volatility * 2);
                let simState: MarketState = 'SIDEWAYS';
                if (randomChange > 0.05) simState = 'BULLISH';
                else if (randomChange < -0.05) simState = 'BEARISH';

                const actions: Action[] = ['CALL', 'PUT', 'HOLD'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                let reward = action === 'HOLD' ? -0.05 : (action === 'CALL' && randomChange > 0) || (action === 'PUT' && randomChange < 0) ? 1.0 : -1.0;

                replayBuffer.current.push({ state: simState, action, reward, nextState: simState });
                if (replayBuffer.current.length > MAX_MEMORY) replayBuffer.current.shift();
            }

            setQTable(newQTable);
            setMemoryUsage((replayBuffer.current.length / MAX_MEMORY) * 100);
            setBotLog(">> BOOST COMPLETE. BUFFER FILLED.");
            setIsBoosting(false);
        }, 500);
    };

    const displayTable = activeNetwork === 'MAIN' ? qTable : targetQTable;

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden relative">
            {/* Header with Toggle */}
            <div className="mb-6 z-20 relative">
                <div className="flex items-center gap-4">
                    <h3 className="font-heading text-xl font-bold tracking-wider mb-1 transition-all duration-300 text-white">
                        {isAutomated ? 'AUTO-PILOT' : 'EXECUTION'}
                    </h3>
                    <button
                        onClick={() => setIsAutomated(!isAutomated)}
                        className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border transition-all duration-300 uppercase
                        ${isAutomated
                                ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-[#33f2ff]'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                            }
                        `}
                    >
                        {isAutomated ? <Brain size={14} className="animate-pulse" /> : <Bot size={14} />}
                        {isAutomated ? 'Active' : 'Automate'}
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isAutomated ? 'bg-black animate-pulse' : 'bg-gray-600'}`} />
                    </button>
                </div>

                <p className={`transition-all duration-300 ${isAutomated ? 'text-xl font-heading font-bold mt-1 flex items-center gap-2' : 'text-xs text-gray-500'}`}>
                    {isAutomated ? (
                        <>
                            <span className="text-orange-500 whitespace-nowrap">Q Learning Model:</span>
                            <span className="text-neon-cyan">{asset.symbol}</span>
                        </>
                    ) : (
                        'Configure your position'
                    )}
                </p>
                {isAutomated && (
                    <div className="mt-2">
                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                            <ShieldCheck size={10} /> DDQN ACTIVE
                        </span>
                    </div>
                )}
            </div>

            {/* Main Content Area - Relative for absolute positioning of sliding panels */}
            <div className="flex-1 relative w-full">

                {/* Manual Trading View */}
                <div className={`
                absolute inset-0 flex flex-col transition-all duration-500 ease-in-out transform
                ${isAutomated ? 'translate-x-[120%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100 z-10'}
          `}>
                    <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center justify-between">
                                <span><PhilippinePeso size={10} className="inline mr-1" /> Amount</span>
                                <span className="text-neon-cyan cursor-pointer hover:underline">Max</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl font-mono font-bold focus:outline-none focus:border-neon-cyan/50 transition-all text-white text-center"
                                />
                                <div className="flex justify-between mt-2 gap-2">
                                    <button onClick={() => setAmount(a => Math.max(10, a - 10))} className="flex-1 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors">-</button>
                                    <button onClick={() => setAmount(a => a + 10)} className="flex-1 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors">+</button>
                                </div>
                            </div>
                        </div>

                        {/* Time Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                <Clock size={10} /> Duration
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[15, 30, 60, 120, 300, 600].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setDuration(time)}
                                        className={`py-2 rounded-lg font-bold text-xs transition-all border ${duration === time ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'}`}
                                    >
                                        {time < 60 ? `${time}s` : `${time / 60}m`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payout Info */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    Profit ({profitPercentage}%)
                                    <Info size={10} className="text-gray-600" />
                                </span>
                                <span className="text-sm font-bold text-green-400">+₱{potentialProfit}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Total Payout</span>
                                <span className="text-lg font-mono font-bold text-white">₱{totalPayout}</span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons - Side by Side Layout */}
                    <div className="mt-4 flex gap-3 flex-shrink-0">
                        <GlassButton
                            variant="CALL"
                            label="CALL"
                            subLabel="HIGHER"
                            className="flex-1"
                            icon={<ArrowUp size={24} className="stroke-[3px]" />}
                            onClick={() => onTrade('CALL', amount, duration, profitPercentage)}
                        />
                        <GlassButton
                            variant="PUT"
                            label="PUT"
                            subLabel="LOWER"
                            className="flex-1"
                            icon={<ArrowDown size={24} className="stroke-[3px]" />}
                            onClick={() => onTrade('PUT', amount, duration, profitPercentage)}
                        />
                    </div>
                </div>

                {/* Automated Trading View (Q-Learning Visualization) */}
                <div className={`
                absolute inset-0 flex flex-col transition-all duration-500 ease-in-out transform
                ${!isAutomated ? '-translate-x-[20%] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100 z-10'}
          `}>
                    <div className="h-full border border-white/10 rounded-2xl bg-black/40 flex flex-col overflow-hidden relative">

                        {/* Background Grid Effect */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00F0FF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Brain / Network Selector Header */}
                        <div className="p-2 border-b border-white/5 flex gap-1 bg-white/5 relative z-10">
                            <button
                                onClick={() => setActiveNetwork('MAIN')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all
                            ${activeNetwork === 'MAIN'
                                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
                        `}
                            >
                                <Layers size={12} /> Live Net (A)
                            </button>
                            <button
                                onClick={() => setActiveNetwork('TARGET')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all relative overflow-hidden
                            ${activeNetwork === 'TARGET'
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
                        `}
                            >
                                <GitMerge size={12} /> Target Net (B)
                                <div className="absolute bottom-0 left-0 h-0.5 bg-purple-500 transition-all duration-1000" style={{ width: `${syncProgress}%` }}></div>
                            </button>
                        </div>

                        {/* Status Bar */}
                        <div className="p-2 border-b border-white/5 flex justify-between items-center bg-black/20 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Activity size={12} className={activeNetwork === 'MAIN' ? 'text-neon-cyan animate-pulse' : 'text-purple-400'} />
                                    <span className={`text-[9px] uppercase font-bold tracking-widest ${activeNetwork === 'MAIN' ? 'text-neon-cyan' : 'text-purple-400'}`}>
                                        Epoch: {epoch}
                                    </span>
                                </div>
                            </div>

                            <div className={`text-[9px] font-bold px-2 py-0.5 rounded transition-colors duration-300 ${lastReward && lastReward > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : lastReward && lastReward < 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 border border-transparent'}`}>
                                Reward: {lastReward ? (lastReward > 0 ? '+' : '') + lastReward : '0.0'}
                            </div>
                        </div>

                        {/* The Q-Matrix (The Box) */}
                        <div className={`p-3 flex flex-col justify-center relative z-10 transition-all duration-300 ${isBoosting ? 'blur-sm scale-95 opacity-50' : ''}`}>

                            <div className="grid grid-cols-4 gap-1 mb-1">
                                <div className="text-[9px] text-gray-500 text-center uppercase">State</div>
                                <div className="text-[9px] text-gray-500 text-center uppercase">Call</div>
                                <div className="text-[9px] text-gray-500 text-center uppercase">Put</div>
                                <div className="text-[9px] text-gray-500 text-center uppercase">Hold</div>
                            </div>

                            {(['BULLISH', 'SIDEWAYS', 'BEARISH'] as MarketState[]).map((state) => (
                                <div key={state} className={`grid grid-cols-4 gap-1 mb-2 p-1 rounded transition-colors ${currentMarketState === state && activeNetwork === 'MAIN' ? 'bg-white/10 border border-white/20' : ''}`}>
                                    <div className="flex items-center justify-center">
                                        <span className={`text-[9px] font-bold ${currentMarketState === state && activeNetwork === 'MAIN' ? 'text-white' : 'text-gray-600'}`}>{state}</span>
                                    </div>
                                    {(['CALL', 'PUT', 'HOLD'] as Action[]).map(action => (
                                        <div key={action} className={`
                                    relative h-8 rounded border border-white/5 flex items-center justify-center bg-black/50
                                    transition-all duration-300
                                    ${lastAction === action && currentMarketState === state && activeNetwork === 'MAIN' ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' : ''}
                                 `}>
                                            <span className={`font-mono text-xs font-bold ${getValueColor(displayTable[state][action], activeNetwork === 'TARGET')}`}>
                                                {displayTable[state][action].toFixed(2)}
                                            </span>
                                            <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ${displayTable[state][action] > 0 ? (activeNetwork === 'TARGET' ? 'bg-purple-500' : 'bg-neon-cyan') : (activeNetwork === 'TARGET' ? 'bg-pink-600' : 'bg-neon-magenta')}`} style={{ width: `${Math.min(Math.abs(displayTable[state][action]) * 100, 100)}%` }}></div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Compact Metrics Grid */}
                            <div className="mt-2 grid grid-cols-3 gap-1">
                                <div className="bg-black/40 border border-white/5 rounded p-1 flex flex-col items-center justify-center">
                                    <span className="text-[8px] text-gray-500 uppercase">Strategy</span>
                                    <span className={`text-[9px] font-bold ${aiStrategy === 'EXPLORE' ? 'text-yellow-400' : aiStrategy === 'GATHERING' ? 'text-gray-400' : 'text-neon-cyan'}`}>{aiStrategy}</span>
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded p-1 flex flex-col items-center justify-center relative overflow-hidden" title="Experience Replay Buffer">
                                    <span className="text-[8px] text-gray-500 uppercase relative z-10 flex items-center gap-1"><History size={8} />Buffer</span>
                                    <span className="text-[9px] font-bold text-white relative z-10">{Math.round(memoryUsage)}%</span>
                                    <div className="absolute bottom-0 left-0 h-1 bg-neon-cyan/50" style={{ width: `${memoryUsage}%` }} />
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded p-1 flex flex-col items-center justify-center relative transition-all duration-500">
                                    <span className="text-[8px] text-gray-500 uppercase flex items-center gap-1"><Timer size={8} />Model TF</span>
                                    <span className="text-[9px] font-bold text-white animate-pulse">{aiTimeframe}s</span>
                                </div>
                            </div>

                            <div className="mt-3 mb-1 px-1 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model Bet Size</span>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                                        <PhilippinePeso size={12} className="text-neon-cyan" />
                                    </div>
                                    <input
                                        type="number"
                                        min="10"
                                        value={modelTradeAmount}
                                        onChange={(e) => setModelTradeAmount(Number(e.target.value))}
                                        className="w-24 bg-black/40 border border-white/10 rounded-lg py-1.5 pl-7 pr-3 text-right font-mono text-xs font-bold text-white focus:outline-none focus:border-neon-cyan/50 transition-all shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {isBoosting && (
                            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
                                <div className="flex flex-col items-center text-neon-cyan animate-pulse">
                                    <Cpu size={32} className="animate-spin duration-700" />
                                    <span className="mt-2 text-xs font-bold tracking-widest">TRAINING...</span>
                                </div>
                            </div>
                        )}

                        {isResetVerifying && (
                            <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0a0a16]/95 backdrop-blur-md animate-in fade-in zoom-in duration-200">
                                <div className="w-64 p-4 border border-white/10 rounded-2xl bg-black shadow-2xl flex flex-col items-center text-center">
                                    <div className="mb-3 p-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                                        <Lock size={20} />
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1 tracking-wider uppercase">System Override</h4>

                                    <p className="text-[10px] text-gray-500 mb-2 px-2">
                                        Resetting neural weights for <span className="text-neon-cyan font-bold">{asset.symbol}</span>.
                                    </p>
                                    <p className="text-[9px] text-red-400/80 mb-4 px-2 bg-red-500/5 py-1 rounded border border-red-500/10">
                                        Warning: Learning history for this asset will be permanently deleted.
                                    </p>

                                    <div className="relative w-full mb-2">
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={resetPin}
                                            onChange={(e) => {
                                                setResetPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4));
                                                setResetError('');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && verifyAndReset()}
                                            placeholder="Enter PIN"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-center font-mono font-bold text-white focus:outline-none focus:border-red-500/50 transition-all tracking-[0.5em] placeholder:tracking-normal placeholder:text-gray-600"
                                            autoFocus
                                        />
                                    </div>

                                    {resetError && (
                                        <div className="text-[10px] text-red-500 font-bold mb-3 animate-pulse flex items-center gap-1">
                                            <AlertTriangle size={10} /> {resetError}
                                        </div>
                                    )}

                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => setIsResetVerifying(false)}
                                            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-gray-400 transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={verifyAndReset}
                                            className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-[10px] font-bold text-white transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                        >
                                            UNLOCK
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 bg-[#0a0a16] p-3 border-t border-white/10 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col-reverse relative z-10 min-h-[80px]">
                            <div className="text-neon-cyan/80">
                                <span className="mr-2 opacity-50">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                                {botLog}
                                <span className="animate-pulse ml-1">_</span>
                            </div>
                            <div className="text-gray-600 truncate">System: Live Tensor Feed active...</div>
                        </div>

                        <div className="p-2 border-t border-white/5 flex justify-between gap-2 relative z-10 flex-shrink-0">
                            <button onClick={handleResetRequest} className="px-3 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-wider flex items-center justify-center">
                                Reset
                            </button>
                            <button
                                onClick={handleBoostLearning}
                                disabled={isBoosting}
                                className={`flex-1 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-2 border
                            ${isBoosting
                                        ? 'bg-neon-cyan text-black border-neon-cyan shadow-[0_0_15px_#00F0FF]'
                                        : 'bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20'
                                    }
                        `}
                            >
                                <Zap size={12} className={isBoosting ? "animate-spin" : ""} />
                                {isBoosting ? "Learning..." : "Boost Learning"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TradingPanel;
