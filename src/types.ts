
export enum AssetType {
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  STOCKS = 'STOCKS'
}

export type TimeFrame = '1S' | '15S' | '30S' | '1M' | '2M' | '5M' | '15M' | '30M' | '1H' | '4H' | '1D';

export interface UserProfile {
  firstName: string;
  lastName: string;
  pin: string; // In a real app, this should be hashed
  hasAccount: boolean;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: AssetType;
  volatility: number; // 0-1
  coincapId?: string; // Updated: Using CoinCap ID instead of Binance to avoid PH ban issues
}

export interface Trade {
  id: string;
  assetId: string;
  symbol: string;
  direction: 'CALL' | 'PUT';
  entryPrice: number;
  exitPrice?: number; // Added for trade verification
  amount: number;
  payout: number;
  timestamp: number;
  duration: number; // seconds
  status: 'OPEN' | 'WON' | 'LOST';
}

export interface WhaleTrade {
  id: string;
  user: string;
  avatar: string; // URL
  asset: string;
  amount: number;
  direction: 'CALL' | 'PUT';
  time: string;
}

export interface ChartDataPoint {
  time: number;
  price: number;
  liquidityBuy: number; // Heatmap density
  liquiditySell: number; // Heatmap density
}

export interface Wallet {
  balance: number;
  gems: number; // Gamification currency
  pnl: {
    won: number;
    lost: number;
    totalTrades: number;
  };
}
