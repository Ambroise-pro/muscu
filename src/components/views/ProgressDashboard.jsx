import { ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';

export const ProgressDashboard = ({ history = [], sessionHistory = [], setView }) => {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const recentSessions = sessionHistory.filter((s) => new Date(s.date).getTime() >= thirtyDaysAgo);
  const recentRms = history.filter((h) => new Date(h.date).getTime() >= thirtyDaysAgo);

  const sessionsByDay = new Set(recentSessions.map((s) => new Date(s.date).toLocaleDateString()));
  const consistencyScore = Math.min(100, Math.round((sessionsByDay.size / 12) * 100));

  const exerciseSeries = {};
  history.forEach((item) => {
    if (!exerciseSeries[item.exercise]) exerciseSeries[item.exercise] = [];
    exerciseSeries[item.exercise].push({
      date: new Date(item.date).getTime(),
      value: item.rmResult,
      muscle: item.muscle || "Sans groupe"
    });
  });
  Object.keys(exerciseSeries).forEach((key) => {
    exerciseSeries[key].sort((a, b) => a.date - b.date);
  });

  const exerciseTrends = Object.entries(exerciseSeries).map(([exercise, points]) => {
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const diff = prev ? (last.value - prev.value) : 0;
    const diffPct = prev && prev.value ? ((diff / prev.value) * 100) : 0;
    return {
      exercise,
      muscle: last?.muscle || "Sans groupe",
      last: last?.value || 0,
      diff,
      diffPct,
      points: points.slice(-8)
    };
  }).sort((a, b) => b.last - a.last);

  const muscleStats = {};
  history.forEach((item) => {
    const muscle = item.muscle || "Sans groupe";
    if (!muscleStats[muscle]) muscleStats[muscle] = [];
    muscleStats[muscle].push(item.rmResult);
  });
  const muscleSummary = Object.entries(muscleStats).map(([muscle, values]) => {
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    return { muscle, avg: Math.round(avg * 10) / 10, entries: values.length };
  }).sort((a, b) => b.avg - a.avg);

  const estimateSessionVolume = (session) => {
    if (session.logs) {
      let vol = 0;
      Object.values(session.logs).forEach((logs) => {
        logs.forEach((entry) => {
          if (entry.targetWeight && entry.targetReps) vol += (entry.targetWeight * entry.targetReps);
        });
      });
      if (vol > 0) return vol;
    }
    return (session.exercises || []).reduce((acc, exo) => {
      if (!exo.weight) return acc;
      return acc + ((parseInt(exo.weight) || 0) * (parseInt(exo.reps) || 0) * (parseInt(exo.sets) || 0));
    }, 0);
  };

  const recentVolume = recentSessions.reduce((acc, session) => acc + estimateSessionVolume(session), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('menu')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Suivi progression</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <div className="text-[10px] uppercase text-slate-400">Séances 30j</div>
          <div className="text-xl font-black text-emerald-300">{recentSessions.length}</div>
        </Card>
        <Card className="text-center">
          <div className="text-[10px] uppercase text-slate-400">Calculs RM 30j</div>
          <div className="text-xl font-black text-blue-300">{recentRms.length}</div>
        </Card>
        <Card className="text-center">
          <div className="text-[10px] uppercase text-slate-400">Régularité</div>
          <div className="text-xl font-black text-amber-300">{consistencyScore}%</div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-bold text-white mb-2">Volume estimé (30 jours)</div>
        <div className="text-3xl font-black text-cyan-300">{Math.round(recentVolume)} kg</div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-white mb-3">Progression par exercice (1RM)</div>
        <div className="space-y-2">
          {exerciseTrends.length === 0 && <div className="text-slate-500 text-sm">Aucune donnée 1RM.</div>}
          {exerciseTrends.map((trend) => (
            <div key={trend.exercise} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{trend.exercise}</div>
                  <div className="text-[11px] text-slate-500">{trend.muscle}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-300">{trend.last} kg</div>
                  <div className={`text-xs font-bold ${trend.diff >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {trend.diff >= 0 ? "+" : ""}{Math.round(trend.diff * 10) / 10} kg ({trend.diffPct >= 0 ? "+" : ""}{Math.round(trend.diffPct)}%)
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-end gap-1 h-10">
                {trend.points.map((p) => {
                  const maxVal = Math.max(...trend.points.map((n) => n.value));
                  const h = maxVal > 0 ? Math.max(12, Math.round((p.value / maxVal) * 36)) : 12;
                  return <div key={`${trend.exercise}-${p.date}`} className="flex-1 bg-blue-500/40 rounded-t" style={{ height: `${h}px` }} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold text-white mb-3">Moyenne 1RM par muscle</div>
        <div className="space-y-2">
          {muscleSummary.length === 0 && <div className="text-slate-500 text-sm">Aucune donnée par muscle.</div>}
          {muscleSummary.map((row) => (
            <div key={row.muscle} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
              <div className="text-sm text-slate-200">{row.muscle}</div>
              <div className="text-sm font-bold text-amber-300">{row.avg} kg <span className="text-[11px] text-slate-500">({row.entries} tests)</span></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
