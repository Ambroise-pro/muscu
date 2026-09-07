import { AlertTriangle, ArrowLeft, Calculator, CheckCircle, ClipboardCopy, Dumbbell } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatTime } from '../../utils/format';
import { calculateBrzycki } from '../../utils/calculations';
import { copyBilanToCarnet } from '../../utils/carnetExport';

const HubAction = ({ icon, title, desc, onClick, tint }) => (
  <button
    onClick={onClick}
    className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-xl2 transition-all text-left shadow-card relative overflow-hidden group hover:border-slate-600 active:scale-[0.99]"
  >
    <div className={`${tint.bg} w-12 h-12 rounded-lg flex items-center justify-center ${tint.text} mb-4`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-slate-400 text-sm mt-1">{desc}</p>
  </button>
);

export const SessionHub = ({ setView, activeSeance, showToast }) => {
  const rmCalcs = activeSeance?.rmCalcs || [];
  const workout = activeSeance?.workout;
  const items = workout?.items || [];
  const hasBilan = rmCalcs.length > 0 || items.length > 0;

  const handleCopyToCarnet = async () => {
    const ok = await copyBilanToCarnet(activeSeance);
    showToast?.(ok ? "Bilan copié — collez-le dans le Carnet." : "Impossible de copier le bilan.");
  };

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('menu')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Nouvelle séance</h2>
      </div>

      {activeSeance && (
        <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">
          Dossier créé le {new Date(activeSeance.createdAt).toLocaleDateString('fr-FR')}
        </div>
      )}

      {hasBilan && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" /> Bilan de la séance
            </h3>
            <button
              onClick={handleCopyToCarnet}
              className="flex items-center gap-1.5 border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold"
            >
              <ClipboardCopy size={14} /> Copier vers le Carnet
            </button>
          </div>

          {rmCalcs.length > 0 && (
            <Card>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calculator size={14} className="text-accent" /> Calculs 1RM ({rmCalcs.length})
              </div>
              <div className="space-y-2">
                {rmCalcs.map((item) => (
                  <div key={item.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {item.muscle || "Non renseigné"}
                        {item.isUnreliable && <AlertTriangle size={12} className="text-amber-500" />}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.exercise}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.weightInput}kg x {item.repsInput}
                      </div>
                    </div>
                    <span className="font-black text-accent text-lg">{item.rmResult}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {items.length > 0 && (
            <Card>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Dumbbell size={14} className="text-emerald-400" />
                Entraînement
                {workout?.completedAt
                  ? ` • loggé le ${new Date(workout.completedAt).toLocaleDateString('fr-FR')}`
                  : " • programmé (pas encore réalisé)"}
              </div>
              <div className="space-y-4">
                {items.map((exo, idx) => {
                  const logs = workout?.logs ? workout.logs[idx] : null;
                  const rmEstimate = calculateBrzycki(exo.weight, exo.reps);
                  return (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-200 font-bold text-sm">{exo.exercise}</span>
                        <span className="text-slate-500 text-xs">
                          {exo.sets}x{exo.reps} @ {exo.weight || '-'}kg
                          {rmEstimate > 0 && (
                            <span className="text-accent"> • 1RM est.: {rmEstimate}kg</span>
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
                        <div className="text-xs text-slate-600 italic text-center">Pas encore réalisé.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      <p className="text-slate-400 text-sm">
        Que voulez-vous faire dans cette séance ? Vous pouvez enchaîner les deux.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <HubAction
          icon={<Calculator size={22} />}
          title="Calculer un 1RM"
          desc="Estimer une charge maximale pour calibrer l'entraînement."
          onClick={() => setView('calculator')}
          tint={{ bg: "bg-accent-soft", text: "text-accent" }}
        />
        <HubAction
          icon={<Dumbbell size={22} />}
          title={items.length > 0 ? "Modifier l'entraînement" : "Programmer l'entraînement"}
          desc="Construire le programme d'exercices et lancer le chrono."
          onClick={() => setView('session_builder')}
          tint={{ bg: "bg-emerald-500/15", text: "text-emerald-400" }}
        />
      </div>
    </div>
  );
};
