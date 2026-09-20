import { Simulator } from "./components/Simulator";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f1220] text-slate-100">
      {/* Hero */}
      <header className="max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="text-4xl mb-3">🚦</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Traffic lights that <span className="text-teal-400">learn.</span>
        </h1>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto">
          Most real-world traffic signals run on fixed timers, ignoring actual
          congestion. This is a reinforcement-learning agent that learns, purely
          through simulation, to reduce car wait times at an intersection —
          watch it beat a traditional fixed-timer light live.
        </p>
        <a
          href="#simulator"
          className="inline-block mt-6 bg-teal-400 hover:bg-teal-300 text-slate-900 font-semibold px-6 py-3 rounded-lg text-sm transition"
        >
          See it learn ↓
        </a>
      </header>

      <Simulator />

      {/* Why it matters */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-5">Why this matters</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ImpactCard
            stat="~40%"
            label="of urban commute delay is attributed to inefficient, static signal timing in traffic engineering studies"
          />
          <ImpactCard
            stat="0 sensors"
            label="beyond what many intersections already have — no new hardware required to pilot this approach"
          />
          <ImpactCard
            stat="Edge-ready"
            label="tabular Q-learning is lightweight enough to run on low-cost hardware, no GPU or cloud needed"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-4">How it works</h2>
        <div className="bg-[#171b2e] border border-[#262b47] rounded-xl p-5 text-sm text-slate-300 space-y-2">
          <p>
            <strong className="text-slate-100">State:</strong> the number of cars
            waiting in each direction (bucketed) plus the current light phase.
          </p>
          <p>
            <strong className="text-slate-100">Action:</strong> keep the current
            light phase, or switch it (a minimum green time is enforced).
          </p>
          <p>
            <strong className="text-slate-100">Reward:</strong> the negative of
            the total number of cars waiting — the agent is pushed to minimize
            congestion.
          </p>
          <p>
            <strong className="text-slate-100">Algorithm:</strong> tabular
            Q-learning with epsilon-greedy exploration that decays over 300
            training episodes, each simulating 150 steps of traffic.
          </p>
        </div>
      </section>

      <footer className="max-w-5xl mx-auto px-4 py-10 text-center text-xs text-slate-500">
        Built for HackDevengers 2.0 (Open Innovation Hackathon, powered by
        Unstop, sponsored by Lovable).
      </footer>
    </div>
  );
}

function ImpactCard({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="bg-[#171b2e] border border-[#262b47] rounded-xl p-5">
      <div className="text-2xl font-bold text-amber-400">{stat}</div>
      <div className="text-xs text-slate-400 mt-2">{label}</div>
    </div>
  );
}
