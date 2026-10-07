# FinLit Ventures

FinLit Ventures is a fintech product prototype focused on AI-assisted investment decision support.

Most investing apps are retrospective—providing lagging dashboards, alerts, and chatbots that inform users only after damage has occurred. FinLit Ventures introduces proactive, in-the-moment AI interventions designed to protect long-term compounding at the critical moment an investor considers pausing or stopping their Systematic Investment Plan (SIP).

---

## Core Features

- **Pause Saver AI™**: Proactive, intent-aware intervention triggered when an investor attempts to pause a SIP, presenting thoughtful alternatives before irreversible decisions are made.
- **Intent-Aware Decision Paths**: Tailors copy, metrics, and recommendations dynamically across 5 distinct investor intents:
  - *I need the money* (Cash flexibility & step-down prioritization)
  - *Worried about the market* (Historical market context, NIFTY 50 drawdowns & recovery trajectories)
  - *Not sure it's working* (Plan health, compounding audits, XIRR verification)
  - *Goal changed or switching* (Goal recalibration & target realignment)
  - *Just checking* (Low-friction impact snapshot)
- **Goal-Based Investing & Synchronization**: Centralized goal store where the selected primary goal (e.g. *Dream Bike*, *Higher Education*, *Emergency Fund*) acts as the single source of truth across SIPs, portfolios, and interventions.
- **Future You™ Simulator**: Interactive simulation projecting missed savings, compounding losses, and delayed target dates based on selected pause durations.
- **Smart Decision Ladder**: Graded alternatives prioritizing lower-disruption options (Continue, Skip 1 month, Step-down debit, Amount reduction, Auto-resuming pause).
- **Auto-Resume Safety Net**: Time-bound pause windows with automated resumption safeguards to keep wealth creation on track.
- **Investments Marketplace**: Real Indian equity and index market exploration backed by real NSE delayed market data (never fabricated prices).
- **Portfolio Tracking & Performance**: Live asset allocation (Mutual Funds, Direct Stocks, Cash Reserves), detailed holding breakdowns, and stock charts featuring dynamic **Average Buy Price** reference lines.
- **Historical Market Context & Drawdown Detection**: Real 10-year NIFTY 50 historical drawdown analysis with normalized recovery graphs (indexed to 100 at peak), phase distinction (Decline vs. Recovery), and duration brackets.
- **Explainable & Safe AI**: High-level transparent reasoning factors (*"How Pause Saver reached this conclusion"*) without hidden CoT; strict non-predictive, educational tone that never guarantees market returns or recovery.

---

## Tech Stack

- **React 19** — Frontend UI library
- **TypeScript** — End-to-end static typing and domain models
- **Vite 8** — Next-generation build tool and local dev server with integrated API middleware proxies
- **Tailwind CSS** — Custom calm fintech design system (Navy `#0C2340`, Teal `#007A82`, soft rounded cards, subtle borders)
- **Lucide React** — Crisp financial and navigation iconography
- **Recharts** — Responsive interactive charts for portfolio valuations, NAV history, and normalized recovery trajectories
- **Tailwind Merge & Clsx** — Dynamic utility class compositions
- **Oxlint** — High-speed JavaScript/TypeScript linter
- **Real Market Data Feeds** — Proxied upstream integrations for NSE stock candles (`^NSEI`, `RELIANCE.NS`, `HDFCBANK.NS`) and official AMFI mutual fund Net Asset Values (NAV) via `api.mfapi.in`
- **Server-Side Groq LLM Layer** — Vite server middleware calling Groq LLaMA models securely via `process.env.GROQ_API_KEY` with deterministic fallbacks

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/25je0551-spec/FinLit.git
cd FinLit

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:5173/
```

### Building for Production

```bash
npm run build
```

This compiles TypeScript (`tsc -b`) and generates production assets in `dist/`.

### Linting

```bash
npm run lint
```

---

## Environment Variables (Optional)

The application includes deterministic fallback models and does not require third-party API keys to run. If you wish to use the live Groq LLM explanatory layer:

Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

> **Security Note**: `GROQ_API_KEY` is accessed only server-side by the Vite API middleware. It is never exposed to the client-side bundle or browser variables.

---

## License

Private / Prototype project for FinLit Ventures.
