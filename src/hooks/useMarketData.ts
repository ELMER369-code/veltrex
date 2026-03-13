
import { useState, useEffect, useRef } from 'react';
import { Asset, ChartDataPoint, TimeFrame } from '../types';

export const useMarketData = (activeAsset: Asset, timeFrame: TimeFrame) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(activeAsset.price);
  const [recentChange, setRecentChange] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Refs for animation loop
  const lastRenderedPriceRef = useRef<number>(activeAsset.price);
  const latestRealPriceRef = useRef<number>(activeAsset.price);
  const prevAssetIdRef = useRef<string>(activeAsset.id);
  const lastPointTimeRef = useRef<number>(Date.now());

  // CONSTANTS
  const MAX_POINTS = 150; // Points to keep in history
  const ANIMATION_TICK_RATE = 50; // 20 FPS Vertical Animation (Smoothness)
  const SMOOTHING_FACTOR = 0.08; // How fast it chases the real price

  // DYNAMIC HORIZONTAL SPEED MAPPING (STRICT)
  // Maps TimeFrame directly to milliseconds per candle/point.
  const getPointDuration = (tf: TimeFrame): number => {
      switch(tf) {
          case '1S': return 1000;
          case '15S': return 15000;
          case '30S': return 30000;
          case '1M': return 60000;
          case '2M': return 120000;
          case '5M': return 300000;
          case '15M': return 900000;
          case '30M': return 1800000;
          case '1H': return 3600000;
          case '4H': return 14400000; 
          case '1D': return 86400000;
          default: return 1000;
      }
  };

  // Helper to generate high-density fake history 
  const generateInitialHistory = (basePrice: number, pointDuration: number) => {
    const initialData: ChartDataPoint[] = [];
    let price = basePrice;
    const now = Date.now();
    
    // Create random walk backwards
    const historyPoints = [];
    for (let i = 0; i < MAX_POINTS; i++) {
       const volatility = 0.0002; 
       const change = (Math.random() - 0.5) * (price * volatility);
       price = price - change; 
       historyPoints.unshift(price);
    }

    historyPoints.forEach((p, i) => {
        initialData.push({
            time: now - ((MAX_POINTS - i) * pointDuration),
            price: p,
            liquidityBuy: p * 0.999,
            liquiditySell: p * 1.001
        });
    });
    
    return initialData;
  };

  useEffect(() => {
    if (data.length > 0) {
        const firstPrice = data[0].price;
        const lastPrice = data[data.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setRecentChange(change);
    }
  }, [data]);

  useEffect(() => {
    const isAssetChanged = prevAssetIdRef.current !== activeAsset.id;
    prevAssetIdRef.current = activeAsset.id;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Initialize
    let startPrice = isAssetChanged ? activeAsset.price : lastRenderedPriceRef.current;
    const pointDuration = getPointDuration(timeFrame);
    
    latestRealPriceRef.current = startPrice;
    lastRenderedPriceRef.current = startPrice;
    lastPointTimeRef.current = Date.now();

    setData(generateInitialHistory(startPrice, pointDuration));
    setCurrentPrice(startPrice);
    
    // 1. WEBSOCKET SETUP
    if (activeAsset.coincapId) {
      const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${activeAsset.coincapId}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message[activeAsset.coincapId!]) {
            const newRealPrice = parseFloat(message[activeAsset.coincapId!]);
            latestRealPriceRef.current = newRealPrice; 
        }
      };
    } 

    // 2. HYBRID ANIMATION LOOP
    const interval = setInterval(() => {
        const pointDuration = getPointDuration(timeFrame);
        const now = Date.now();

        // A. VERTICAL INTERPOLATION (Smooth Pursuit) - Runs every 50ms
        // This updates the *current price value* so the line wiggles smoothly
        const target = latestRealPriceRef.current;
        const current = lastRenderedPriceRef.current;
        
        // Sim Logic for non-crypto
        if (activeAsset.type !== 'CRYPTO') {
            const volFactor = activeAsset.type === 'FOREX' ? 0.00005 : 0.0002;
            const change = (Math.random() - 0.5) * (current * volFactor);
            latestRealPriceRef.current = target + change;
        }

        const diff = target - current;
        let step = diff * SMOOTHING_FACTOR;
        const noise = (Math.random() - 0.5) * (current * 0.00001); 
        
        let newPrice = current + step + noise;
        
        // Update Refs
        lastRenderedPriceRef.current = newPrice;
        setCurrentPrice(newPrice);

        // B. HORIZONTAL DATA MANAGEMENT
        setData(prevData => {
            if (prevData.length === 0) return prevData;

            // Check if it's time to "Move Right" (Add new candle/point) based on exact timeframe
            const timeSinceLastPoint = now - lastPointTimeRef.current;

            if (timeSinceLastPoint >= pointDuration) {
                // TIME TO SCROLL: Add new point, Shift old
                lastPointTimeRef.current = now;
                
                const newPoint: ChartDataPoint = {
                    time: now,
                    price: newPrice,
                    liquidityBuy: newPrice * 0.999,
                    liquiditySell: newPrice * 1.001,
                };

                const newData = [...prevData, newPoint];
                if (newData.length > MAX_POINTS) newData.shift();
                return newData;

            } else {
                // NOT YET: Update the *last point* in place (Vertical Wiggle Only)
                // This keeps the chart "alive" showing the current price, but doesn't scroll horizontally until the second/minute passes.
                const updatedData = [...prevData];
                const lastIndex = updatedData.length - 1;
                updatedData[lastIndex] = {
                    ...updatedData[lastIndex],
                    price: newPrice, 
                    // Do NOT update 'time' here, or Recharts will jitter the x-axis
                };
                return updatedData;
            }
        });
    }, ANIMATION_TICK_RATE);

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeAsset, timeFrame]);

  return { data, currentPrice, recentChange };
};
