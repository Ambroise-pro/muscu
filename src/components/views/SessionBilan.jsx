import { useState } from 'react';
import { CheckCircle, ChevronRight, SkipForward } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

const RESSENTIS = [
  { value: 1, emoji: '😩', label: 'Très difficile' },
  { value: 2, emoji: '😕', label: 'Difficile' },
  { value: 3, emoji: '😐', label: 'Correct' },
  { value: 4, emoji: '😊', label: 'Bien' },
  { value: 5, emoji: '🤩', label: 'Excellent' },
];

const FATIGUES = [
  { value: 1, label: 'Aucune' },
  { value: 2, label: 'Légère' },
  { value: 3, label: 'Modérée' },
  { value: 4, label: 'Forte' },
  { value: 5, label: 'Épuisé(e)' },
];

export const SessionBilan = ({ onSave, onSkip }) => {
  const [ressenti, setRessenti] = useState(null);
  const [fatigue, setFatigue] = useState(null);
  const [positif, setPositif] = useState('');
  const [ameliorer, setAmeliorer] = useState('');
  const [objectif, setObjectif] = useState('');

  const canSave = ressenti !== null || fatigue !== null || positif || ameliorer || objectif;

  const handleSave = () => {
    onSave({
      ressenti,
      fatigue,
      positif: positif.trim(),
      ameliorer: ameliorer.trim(),
      objectif: objectif.trim(),
      completedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div>
        <h2 className="text-2xl font-bold text-white">Bilan de séance</h2>
        <p className="text-slate-400 text-sm mt-1">Prends 2 minutes pour évaluer ta séance.</p>
      </div>

      <Card>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Comment s'est passée ta séance ?
        </div>
        <div className="flex justify-between gap-1">
          {RESSENTIS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRessenti(r.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${
                ressenti === r.value
                  ? 'bg-blue-600/30 border-blue-500 scale-105'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-[10px] text-slate-400 leading-tight text-center">{r.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Niveau de fatigue ressentie
        </div>
        <div className="flex gap-2 flex-wrap">
          {FATIGUES.map((f) => (
            <button
              key={f.value}
              onClick={() => setFatigue(f.value)}
              className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                fatigue === f.value
                  ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Ce qui s'est bien passé
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none resize-none focus:border-emerald-500/60"
              rows={2}
              value={positif}
              onChange={(e) => setPositif(e.target.value)}
              placeholder="Ex : bonne exécution sur les squats, j'ai tenu le tempo…"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Ce qui était difficile / à améliorer
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none resize-none focus:border-amber-500/60"
              rows={2}
              value={ameliorer}
              onChange={(e) => setAmeliorer(e.target.value)}
              placeholder="Ex : manque de force sur le développé couché, repos trop courts…"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Objectif pour la prochaine séance
            </label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm outline-none resize-none focus:border-blue-500/60"
              rows={2}
              value={objectif}
              onChange={(e) => setObjectif(e.target.value)}
              placeholder="Ex : augmenter la charge de 2.5 kg sur les curls…"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        <Button onClick={handleSave} disabled={!canSave} className="py-4">
          <CheckCircle size={20} /> Enregistrer le bilan <ChevronRight size={18} />
        </Button>
        <button
          onClick={onSkip}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-sm py-2"
        >
          <SkipForward size={16} /> Passer sans remplir
        </button>
      </div>
    </div>
  );
};
