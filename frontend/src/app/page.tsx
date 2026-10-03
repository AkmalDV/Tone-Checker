"use client";
import { useState } from "react";

interface Criterion {
  key: string;
  description: string;
}

export default function Home() {
  const [statement, setStatement] = useState(
    'Me: "Can I buy this new gaming GPU?"\nWife: "Sure, go ahead."'
  );
  const [targetQuestion, setTargetQuestion] = useState("Can I buy this?");
  const [instructions, setInstructions] = useState(
    "What is her true permission level regarding this purchase?"
  );
  const [threshold, setThreshold] = useState(0.75);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { key: "approved", description: "She means it, completely fine." },
    { key: "risky", description: "Hesitant, will bring it up later in arguments." },
    { key: "forbidden", description: "Absolute trap, financial veto activated." },
  ]);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const addCriterion = () => {
    if (!newKey || !newDesc) return;
    setCriteria([...criteria, { key: newKey.trim(), description: newDesc.trim() }]);
    setNewKey("");
    setNewDesc("");
  };

  const removeCriterion = (i: number) => setCriteria(criteria.filter((_, j) => j !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const criteriaMap: Record<string, string> = {};
    criteria.forEach((c) => (criteriaMap[c.key] = c.description));
    try {
      const res = await fetch("http://localhost:8000/api/predict-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement,
          target_question: targetQuestion,
          instructions,
          criteria_map: criteriaMap,
          custom_threshold: threshold,
        }),
      });
      if (!res.ok) throw new Error("Backend returned " + res.status);
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center p-6 pt-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Tone & Confidence Checker
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dynamic Laya decision agent — custom criteria, instant analysis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Statement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statement / Dialogue
            </label>
            <textarea
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Question
              </label>
              <input
                type="text"
                value={targetQuestion}
                onChange={(e) => setTargetQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Instructions
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                required
              />
            </div>
          </div>

          {/* Criteria Builder */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/60 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Outcome Criteria
            </h3>
            <div className="space-y-2">
              {criteria.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900 mr-1.5">{c.key}:</span>
                    <span className="text-gray-600">{c.description}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriterion(i)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium ml-3 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-1/3 border border-gray-300 rounded-md p-2 text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Description..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md p-2 text-xs bg-white"
              />
              <button
                type="button"
                onClick={addCriterion}
                className="px-3 text-xs font-semibold border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Add
              </button>
            </div>
          </div>

          {/* Threshold */}
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span className="font-medium">Confidence Threshold</span>
              <span className="font-mono">{threshold}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-gray-900 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {data && (() => {
          // ponytail: assumes prediction values are 0-1 floats; clamp if backend changes scale
          // ponytail: probabilities nested under prediction.probabilities from Laya
          const scores = Object.entries(data.prediction?.probabilities || {})
            .map(([k, v]) => [k, typeof v === "number" ? v : 0] as [string, number])
            .sort((a, b) => b[1] - a[1]);
          const top = data.prediction?.choice || scores[0]?.[0] || "N/A";

          return (
            <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-white">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Results
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase">Top Match</p>
                  <p className="text-xl font-bold mt-1 text-gray-900">{top}</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 uppercase">Confidence</p>
                  <p className="text-xl font-bold mt-1 text-gray-900">
                    {(data.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase">All Outcomes</p>
                {scores.map(([k, v]) => {
                  const pct = (v * 100).toFixed(1);
                  const isTop = k === top;
                  return (
                    <div key={k} className="space-y-0.5">
                      <div className="flex justify-between text-sm">
                        <span className={isTop ? "font-bold text-gray-900" : "font-medium text-gray-600"}>
                          {k}{isTop && " ★"}
                        </span>
                        <span className="font-mono text-gray-900">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isTop ? "bg-gray-900" : "bg-gray-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
