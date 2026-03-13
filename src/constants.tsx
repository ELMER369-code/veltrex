
import React from 'react';
import { Asset, AssetType } from './types';

export const INITIAL_ASSETS: Asset[] = [
  // CRYPTO (Connected via CoinCap WebSocket)
  { id: '1', symbol: 'BTC/USDT', name: 'Bitcoin', price: 88074.50, change: 2.4, type: AssetType.CRYPTO, volatility: 0.8, coincapId: 'bitcoin' },
  { id: '2', symbol: 'ETH/USDT', name: 'Ethereum', price: 3150.20, change: -1.2, type: AssetType.CRYPTO, volatility: 0.7, coincapId: 'ethereum' },
  { id: '3', symbol: 'SOL/USDT', name: 'Solana', price: 215.80, change: 5.6, type: AssetType.CRYPTO, volatility: 0.9, coincapId: 'solana' },
  { id: '4', symbol: 'XRP/USDT', name: 'Ripple', price: 0.69, change: 1.1, type: AssetType.CRYPTO, volatility: 0.6, coincapId: 'xrp' },
  { id: '13', symbol: 'BNB/USDT', name: 'Binance Coin', price: 620.20, change: 0.5, type: AssetType.CRYPTO, volatility: 0.65, coincapId: 'binance-coin' },
  { id: '14', symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.38, change: 8.4, type: AssetType.CRYPTO, volatility: 0.95, coincapId: 'dogecoin' },
  { id: '15', symbol: 'ADA/USDT', name: 'Cardano', price: 0.58, change: -0.5, type: AssetType.CRYPTO, volatility: 0.6, coincapId: 'cardano' },
  { id: '16', symbol: 'MATIC/USDT', name: 'Polygon', price: 0.38, change: 1.8, type: AssetType.CRYPTO, volatility: 0.75, coincapId: 'polygon' },
  
  // STOCKS (Simulated Live Feed) - Updated for 2025 realism
  { id: '5', symbol: 'NVDA', name: 'Nvidia Corp', price: 145.50, change: 3.2, type: AssetType.STOCKS, volatility: 0.9 }, // High Volatility
  { id: '6', symbol: 'TSLA', name: 'Tesla Inc', price: 320.20, change: -0.8, type: AssetType.STOCKS, volatility: 0.85 },
  { id: '7', symbol: 'AAPL', name: 'Apple Inc', price: 225.50, change: 0.5, type: AssetType.STOCKS, volatility: 0.4 },
  { id: '8', symbol: 'MSFT', name: 'Microsoft', price: 420.10, change: 1.2, type: AssetType.STOCKS, volatility: 0.35 },
  { id: '9', symbol: 'AMZN', name: 'Amazon', price: 210.30, change: -0.3, type: AssetType.STOCKS, volatility: 0.5 },
  { id: '10', symbol: 'AMD', name: 'Adv. Micro Devices', price: 148.80, change: 2.1, type: AssetType.STOCKS, volatility: 0.8 },

  // FOREX (Simulated Live Feed)
  { id: '11', symbol: 'EUR/USD', name: 'Euro', price: 1.0550, change: 0.05, type: AssetType.FOREX, volatility: 0.15 },
  { id: '12', symbol: 'GBP/USD', name: 'British Pound', price: 1.2650, change: -0.1, type: AssetType.FOREX, volatility: 0.2 },
];

export const MOCK_WHALES = [
  { id: 'w1', user: 'CryptoKing', avatar: 'https://picsum.photos/30/30?random=1', asset: 'BTC/USDT', amount: 5000, direction: 'CALL', time: 'Just now' },
  { id: 'w2', user: 'AlphaTrader', avatar: 'https://picsum.photos/30/30?random=2', asset: 'NVDA', amount: 12000, direction: 'CALL', time: '2s ago' },
  { id: 'w3', user: 'SatoshiGhost', avatar: 'https://picsum.photos/30/30?random=3', asset: 'SOL/USDT', amount: 8500, direction: 'PUT', time: '5s ago' },
];

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 20 L50 80 L80 20" stroke="#00F0FF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
    <path d="M50 80 L90 10" stroke="#00F0FF" strokeWidth="2" strokeOpacity="0.5" />
    <circle cx="50" cy="80" r="4" fill="#fff" />
  </svg>
);
