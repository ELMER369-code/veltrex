# Veltrex: Autonomous Future Trading Bot 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows-blue.svg)]()

> **"Experience the future of trading—where algorithms learn, adapt, and execute without emotion."**

Veltrex is a professional-grade autonomous trading simulation system powered by **Q-Learning** reinforcement AI. It observes live market conditions, analyzes volatility, and executes trades (CALL/PUT) with a strategy that continuously evolves through experience.


https://github.com/user-attachments/assets/87bfa959-7fa3-4009-932c-f4acacbcca78



https://github.com/user-attachments/assets/97cadc55-9137-495d-b67b-3c33f392cae1


[**Explore Documentation**](DOCUMENTATION.md) | [**View Demo Video**](#visual-demo)

---

## 📸 Visual Demo

### Watch the Bot in Action

<div align="center">
  <video src="https://github.com/ELMER369-code/veltrex/raw/main/veltrex-demo.mp4" width="100%" controls autoplay muted loop>
    Your browser does not support the video tag.
  </video>
</div>

> [!NOTE]
> If the video does not play in your browser, you can find the source file at `veltrex-demo.mp4` in the root directory.

---

## ✨ Key Features

- **🧠 Autonomous RL Brain**: Implements Double Deep Q-Network (DDQN) with Experience Replay for stable, high-performance learning.
- **⚡ Adaptive Execution**: Automatically adjusts analysis timeframes (15s/30s/60s) based on real-time market volatility.
- **📉 Intelligent Signal Processing**: Uses RSI and trend analysis to classify markets into Bullish, Bearish, or Sideways states.
- **🛡️ Emotional-Free Trading**: Eliminates human bias by relying purely on mathematical Q-Values and probability.
- **💾 Persistent Memory**: Automatically saves its learned Q-Matrix across sessions, ensuring the bot gets "smarter" over time.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Desktop core**: [Tauri](https://tauri.app/) (Rust-based)
- **State Management**: React Hooks & Refs for high-frequency updates
- **Data Feed**: Real-time WebSockets integration

---

## 🚀 Getting Started

Follow these steps to set up the Veltrex trading environment on your local machine.

### Prerequisites

- **Node.js**: v18 or higher
- **Rust**: Latest stable version (for Tauri)
- **API Key**: A Gemini API key (for AI-assisted analysis features)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ELMER369-code/veltrex.git
   cd veltrex
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory and add your key:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 📖 Documentation

For a deep dive into the Q-Learning algorithm, Bellman Equations, and the technical architecture, please refer to our comprehensive guide:

<p align="center">
  <a href="DOCUMENTATION.md">
    <img src="https://img.shields.io/badge/Read_The_Documentation-2ea44f?style=for-the-badge&logo=github" alt="Read Documentation" />
  </a>
</p>

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Built with ❤️ by Elmerio S. Talara, Trisha Ann Dahab, & Venice Cabillada</p>
