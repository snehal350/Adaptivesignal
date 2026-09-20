# 🚦 AdaptiveSignal — Traffic Lights That Learn

![License](https://img.shields.io/badge/license-MIT-teal) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-Powered-646CFF?logo=vite)

**Live Demo:** *(add your deployed URL here — see Deployment below)*

A reinforcement-learning agent that learns to control a traffic light more efficiently than
a traditional fixed-timer light — trained and demonstrated live in the browser.

## The Problem

Most real-world traffic signals run on **fixed timers**, switching on a schedule regardless
of actual traffic. This wastes green time on empty approaches while cars queue up elsewhere —
a major, largely invisible contributor to urban congestion, wasted fuel, and lost commuter time.

## The Solution

AdaptiveSignal trains a **tabular Q-learning agent** to control a single 4-way intersection.
The agent observes how many cars are waiting in each direction (discretized into buckets)
plus the current light phase, and each step decides whether to **keep** the light or
**switch** it. It's rewarded for minimizing total cars waiting — so across hundreds of
simulated training episodes, it learns an adaptive signal policy without ever being told
explicit traffic rules.

The app then runs the trained agent **head-to-head against a naive fixed-timer light on
identical traffic** (same random seed), with a live training-reward chart and side-by-side
canvases, so the improvement in average wait time and throughput is directly visible.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Recharts (training-reward chart)
- No backend — the Q-learning simulation runs entirely client-side

## Project Structure

```
src/
  lib/traffic.ts              Q-learning agent + traffic environment (pure TS, no deps)
  components/
    IntersectionCanvas.tsx    Canvas renderer for one intersection
    RewardChart.tsx           Recharts line chart of training reward
    Simulator.tsx             Controls, training loop, live comparison, stats
  App.tsx                     Hero, simulator, impact section, how-it-works
```

## Running Locally (VS Code)

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

- Click **Train RL Agent** — runs 300 simulated training episodes (a few seconds), plots
  the reward curve.
- Click **Run Live Comparison** — replays the trained RL policy against a fixed-timer
  light on identical randomly generated traffic, updating live.

To type-check and build for production:

```bash
npm run build
npm run preview
```

## Deployment

Any static host works since there's no backend — e.g. Vercel, Netlify, or GitHub Pages:

```bash
npm run build
# deploy the generated dist/ folder
```

## How It Works

| Component     | Details |
|---|---|
| **State**     | Bucketed queue length (0 / 1–2 / 3–5 / 6+) for N, E, S, W + current light phase |
| **Actions**   | `keep` current phase, or `switch` phase (min green time enforced) |
| **Reward**    | `-(total cars waiting)` each simulated step |
| **Algorithm** | Tabular Q-learning, ε-greedy exploration with decay, α=0.2, γ=0.9 |
| **Training**  | 300 episodes × 150 steps, seeded per episode |
| **Evaluation**| Live run on an unseen traffic seed, greedy (no exploration) policy |

## Future Work

- Multi-intersection coordination across a city-block grid
- Deep Q-Network (DQN) for richer, continuous state representation
- Integration with real traffic camera / sensor data
- Priority signal handling for emergency vehicles

## Submission Details (HackDevengers 2.0)

**Project Title:** AdaptiveSignal — Traffic Lights That Learn (Reinforcement Learning)

**Project Description:** Most real-world traffic signals run on fixed timers, switching
regardless of actual congestion — wasting commuter time and fuel every day. AdaptiveSignal
is a reinforcement learning agent (tabular Q-learning) that learns, purely through simulated
trial and error, to control a traffic light based on real queue lengths instead of a fixed
schedule. The app trains the agent live in the browser, then runs it head-to-head against a
traditional fixed-timer light on identical traffic conditions, visually showing the
reduction in average wait time and increase in throughput.

---
Built for **HackDevengers 2.0** (Open Innovation Hackathon, powered by Unstop, sponsored by Lovable).
