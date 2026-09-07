import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, HelpCircle, History, Info, Save, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MUSCLE_GROUPS, MUSCLE_ZONES } from '../../constants/muscles';
import { calculateBrzycki } from '../../utils/calculations';

export const RMCalculator = ({ savedRMs, saveRM, deleteRM, history, deleteHistoryItem, setView }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(MUSCLE_GROUPS[0]);
  const [machineName, setMachineName] = useState('');
  const [result, setResult] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const repsNum = parseInt(reps) || 0;
  const isUnreliable = repsNum > 10;
  const isHeavyLoad = repsNum > 0 && repsNum < 5;

  useEffect(() => {
    setResult(calculateBrzycki(weight, reps));
  }, [weight, reps]);

  const handleSave = () => {
    if (machineName && result > 0) {
      saveRM(machineName, result, {
        muscle: selectedMuscle,
        weightInput: weight,
        repsInput: reps,
        isUnreliable
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('session_hub')} className="text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">Calculateur 1RM</h2>
        </div>
        <button onClick={() => setShowTutorial(!showTutorial)} className="p-2 text-blue-400 bg-slate-800 rounded-lg border border-slate-700">
          <Info size={24} />
        </button>
      </div>

      {showTutorial && (
        <Card className="bg-blue-900/20 border-blue-500/50 mb-4">
          <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <HelpCircle size={18}/> Protocole Test
          </h3>
          <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
            <li>Échauffez-vous progressivement.</li>
            <li>Choisissez une charge pour faire 5 à 10 reps max.</li>
            <li>Exécutez jusqu'à l'échec technique.</li>
            <li>Notez le résultat ci-dessous.</li>
          </ul>
        </Card>
      )}

      <Card>
        <div className="text-center mb-6">
          <h3 className="text-slate-400 text-xs uppercase font-bold mb-1">Estimation 1RM</h3>
          <div className="text-5xl font-black text-blue-400">
            {result} <span className="text-xl text-slate-500 font-normal">kg</span>
          </div>

          {isUnreliable && (
            <div className="mt-3 bg-amber-900/30 border border-amber-600/50 rounded p-2 text-amber-200 text-xs flex items-center justify-center gap-2">
              <AlertTriangle size={14} /> Résultat peu fiable ({'>'}10 reps)
            </div>
          )}
          {isHeavyLoad && (
            <div className="mt-3 bg-red-900/30 border border-red-600/50 rounded p-2 text-red-200 text-xs flex items-center justify-center gap-2">
              <AlertTriangle size={14} /> Charge lourde : prudence !
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Charge (kg)" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="80"/>
          <Input label="Répétitions" type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="8"/>
        </div>
      </Card>

      <Card>
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <Save size={18} /> Sauvegarder
        </h4>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-sm font-medium ml-1">Groupe Musculaire</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
            >
              {MUSCLE_ZONES.map((zone) => (
                <optgroup key={zone.label} label={zone.label}>
                  {zone.muscles.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-sm font-medium ml-1">Machine</label>
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="Nom de la machine"
            />
          </div>

          <Button onClick={handleSave} disabled={!machineName || result === 0} variant={isUnreliable || isHeavyLoad ? "warning" : "primary"}>
            {isUnreliable || isHeavyLoad ? "Sauvegarder (Avec Note)" : "Sauvegarder"}
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-white font-bold flex items-center gap-2 border-b border-slate-700 pb-2">
          <History size={18} className="text-slate-400"/> Historique Calculs
        </h3>
        {history.length === 0 ? (
          <div className="text-slate-500 text-sm italic text-center py-4">Aucun historique.</div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  {item.muscle || "Non renseigné"}
                  {item.isUnreliable && <AlertTriangle size={12} className="text-amber-500" />}
                </div>
                <div className="text-xs text-slate-400">
                  {item.exercise}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(item.date).toLocaleDateString()} • {item.weightInput}kg x {item.repsInput}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-blue-400 text-lg">{item.rmResult}</span>
                <button onClick={() => setPendingDeleteId(item.id)} className="text-slate-600 hover:text-red-400">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pendingDeleteId !== null && (
        <ConfirmDialog
          title="Supprimer ce calcul 1RM ?"
          message="Cette entrée sera définitivement retirée de l'historique."
          onConfirm={() => {
            deleteHistoryItem(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
};
