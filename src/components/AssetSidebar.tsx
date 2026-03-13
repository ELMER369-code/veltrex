import React from 'react';
import { Asset, AssetType } from '../types';
import { Activity, Globe, PhilippinePeso, TrendingUp, TrendingDown } from 'lucide-react';

interface AssetSidebarProps {
  assets: Asset[];
  activeAsset: Asset;
  onSelect: (asset: Asset) => void;
}

const AssetSidebar: React.FC<AssetSidebarProps> = ({ assets, activeAsset, onSelect }) => {
  return (
    <div className="w-16 md:w-20 flex flex-col items-center py-6 glass-panel border-r-0 border-l-0 md:border-r border-white/5 h-full z-20 bg-[#05050F]/80">
      <div className="mb-8 p-2 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-white/10">
        <Activity className="w-6 h-6 text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-4 w-full px-2 overflow-y-auto">
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={`
              group relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300
              ${activeAsset.id === asset.id 
                ? 'bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-neon-cyan/50' 
                : 'hover:bg-white/5 border-transparent'}
              border
            `}
          >
            {/* Indicator Icon based on Type */}
            <div className={`mb-1 ${activeAsset.id === asset.id ? 'text-neon-cyan' : 'text-gray-400 group-hover:text-white'}`}>
                {asset.type === AssetType.CRYPTO && <PhilippinePeso size={16} />}
                {asset.type === AssetType.FOREX && <Globe size={16} />}
                {asset.type === AssetType.STOCKS && <Activity size={16} />}
            </div>
            
            <span className="text-[10px] font-bold font-heading tracking-wider hidden md:block">
                {asset.symbol.split('/')[0]}
            </span>

            {/* Price Change Pill */}
            <div className={`
                mt-1 text-[9px] px-1 rounded-sm flex items-center gap-0.5
                ${asset.change >= 0 ? 'text-neon-cyan bg-neon-cyan/10' : 'text-neon-magenta bg-neon-magenta/10'}
            `}>
                {asset.change >= 0 ? <TrendingUp size={8}/> : <TrendingDown size={8}/>}
                {Math.abs(asset.change)}%
            </div>

            {/* Active Indicator Bar */}
            {activeAsset.id === asset.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full shadow-[0_0_10px_#00F0FF]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetSidebar;