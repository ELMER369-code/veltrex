# Future Trading Bot - Technical Documentation

## Project Information

| Field | Value |
|-------|-------|
| **Project Name** | **Veltrex** (Future Trading Bot) |
| **Version** | 1.0.0 |
| **Platform** | Windows Desktop (Tauri + React) |
| **Authors / System Architects** | Elmerio S. Talara, Trisha Ann Dahab, Venice Cabillada |
| **Institution** | Bohol Island State University - Main Campus |

---

## 1. Project Identity and Origin

### 1.1 The Name "VELTREX"
The software is named **VELTREX**, a unique identifier derived from the names of its system architects:

*   **V** — Venice
*   **EL** — Elmerio
*   **TR** — Trisha
*   **EX** — **Automated EXecution**

The suffix **"EX"** symbolizes the core purpose of the system: the **Autonomous Execution** of trades based on algorithmic decisions, removing human error and emotional bias from the equation.

## 2. Executive Summary

The Future Trading Bot is an autonomous trading simulation system powered by **Q-Learning**, a model-free reinforcement learning algorithm. The bot observes market conditions, makes trading decisions (CALL, PUT, or HOLD), and continuously improves its strategy by learning from the outcomes of its actions.

This document provides a comprehensive explanation of the Q-Learning algorithm, the Q-Matrix data structure, and how the system implements **Double Deep Q-Network (DDQN)** principles with **Experience Replay** for stable and efficient learning.

---

## 2. Introduction to Reinforcement Learning

### 2.1 What is Reinforcement Learning?

Reinforcement Learning (RL) is a type of machine learning where an **agent** learns to make decisions by interacting with an **environment**. The agent receives **rewards** or **penalties** based on its actions and uses this feedback to improve future decisions.

**Key Components:**
- **Agent**: The decision-maker (our trading bot)
- **Environment**: The market conditions (price, volatility, trend)
- **State**: A representation of the current market situation
- **Action**: What the agent can do (CALL, PUT, HOLD)
- **Reward**: Feedback signal (+1 for correct prediction, -1 for incorrect)

### 2.2 Why Q-Learning for Trading?

Q-Learning is ideal for trading because:
1. **Model-Free**: It doesn't require a mathematical model of the market
2. **Adaptive**: It learns from experience and adapts to changing conditions
3. **Exploratory**: It balances trying new strategies vs. exploiting known good ones

---

## 3. The Q-Learning Algorithm

### 3.1 Core Concept

Q-Learning assigns a **Q-value** (Quality value) to each state-action pair. This value represents the expected future reward of taking a particular action in a given state.

**The Q-Value Update Formula:**

```
Q(s, a) ← Q(s, a) + α × [R + γ × max Q(s', a') - Q(s, a)]
```

Where:
- `Q(s, a)` = Current Q-value for state `s` and action `a`
- `α` (alpha) = Learning rate (0.1 in our implementation)
- `R` = Reward received after taking action `a`
- `γ` (gamma) = Discount factor (0.9 in our implementation)
- `max Q(s', a')` = Maximum Q-value for the next state

### 3.2 Learning Rate (α = 0.1)

The learning rate controls how much new information overrides old information:
- **Low α (0.01)**: Slow learning, stable but may miss patterns
- **High α (0.9)**: Fast learning but unstable
- **Our choice (0.1)**: Balanced approach for gradual improvement

### 3.3 Discount Factor (γ = 0.9)

The discount factor determines how much the agent values future rewards:
- **γ = 0**: Only cares about immediate rewards
- **γ = 1**: Values future rewards equally to immediate ones
- **Our choice (0.9)**: Strong consideration for future outcomes

---

## 4. The Q-Matrix (Q-Table)

### 4.1 Structure

The Q-Matrix is a table that stores Q-values for every possible state-action combination. In our trading bot, the Q-Matrix has the following structure:

| State | CALL | PUT | HOLD |
|-------|------|-----|------|
| **BULLISH** | 0.50 | -0.20 | 0.10 |
| **BEARISH** | -0.30 | 0.60 | 0.10 |
| **SIDEWAYS** | 0.10 | 0.10 | 0.40 |

### 4.2 States Explained

The bot classifies market conditions into three states:

1. **BULLISH**: Price is trending upward
   - Detected when: `price_change > threshold` AND `RSI < 75`
   - Optimal action: CALL (bet on price going higher)

2. **BEARISH**: Price is trending downward
   - Detected when: `price_change < -threshold` AND `RSI > 25`
   - Optimal action: PUT (bet on price going lower)

3. **SIDEWAYS**: Price is moving horizontally
   - Detected when: price change is within threshold
   - Optimal action: HOLD (wait for clearer signal)

### 4.3 Actions Explained

| Action | Description | When to Use |
|--------|-------------|-------------|
| **CALL** | Predict price will go UP | Bullish market conditions |
| **PUT** | Predict price will go DOWN | Bearish market conditions |
| **HOLD** | Skip this trade | Uncertain/sideways market |

### 4.4 How Q-Values are Interpreted

- **Positive Q-value (e.g., +0.60)**: Taking this action in this state has historically led to profits
- **Negative Q-value (e.g., -0.30)**: Taking this action in this state has historically led to losses
- **Near-zero Q-value**: The outcome is uncertain or neutral

### 4.5 Initial Q-Values

The Q-Matrix is initialized with sensible default values based on trading intuition:

```javascript
{
    BULLISH:  { CALL: 0.50, PUT: -0.20, HOLD: 0.10 },
    BEARISH:  { CALL: -0.30, PUT: 0.60, HOLD: 0.10 },
    SIDEWAYS: { CALL: 0.10, PUT: 0.10, HOLD: 0.40 }
}
```

These defaults encode the common-sense rules:
- In BULLISH markets, CALL is preferred (+0.50)
- In BEARISH markets, PUT is preferred (+0.60)
- In SIDEWAYS markets, HOLD is preferred (+0.40)

---

## 5. Double Deep Q-Network (DDQN)

### 5.1 The Problem with Standard Q-Learning

Standard Q-Learning can **overestimate** Q-values because the same network is used to:
1. Select the best action
2. Evaluate the value of that action

This creates a positive feedback loop that inflates Q-values.

### 5.2 DDQN Solution: Two Networks

DDQN uses two separate Q-Tables (networks):

1. **Main Network (Live Net A)**: 
   - Updated every step
   - Used to SELECT the best action
   - Shows real-time learning

2. **Target Network (Target Net B)**:
   - Updated periodically (synced from Main)
   - Used to EVALUATE the action value
   - Provides stability

### 5.3 Sync Process

The Target Network is synchronized from the Main Network every ~20 epochs:

```
Sync Progress: [████████████████████] 100%
→ Target Network B updated from Main Network A
```

This prevents the instability caused by constantly changing target values.

---

## 6. Experience Replay

### 6.1 What is Experience Replay?

Instead of learning from experiences immediately (which causes correlation issues), the bot stores experiences in a **Replay Buffer** and samples random batches for training.

### 6.2 Experience Structure

Each experience contains:

```javascript
{
    state: "BULLISH",      // Market state when decision was made
    action: "CALL",        // Action taken
    reward: +1.0,          // Outcome (+1 win, -1 loss)
    nextState: "BULLISH"   // Market state after action
}
```

### 6.3 Buffer Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MAX_MEMORY` | 2000 | Maximum experiences stored |
| `BATCH_SIZE` | 64 | Experiences sampled per training step |
| `MIN_REPLAY_SIZE` | 64 | Minimum buffer size before training begins |

### 6.4 Benefits of Experience Replay

1. **Breaks Correlation**: Random sampling prevents learning from sequential patterns
2. **Efficient Data Use**: Each experience can be used multiple times
3. **Stable Learning**: Smooths out the learning process

---

## 7. Trading Strategy: Epsilon-Greedy

### 7.1 The Explore vs. Exploit Dilemma

The bot must balance:
- **Exploitation**: Using known successful strategies
- **Exploration**: Trying new actions to discover better strategies

### 7.2 Epsilon-Greedy Implementation

```
ε (epsilon) = 0.10 (10%)
```

**Decision Process:**
1. Generate random number between 0 and 1
2. If random < ε (10% chance): **EXPLORE** - choose random action
3. Else (90% chance): **EXPLOIT** - choose action with highest Q-value

### 7.3 Strategy Modes

| Mode | Description | When Active |
|------|-------------|-------------|
| **GATHERING** | Collecting initial experiences | Buffer < 64 experiences |
| **EXPLORE** | Random action selection | 10% of decisions |
| **EXPLOIT** | Best known action | 90% of decisions |

---

## 8. Reward Shaping

### 8.1 How Rewards are Calculated

