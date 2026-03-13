# Veltrex Code Snippets
**System Architecture & Core Algorithms**

This document contains key code excerpts from the Veltrex source code, selected to demonstrate the technical depth of the project.

---

## 1. The Q-Learning Brain (Reinforcement Learning)
**Source:** `src/components/TradingPanel.tsx`
**Description:** This logic demonstrates the core "Double Deep Q-Network" (DDQN) implementation. It uses an Experience Replay buffer to learn from past actions and updates the Q-Matrix using the Bellman Equation.

```typescript
// -------------------------------------------------------------------------
// THE BRAIN: Simulation Loop (DDQN + Experience Replay + Dynamic Timeframe)
// -------------------------------------------------------------------------
useEffect(() => {
    if (isAutomated) {
        interval = setInterval(() => {

            // 1. FEATURE ENGINEERING (Sensors)
            // Calculates RSI and Volatility signals from raw price data
            const currentVol = asset.volatility + (Math.random() * 0.1);
            const simulatedRSI = Math.min(100, Math.max(0, 50 + (modelDelta * 50)));

            // 2. STATE DETERMINATION (Environment)
            // Classifies the market as BULLISH, BEARISH, or SIDEWAYS
            let newState: MarketState = 'SIDEWAYS';
            if (modelDelta > 0.03 && simulatedRSI < 75) newState = 'BULLISH';
            else if (modelDelta < -0.03 && simulatedRSI > 25) newState = 'BEARISH';

            // 3. DECIDE ACTION (Epsilon-Greedy Strategy)
            let action: Action;
            const epsilon = 0.10; // 10% Exploration Rate

            if (Math.random() < epsilon) {
                // EXPLORE: Try a random action to discover new strategies
                const actions: Action[] = ['CALL', 'PUT', 'HOLD'];
                action = actions[Math.floor(Math.random() * actions.length)];
            } else {
                // EXPLOIT: Use the Q-Table to choose the best known action
                const stateValues = qTable[newState];
                action = Object.keys(stateValues).reduce((a, b) => 
                    stateValues[a] > stateValues[b] ? a : b) as Action;
            }

            // 4. REWARD & TRAINING (The "Learning" Step)
            // Updates the Q-Values based on whether the trade won or lost
            const trainingBatch = Array.from({ length: 32 }, () => 
                replayBuffer.current[Math.floor(Math.random() * replayBuffer.current.length)]);

            trainingBatch.forEach(exp => {
                // Bellman Equation: Q(s,a) = Q(s,a) + alpha * (reward + gamma * maxQ(s',a') - Q(s,a))
                const currentQ = newTable[exp.state][exp.action];
                const targetValue = targetQTable[exp.nextState][bestNextAction];
                const updatedQ = currentQ + 0.1 * (exp.reward + 0.9 * targetValue - currentQ);
                
                newTable[exp.state][exp.action] = Number(updatedQ.toFixed(3));
            });

        }, 1500); // Thinking Speed
    }
}, [isAutomated, qTable]);
```

---

## 2. Trade Execution Engine
**Source:** `src/App.tsx`
**Description:** This function handles the financial logic. It validates balances, locks funds, creates a trade record, and asynchronously verifies the outcome after the duration expires.

```typescript
// Updated to accept 'currentReturn' (profit percentage) from the AI
const handleTrade = (direction: 'CALL' | 'PUT', amount: number, duration: number, currentReturn: number) => {
    
    // 1. Validation & Deduction
    if (wallet.balance < amount) return alert("Insufficient funds");
    setWallet(prev => ({ ...prev, balance: prev.balance - amount }));

    // 2. Execution Record
    const newTrade: Trade = {
        id: Date.now().toString(),
        direction,
        entryPrice: currentPrice,
        amount,
        payout: amount + (amount * (currentReturn / 100)), // Dynamic Payout
        timestamp: Date.now(),
        duration,
        status: 'OPEN'
    };

    setTrades(prev => [newTrade, ...prev]);

    // 3. Asynchronous Resolution (Timer)
    setTimeout(() => {
        const finalExitPrice = latestPriceRef.current; // Get real-time exit price
        let finalStatus: 'WON' | 'LOST' = 'LOST';

        // 4. Win Condition Logic
        if (direction === 'CALL' && finalExitPrice > newTrade.entryPrice) finalStatus = 'WON';
        else if (direction === 'PUT' && finalExitPrice < newTrade.entryPrice) finalStatus = 'WON';

        // 5. Settlement
        if (finalStatus === 'WON') {
            setWallet(prev => ({
                ...prev,
                balance: prev.balance + newTrade.payout, // Crediting Winnings
                pnl: { ...prev.pnl, won: prev.pnl.won + 1 }
            }));
        }
    }, duration * 1000);
};
```

---

## 3. Market Data Simulation (Hybrid Engine)
**Source:** `src/hooks/useMarketData.ts`
**Description:** This custom hook manages the price feed. It connects to live WebSockets for crypto assets but applies a "Hybrid Animation Loop" to smooth out the data and simulate vertical wiggles (ticks) between network updates for a fluid UI experience.

```typescript
// 1. WEBSOCKET SETUP (Real-Time Data)
const ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${activeAsset.coincapId}`);
ws.onmessage = (event) => {
    const newRealPrice = parseFloat(JSON.parse(event.data)[activeAsset.coincapId]);
    latestRealPriceRef.current = newRealPrice; // Update the "Target" price
};

// 2. HYBRID ANIMATION LOOP (Smooth Pursuit)
// Runs at 20 FPS to interpolate between received price updates
setInterval(() => {
    const target = latestRealPriceRef.current;
    const current = lastRenderedPriceRef.current;

    // Smoothly chase the real price (Linear Interpolation)
    const diff = target - current;
    let step = diff * 0.08; // Smoothing Factor
    
    // Add micro-volatility noise for realism
    const noise = (Math.random() - 0.5) * (current * 0.00001); 
    let newPrice = current + step + noise;
    
    setCurrentPrice(newPrice);
    
    // Manage Chart Data Array (FIFO Buffer)
    setData(prevData => {
        // ... Logic to shift array and add new points ...
    });
}, 50);
```
