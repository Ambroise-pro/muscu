import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertTriangle, ArrowLeft, BookOpen, CheckCircle, Edit2, HelpCircle, Info, Play, Plus, Settings, Trash2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ExerciseGuideModal } from '../ui/ExerciseGuideModal';
import { MUSCLE_GROUPS, MUSCLE_ZONES, SMALL_MUSCLES } from '../../constants/muscles';
import { SESSION_GOALS, WORK_PATTERNS, GOAL_RULES, TECH_GUIDE_ENABLED } from '../../constants/exercises';
import { getExerciseGuide, getValidationIssues } from '../../utils/format';
import { generateSeriesPlan } from '../../utils/calculations';

export const SessionBuilder = ({
  savedRMs,
  history,
  sessionItems,
  setSessionItems,
  sessionSettings,
  setSessionSettings,
  setView
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState(MUSCLE_GROUPS[0]);
  const [exercise, setExercise] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [exerciseRest, setExerciseRest] = useState(sessionSettings?.restTime || 90);
  const [useSavedRM, setUseSavedRM] = useState(false);
  const [selectedSavedExercise, setSelectedSavedExercise] = useState('');
  const [intensity, setIntensity] = useState(75);
  const [workPattern, setWorkPattern] = useState('constant');
  const [seriesDraft, setSeriesDraft] = useState([]);
  const [showSettings, setShowSettings] = useState(true);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [showGuidePopup, setShowGuidePopup] = useState(false);

  // Pour l'édition
  const [editingId, setEditingId] = useState(null);
  const currentRule = GOAL_RULES[sessionSettings.goal];

  useEffect(() => {
    if (!editingId) {
        const baseRest = sessionSettings?.restTime || 90;
        const isSmall = SMALL_MUSCLES.includes(selectedMuscle);
        setExerciseRest(isSmall ? Math.max(30, baseRest - 30) : baseRest);
    }
  }, [selectedMuscle, sessionSettings, editingId]);

  const calculatedWeight = useSavedRM && selectedSavedExercise && savedRMs[selectedSavedExercise]
    ? Math.round(savedRMs[selectedSavedExercise] * (intensity / 100))
    : null;
  const baseWeightForPlan = useSavedRM ? calculatedWeight : (manualWeight ? parseInt(manualWeight) : null);
  const selectedExerciseName = useSavedRM ? selectedSavedExercise : exercise;
  const selectedGuide = getExerciseGuide(selectedExerciseName, selectedMuscle);
  const defaultSeriesPlan = useMemo(() => generateSeriesPlan({
    pattern: workPattern,
    sets,
    reps,
    baseWeight: baseWeightForPlan
  }), [workPattern, sets, reps, baseWeightForPlan]);

  useEffect(() => {
    if (editingId) return;
    setSeriesDraft(defaultSeriesPlan);
  }, [defaultSeriesPlan, editingId]);

  const updateSeriesDraft = (setNumber, field, rawValue) => {
    setSeriesDraft(prev => prev.map((setRow) => {
      if (setRow.set !== setNumber) return setRow;
      if (rawValue === "") return { ...setRow, [field]: "" };
      const parsed = parseInt(rawValue);
      if (!Number.isFinite(parsed)) return setRow;
      if (field === "reps") return { ...setRow, reps: Math.max(1, parsed) };
      return { ...setRow, weight: Math.max(1, parsed) };
    }));
  };

  const getSavedExerciseMuscle = useCallback((exerciseName) => {
    const match = history?.find((h) => h.exercise === exerciseName && h.muscle);
    return match?.muscle || selectedMuscle;
  }, [history, selectedMuscle]);

  const handleGoalChange = (newGoal) => {
    setSessionSettings({
      goal: newGoal,
      restTime: SESSION_GOALS[newGoal].defaultRest
    });
    if (!editingId) {
      const rule = GOAL_RULES[newGoal];
      setSets(Math.round((rule.minSets + rule.maxSets) / 2));
      setReps(Math.round((rule.minReps + rule.maxReps) / 2));
      setIntensity(Math.round((rule.minInt + rule.maxInt) / 2));
      setExerciseRest(SESSION_GOALS[newGoal].defaultRest);
    }
  };

  const addItem = () => {
    const name = useSavedRM ? selectedSavedExercise : exercise;
    if (!name) return;
    const parsedSets = Math.max(1, parseInt(sets) || 1);
    const parsedReps = Math.max(1, parseInt(reps) || 1);
    const parsedRest = Math.max(10, parseInt(exerciseRest) || 10);
    const finalWeight = useSavedRM ? calculatedWeight : (manualWeight ? parseInt(manualWeight) : null);
    const seriesPlan = generateSeriesPlan({
      pattern: workPattern,
      sets: parsedSets,
      reps: parsedReps,
      baseWeight: finalWeight
    });

    const newItem = {
      id: editingId || Date.now(),
      muscle: useSavedRM ? getSavedExerciseMuscle(name) : selectedMuscle,
      exercise: name,
      sets: parsedSets,
      reps: parsedReps,
      weight: finalWeight,
      intensity: useSavedRM ? intensity : null,
      restTime: parsedRest,
      workPattern,
      seriesPlan: seriesPlan.map((setRow, idx) => {
        const custom = seriesDraft[idx] || {};
        const repsValue = custom.reps === "" || custom.reps === null || custom.reps === undefined
          ? setRow.reps
          : Math.max(1, parseInt(custom.reps) || setRow.reps);
        const baseWeight = custom.weight === "" || custom.weight === null || custom.weight === undefined
          ? setRow.weight
          : Math.max(1, parseInt(custom.weight) || (setRow.weight || 1));
        return {
          set: idx + 1,
          reps: repsValue,
          weight: baseWeight || null
        };
      })
    };

    if (editingId) {
        setSessionItems(prev => prev.map(item => item.id === editingId ? newItem : item));
        setEditingId(null);
    } else {
        setSessionItems(prev => [...prev, newItem]);
    }

    // Reset form fields lightly
    if (!editingId) {
      setExercise('');
      setManualWeight('');
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setSelectedMuscle(item.muscle);
    setSets(item.sets);
    setReps(item.reps);
    setExerciseRest(item.restTime);

    if (item.intensity) {
        setUseSavedRM(true);
        setSelectedSavedExercise(item.exercise); // Assumes name matches key in savedRMs
        setIntensity(item.intensity);
    } else {
        setUseSavedRM(false);
        setExercise(item.exercise);
        setManualWeight(item.weight ?? '');
    }
    setWorkPattern(item.workPattern || 'constant');
    setSeriesDraft(
      (item.seriesPlan && item.seriesPlan.length > 0)
        ? item.seriesPlan.map((row, idx) => ({ set: idx + 1, reps: row.reps, weight: row.weight }))
        : generateSeriesPlan({
            pattern: item.workPattern || 'constant',
            sets: item.sets,
            reps: item.reps,
            baseWeight: item.weight
          })
    );
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeItem = (id) => {
    setSessionItems(prev => prev.filter(i => i.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('session_hub')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Préparer Séance</h2>
      </div>

      <Card className="border-amber-500/20 bg-slate-800/80 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={18} className="text-amber-400" />
            <h3 className="text-white font-bold">Objectif : {SESSION_GOALS[sessionSettings.goal].label}</h3>
          </div>
          <button
            onClick={() => setShowRulesPopup(!showRulesPopup)}
            className="bg-slate-700 hover:bg-slate-600 p-1.5 rounded-full text-blue-400 transition-colors"
          >
            <HelpCircle size={20} />
          </button>
        </div>

        {showRulesPopup && (
          <div className="absolute top-12 right-4 left-4 z-50 bg-slate-900 border border-blue-500 rounded-xl p-4 shadow-2xl animate-fade-in text-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-blue-400">Paramètres de validation</span>
              <button onClick={() => setShowRulesPopup(false)}><Plus size={18} className="rotate-45 text-slate-500"/></button>
            </div>
            <div className="space-y-3">
              {Object.entries(GOAL_RULES).map(([key, r]) => (
                <div key={key} className="border-b border-slate-800 pb-2 last:border-0">
                  <div className="font-bold text-white capitalize mb-1">{key}</div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="text-slate-400">Séries: <span className="text-blue-300">{r.minSets}-{r.maxSets}</span></div>
                    <div className="text-slate-400">Reps: <span className="text-blue-300">{r.minReps}-{r.maxReps}</span></div>
                    <div className="text-slate-400">Int: <span className="text-blue-300">{r.minInt}-{r.maxInt}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSettings && (
          <div className="space-y-4 mt-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SESSION_GOALS).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => handleGoalChange(key)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                    sessionSettings.goal === key
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="mb-1">{data.icon}</div>
                  <span className="text-[10px] font-bold">{data.label}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-amber-900/60 bg-gradient-to-br from-amber-900/30 via-slate-900/60 to-slate-900/40 p-3">
              <div className="flex items-center justify-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
                <Info size={12} />
                Repères {SESSION_GOALS[sessionSettings.goal].label}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Séries</div>
                  <div className="text-amber-200 font-bold">{currentRule.minSets}-{currentRule.maxSets}</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Reps</div>
                  <div className="text-amber-200 font-bold">{currentRule.minReps}-{currentRule.maxReps}</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Intensité</div>
                  <div className="text-amber-200 font-bold">{currentRule.minInt}-{currentRule.maxInt}%</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-slate-500 uppercase">Vitesse</div>
                  <div className="text-amber-200 font-bold">{currentRule.speed}</div>
                </div>
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-lg p-2 text-center sm:col-span-2">
                  <div className="text-[10px] text-slate-500 uppercase">Récupération</div>
                  <div className="text-amber-200 font-bold">{currentRule.recovery}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </Card>

      <Card className={`border-blue-500/30 ${editingId ? 'ring-2 ring-blue-500 bg-blue-900/10' : ''}`}>
        {editingId && <div className="text-xs text-blue-400 font-bold mb-2 uppercase tracking-wider flex items-center gap-1"><Edit2 size={12}/> Modification en cours</div>}
        <div className="flex flex-col gap-4">
          <div className="flex bg-slate-900 p-1 rounded-lg">
            <button className={`flex-1 py-2 rounded text-sm font-bold ${!useSavedRM ? 'bg-slate-700 text-white' : 'text-slate-400'}`} onClick={() => setUseSavedRM(false)}>Manuel</button>
            <button className={`flex-1 py-2 rounded text-sm font-bold ${useSavedRM ? 'bg-blue-600 text-white' : 'text-slate-400'}`} onClick={() => setUseSavedRM(true)}>Utiliser 1RM</button>
          </div>

          {useSavedRM ? (
            Object.keys(savedRMs).length > 0 ? (
              <>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" value={selectedSavedExercise} onChange={(e) => setSelectedSavedExercise(e.target.value)}>
                  <option value="">-- Choisir une RM --</option>
                  {Object.keys(savedRMs).map(k => {
                    const muscle = getSavedExerciseMuscle(k) || "Sans groupe";
                    return (
                      <option key={k} value={k}>
                        {muscle} ({k}) - Max: {savedRMs[k]}kg
                      </option>
                    );
                  })}
                </select>
                <div className="flex justify-between text-sm text-slate-400 px-1">
                  <span>Intensité</span>
                  <span className="text-blue-400 font-bold">{intensity}%</span>
                </div>
                <input type="range" min="50" max="100" step="5" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                {calculatedWeight && (
                  <div className="bg-blue-900/30 border border-blue-500/30 p-2 rounded text-center text-white font-bold">
                    Recommandé : {calculatedWeight} kg
                  </div>
                )}
              </>
            ) : <div className="text-yellow-500 text-sm">Aucun 1RM sauvegardé.</div>
          ) : (
            <>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
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
              <Input label="Nom Exercice" value={exercise} onChange={(e) => setExercise(e.target.value)} placeholder="ex: Curls"/>
              <Input label="Charge cible (kg)" type="number" value={manualWeight} onChange={(e) => setManualWeight(e.target.value)} placeholder="ex: 40"/>
            </>
          )}

          {TECH_GUIDE_ENABLED && (
            <button
              onClick={() => setShowGuidePopup(true)}
              disabled={!selectedExerciseName}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2 text-sm font-bold text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2"><BookOpen size={14} /> Voir la fiche technique</span>
            </button>
          )}

          <div className="space-y-2">
            <label className="text-slate-400 text-sm font-medium ml-1">Forme de travail</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white"
              value={workPattern}
              onChange={(e) => setWorkPattern(e.target.value)}
            >
              {Object.entries(WORK_PATTERNS).map(([key, data]) => (
                <option key={key} value={key}>{data.label}</option>
              ))}
            </select>
            <div className="text-xs text-slate-500 px-1">{WORK_PATTERNS[workPattern].desc}</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input label="Séries" type="number" value={sets} onChange={(e) => setSets(e.target.value)} />
            <Input label="Répétitions" type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
            <Input label="Repos (s)" type="number" value={exerciseRest} onChange={(e) => setExerciseRest(e.target.value)} />
          </div>

          <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-3 space-y-2">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Réglage séries ({WORK_PATTERNS[workPattern].label})
            </div>
            <div className="space-y-2 text-xs">
              {seriesDraft.map((setData) => (
                <div key={setData.set} className="bg-slate-800 border border-slate-700 rounded px-2 py-2">
                  <div className="text-slate-400 mb-1 font-bold">Série {setData.set}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={setData.reps}
                        onChange={(e) => updateSeriesDraft(setData.set, "reps", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-500">Charge (kg)</label>
                      <input
                        type="number"
                        min="1"
                        value={setData.weight ?? ""}
                        onChange={(e) => updateSeriesDraft(setData.set, "weight", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-blue-200"
                        placeholder="Libre"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {editingId && (
                <Button onClick={() => setEditingId(null)} variant="secondary" className="w-1/3">Annuler</Button>
            )}
            <Button onClick={addItem} disabled={useSavedRM ? !selectedSavedExercise : !exercise}>
                {editingId ? <><CheckCircle size={20} /> Mettre à jour</> : <><Plus size={20} /> Ajouter</>}
            </Button>
          </div>
        </div>
      </Card>

      {TECH_GUIDE_ENABLED && showGuidePopup && selectedExerciseName && (
        <ExerciseGuideModal
          title={selectedExerciseName}
          guide={selectedGuide}
          onClose={() => setShowGuidePopup(false)}
        />
      )}

      {sessionItems.length > 0 && !editingId && (
        <div className="space-y-2">
          <Button
            onClick={() => setView('active_session')}
            variant="success"
            className="py-4 text-lg"
          >
            <Play size={24} fill="currentColor" /> DÉMARRER ({sessionItems.length})
          </Button>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {sessionItems.map((item) => {
          // Validation de l'exercice
          const issues = getValidationIssues(item, sessionSettings.goal);
          const hasIssues = issues.length > 0;

          return (
            <div key={item.id} className={`bg-slate-800 p-3 rounded-lg border flex flex-col relative overflow-hidden transition-all ${editingId === item.id ? 'opacity-50' : ''} ${hasIssues ? 'border-amber-500/50' : 'border-slate-700'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${hasIssues ? 'bg-amber-500' : 'bg-blue-500'}`}></div>

              <div className="flex justify-between items-start pl-3 mb-2">
                <div>
                  <div className="text-[10px] text-blue-400 uppercase font-bold">{item.muscle}</div>
                  <div className="font-bold text-white text-lg">{item.exercise}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.sets} séries • {WORK_PATTERNS[item.workPattern || "constant"]?.label || WORK_PATTERNS.constant.label} • {item.restTime}s repos {item.weight && `• Base ${item.weight}kg${item.intensity ? ` (${item.intensity}%)` : ""}`}
                  </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => editItem(item)} className="text-slate-500 hover:text-white p-1 bg-slate-900 rounded border border-slate-700">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 p-1 bg-slate-900 rounded border border-slate-700">
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>

              {/* Affichage des avertissements */}
              {hasIssues && (
                  <div className="ml-3 mt-1 bg-amber-900/20 border border-amber-500/30 rounded p-2 text-xs text-amber-200">
                      <div className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={12}/> Attention :</div>
                      <ul className="list-disc pl-4 space-y-1">
                          {issues.map((issue, i) => <li key={i}>{issue}</li>)}
                      </ul>
                  </div>
              )}
            </div>
          );
        })}
        {sessionItems.length === 0 && <div className="text-center text-slate-500 py-4 italic">Liste vide.</div>}
      </div>
    </div>
  );
};
