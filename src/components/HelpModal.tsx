
import React from 'react';
import { X, BookOpen, Bot, Zap, Shield, MousePointer2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 left-[60px] z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl h-[600px] bg-[#0a0a16] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 mx-8">
        
        {/* Header */}
        <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
                    <BookOpen size={20} className="text-neon-cyan" />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-heading text-white tracking-widest">TERMINAL GUIDE</h3>
                    <p className="text-[10px] text-gray-400 uppercase">Veltrex Operating Manual v2.5</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            
            {/* Section 1: Basics */}
            <section className="space-y-4">
                <h4 className="flex items-center gap-2 text-neon-cyan text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                    <MousePointer2 size={16} /> Execution Basics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-cyan/30 transition-colors">
                        <div className="text-neon-cyan font-bold mb-2">CALL (Higher)</div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Predicts the price will be <span className="text-white">HIGHER</span> than the entry point after the duration expires.
                            <br/><br/>
                            <span className="text-[10px] bg-neon-cyan/10 px-1 py-0.5 rounded border border-neon-cyan/20">Win Condition: Exit Price &gt; Entry Price</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-magenta/30 transition-colors">
                        <div className="text-neon-magenta font-bold mb-2">PUT (Lower)</div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                             Predicts the price will be <span className="text-white">LOWER</span> than the entry point after the duration expires.
                            <br/><br/>
                            <span className="text-[10px] bg-neon-magenta/10 px-1 py-0.5 rounded border border-neon-magenta/20">Win Condition: Exit Price &lt; Entry Price</span>
                        </p>
                    </div>
                </div>
            </section>

             {/* Section 2: AI */}
             <section className="space-y-4">
                <h4 className="flex items-center gap-2 text-purple-400 text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                    <Bot size={16} /> Neural Auto-Pilot
                </h4>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20">
                    <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                        Veltrex utilizes a **Double Deep Q-Network (DDQN)** to analyze market micro-structures.
                        The AI observes RSI, Volatility, and Price Delta to build a probability matrix.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-black/40 p-2 rounded text-center">
                            <div className="text-purple-400 font-bold text-xs">Explore</div>
                            <div className="text-[9px] text-gray-500">Random sampling to find new patterns</div>
                        </div>
                        <div className="bg-black/40 p-2 rounded text-center">
                            <div className="text-neon-cyan font-bold text-xs">Exploit</div>
                            <div className="text-[9px] text-gray-500">Executing known high-probability setups</div>
                        </div>
                         <div className="bg-black/40 p-2 rounded text-center">
                            <div className="text-white font-bold text-xs">Replay</div>
                            <div className="text-[9px] text-gray-500">Learning from past trade outcomes</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Features */}
            <section className="space-y-4">
                <h4 className="flex items-center gap-2 text-yellow-400 text-sm font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                    <Zap size={16} /> Pro Tools
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <div className="mt-1 text-yellow-400"><Shield size={14}/></div>
                        <div>
                            <div className="text-xs font-bold text-white">Social Radar</div>
                            <div className="text-[10px] text-gray-400">Track "Whale" wallets in real-time and copy their directional bias instantly.</div>
                        </div>
                    </li>
                     <li className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <div className="mt-1 text-yellow-400"><Zap size={14}/></div>
                        <div>
                            <div className="text-xs font-bold text-white">Focus Chart</div>
                            <div className="text-[10px] text-gray-400">Distraction-free visualization with real-time liquidity heatmaps.</div>
                        </div>
                    </li>
                </ul>
            </section>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;
