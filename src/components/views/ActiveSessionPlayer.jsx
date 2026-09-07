import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, BookOpen, CheckCircle, Clock, Layers, Play, Plus,
  RotateCcw, Square, Timer, Trophy
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ExerciseGuideModal } from '../ui/ExerciseGuideModal';
import { GOAL_RULES, TECH_GUIDE_ENABLED } from '../../constants/exercises';
import { PEER_EVAL_CRITERIA, createPeerEvalState, isPeerEvalComplete, computePeerEvalScore } from '../../constants/peerEval';
import { formatTime, getMuscleImage, getExerciseGuide } from '../../utils/format';
import { getSetPrescription, evaluateWorkTime } from '../../utils/calculations';

export const ActiveSessionPlayer = ({ sessionItems = [], sessionSettings, setView, onSessionComplete }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [setProgressByExercise, setSetProgressByExercise] = useState({});
  const [exerciseSetCaps, setExerciseSetCaps] = useState({});
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showGuidePopup, setShowGuidePopup] = useState(false);
  const [timeBudgetMin, setTimeBudgetMin] = useState("");
  const [timePlannerMessage, setTimePlannerMessage] = useState(null);
  const [peerEvaluation, setPeerEvaluation] = useState(createPeerEvalState());
  const [peerEvalError, setPeerEvalError] = useState(null);
  const [workTimer, setWorkTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [actualRestTime, setActualRestTime] = useState(0); // Nouveau: temps réel passé en repos
  const [status, setStatus] = useState('ready'); // 'ready', 'working', 'resting'
  const [lastWorkTime, setLastWorkTime] = useState(null);
  const [workTimeFeedback, setWorkTimeFeedback] = useState(null);
  const [selectedRPE, setSelectedRPE] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [performanceLog, setPerformanceLog] = useState({}); // Stockage des perfs { exoIndex: [ {set:1, work:20, rest:60, rpe:8} ] }

  const hasSavedRef = useRef(false);
  const intervalRef = useRef(null);

  const getExerciseTotalSets = useCallback((item) => {
    if (!item) return 1;
    return item?.seriesPlan?.length || parseInt(item?.sets) || 1;
  }, []);

  const getEffectiveTotalSets = useCallback((idx) => {
    const item = sessionItems[idx];
    const originalTotal = getExerciseTotalSets(item);
    const cap = exerciseSetCaps[idx] || originalTotal;
    return Math.max(1, Math.min(originalTotal, cap));
  }, [exerciseSetCaps, sessionItems, getExerciseTotalSets]);

  const isExerciseDone = useCallback((idx) => {
    const total = getEffectiveTotalSets(idx);
    const nextSet = setProgressByExercise[idx] || 1;
    return nextSet > total;
  }, [setProgressByExercise, getEffectiveTotalSets]);

  const getNextIncompleteExercise = useCallback((fromIdx = 0) => {
    for (let i = fromIdx + 1; i < sessionItems.length; i += 1) {
      if (!isExerciseDone(i)) return i;
    }
    for (let i = 0; i < fromIdx; i += 1) {
      if (!isExerciseDone(i)) return i;
    }
    return -1;
  }, [sessionItems, isExerciseDone]);

  const currentExercise = sessionItems[currentExerciseIndex];

  useEffect(() => {
    if (!sessionItems.length) return;
    setSetProgressByExercise(prev => {
      const next = { ...prev };
      sessionItems.forEach((_, idx) => {
        if (!next[idx]) next[idx] = 1;
      });
      return next;
    });
    setExerciseSetCaps(prev => {
      const next = { ...prev };
      sessionItems.forEach((item, idx) => {
        if (!next[idx]) next[idx] = getExerciseTotalSets(item);
      });
      return next;
    });
  }, [sessionItems, getExerciseTotalSets]);

  useEffect(() => {
    const nextSet = setProgressByExercise[currentExerciseIndex] || 1;
    setCurrentSet(nextSet);
  }, [currentExerciseIndex, setProgressByExercise]);

  useEffect(() => {
    if (currentExercise) {
      setRestTimer(currentExercise.restTime || sessionSettings?.restTime || 90);
    }
  }, [currentExercise, sessionSettings]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (status === 'working') {
        setWorkTimer(t => t + 1);
      } else if (status === 'resting') {
        setRestTimer(t => (t > 0 ? t - 1 : 0));
        setActualRestTime(t => t + 1); // On compte le temps réel écoulé
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [status]);

  useEffect(() => {
    if (sessionComplete && !hasSavedRef.current) {
      hasSavedRef.current = true;
      if (onSessionComplete) {
        onSessionComplete(sessionItems, sessionSettings, performanceLog);
      }
    }
  }, [sessionComplete, sessionItems, sessionSettings, performanceLog, onSessionComplete]);

  const startSet = () => {
    setWorkTimer(0);
    setStatus('working');
    setSelectedRPE(null);
    setActualRestTime(0);
    setWorkTimeFeedback(null);
    setPeerEvaluation(createPeerEvalState());
    setPeerEvalError(null);
  };

  const finishSet = () => {
    const feedback = evaluateWorkTime(workTimer, sessionSettings?.goal);
    setStatus('resting');
    setLastWorkTime(workTimer);
    setWorkTimeFeedback(feedback);
    const nextRest = currentExercise?.restTime || sessionSettings?.restTime || 90;
    setRestTimer(nextRest);
    setActualRestTime(0);
  };

  const totalSets = getEffectiveTotalSets(currentExerciseIndex);
  const currentSetTarget = getSetPrescription(currentExercise, currentSet);
  const hasNextSetInExercise = currentSet < totalSets;
  const nextExerciseIdx = getNextIncompleteExercise(currentExerciseIndex);
  const nextExercise = nextExerciseIdx >= 0 && nextExerciseIdx !== currentExerciseIndex ? sessionItems[nextExerciseIdx] : null;
  const nextExerciseSet = nextExerciseIdx >= 0 ? (setProgressByExercise[nextExerciseIdx] || 1) : 1;
  const upcomingTarget = hasNextSetInExercise
    ? getSetPrescription(currentExercise, currentSet + 1)
    : (nextExercise ? getSetPrescription(nextExercise, nextExerciseSet) : null);
  const upcomingLabel = hasNextSetInExercise
    ? `Série ${currentSet + 1}`
    : (nextExercise ? `Exercice suivant • ${nextExercise.exercise} (S${nextExerciseSet})` : null);
  const peerEvalScore = computePeerEvalScore(peerEvaluation);

  const estimateSetSeconds = useCallback((exercise) => {
    const rules = GOAL_RULES[sessionSettings?.goal];
    const avgWork = rules ? Math.round((rules.minSpeed + rules.maxSpeed) / 2) : 20;
    const rest = parseInt(exercise?.restTime) || sessionSettings?.restTime || 90;
    return avgWork + rest;
  }, [sessionSettings]);

  const optimizeForRemainingTime = () => {
    const targetSec = Math.max(1, parseInt(timeBudgetMin) || 0) * 60;
    if (targetSec <= 0) {
      setTimePlannerMessage("Entrez un temps restant valide.");
      return;
    }

    const nextSetPointer = (idx, totalForIdx) => {
      const pointer = setProgressByExercise[idx] || 1;
      if (idx !== currentExerciseIndex) return pointer;
      if (status === "resting") return Math.min(pointer + 1, totalForIdx + 1);
      return pointer;
    };

    const estimateRemaining = (caps) => {
      let sum = 0;
      sessionItems.forEach((item, idx) => {
        const total = Math.max(1, Math.min(getExerciseTotalSets(item), caps[idx] || getExerciseTotalSets(item)));
        const pointer = nextSetPointer(idx, total);
        const remainingSets = Math.max(0, total - pointer + 1);
        sum += remainingSets * estimateSetSeconds(item);
      });
      return sum;
    };

    const nextCaps = { ...exerciseSetCaps };
    const initialEstimate = estimateRemaining(nextCaps);
    if (initialEstimate <= targetSec) {
      setTimePlannerMessage(`Déjà cohérent: ~${Math.ceil(initialEstimate / 60)} min restantes.`);
      return;
    }

    let estimated = initialEstimate;
    let skippedSets = 0;
    const minCaps = {};
    sessionItems.forEach((item, idx) => {
      const originalTotal = getExerciseTotalSets(item);
      if (!nextCaps[idx]) nextCaps[idx] = originalTotal;
      const pointer = nextSetPointer(idx, nextCaps[idx]);
      minCaps[idx] = Math.max(1, pointer);
    });

    // Répartit les retraits sur plusieurs exercices pour garder un travail multi-musculaire.
    let roundRobin = 0;
    while (estimated > targetSec) {
      const eligible = sessionItems
        .map((_, idx) => idx)
        .filter((idx) => nextCaps[idx] > minCaps[idx]);

      if (eligible.length === 0) break;

      const targetIdx = eligible[roundRobin % eligible.length];
      roundRobin += 1;
      nextCaps[targetIdx] -= 1;
      estimated -= estimateSetSeconds(sessionItems[targetIdx]);
      skippedSets += 1;
    }

    setExerciseSetCaps(nextCaps);
    if (skippedSets === 0) {
      setTimePlannerMessage(`Impossible de réduire plus sans supprimer les séries en cours. Estimation: ~${Math.ceil(estimated / 60)} min.`);
    } else {
      setTimePlannerMessage(`Plan court appliqué: ${skippedSets} série(s) retirée(s) de façon répartie. Reste ~${Math.max(1, Math.ceil(estimated / 60))} min.`);
    }
  };

  const moveToExercise = (targetIdx) => {
    if (targetIdx < 0 || targetIdx >= sessionItems.length) return;
    const targetSet = setProgressByExercise[targetIdx] || 1;
    setCurrentExerciseIndex(targetIdx);
    setCurrentSet(targetSet);
    setStatus('ready');
    setWorkTimer(0);
    setLastWorkTime(null);
    setSelectedRPE(null);
    setWorkTimeFeedback(null);
    setPeerEvaluation(createPeerEvalState());
    setPeerEvalError(null);
    setShowExercisePicker(false);
  };

  const skipCurrentSet = () => {
    const skippedLog = {
      set: currentSet,
      targetReps: currentSetTarget.reps,
      targetWeight: currentSetTarget.weight,
      workTime: 0,
      realRestTime: 0,
      rpe: "Sautée",
      tempoStatus: "skipped",
      peerEvaluation: null,
      peerEvalScore: 0
    };
    setPerformanceLog(prev => {
      const currentExoLogs = prev[currentExerciseIndex] || [];
      return { ...prev, [currentExerciseIndex]: [...currentExoLogs, skippedLog] };
    });

    const nextSet = currentSet + 1;
    const finishedExercise = nextSet > totalSets;
    setSetProgressByExercise(prev => ({ ...prev, [currentExerciseIndex]: nextSet }));

    if (finishedExercise) {
      const nextIdx = getNextIncompleteExercise(currentExerciseIndex);
      if (nextIdx === -1) {
        setSessionComplete(true);
      } else {
        moveToExercise(nextIdx);
      }
      return;
    }

    setCurrentSet(nextSet);
    setStatus('ready');
    setWorkTimer(0);
    setLastWorkTime(null);
    setSelectedRPE(null);
    setWorkTimeFeedback(null);
    setPeerEvaluation(createPeerEvalState());
    setPeerEvalError(null);
  };

  const setPeerCriterion = (key, value) => {
    setPeerEvaluation((prev) => ({ ...prev, [key]: value }));
    setPeerEvalError(null);
  };

  const nextStep = () => {
    if (!isPeerEvalComplete(peerEvaluation)) {
      setPeerEvalError("Le camarade doit valider posture, amplitude, contrôle et sécurité.");
      return;
    }

    // Enregistrement de la performance de la série
    const newLogEntry = {
      set: currentSet,
      targetReps: currentSetTarget.reps,
      targetWeight: currentSetTarget.weight,
      workTime: lastWorkTime,
      realRestTime: actualRestTime,
      rpe: selectedRPE || "-",
      tempoStatus: workTimeFeedback?.status || null,
      peerEvaluation,
      peerEvalScore: computePeerEvalScore(peerEvaluation)
    };

    setPerformanceLog(prev => {
      const currentExoLogs = prev[currentExerciseIndex] || [];
      return { ...prev, [currentExerciseIndex]: [...currentExoLogs, newLogEntry] };
    });

    const nextSet = currentSet + 1;
    const finishedExercise = nextSet > totalSets;
    setSetProgressByExercise(prev => ({ ...prev, [currentExerciseIndex]: nextSet }));

    if (finishedExercise) {
      const nextIdx = getNextIncompleteExercise(currentExerciseIndex);
      if (nextIdx === -1) {
        setSessionComplete(true);
      } else {
        moveToExercise(nextIdx);
      }
      return;
    }

    setCurrentSet(nextSet);
    setStatus('ready');
    setWorkTimer(0);
    setLastWorkTime(null);
    setSelectedRPE(null);
    setPeerEvaluation(createPeerEvalState());
    setPeerEvalError(null);
  };

  const getRpeColor = (val) => {
    if(val <= 7) return "bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400";
    if(val <= 8) return "bg-amber-500 text-white shadow-lg ring-2 ring-amber-400";
    return "bg-red-600 text-white shadow-lg ring-2 ring-red-400";
  };

  const getRpeLabel = (val) => {
    if(val === 6) return "Facile (4+ reps en réserve)";
    if(val === 7) return "Moyen (3 reps en réserve)";
    if(val === 8) return "Difficile (2 reps en réserve)";
    if(val === 9) return "Très Dur (1 rep en réserve)";
    if(val === 10) return "Échec (0 rep en réserve)";
    return "";
  };

  const peerScores = Object.values(performanceLog).flatMap((logs) =>
    logs
      .map((entry) => entry.peerEvalScore)
      .filter((score) => typeof score === "number" && score >= 0)
  );
  const finalPeerScore = peerScores.length > 0
    ? Math.round(peerScores.reduce((acc, score) => acc + score, 0) / peerScores.length)
    : null;

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center pt-20 animate-fade-in">
        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 mb-6">
          <Trophy size={64} />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Séance Terminée !</h2>
        <p className="text-slate-400 mb-8">Votre séance a été enregistrée dans l'historique.</p>
        {finalPeerScore !== null && (
          <div className="mb-4 bg-emerald-900/20 border border-emerald-500/40 rounded-xl px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-emerald-300">Score évaluation camarade</div>
            <div className="text-3xl font-black text-emerald-200">{finalPeerScore}%</div>
          </div>
        )}
        <Button onClick={() => setView('menu')}>Retour au Menu</Button>
      </div>
    );
  }

  if (!currentExercise) return <div className="text-center text-slate-500 mt-10">Chargement...</div>;

  const totalPlannedSets = sessionItems.reduce((acc, _, idx) => acc + getEffectiveTotalSets(idx), 0);
  const doneSets = sessionItems.reduce((acc, item, idx) => {
    const total = getEffectiveTotalSets(idx);
    const done = Math.min(Math.max((setProgressByExercise[idx] || 1) - 1, 0), total);
    return acc + done;
  }, 0);
  const progressPercent = totalPlannedSets > 0 ? (doneSets / totalPlannedSets) * 100 : 0;
  const isResting = status === 'resting';

  return (
    <div className="space-y-4 h-full flex flex-col animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => { if(window.confirm("Quitter la séance ?")) setView('session_builder'); }} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Quitter
        </button>
        <button
          onClick={() => setShowExercisePicker(true)}
          className="text-slate-300 hover:text-white text-xs border border-slate-700 rounded-full px-3 py-1.5 bg-slate-900/80 flex items-center gap-1"
        >
          <Layers size={13} /> Changer d'exercice
        </button>
        <div className="text-slate-400 text-sm font-mono">
          Ex {currentExerciseIndex + 1}/{sessionItems.length} • {doneSets}/{totalPlannedSets} séries
        </div>
      </div>

      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-2">
        <div className="text-xs uppercase tracking-wide text-slate-400 font-bold flex items-center gap-2">
          <Timer size={12} /> Objectif temps de cours
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={timeBudgetMin}
            onChange={(e) => setTimeBudgetMin(e.target.value)}
            placeholder="Temps restant (min)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white"
          />
          <button
            onClick={optimizeForRemainingTime}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-sm font-bold px-3 py-2 rounded"
          >
            Adapter
          </button>
        </div>
        {timePlannerMessage && <div className="text-xs text-amber-200">{timePlannerMessage}</div>}
      </div>

      <Card className={`flex-grow flex flex-col justify-between relative overflow-hidden transition-colors duration-500 min-h-[420px] ${isResting ? 'border-amber-500/50 bg-slate-800' : 'border-blue-500/30'}`}>
        {/* Muscle Image Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/40 z-10"></div>
            <img
              src={getMuscleImage(currentExercise.muscle)}
              alt={currentExercise.muscle}
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm">
              {currentExercise.muscle}
            </span>
            {isResting && (
              <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-bold animate-pulse flex items-center gap-1">
                <Clock size={12} /> REPOS
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-6 drop-shadow-xl">
            {currentExercise.exercise}
          </h2>
          {TECH_GUIDE_ENABLED && (
            <button
              onClick={() => setShowGuidePopup(true)}
              className="text-xs text-blue-300 hover:text-blue-200 border border-blue-500/40 rounded-full px-3 py-1 bg-slate-900/70 mb-4"
            >
              <span className="inline-flex items-center gap-1"><BookOpen size={12} /> Fiche technique</span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-slate-900/80 p-2 md:p-3 rounded-lg text-center border border-slate-700 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px] md:text-xs uppercase">Série</div>
              <div className="text-lg md:text-2xl font-bold text-white">
                <span className={isResting ? "text-slate-500" : "text-blue-400"}>{currentSet}</span>
                <span className="text-slate-600 text-sm md:text-base">/{totalSets}</span>
              </div>
            </div>
            <div className="bg-slate-900/80 p-2 md:p-3 rounded-lg text-center border border-slate-700 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px] md:text-xs uppercase">Reps</div>
              <div className="text-lg md:text-2xl font-bold text-white">{currentSetTarget.reps}</div>
            </div>
            <div className="bg-slate-900/80 p-2 md:p-3 rounded-lg text-center border border-slate-700 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px] md:text-xs uppercase">Charge</div>
              <div className="text-lg md:text-2xl font-bold text-white">
                {currentSetTarget.weight || '--'}<span className="text-xs md:text-sm font-normal text-slate-500">kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-xs md:text-sm uppercase tracking-widest text-slate-500 mb-1">
              {isResting ? "Temps Restant" : "Chrono Série"}
            </div>
            <div className={`text-6xl md:text-8xl font-mono font-black tabular-nums tracking-tighter transition-colors ${
              status === 'working' ? 'text-blue-400' :
              status === 'resting' ? 'text-amber-400' : 'text-slate-600'
            }`}>
              {isResting ? formatTime(restTimer) : formatTime(workTimer)}
            </div>
          </div>

          <div className="w-full space-y-3">
            {status === 'ready' && (
              <div className="space-y-2">
                <Button onClick={startSet} className="py-5 text-lg shadow-xl shadow-blue-900/20">
                  <Play size={24} fill="currentColor" /> DÉMARRER
                </Button>
                <button
                  onClick={skipCurrentSet}
                  className="w-full bg-slate-700/70 hover:bg-slate-600 text-slate-200 text-sm py-2 rounded-lg border border-slate-600"
                >
                  Sauter cette série
                </button>
              </div>
            )}
            {status === 'working' && (
              <Button onClick={finishSet} variant="danger" className="py-5 text-lg animate-pulse shadow-xl shadow-red-900/20">
                <Square size={24} fill="currentColor" /> FINIR SÉRIE
              </Button>
            )}
            {status === 'resting' && (
              <div className="space-y-4 animate-fade-in w-full">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 w-full backdrop-blur-sm">
                  <div className="text-center text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-wider">
                    Ressenti (RPE)
                  </div>
                  <div className="flex justify-between gap-1 mb-2">
                    {[6, 7, 8, 9, 10].map(val => (
                       <button
                         key={val}
                         onClick={() => setSelectedRPE(val)}
                         className={`flex-1 py-2 rounded text-sm font-bold transition-all ${selectedRPE === val ? getRpeColor(val) : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                       >
                         {val}
                       </button>
                    ))}
                  </div>
                  <div className="text-center text-xs text-slate-300 italic min-h-[1.5em]">
                     {selectedRPE ? getRpeLabel(selectedRPE) : "Comment était cette série ?"}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 w-full backdrop-blur-sm">
                  <div className="text-center text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-wider">
                    Évaluation camarade
                  </div>
                  <div className="space-y-2">
                    {PEER_EVAL_CRITERIA.map((criterion) => (
                      <div key={criterion.key} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-300">{criterion.label}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPeerCriterion(criterion.key, true)}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              peerEvaluation[criterion.key] === true
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setPeerCriterion(criterion.key, false)}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              peerEvaluation[criterion.key] === false
                                ? "bg-red-600 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            Corriger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-blue-300">Score série: {peerEvalScore}%</div>
                  {peerEvalError && <div className="mt-1 text-xs text-red-300">{peerEvalError}</div>}
                </div>

                <div className="text-center text-xs text-slate-400 bg-slate-900/80 py-2 rounded border border-slate-700/30 backdrop-blur-sm">
                  Temps d'effort : {formatTime(lastWorkTime)} {selectedRPE && <span className="text-blue-300">• RPE {selectedRPE}</span>}
                </div>

                {workTimeFeedback && (
                  <div className={`text-center text-xs rounded border px-3 py-2 ${
                    workTimeFeedback.tone === "emerald"
                      ? "bg-emerald-900/20 border-emerald-500/40 text-emerald-200"
                      : workTimeFeedback.tone === "amber"
                      ? "bg-amber-900/20 border-amber-500/40 text-amber-200"
                      : "bg-red-900/20 border-red-500/40 text-red-200"
                  }`}>
                    <span className="font-bold">{workTimeFeedback.label}</span> • {workTimeFeedback.message}
                  </div>
                )}

                {upcomingTarget && upcomingLabel && (
                  <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg px-3 py-2 text-xs text-blue-100">
                    <div className="font-bold text-[11px] uppercase tracking-wide text-blue-300 mb-1">{upcomingLabel}</div>
                    <div className="flex items-center justify-between gap-2">
                      <span>{upcomingTarget.reps} reps</span>
                      <span className="font-bold">{upcomingTarget.weight ? `${upcomingTarget.weight} kg` : "Charge libre"}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={nextStep}
                  variant={restTimer === 0 ? "success" : "secondary"}
                  className="py-4 shadow-xl"
                >
                  {currentSet < totalSets ? (
                    <>Série Suivante <RotateCcw size={20} /></>
                  ) : (
                    <>Exercice Suivant <CheckCircle size={20} /></>
                  )}
                </Button>
                <button
                  onClick={() => setShowExercisePicker(true)}
                  className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-lg border border-slate-600"
                >
                  Passer à un autre exercice
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {showExercisePicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <div className="text-sm font-bold text-slate-200">Choisir l'exercice disponible</div>
              <button onClick={() => setShowExercisePicker(false)} className="text-slate-500 hover:text-slate-200" aria-label="Fermer">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <div className="p-3 max-h-[70vh] overflow-y-auto space-y-2">
              {sessionItems.map((item, idx) => {
                const exoTotalSets = getEffectiveTotalSets(idx);
                const exoNextSet = setProgressByExercise[idx] || 1;
                const exoDone = exoNextSet > exoTotalSets;
                const nextSetPrescription = exoDone ? null : getSetPrescription(item, exoNextSet);
                return (
                  <button
                    key={item.id}
                    onClick={() => !exoDone && moveToExercise(idx)}
                    disabled={exoDone}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                      exoDone
                        ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                        : idx === currentExerciseIndex
                        ? "bg-blue-900/30 border-blue-500/50 text-blue-100"
                        : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{item.exercise}</span>
                      <span className="text-[11px] text-slate-400">{item.muscle}</span>
                    </div>
                    <div className="text-xs mt-1 flex items-center justify-between">
                      <span className="text-slate-400">
                        {exoDone ? "Terminé" : `Série ${exoNextSet}/${exoTotalSets}`}
                      </span>
                      {!exoDone && (
                        <span className="text-blue-300">
                          {nextSetPrescription?.reps} reps • {nextSetPrescription?.weight ? `${nextSetPrescription.weight}kg` : "charge libre"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {TECH_GUIDE_ENABLED && showGuidePopup && (
        <ExerciseGuideModal
          title={currentExercise.exercise}
          guide={getExerciseGuide(currentExercise.exercise, currentExercise.muscle)}
          onClose={() => setShowGuidePopup(false)}
        />
      )}
    </div>
  );
};
