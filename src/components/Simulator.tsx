import { useRef, useState } from "react";
import {
  Intersection,
  QAgent,
  makeRng,
  trainAgent,
} from "../lib/traffic";
import { IntersectionCanvas } from "./IntersectionCanvas";
import { RewardChart, type RewardPoint } from "./RewardChart";

const TOTAL_LIVE_STEPS = 400;

type Status = "idle" | "training" | "trained" | "running" | "done";

export function Simulator() {
  const [status, setStatus] = useState<Status>("idle");
  const [trainProgress, setTrainProgress] = useState(0);
  const [rewardData, setRewardData] = useState<RewardPoint[]>([]);
  const [speed, setSpeed] = useState(6);

  const [fixedEnv, setFixedEnv] = useState<Intersection | null>(null);
  const [rlEnv, setRlEnv] = useState<Intersection | null>(null);
  const [liveStep, setLiveStep] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const agentRef = useRef<QAgent>(new QAgent());
  const runningRef = useRef(false);

  function handleTrain() {
    setStatus("training");
    setRewardData([]);
    agentRef.current = new QAgent();
    trainAgent(
      agentRef.current,
      (episode, epReward) => {
        setTrainProgress(episode);
        setRewardData((prev) =>
          episode % 5 === 0 || episode === 1
            ? [...prev, { episode, reward: epReward }]
            : prev
        );
      },
      () => setStatus("trained")
    );
  }

  function handleRun() {
    const seed = Math.floor(Math.random() * 1e9);
    const rngFixed = makeRng(seed);
    const rngRL = makeRng(seed);
    const envFixed = new Intersection(rngFixed);
    const envRL = new Intersection(rngRL);
    setFixedEnv(envFixed);
    setRlEnv(envRL);
    setLiveStep(0);
    setResult(null);
    setStatus("running");
    runningRef.current = true;

    let step = 0;
    const tick = () => {
      if (!runningRef.current) return;

      const fixedAction = envFixed.phaseTimer >= 10 ? 1 : 0;
      envFixed.step(fixedAction as 0 | 1);

      const s = envRL.stateKey();
      const rlAction = agentRef.current.choose(s, rngRL, false);
      envRL.step(rlAction);

      step++;
      setFixedEnv(Object.assign(Object.create(Object.getPrototypeOf(envFixed)), envFixed));
      setRlEnv(Object.assign(Object.create(Object.getPrototypeOf(envRL)), envRL));
      setLiveStep(step);

      if (step < TOTAL_LIVE_STEPS) {
        setTimeout(tick, (11 - speed) * 8);
      } else {
        runningRef.current = false;
        setStatus("done");
        const fw = envFixed.avgWait();
        const rw = envRL.avgWait();
        const improvement = (((fw - rw) / fw) * 100).toFixed(1);
        setResult(
          fw > rw
            ? `RL agent reduced average cars waiting by ${improvement}% compared to the fixed-timer light (${rw.toFixed(
                2
              )} vs ${fw.toFixed(2)} avg cars waiting), passing ${envRL.passed} vs ${
                envFixed.passed
              } cars through the intersection.`
            : `On this run the fixed timer performed comparably (${fw.toFixed(
                2
              )} vs ${rw.toFixed(2)} avg cars waiting) — try training longer or running again.`
        );
      }
    };
    tick();
  }

  function handleReset() {
    runningRef.current = false;
    setStatus("idle");
    setTrainProgress(0);
    setRewardData([]);
    setFixedEnv(null);
    setRlEnv(null);
    setLiveStep(0);
    setResult(null);
    agentRef.current = new QAgent();
  }

  const canRun = status === "trained" || status === "done";
  const isBusy = status === "training" || status === "running";

  return (
    <section id="simulator" className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={handleTrain}
          disabled={isBusy}
          className="bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
        >
          1. Train RL Agent
        </button>
        <button
          onClick={handleRun}
          disabled={!canRun || isBusy}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
        >
          2. Run Live Comparison
        </button>
        <button
          onClick={handleReset}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2.5 rounded-lg text-sm transition"
        >
          Reset
        </button>
        <label className="text-sm text-slate-400 flex items-center gap-2">
          Speed
          <input
            type="range"
            min={1}
            max={10}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="accent-teal-400"
          />
        </label>
        <span className="text-sm text-amber-400 min-w-[220px]">
          {status === "idle" && "Step 1: train the agent first."}
          {status === "training" && `Training… episode ${trainProgress}/300`}
          {status === "trained" && "Training complete — ready to run."}
          {status === "running" && `Simulating… step ${liveStep}/${TOTAL_LIVE_STEPS}`}
          {status === "done" && "Comparison complete."}
        </span>
      </div>

      {rewardData.length > 0 && (
        <div className="bg-[#171b2e] border border-[#262b47] rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">
            Training Reward per Episode
          </h3>
          <RewardChart data={rewardData} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Panel
          title="Fixed-Timer Light"
          subtitle="switches every 10 steps"
          env={fixedEnv}
        />
        <Panel title="RL-Controlled Light" subtitle="learned policy" env={rlEnv} />
      </div>

      <div className="bg-[#171b2e] border border-[#262b47] rounded-xl p-5 mt-6">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Result</h3>
        <p className="text-sm text-slate-300">
          {result ??
            "Run the comparison to see how much the RL agent improves on the fixed-timer baseline."}
        </p>
      </div>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  env,
}: {
  title: string;
  subtitle: string;
  env: Intersection | null;
}) {
  return (
    <div className="bg-[#171b2e] border border-[#262b47] rounded-xl p-4">
      <h3 className="text-base font-semibold text-slate-100">
        {title}{" "}
        <span className="text-xs font-normal text-slate-400">({subtitle})</span>
      </h3>
      <div className="mt-3">
        <IntersectionCanvas env={env} />
      </div>
      <div className="flex gap-3 mt-3">
        <Stat label="Avg Cars Waiting" value={env ? env.avgWait().toFixed(2) : "0"} />
        <Stat label="Cars Passed" value={env ? String(env.passed) : "0"} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-[#12162a] rounded-lg px-3 py-2">
      <div className="text-lg font-bold text-slate-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}