```javascript
if (action === 'HOLD') {
    reward = -0.05;  // Small penalty for inaction
} else {
    if (prediction_correct) {
        reward = 1.0 + magnitude_bonus - volatility_penalty;
    } else {
        reward = -1.0 - volatility_penalty;
    }
}
```

### 8.2 Reward Components

| Component | Value | Purpose |
|-----------|-------|---------|
| Base Win | +1.0 | Correct prediction reward |
| Base Loss | -1.0 | Incorrect prediction penalty |
| Hold Penalty | -0.05 | Discourages excessive waiting |
| Magnitude Bonus | +0 to +0.5 | Rewards strong trend predictions |
| Volatility Penalty | -0 to -0.2 | Penalizes risky market trades |

---

## 9. Dynamic Timeframe Selection

### 9.1 Adaptive Analysis Window

The bot dynamically adjusts its analysis timeframe based on market volatility:

| Volatility Level | Timeframe | Reasoning |
|-----------------|-----------|-----------|
| High (> 0.8) | 15 seconds | Fast markets need quick decisions |
| Medium (0.5-0.8) | 30 seconds | Balanced approach |
| Low (< 0.5) | 60 seconds | Slower markets allow longer analysis |

---

## 10. Data Persistence

### 10.1 What is Saved

The bot persists its learning across sessions:

| Data | Storage Key | Purpose |
|------|-------------|---------|
| Q-Matrix | `veltrex_q_table_{symbol}` | Learned strategy |
| Epoch Count | `veltrex_epoch_{symbol}` | Training progress |
| Replay Buffer | `veltrex_replay_buffer_{symbol}` | Recent experiences |

### 10.2 Auto-Save System

- **Periodic Save**: Every 5 seconds
- **On Tab Close**: `beforeunload` event
- **On Logout**: Component unmount

---

## 11. Technical Architecture

### 11.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Desktop Framework | Tauri (Rust) |
| Build Tool | Vite |
| State Management | React Hooks (useState, useEffect, useRef) |

### 11.2 Key Files

| File | Purpose |
|------|---------|
| `TradingPanel.tsx` | Contains Q-Learning implementation |
| `App.tsx` | Main application logic and trade execution |
| `SettingsModal.tsx` | User preferences and system info |

### 11.3 Core Algorithm Snippet
The following TypeScript code demonstrates the actual DDQN update logic used in the bot:

```typescript
// Experience Replay & Training Loop
trainingBatch.forEach(exp => {
    // 1. Get current Q-Value from Main Network
    const currentQ = newTable[exp.state][exp.action];
    
    // 2. Select best next action using Main Network
    const nextStateValuesMain = newTable[exp.nextState];
    const bestNextAction = Object.keys(nextStateValuesMain)
        .reduce((a, b) => nextStateValuesMain[a] > nextStateValuesMain[b] ? a : b) as Action;
        
    // 3. Evaluate that action using Target Network (DDQN Stability)
    const targetValue = targetQTable[exp.nextState][bestNextAction];
    
    // 4. Calculate Bellman Update
    // Q(s,a) = Q(s,a) + alpha * (reward + gamma * Q(s',a') - Q(s,a))
    const updatedQ = currentQ + alpha * (exp.reward + gamma * targetValue - currentQ);
    
    // 5. Update Q-Table
    newTable[exp.state][exp.action] = Number(updatedQ.toFixed(3));
});
```

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **Q-Value** | Expected future reward for a state-action pair |
| **Q-Matrix** | Table storing all Q-values |
| **Epoch** | One complete training iteration |
| **Replay Buffer** | Memory storing past experiences |
| **DDQN** | Double Deep Q-Network (stabilized Q-Learning) |
| **Epsilon** | Probability of exploration (random action) |
| **Alpha** | Learning rate (how fast the model updates) |
| **Gamma** | Discount factor (importance of future rewards) |

---

## 13. Conclusion

The Future Trading Bot demonstrates the practical application of reinforcement learning in financial markets. By combining Q-Learning with modern techniques like DDQN and Experience Replay, the system achieves:

1. **Autonomous Decision Making**: No human intervention required
2. **Continuous Improvement**: Learns from every trade
3. **Adaptive Strategy**: Adjusts to changing market conditions
4. **Stable Learning**: DDQN prevents value overestimation

The Q-Matrix serves as the "brain" of the system, encoding learned trading wisdom that improves with each epoch of training.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Authors**: Elmerio S. Talara, Trisha Ann Dahab, Venice Cabillada
