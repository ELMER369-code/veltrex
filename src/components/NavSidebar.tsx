
import React from 'react';
import { LayoutGrid, Wallet, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Logo } from '../constants';

interface NavSidebarProps {
  activeView?: 'TRADE' | 'VAULT' | 'SETTINGS' | 'HELP';
  onNavigate?: (view: 'TRADE' | 'VAULT' | 'SETTINGS' | 'HELP') => void;
  onLogout?: () => void;
}

const NavSidebar: React.FC<NavSidebarProps> = ({ activeView = 'TRADE', onNavigate, onLogout }) => {
  
  const navItems = [
    { id: 'TRADE', icon: <LayoutGrid size={20} />, label: 'Trade' },
    { id: 'VAULT', icon: <Wallet size={20} />, label: 'Topup' },
    { id: 'SETTINGS', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const handleNavClick = (id: string) => {
      if (onNavigate) {
          onNavigate(id as 'TRADE' | 'VAULT' | 'SETTINGS' | 'HELP');
      }
  };

  return (
    <div className="h-full flex flex-col justify-between w-full">
      <div className="flex flex-col items-center gap-8">
        <div className="mb-2">
           <Logo className="w-8 h-8" />
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                p-3 rounded-xl flex items-center justify-center transition-all duration-300 group relative
                ${activeView === item.id 
                  ? 'bg-neon-cyan/10 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              {item.icon}
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-2 py-1 bg-black/90 border border-white/10 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-4 mb-4">
        <button 
            onClick={() => handleNavClick('HELP')}
            className={`p-3 rounded-xl transition-all duration-300 ${activeView === 'HELP' ? 'text-neon-cyan bg-neon-cyan/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
          <HelpCircle size={20} />
        </button>
        <button 
            onClick={onLogout}
            className="p-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            title="Log Out / Exit"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default NavSidebar;
