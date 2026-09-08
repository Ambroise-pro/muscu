import {
  Activity, AlertTriangle, Calendar, Download, History, Upload
} from 'lucide-react';

const BACKUP_REMINDER_DAYS = 7;

const PrimaryAction = ({ icon, title, desc, onClick, disabled, tint }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-slate-800/90 border border-slate-700/80 p-5 rounded-xl2 transition-all text-left shadow-card relative overflow-hidden group ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-600 active:scale-[0.99]"
    }`}
  >
    <div className={`${tint.bg} w-11 h-11 rounded-lg flex items-center justify-center ${tint.text} mb-3`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white">{title}</h3>
    <p className="text-slate-400 text-xs mt-1">{desc}</p>
  </button>
);

const SecondaryAction = ({ icon, title, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl py-4 text-center transition-all ${
      disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-800 active:scale-[0.98]"
    }`}
  >
    <span className="text-slate-300">{icon}</span>
    <span className="text-slate-300 text-xs font-semibold">{title}</span>
  </button>
);

export const MainMenu = ({ savedRMs, seances = [], setView, onCreateSeance, onExportData, onImportData, lastExportAt, safetyAccepted }) => {
  const locked = !safetyAccepted;
  const rmEntries = Object.entries(savedRMs || {});
  const lastSeance = seances[0];

  const daysSinceExport = lastExportAt
    ? Math.floor((Date.now() - new Date(lastExportAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const backupStale = daysSinceExport === null || daysSinceExport >= BACKUP_REMINDER_DAYS;

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl2 p-4">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">1RM enregistrés</div>
          <div className="text-2xl font-black text-white">{rmEntries.length}</div>
          {rmEntries.length > 0 && (
            <div className="text-slate-500 text-[11px] mt-1 truncate">
              Dernier : {rmEntries[rmEntries.length - 1][0]}
            </div>
          )}
        </div>
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-xl2 p-4">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Séances créées</div>
          <div className="text-2xl font-black text-white">{seances.length}</div>
          {lastSeance && (
            <div className="text-slate-500 text-[11px] mt-1">
              {new Date(lastSeance.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <PrimaryAction
          icon={<Activity size={20} />}
          title="Nouvelle séance"
          desc="Calculer un 1RM et/ou programmer un entraînement."
          onClick={onCreateSeance}
          disabled={locked}
          tint={{ bg: "bg-emerald-500/15", text: "text-emerald-400" }}
        />
      </div>

      <div className="grid grid-cols-1">
        <SecondaryAction
          icon={<Calendar size={18} />}
          title="Historique"
          onClick={() => setView('history')}
          disabled={locked}
        />
      </div>

      <div className={`bg-slate-800/60 border rounded-xl2 p-4 ${locked ? "opacity-50 border-slate-700/60" : backupStale ? "border-amber-600/60" : "border-slate-700/60"}`}>
        <div className="text-sm font-bold text-white mb-1">Sauvegarde &amp; restauration</div>
        <p className="text-slate-400 text-xs mb-3">
          Exportez un fichier et importez-le sur une autre tablette (ajout sans écraser).
        </p>

        {!locked && (
          <div className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 mb-3 ${
            backupStale ? "bg-amber-900/30 border border-amber-600/50 text-amber-200" : "bg-slate-900/60 text-slate-400"
          }`}>
            {backupStale && <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
            {lastExportAt ? (
              <span>
                Dernière sauvegarde le {new Date(lastExportAt).toLocaleDateString('fr-FR')}
                {backupStale && ` (il y a ${daysSinceExport} jours) — pensez à en refaire une avant le prochain cours.`}
              </span>
            ) : (
              <span>Aucune sauvegarde effectuée pour l'instant — pensez à exporter avant le prochain cours.</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportData}
            disabled={locked}
            className={`flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg py-2 text-sm font-bold text-slate-200 ${
              locked ? "cursor-not-allowed" : "hover:bg-slate-800"
            }`}
          >
            <Download size={14} /> Exporter
          </button>
          <button
            onClick={onImportData}
            disabled={locked}
            className={`flex items-center justify-center gap-1.5 bg-accent rounded-lg py-2 text-sm font-bold text-white ${
              locked ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-dark"
            }`}
          >
            <Upload size={14} /> Importer
          </button>
        </div>
      </div>

      {rmEntries.length === 0 && seances.length === 0 && !locked && (
        <div className="flex items-start gap-2 text-slate-500 text-xs px-1">
          <History size={14} className="mt-0.5 shrink-0" />
          Aucune donnée pour l'instant : lancez une nouvelle séance pour commencer.
        </div>
      )}
    </div>
  );
};
