import { useState, useEffect, useRef } from 'react';
import { Dumbbell, PersonStanding, Plus, Shield } from 'lucide-react';
import { SAFETY_TITLE, SAFETY_SECTIONS, SAFETY_SECTION_ICONS, SAFETY_SUBSECTION_ICONS } from './constants/safety';
import { MainMenu } from './components/views/MainMenu';
import { SessionHub } from './components/views/SessionHub';
import { RMCalculator } from './components/views/RMCalculator';
import { SessionBuilder } from './components/views/SessionBuilder';
import { ActiveSessionPlayer } from './components/views/ActiveSessionPlayer';
import { SessionHistory } from './components/views/SessionHistory';
import { ProgressDashboard } from './components/views/ProgressDashboard';

export default function App() {
  const [view, setView] = useState('menu');
  const [savedRMs, setSavedRMs] = useState({});
  const [history, setHistory] = useState([]); // Historique Calculs RM
  const [sessionHistory, setSessionHistory] = useState([]); // Historique Séances
  const [sessionItems, setSessionItems] = useState([]);
  const [sessionSettings, setSessionSettings] = useState({ goal: 'volume', restTime: 90 });
  const [toast, setToast] = useState(null);
  const [showGroupsPopup, setShowGroupsPopup] = useState(false);
  const [showSafetyPopup, setShowSafetyPopup] = useState(false);
  const [safetyAccepted, setSafetyAccepted] = useState(() => {
    try {
      return localStorage.getItem('muscu_safety_ack') === '1';
    } catch (e) {
      return false;
    }
  });
  const fileInputRef = useRef(null);

  // Chargement sécurisé
  useEffect(() => {
    try {
      const rms = localStorage.getItem('muscu_rms');
      if (rms) setSavedRMs(JSON.parse(rms));

      const hist = localStorage.getItem('muscu_history');
      if (hist) setHistory(JSON.parse(hist));

      const sessHist = localStorage.getItem('muscu_sessions');
      if (sessHist) setSessionHistory(JSON.parse(sessHist));
    } catch (e) {
      console.error("Erreur lecture données", e);
    }
  }, []);

  useEffect(() => {
    if (!safetyAccepted) setShowSafetyPopup(true);
  }, [safetyAccepted]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveRM = (exercise, weight, meta) => {
    const newRMs = { ...savedRMs, [exercise]: parseFloat(weight) };
    setSavedRMs(newRMs);
    localStorage.setItem('muscu_rms', JSON.stringify(newRMs));

    if (meta) {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        exercise,
        rmResult: parseFloat(weight),
        ...meta
      };
      const newHistory = [entry, ...history];
      setHistory(newHistory);
      localStorage.setItem('muscu_history', JSON.stringify(newHistory));
    }
    showToast(`Saved: ${exercise}`);
  };

  const deleteRM = (key) => {
    const next = { ...savedRMs };
    delete next[key];
    setSavedRMs(next);
    localStorage.setItem('muscu_rms', JSON.stringify(next));
  };

  const deleteHistoryItem = (id) => {
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    localStorage.setItem('muscu_history', JSON.stringify(next));
  };

  const saveSession = (exercises, settings, logs) => {
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      goal: settings.goal,
      exercises: exercises,
      logs: logs
    };
    const newHistory = [newSession, ...sessionHistory];
    setSessionHistory(newHistory);
    localStorage.setItem('muscu_sessions', JSON.stringify(newHistory));
  };

  const deleteSession = (id) => {
    const newHistory = sessionHistory.filter(s => s.id !== id);
    setSessionHistory(newHistory);
    localStorage.setItem('muscu_sessions', JSON.stringify(newHistory));
  };

  const handleExportData = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      savedRMs,
      history,
      sessionHistory
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateTag = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `muscu-backup-${dateTag}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Sauvegarde exportée.");
  };

  const mergeById = (current, incoming) => {
    const map = new Map(current.map((item) => [item.id, item]));
    incoming.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const incomingSavedRMs = parsed.savedRMs || parsed.payload?.savedRMs || {};
        const incomingHistory = parsed.history || parsed.payload?.history || [];
        const incomingSessions = parsed.sessionHistory || parsed.payload?.sessionHistory || [];

        const mergedRMs = { ...incomingSavedRMs, ...savedRMs };
        const mergedHistory = mergeById(history, incomingHistory);
        const mergedSessions = mergeById(sessionHistory, incomingSessions);

        setSavedRMs(mergedRMs);
        setHistory(mergedHistory);
        setSessionHistory(mergedSessions);
        localStorage.setItem('muscu_rms', JSON.stringify(mergedRMs));
        localStorage.setItem('muscu_history', JSON.stringify(mergedHistory));
        localStorage.setItem('muscu_sessions', JSON.stringify(mergedSessions));
        showToast("Sauvegarde importée (ajoutée).");
      } catch (err) {
        console.error("Import invalide", err);
        showToast("Fichier invalide.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleImportData = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSafetyAccept = () => {
    setSafetyAccepted(true);
    localStorage.setItem('muscu_safety_ack', '1');
    setShowSafetyPopup(false);
    showToast("Règles de sécurité validées.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-accent/30">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto min-h-screen flex flex-col relative">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 bg-slate-950/90 backdrop-blur border-b border-slate-800/80">
          <button
            onClick={() => setView('menu')}
            className="flex items-center gap-2 text-left"
            aria-label="Retour au menu principal"
          >
            <span className="bg-accent/15 text-accent w-8 h-8 rounded-lg flex items-center justify-center">
              <Dumbbell size={18} />
            </span>
            <span className="font-black text-white tracking-tight">MuscuTracker</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSafetyPopup(true)}
              className="bg-amber-700/20 hover:bg-amber-700/30 border border-amber-600/50 w-9 h-9 rounded-full text-amber-300 flex items-center justify-center shrink-0"
              aria-label="Voir l'apparté sécurité"
            >
              <Shield size={16} />
            </button>
            <button
              onClick={() => setShowGroupsPopup(true)}
              disabled={!safetyAccepted}
              className={`bg-slate-800 border border-slate-700 w-9 h-9 rounded-full text-accent flex items-center justify-center shrink-0 ${
                safetyAccepted ? "hover:bg-slate-700" : "opacity-40 cursor-not-allowed"
              }`}
              aria-label="Voir les groupes musculaires"
            >
              <PersonStanding size={16} />
            </button>
          </div>
        </header>

        <div className="p-4 flex flex-col flex-1">
        {view === 'menu' && (
          <MainMenu
            savedRMs={savedRMs}
            sessionHistory={sessionHistory}
            setView={setView}
            onExportData={handleExportData}
            onImportData={handleImportData}
            safetyAccepted={safetyAccepted}
          />
        )}

        {view === 'session_hub' && (
          <SessionHub setView={setView} />
        )}

        {view === 'calculator' && (
          <RMCalculator
            savedRMs={savedRMs} saveRM={saveRM} deleteRM={deleteRM}
            history={history} deleteHistoryItem={deleteHistoryItem} setView={setView}
          />
        )}

        {view === 'session_builder' && (
          <SessionBuilder
            savedRMs={savedRMs} history={history} sessionItems={sessionItems} setSessionItems={setSessionItems}
            sessionSettings={sessionSettings} setSessionSettings={setSessionSettings} setView={setView}
          />
        )}

        {view === 'active_session' && (
          <ActiveSessionPlayer
            sessionItems={sessionItems}
            sessionSettings={sessionSettings}
            setView={setView}
            onSessionComplete={saveSession}
          />
        )}

        {view === 'history' && (
          <SessionHistory
            sessionHistory={sessionHistory}
            rmHistory={history}
            deleteSession={deleteSession}
            deleteHistoryItem={deleteHistoryItem}
            setView={setView}
          />
        )}

        {view === 'progress' && (
          <ProgressDashboard
            history={history}
            sessionHistory={sessionHistory}
            setView={setView}
          />
        )}

        </div>

        {showGroupsPopup && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md md:max-w-2xl w-full">
              <div className="flex items-center justify-between p-3 border-b border-slate-800">
                <div className="text-sm font-bold text-slate-200">Groupes musculaires</div>
                <button
                  onClick={() => setShowGroupsPopup(false)}
                  className="text-slate-500 hover:text-slate-200"
                  aria-label="Fermer"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>
              <div className="p-3">
                <img
                  src={`${import.meta.env.BASE_URL}groupes.jpg`}
                  alt="Groupes musculaires"
                  className="w-full h-auto rounded-lg border border-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {showSafetyPopup && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-700/50 rounded-xl shadow-2xl max-w-md md:max-w-2xl w-full">
              <div className="flex items-center justify-between p-3 border-b border-slate-800">
                <div className="text-sm font-bold text-amber-200">Apparté sécurité</div>
                <button
                  onClick={() => setShowSafetyPopup(false)}
                  className="text-slate-500 hover:text-slate-200"
                  aria-label="Fermer"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4 text-sm">
                <div className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">
                  {SAFETY_TITLE}
                </div>
                {SAFETY_SECTIONS.map((section) => (
                  <div key={section.heading} className="space-y-2">
                    <div className="text-amber-200 font-bold text-xs uppercase flex items-center gap-2">
                      <span className="text-amber-300">
                        {SAFETY_SECTION_ICONS[section.heading]}
                      </span>
                      {section.heading}
                    </div>
                    {section.items && (
                      <ul className="list-disc pl-4 space-y-1 text-slate-200 text-[13px]">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {section.subsections && (
                      <div className="space-y-3">
                        {section.subsections.map((sub) => (
                          <div key={sub.heading} className="space-y-1">
                            <div className="text-slate-300 font-semibold text-[13px] flex items-center gap-2">
                              <span className="text-slate-400">
                                {SAFETY_SUBSECTION_ICONS[sub.heading]}
                              </span>
                              {sub.heading}
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-slate-200 text-[13px]">
                              {sub.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 p-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {safetyAccepted ? "Règles déjà validées." : "Validez pour activer l'application."}
                </div>
                <button
                  onClick={handleSafetyAccept}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-full"
                >
                  J'ai lu et je valide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-3 rounded-full shadow-pop z-50 animate-bounce-in font-medium text-sm whitespace-nowrap">
            {toast}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes bounceIn { 0% { transform: translate(-50%, 20px); opacity: 0; } 50% { transform: translate(-50%, -5px); opacity: 1; } 100% { transform: translate(-50%, 0); } }
        .animate-bounce-in { animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
}
