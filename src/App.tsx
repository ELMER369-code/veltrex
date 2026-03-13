
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_ASSETS } from './constants';
import { Asset, Wallet as WalletType, TimeFrame, Trade, UserProfile } from './types';
import FocusChart from './components/FocusChart';
import TradingPanel from './components/TradingPanel'; // Now repurposed as Execution Deck
import DashboardLayout from './components/DashboardLayout';
import NavSidebar from './components/NavSidebar';
import TopBar from './components/TopBar';
import TradeTerminal from './components/TradeTerminal';
import VaultModal from './components/VaultModal';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import AuthScreen from './components/AuthScreen';
import { useMarketData } from './hooks/useMarketData';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // App Navigation State
  const [activeView, setActiveView] = useState<'TRADE' | 'VAULT' | 'SETTINGS' | 'HELP'>('TRADE');

  // App Data State
  const [activeAsset, setActiveAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30S');
  
  // Wallet Persistence: Load from storage or initialize clean
  const [wallet, setWallet] = useState<WalletType>(() => {
    try {
      const saved = localStorage.getItem('veltrex_wallet');
      return saved ? JSON.parse(saved) : {
        balance: 10000.00, // Default Starting Demo Balance
        gems: 100,
        pnl: { won: 0, lost: 0, totalTrades: 0 }
      };
    } catch (e) {
      return { balance: 10000.00, gems: 100, pnl: { won: 0, lost: 0, totalTrades: 0 } };
    }
  });

  // Trade History Persistence
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('veltrex_trades');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  // Lifted Sensor State for shared access
  const [marketSensors, setMarketSensors] = useState({ rsi: 50, volatility: 0, delta: 0 });

  // Get real-time data including the micro-trend change
  const { data, currentPrice, recentChange } = useMarketData(activeAsset, timeFrame);

  // Create a Live Asset object that overrides the static 24h change with the live micro-trend
  const liveAsset: Asset = {
      ...activeAsset,
      price: currentPrice,
      change: Number(recentChange.toFixed(2)) // Use 2 decimal places for display
  };

  // REFS for accurate Trade Execution inside closures
  const latestPriceRef = useRef(currentPrice);
  const activeAssetIdRef = useRef(activeAsset.id);

  useEffect(() => {
      latestPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
      activeAssetIdRef.current = activeAsset.id;
  }, [activeAsset.id]);

  // PERSISTENCE EFFECTS
  useEffect(() => {
    localStorage.setItem('veltrex_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('veltrex_trades', JSON.stringify(trades));
  }, [trades]);

  const handleAuthenticated = (user: UserProfile) => {
      setUserProfile(user);
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setActiveView('TRADE');
  };

  const handleNavigate = (view: 'TRADE' | 'VAULT' | 'SETTINGS' | 'HELP') => {
      setActiveView(view);
      // We keep 'TRADE' as the base view but open modals for others
      // logic handled in render below
  };

  const closeModals = () => {
      setActiveView('TRADE');
  };

  // Function to handle Deposits and Withdrawals from Vault
  const handleWalletUpdate = (amount: number) => {
    setWallet(prev => ({
        ...prev,
        balance: Math.max(0, prev.balance + amount)
    }));
  };

  // Updated to accept 'currentReturn' (profit percentage) from the UI
  const handleTrade = (direction: 'CALL' | 'PUT', amount: number, duration: number, currentReturn: number) => {
    if (wallet.balance < amount) {
        alert("Insufficient funds");
        return;
    }

    // Payout is now based on the dynamic rate passed from TradingPanel
    const payout = amount + (amount * (currentReturn / 100));

    const newTrade: Trade = {
        id: Date.now().toString(),
        assetId: activeAsset.id,
        symbol: activeAsset.symbol,
        direction,
        entryPrice: currentPrice,
        amount,
        payout,
        timestamp: Date.now(),
        duration,
        status: 'OPEN'
    };

    // Deduct Balance Immediately
    setWallet(prev => ({
        ...prev,
        balance: prev.balance - amount
    }));

    // Add to Open Trades
    setTrades(prev => [newTrade, ...prev]);

    // Calculate Result after Duration
    setTimeout(() => {
        // Determine Final Price
        let finalExitPrice = 0;
        
        // If user is watching the same asset, use the REAL current price from the hook
        if (activeAssetIdRef.current === newTrade.assetId) {
             finalExitPrice = latestPriceRef.current;
        } else {
             // If user switched assets, simulate the price movement based on entry
             // This ensures background trades still resolve even if we aren't streaming that specific data
             // Simulating a small volatility swing (approx 0.1% - 0.5%)
             const randomFactor = (Math.random() - 0.5) * 0.005; 
             finalExitPrice = newTrade.entryPrice * (1 + randomFactor);
        }

        // Determine Win/Loss
        let finalStatus: 'WON' | 'LOST' = 'LOST';
        if (direction === 'CALL' && finalExitPrice > newTrade.entryPrice) {
            finalStatus = 'WON';
        } else if (direction === 'PUT' && finalExitPrice < newTrade.entryPrice) {
            finalStatus = 'WON';
        }
        // Equal price usually counts as loss or refund in binary options. We'll treat as loss for simplicity.

        setTrades(prevTrades => prevTrades.map(t => {
            if (t.id === newTrade.id) {
                return { 
                    ...t, 
                    status: finalStatus, 
                    exitPrice: finalExitPrice // Store the exit price for verification
                };
            }
            return t;
        }));

        if (finalStatus === 'WON') {
            setWallet(prev => ({
                ...prev,
                balance: prev.balance + payout,
                pnl: {
                    ...prev.pnl,
                    won: prev.pnl.won + 1,
                    totalTrades: prev.pnl.totalTrades + 1
                }
            }));
        } else {
            setWallet(prev => ({
                ...prev,
                pnl: {
                    ...prev.pnl,
                    lost: prev.pnl.lost + 1,
                    totalTrades: prev.pnl.totalTrades + 1
                }
            }));
        }

    }, duration * 1000);
  };

  if (!isAuthenticated) {
      return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <>
      <DashboardLayout
        leftSidebar={<NavSidebar activeView={activeView} onNavigate={handleNavigate} onLogout={handleLogout} />}
        header={
            <TopBar 
                activeAsset={liveAsset} // Pass live asset to show real-time change in TopBar too
                assets={INITIAL_ASSETS} 
                onSelectAsset={setActiveAsset}
                balance={wallet.balance}
                user={userProfile}
                pnl={wallet.pnl}
            />
        }
        chart={
            <FocusChart 
                data={data} 
                asset={liveAsset} 
                timeFrame={timeFrame} 
                onSetTimeFrame={setTimeFrame}
                trades={trades} /* PASSED TRADES HERE */
            />
        }
        rightPanel={
          <TradingPanel 
            key={activeAsset.id} /* CRITICAL: Forces re-mount when asset changes to load specific brain */
            onTrade={handleTrade} 
            asset={liveAsset} 
            onSensorUpdate={setMarketSensors} 
          />
        }
        bottomPanel={
          <TradeTerminal 
            trades={trades} 
            marketSensors={marketSensors} 
          />
        }
      />

      <VaultModal 
        isOpen={activeView === 'VAULT'} 
        onClose={closeModals} 
        wallet={wallet} 
        onUpdateBalance={handleWalletUpdate}
      />

      <SettingsModal 
        isOpen={activeView === 'SETTINGS'} 
        onClose={closeModals} 
      />

      <HelpModal 
        isOpen={activeView === 'HELP'} 
        onClose={closeModals} 
      />
    </>
  );
};

export default App;
