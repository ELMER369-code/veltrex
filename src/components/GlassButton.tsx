import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'CALL' | 'PUT';
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

const GlassButton: React.FC<GlassButtonProps> = ({ variant, label, subLabel, icon, className = '', ...props }) => {
  const isCall = variant === 'CALL';
  
  return (
    <button
      className={`
        relative group w-full py-4 rounded-xl flex items-center justify-center gap-3 
        transition-all duration-300 transform hover:-translate-y-1 active:scale-95 active:translate-y-0
        backdrop-blur-xl border overflow-hidden
        ${isCall 
          ? 'border-neon-cyan/50 text-neon-cyan bg-gradient-to-br from-neon-cyan/5 via-white/5 to-neon-cyan/5 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] hover:bg-neon-cyan/10' 
          : 'border-neon-magenta/50 text-neon-magenta bg-gradient-to-br from-neon-magenta/5 via-white/5 to-neon-magenta/5 shadow-[0_0_20px_rgba(255,0,85,0.15)] hover:shadow-[0_0_40px_rgba(255,0,85,0.5)] hover:bg-neon-magenta/10'
        }
        ${className}
      `}
      {...props}
    >
      {/* Top Highlight (Glass Edge) */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
      
      {/* Glossy Shine Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Icon Container */}
      <div className={`
        p-1.5 rounded-lg transition-all duration-300
        ${isCall 
            ? 'bg-neon-cyan/10 group-hover:bg-neon-cyan/20 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(0,240,255,0.5)]' 
            : 'bg-neon-magenta/10 group-hover:bg-neon-magenta/20 group-hover:text-white group-hover:shadow-[0_0_10px_rgba(255,0,85,0.5)]'}
      `}>
        {icon}
      </div>

      {/* Text Content */}
      <div className="text-left leading-none relative z-10">
        {subLabel && <div className="text-[10px] font-bold opacity-70 mb-1 tracking-widest uppercase">{subLabel}</div>}
        <div className="text-xl font-bold font-heading tracking-wide drop-shadow-md">{label}</div>
      </div>
      
      {/* Bottom Reflection (Glass Edge) */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
    </button>
  );
};

export default GlassButton;