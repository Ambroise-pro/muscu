import { useState } from 'react';
import { AlertTriangle, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { SESSION_GOALS } from '../../constants/exercises';
import { calculateBrzycki } from '../../utils/calculations';
import { formatTime } from '../../utils/format';

export const SessionHistory = ({ sessionHistory = [], rmHistory = [], deleteSession, deleteHistoryItem, setView }) => {
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const toggleSession = (id) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const groupedByDay = {};
  const addToGroup = (dateValue, type, item) => {
    const dateObj = new Date(dateValue);
    const key = dateObj.toLocaleDateString();
    if (!groupedByDay[key]) {
      groupedByDay[key] = { key, sortKey: dateObj.getTime(), sessions: [], rms: [] };
    } else {
      groupedByDay[key].sortKey = Math.max(groupedByDay[key].sortKey, dateObj.getTime());
    }
    if (type === "session") groupedByDay[key].sessions.push(item);
    if (type === "rm") groupedByDay[key].rms.push(item);
  };

  sessionHistory.forEach((session) => addToGroup(session.date, "session", session));
  rmHistory.forEach((item) => addToGroup(item.date, "rm", item));

  const orderedGroups = Object.values(groupedByDay).sort((a, b) => b.sortKey - a.sortKey);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('menu')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Historique Séances</h2>
      </div>

      <div className="space-y-4">
        {orderedGroups.length === 0 ? (
          <div className="text-center text-slate-500 py-10 italic">
            Aucune séance terminée pour le moment.
          </div>
        ) : (
          orderedGroups.map((group) => (
            <Card key={group.key} className="relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                <div className="text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={12}/> {group.key}
                </div>
              </div>

              {group.sessions.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Séances</div>
                  {group.sessions.map((session) => (
                    <div key={session.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div onClick={() => toggleSession(session.id)} className="cursor-pointer flex-grow">
                          <div className="text-white font-bold text-sm flex items-center gap-2">
                            {SESSION_GOALS[session.goal]?.label || "Séance"}
                            <span className="text-xs text-slate-500 font-normal">
                              ({session.exercises.length} Exos) {expandedSessionId === session.id ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => deleteSession(session.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {expandedSessionId === session.id && (
                        <div className="space-y-4 animate-fade-in">
                          {session.exercises.map((exo, idx) => {
                            const logs = session.logs ? session.logs[idx] : [];
                            const rmEstimate = calculateBrzycki(exo.weight, exo.reps);
                            return (
                              <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-slate-200 font-bold text-sm">{exo.exercise}</span>
                                  <span className="text-slate-500 text-xs">
                                    Objectif: {exo.sets}x{exo.reps} @ {exo.weight || '-'}kg
                                    {rmEstimate > 0 && (
                                      <span className="text-blue-400"> • 1RM est.: {rmEstimate}kg</span>
                                    )}
                                  </span>
                                </div>

                                {logs && logs.length > 0 ? (
                                  <table className="w-full text-xs text-center text-slate-400">
                                    <thead>
                                      <tr className="border-b border-slate-700 text-slate-500">
                                        <th className="pb-1">Série</th>
                                        <th className="pb-1">Effort</th>
                                        <th className="pb-1">Repos</th>
                                        <th className="pb-1">RPE</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {logs.map((log, i) => (
                                        <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50">
                                          <td className="py-1.5 font-bold text-slate-300">{log.set}</td>
                                          <td className="py-1.5">{formatTime(log.workTime)}</td>
                                          <td className="py-1.5 text-amber-500/80">{formatTime(log.realRestTime)}</td>
                                          <td className="py-1.5">
                                            <span className={`px-1.5 py-0.5 rounded ${
                                               log.rpe >= 9 ? 'bg-red-900/50 text-red-200' :
                                               log.rpe >= 7 ? 'bg-amber-900/50 text-amber-200' :
                                               'bg-emerald-900/50 text-emerald-200'
                                            }`}>
                                              {log.rpe}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-xs text-slate-600 italic text-center">Détails non disponibles</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {expandedSessionId !== session.id && (
                        <div className="mt-2 text-xs text-slate-500">
                          Cliquez pour voir les détails de performance.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {group.rms.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calculs 1RM</div>
                  {group.rms.map((item) => (
                    <div key={item.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {item.exercise}
                          {item.isUnreliable && <AlertTriangle size={12} className="text-amber-500" />}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.weightInput}kg x {item.repsInput} • {item.muscle}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-blue-400 text-lg">{item.rmResult}</span>
                        {deleteHistoryItem && (
                          <button onClick={() => deleteHistoryItem(item.id)} className="text-slate-600 hover:text-red-400">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
