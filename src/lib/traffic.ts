// Core reinforcement-learning traffic simulation logic.
// Pure TypeScript, no dependencies — used by both the training loop and the live UI.

export type Direction = "N" | "E" | "S" | "W";
export type Phase = 0 | 1; // 0 = N/S green, 1 = E/W green
export type Action = 0 | 1; // 0 = keep, 1 = switch

export const ARRIVAL_P = 0.28;
export const DISCHARGE = 2;
export const MIN_GREEN = 4;

// Simple seeded PRNG (LCG) so two controllers can be compared on identical traffic.
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return function rng() {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface Queues {
  N: number;
  E: number;
  S: number;
  W: number;
}

export class Intersection {
  q: Queues = { N: 0, E: 0, S: 0, W: 0 };
  phase: Phase = 0;
  phaseTimer = 0;
  passed = 0;
  waitLog: number[] = [];
  private rng: () => number;

  constructor(rng: () => number) {
    this.rng = rng;
  }

  private bucket(n: number): number {
    if (n === 0) return 0;
    if (n <= 2) return 1;
    if (n <= 5) return 2;
    return 3;
  }

  stateKey(): string {
    return [
      this.bucket(this.q.N),
      this.bucket(this.q.E),
      this.bucket(this.q.S),
      this.bucket(this.q.W),
      this.phase,
    ].join(",");
  }

  step(action: Action): number {
    (["N", "E", "S", "W"] as Direction[]).forEach((d) => {
      if (this.rng() < ARRIVAL_P) this.q[d] = Math.min(this.q[d] + 1, 30);
    });

    if (action === 1 && this.phaseTimer >= MIN_GREEN) {
      this.phase = this.phase === 0 ? 1 : 0;
      this.phaseTimer = 0;
    } else {
      this.phaseTimer++;
    }

    const greenDirs: Direction[] = this.phase === 0 ? ["N", "S"] : ["E", "W"];
    greenDirs.forEach((d) => {
      const pass = Math.min(this.q[d], DISCHARGE);
      this.q[d] -= pass;
      this.passed += pass;
    });

    const totalWaiting = this.q.N + this.q.E + this.q.S + this.q.W;
    this.waitLog.push(totalWaiting);
    return -totalWaiting;
  }

  avgWait(): number {
    if (!this.waitLog.length) return 0;
    return this.waitLog.reduce((a, b) => a + b, 0) / this.waitLog.length;
  }
}

type QTable = Record<string, { 0: number; 1: number }>;

export class QAgent {
  Q: QTable = {};
  alpha = 0.2;
  gamma = 0.9;
  epsilon = 0.3;

  private getQ(s: string, a: Action): number {
    return this.Q[s] ? this.Q[s][a] : 0;
  }

  bestAction(s: string): Action {
    return this.getQ(s, 1) > this.getQ(s, 0) ? 1 : 0;
  }

  choose(s: string, rng: () => number, explore: boolean): Action {
    if (explore && rng() < this.epsilon) return rng() < 0.5 ? 0 : 1;
    return this.bestAction(s);
  }

  update(s: string, a: Action, r: number, sNext: string) {
    if (!this.Q[s]) this.Q[s] = { 0: 0, 1: 0 };
    const maxNext = Math.max(this.getQ(sNext, 0), this.getQ(sNext, 1));
    this.Q[s][a] += this.alpha * (r + this.gamma * maxNext - this.Q[s][a]);
  }

  get stateCount(): number {
    return Object.keys(this.Q).length;
  }
}

export const EPISODES = 300;
export const STEPS_PER_EP = 150;

/** Trains the agent in batches, yielding to the UI thread between batches via a callback. */
export function trainAgent(
  agent: QAgent,
  onProgress: (episode: number, totalEpisodeReward: number) => void,
  onDone: () => void,
  batchSize = 15
) {
  let ep = 0;

  function runBatch() {
    const end = Math.min(ep + batchSize, EPISODES);
    for (; ep < end; ep++) {
      agent.epsilon = Math.max(0.05, 0.3 * (1 - ep / EPISODES));
      const rng = makeRng(1000 + ep);
      const env = new Intersection(rng);
      let epReward = 0;
      for (let t = 0; t < STEPS_PER_EP; t++) {
        const s = env.stateKey();
        const a = agent.choose(s, rng, true);
        const r = env.step(a);
        epReward += r;
        const sNext = env.stateKey();
        agent.update(s, a, r, sNext);
      }
      onProgress(ep + 1, epReward);
    }
    if (ep < EPISODES) {
      setTimeout(runBatch, 0);
    } else {
      onDone();
    }
  }
  runBatch();
}
