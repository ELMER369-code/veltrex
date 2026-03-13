
import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Activity, History, Radio, Gauge } from 'lucide-react';
import { Trade } from '../types';

interface TradeTerminalProps {
    trades: Trade[];
    marketSensors: { rsi: number; volatility: number; delta: number };
}

// Sub-component for countdown timer
const TradeTimer: React.FC<{ timestamp: number; duration: number }> = ({ timestamp, duration }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const end = timestamp + (duration * 1000);
            const remaining = Math.max(0, Math.ceil((end - now) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);

        // Initial call
        const now = Date.now();
        const end = timestamp + (duration * 1000);
        setTimeLeft(Math.max(0, Math.ceil((end - now) / 1000)));

        return () => clearInterval(interval);
    }, [timestamp, duration]);

    return <span>{timeLeft}s</span>;
};

const TradeTerminal: React.FC<TradeTerminalProps> = ({ trades, marketSensors }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY'>('OPEN');

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const historyTrades = trades.filter(t => t.status !== 'OPEN');

  const displayedTrades = activeTab === 'OPEN' ? openTrades : historyTrades;

  return (
    <div className={`flex flex-col transition-all duration-300 bg-[#05050F]/95 border-t border-white/10 ${isExpanded ? 'h-64' : 'h-10'}`}>
      {/* Tab Bar */}
      <div className="h-10 flex items-center justify-between px-4 bg-white/5 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
         <div className="flex items-center gap-6 h-full">
            <button 
                onClick={(e) => { e.stopPropagation(); setActiveTab('OPEN'); }}
                className={`h-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all px-2 ${activeTab === 'OPEN' ? 'border-neon-cyan text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <Activity size={14} className={activeTab === 'OPEN' ? 'text-neon-cyan' : ''} /> 
                Open Trades ({openTrades.length})
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setActiveTab('HISTORY'); }}
                className={`h-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all px-2 ${activeTab === 'HISTORY' ? 'border-neon-cyan text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                <History size={14} className={activeTab === 'HISTORY' ? 'text-neon-cyan' : ''} /> 
                History
            </button>

            {/* AI SENSORS DISPLAY - Moved Here */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10 h-1/2">
                <div className="text-[10px] text-gray-400 flex items-center gap-1" title="AI Sensor: RSI">
                    <Radio size={12} className="text-neon-cyan/70" /> 
                    <span className="font-mono text-gray-300">RSI:{marketSensors.rsi.toFixed(0)}</span>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1" title="AI Sensor: Volatility">
                    <Gauge size={12} className="text-neon-magenta/70" /> 
                    <span className="font-mono text-gray-300">VOL:{marketSensors.volatility.toFixed(2)}</span>
                </div>
            </div>
         </div>
         <button className="text-gray-400 hover:text-white">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
         </button>
      </div>

      {/* Content */}
      {isExpanded && (
          <div className="flex-1 overflow-auto p-0 custom-scrollbar">
             {displayedTrades.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs uppercase tracking-widest">
                    <span>No {activeTab.toLowerCase()} trades found</span>
                 </div>
             ) : (
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-400 font-bold sticky top-0 backdrop-blur-md">
                        <tr>
                            <th className="p-3">Asset</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Entry Price</th>
                            <th className="p-3">Exit Price</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Payout</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Time Remaining / Result</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {displayedTrades.map(trade => (
                            <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-bold">{trade.symbol}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.direction === 'CALL' ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-magenta/20 text-neon-magenta'}`}>
                                        {trade.direction}
                                    </span>
                                </td>
                                <td className="p-3 font-mono text-gray-300">{trade.entryPrice.toFixed(2)}</td>
                                <td className="p-3 font-mono text-white">
                                    {trade.exitPrice ? (
                                        <span className={
                                            (trade.direction === 'CALL' && trade.exitPrice > trade.entryPrice) || (trade.direction === 'PUT' && trade.exitPrice < trade.entryPrice)
                                            ? 'text-neon-cyan'
                                            : 'text-neon-magenta'
                                        }>
                                            {trade.exitPrice.toFixed(2)}
                                        </span>
                                    ) : (
                                        <span className="text-gray-600">---</span>
                                    )}
                                </td>
                                <td className="p-3 font-mono">₱{trade.amount}</td>
                                <td className="p-3 font-mono text-green-400">₱{trade.payout.toFixed(2)}</td>
                                <td className="p-3">
                                    <span className={`text-xs font-bold ${
                                        trade.status === 'OPEN' ? 'text-yellow-400 animate-pulse' : 
                                        trade.status === 'WON' ? 'text-neon-cyan' : 'text-neon-magenta'
                                    }`}>
                                        {trade.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right font-mono text-gray-400">
                                    {trade.status === 'OPEN' ? (
                                        <div className="text-white font-bold">
                                            <TradeTimer timestamp={trade.timestamp} duration={trade.duration} />
                                        </div>
                                    ) : (
                                        <span>{new Date(trade.timestamp + trade.duration * 1000).toLocaleTimeString()}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             )}
          </div>
      )}
    </div>
  );
};

export default TradeTerminal;
