import React from 'react';
import { MOCK_WHALES } from '../constants';
import { WhaleTrade } from '../types';
import { Users, Copy, Zap } from 'lucide-react';

const SocialRadar: React.FC = () => {
  return (
    <div className="w-72 hidden lg:flex flex-col glass-panel border-l border-white/5 h-full bg-[#05050F]/80 z-20">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-heading font-bold text-lg tracking-widest flex items-center gap-2">
          <Users className="text-neon-cyan" size={18} />
          SOCIAL RADAR
        </h3>
        <span className="text-xs text-green-400 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {MOCK_WHALES.map((whale: WhaleTrade) => (
          <div key={whale.id} className="relative p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group overflow-hidden">
            {/* Decorative Glow */}
            <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-20 -z-10 ${whale.direction === 'CALL' ? 'bg-neon-cyan' : 'bg-neon-magenta'}`} />
            
            <div className="flex items-center gap-3 mb-2">
              <img src={whale.avatar} alt={whale.user} className="w-8 h-8 rounded-full border border-white/20" />
              <div>
                <div className="text-sm font-bold font-heading">{whale.user}</div>
                <div className="text-[10px] text-gray-400">{whale.time} • {whale.asset}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Bet Amount</span>
                    <span className="font-mono font-bold text-white">₱{whale.amount.toLocaleString()}</span>
                </div>
                <div className={`
                    px-2 py-1 rounded text-xs font-bold border
                    ${whale.direction === 'CALL' 
                        ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' 
                        : 'border-neon-magenta text-neon-magenta bg-neon-magenta/10'}
                `}>
                    {whale.direction}
                </div>
            </div>

            <button className="mt-3 w-full py-1.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider rounded bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/20">
                <Copy size={12} />
                One-Click Copy
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Tournament</span>
            </div>
            <div className="text-sm text-gray-300 mb-2">Weekly Whale Cup</div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>Rank: 42</span>
                <span>Prize: ₱50k</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SocialRadar;