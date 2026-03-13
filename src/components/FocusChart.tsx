
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot } from 'recharts';
import { ChartDataPoint, Asset, TimeFrame, Trade } from '../types';
import { Clock, ChevronDown, Activity } from 'lucide-react';

interface FocusChartProps {
  data: ChartDataPoint[];
  asset: Asset;
  timeFrame: TimeFrame;
  onSetTimeFrame: (tf: TimeFrame) => void;
  trades?: Trade[]; // Optional to allow for backwards compatibility/flexibility
}

// Custom Shape Renderer for the Trade Dot with Hover Tooltip
const CustomTradeDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Safety check if coordinates are valid numbers (prevents crashing when off-screen)
    if (!cx || !cy || isNaN(cx) || isNaN(cy)) return null;

    // Use payload data passed from ReferenceDot
    const direction = payload.direction;
    const price = payload.price;
    
    const isCall = direction === 'CALL';
    const color = isCall ? '#00F0FF' : '#FF0055';
    const bgColor = isCall ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 0, 85, 0.1)';

    return (
        <g className="group cursor-crosshair">
            {/* Pulsing Effect Ring */}
            <circle cx={cx} cy={cy} r={8} fill={bgColor} className="animate-pulse origin-center" />
            
            {/* The Main Dot */}
            <circle 
                cx={cx} 
                cy={cy} 
                r={4} 
                fill={color} 
                stroke="#fff" 
                strokeWidth={1.5} 
                className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
            />

            {/* Tooltip (Hidden by default, shown on group hover) */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {/* Tooltip Box Background */}
                <rect 
                    x={cx - 50} 
                    y={cy - 45} 
                    width="100" 
                    height="30" 
                    rx="6" 
                    fill="#0a0a16" 
                    stroke={color} 
                    strokeWidth="1" 
                    fillOpacity="0.9"
                />
                
                {/* Triangle Pointer */}
                <path d={`M ${cx} ${cy - 14} L ${cx - 5} ${cy - 16} L ${cx + 5} ${cy - 16} Z`} fill={color} />

                {/* Text Content */}
                <text 
                    x={cx} 
                    y={cy - 26} 
                    textAnchor="middle" 
                    fill={color} 
                    fontSize="10" 
                    fontWeight="bold" 
                    fontFamily="monospace"
                >
                    {direction} @ {price.toFixed(2)}
                </text>
            </g>
        </g>
    );
};

const FocusChart: React.FC<FocusChartProps> = ({ data, asset, timeFrame, onSetTimeFrame, trades = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevAssetIdRef = useRef(asset.id);
  const prevTimeFrameRef = useRef(timeFrame);
  
  const timeFrames: TimeFrame[] = ['1S', '15S', '30S', '1M', '2M', '5M', '15M', '30M', '1H', '4H', '1D'];

  useEffect(() => {
    if (prevAssetIdRef.current !== asset.id || prevTimeFrameRef.current !== timeFrame) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Animation duration
      
      prevAssetIdRef.current = asset.id;
      prevTimeFrameRef.current = timeFrame;
      return () => clearTimeout(timer);
    }
  }, [asset.id, timeFrame]);

  if (data.length === 0) return <div className="flex-1 flex items-center justify-center text-neon-cyan">Initializing Quantum Feed...</div>;

  const currentPrice = data[data.length - 1].price;
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.2;

  // Filter trades to only show those for the current asset
  // We don't filter by time here, Recharts handles off-screen coordinates automatically
  const visibleTrades = trades.filter(t => t.assetId === asset.id);

  const handleTimeFrameSelect = (tf: TimeFrame) => {
    onSetTimeFrame(tf);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-[#05050F]">
       {/* Background Grid Simulation */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      {/* Heatmap Layers (Visual Simulation) */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500">
          {/* Buy Wall Simulation (Green Haze at bottom) */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-neon-cyan/5 to-transparent opacity-50"></div>
          {/* Sell Wall Simulation (Red Haze at top) */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-neon-magenta/5 to-transparent opacity-50"></div>
      </div>

      {/* Time Frame Selector Dropdown */}
      <div className="absolute top-4 left-4 z-20">
        <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-[#05050F]/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg hover:bg-white/5 transition-all group"
        >
            <Clock size={14} className="text-neon-cyan" />
            <span className="text-xs font-bold font-mono text-white">{timeFrame}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-[#0a0a16] border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden min-w-[100px] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 custom-scrollbar">
                <div className="p-1">
                    {timeFrames.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => handleTimeFrameSelect(tf)}
                            className={`
                                w-full text-left px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-between
                                ${timeFrame === tf 
                                    ? 'bg-neon-cyan/10 text-neon-cyan' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {tf}
                            {timeFrame === tf && <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_5px_#00F0FF]"></div>}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Transition Loading Overlay */}
      <div className={`
        absolute inset-0 z-10 flex items-center justify-center bg-[#05050F]/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-none
        ${isTransitioning ? 'opacity-100' : 'opacity-0'}
      `}>
          <div className="flex flex-col items-center gap-2 text-neon-cyan animate-pulse">
             <Activity size={32} />
             <span className="font-mono text-xs tracking-widest uppercase">
                Calibrating Stream: {asset.symbol} [{timeFrame}]
             </span>
          </div>
      </div>

      {/* Chart Container with Blur Transition */}
      <div className={`w-full h-full transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            
            <XAxis 
                dataKey="time" 
                hide 
                type="number" 
                domain={['dataMin', 'dataMax']} 
            />
            <YAxis 
                hide 
                domain={[minPrice - padding, maxPrice + padding]} 
            />
            
            <Tooltip 
                contentStyle={{ backgroundColor: '#05050F', borderColor: '#333', color: '#fff' }}
                itemStyle={{ color: '#00F0FF' }}
                formatter={(value: number) => [value.toFixed(2), 'Price']}
                labelFormatter={() => ''}
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeDasharray: '5 5' }}
            />
            
            {/* The Price Line - Animation Disabled for manual loop control */}
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#00F0FF" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                filter="url(#glow)"
                isAnimationActive={false} 
            />
            
            {/* Current Price Line */}
            <ReferenceLine 
                y={currentPrice} 
                stroke="#fff" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5} 
            />

            {/* VISUALIZE TRADES AS DOTS */}
            {visibleTrades.map((trade) => (
                <ReferenceDot
                    key={trade.id}
                    x={trade.timestamp}
                    y={trade.entryPrice}
                    r={0} // We hide the default dot and use shape={}
                    shape={(props: any) => (
                        <CustomTradeDot 
                            {...props} 
                            payload={{ 
                                direction: trade.direction, 
                                price: trade.entryPrice 
                            }} 
                        />
                    )}
                    // Removed isFront={true} as it's not supported in current Recharts types
                    ifOverflow="hidden" // Hides dots that scroll out of view
                />
            ))}

            </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Floating Current Price Tag - also fades */}
      <div 
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ top: `${100 - ((currentPrice - (minPrice - padding)) / ((maxPrice + padding) - (minPrice - padding))) * 100}%` }}
      >
        <div className="h-[1px] w-4 bg-neon-cyan"></div>
        <div className="bg-neon-cyan text-black font-mono font-bold text-xs px-2 py-1 rounded-l-md shadow-[0_0_10px_#00F0FF]">
            {currentPrice.toFixed(2)}
        </div>
      </div>

    </div>
  );
};

export default FocusChart;
