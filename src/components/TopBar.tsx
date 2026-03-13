
import React, { useState } from 'react';
import { ChevronDown, Plus, Bell, User, Wifi, Radio, Shield, Fingerprint, PieChart, TrendingUp, Trash2, Heart } from 'lucide-react';
import { Asset, UserProfile } from '../types';

interface TopBarProps {
  activeAsset: Asset;
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  balance: number;
  user: UserProfile | null;
  pnl: {
    won: number;
    lost: number;
    totalTrades: number;
  };
}

const TopBar: React.FC<TopBarProps> = ({ activeAsset, assets, onSelectAsset, balance, user, pnl }) => {
  const [isAssetListOpen, setIsAssetListOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "System Message", 
      message: "Good Day Happy Trading from ELMER", 
      time: "Just now", 
      type: 'system', 
      read: false 
    },
    { 
      id: 2, 
      title: "Community Love", 
      message: "Elmer love's U", 
      time: "2 min ago", 
      type: 'love', 
      read: false 
    }
  ]);

  const handleSelect = (asset: Asset) => {
    onSelectAsset(asset);
    setIsAssetListOpen(false);
  };
  
  const handleNotificationClick = (id: number) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
      setNotifications([]);
      setIsNotificationsOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const winRate = pnl.totalTrades > 0 ? Math.round((pnl.won / pnl.totalTrades) * 100) : 0;

  return (
    <div className="w-full h-full flex items-center justify-between">
      {/* Asset Selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => { setIsAssetListOpen(!isAssetListOpen); setIsProfileOpen(false); setIsNotificationsOpen(false); }}
            className={`flex items-center gap-3 pl-0 pr-4 py-2 rounded-lg transition-colors ${isAssetListOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                {activeAsset.symbol}
                <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-300 ${isAssetListOpen ? 'rotate-180' : ''}`} 
                />
              </h2>
              <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${activeAsset.change >= 0 ? 'text-neon-cyan' : 'text-neon-magenta'}`}>
                    {activeAsset.change > 0 ? '+' : ''}{activeAsset.change}%
                  </span>
                  
                  {/* DATA SOURCE INDICATOR */}
                  <div className={`flex items-center gap-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded border 
                    ${activeAsset.coincapId 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                      {activeAsset.coincapId 
                        ? <Wifi size={10} className="animate-pulse" /> 
                        : <Radio size={10} />
                      }
                      {activeAsset.coincapId ? 'COINCAP LIVE' : 'SIMULATED FEED'}
                  </div>
              </div>
            </div>
          </button>
          
          {/* Dropdown (Click Toggled) */}
          {isAssetListOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a16] border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 z-50">
               <div className="text-[10px] uppercase text-gray-500 font-bold px-2 py-1 mb-1">Select Asset</div>
               <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                   {assets.map(a => (
                     <button 
                       key={a.id}
                       onClick={() => handleSelect(a)}
                       className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm ${activeAsset.id === a.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                     >
                       <div className="flex flex-col items-start">
                           <span className="font-bold">{a.symbol}</span>
                           <span className={`text-[9px] font-bold ${a.coincapId ? 'text-green-500' : 'text-gray-600'}`}>
                               {a.coincapId ? '● LIVE' : '○ SIM'}
                           </span>
                       </div>
                       <span className={a.change >= 0 ? 'text-neon-cyan' : 'text-neon-magenta'}>{a.change}%</span>
                     </button>
                   ))}
               </div>
            </div>
          )}
        </div>

        <button className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 transition-all">
          <Plus size={16} />
        </button>
      </div>

      {/* Balance & User */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Live Account</div>
          <div className="text-lg font-mono font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <button className="bg-neon-cyan text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#33f2ff] transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          DEPOSIT
        </button>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex items-center gap-3">
           {/* NOTIFICATIONS DROPDOWN */}
           <div className="relative">
               <button 
                 onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); setIsAssetListOpen(false); }}
                 className={`relative p-2 rounded-lg transition-colors ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 <Bell size={20} />
                 {unreadCount > 0 && (
                   <span className="absolute top-1 right-1.5 w-2 h-2 bg-neon-magenta rounded-full shadow-[0_0_5px_#FF0055]">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-magenta opacity-75"></span>
                   </span>
                 )}
               </button>

               {isNotificationsOpen && (
                   <div className="absolute top-full right-0 mt-3 w-80 bg-[#0a0a16] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 backdrop-blur-xl">
                       {/* Triangle pointer */}
                       <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[#0a0a16] border-t border-l border-white/10 rotate-45 transform"></div>
                       
                       <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                           <span className="text-xs font-bold uppercase tracking-widest text-white">Notifications</span>
                           {notifications.length > 0 && (
                               <button onClick={clearNotifications} className="text-[10px] text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors">
                                   <Trash2 size={10} /> Clear All
                               </button>
                           )}
                       </div>

                       <div className="max-h-64 overflow-y-auto custom-scrollbar">
                           {notifications.length === 0 ? (
                               <div className="p-8 text-center text-gray-500 text-xs">
                                   No new notifications
                               </div>
                           ) : (
                               notifications.map(notif => (
                                   <div 
                                     key={notif.id} 
                                     onClick={() => handleNotificationClick(notif.id)}
                                     className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${notif.read ? 'opacity-50' : 'bg-neon-cyan/5'}`}
                                   >
                                       <div className="flex items-start gap-3">
                                           <div className={`mt-0.5 p-1.5 rounded-full ${notif.type === 'love' ? 'bg-pink-500/20 text-pink-500' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
                                               {notif.type === 'love' ? <Heart size={12} fill="currentColor" /> : <Shield size={12} />}
                                           </div>
                                           <div className="flex-1">
                                               <div className="flex justify-between items-start mb-0.5">
                                                   <span className={`text-xs font-bold ${notif.type === 'love' ? 'text-pink-400' : 'text-neon-cyan'}`}>{notif.title}</span>
                                                   <span className="text-[9px] text-gray-500">{notif.time}</span>
                                               </div>
                                               <p className="text-[11px] text-gray-300 leading-tight">{notif.message}</p>
                                           </div>
                                           {!notif.read && (
                                               <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan mt-1.5 shadow-[0_0_5px_#00F0FF]"></div>
                                           )}
                                       </div>
                                   </div>
                               ))
                           )}
                       </div>
                   </div>
               )}
           </div>
           
           {/* USER PROFILE DROPDOWN */}
           <div className="relative">
               <button 
                 onClick={() => { setIsProfileOpen(!isProfileOpen); setIsAssetListOpen(false); setIsNotificationsOpen(false); }}
                 className={`w-9 h-9 rounded-lg bg-gradient-to-br from-white/10 to-transparent border flex items-center justify-center overflow-hidden transition-all ${isProfileOpen ? 'border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'border-white/10 hover:border-white/30 hover:text-white'}`}
               >
                  <User size={18} />
               </button>

               {isProfileOpen && (
                   <div className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a16] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 animate-in fade-in slide-in-from-top-2 z-50 backdrop-blur-xl">
                       {/* Triangle pointer */}
                       <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[#0a0a16] border-t border-l border-white/10 rotate-45 transform"></div>
                       
                       <div className="flex items-center gap-3 mb-4">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/20 to-blue-600/20 border border-neon-cyan/50 flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                               <User size={24} />
                           </div>
                           <div className="overflow-hidden">
                               <div className="text-base font-bold font-heading text-white tracking-wide truncate">
                                   {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                               </div>
                               <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                                   <Shield size={10} className="text-green-500" /> Verified Trader
                               </div>
                           </div>
                       </div>

                       {/* PnL Stats Section */}
                       <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5">
                           <div className="flex items-center gap-2 mb-2">
                               <PieChart size={12} className="text-gray-400" />
                               <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Performance</span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-2 mb-2">
                               <div className="bg-black/40 rounded-lg p-2 flex flex-col items-center">
                                   <span className="text-neon-cyan font-mono font-bold text-lg leading-none">{winRate}%</span>
                                   <span className="text-[8px] text-gray-500 uppercase mt-1">Win Rate</span>
                               </div>
                               <div className="bg-black/40 rounded-lg p-2 flex flex-col items-center">
                                   <span className="text-white font-mono font-bold text-lg leading-none">{pnl.totalTrades}</span>
                                   <span className="text-[8px] text-gray-500 uppercase mt-1">Total Trades</span>
                               </div>
                           </div>
                           
                           <div className="flex justify-between items-center text-[10px] font-mono px-1">
                               <span className="text-green-400 flex items-center gap-1"><TrendingUp size={10} /> {pnl.won} Wins</span>
                               <span className="text-neon-magenta">{pnl.lost} Losses</span>
                           </div>
                       </div>

                       <div className="h-px bg-white/5 my-2" />

                       <div className="space-y-2">
                           <div className="flex justify-between items-center text-xs text-gray-400 py-1 hover:bg-white/5 rounded px-2 transition-colors cursor-pointer">
                               <span className="flex items-center gap-2"><Fingerprint size={12}/> Account ID</span>
                               <span className="font-mono text-gray-300">TRD-8821X</span>
                           </div>
                            <div className="flex justify-between items-center text-xs text-gray-400 py-1 hover:bg-white/5 rounded px-2 transition-colors cursor-pointer">
                               <span className="flex items-center gap-2"><Shield size={12}/> Security Level</span>
                               <span className="text-neon-cyan font-bold">MAXIMUM</span>
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

export default TopBar;
