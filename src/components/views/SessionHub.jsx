import { ArrowLeft, Calculator, CheckCircle, Dumbbell, ListChecks } from 'lucide-react';

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

export const SessionHub = ({ setView, activeSeance }) => {
  const rmCount = activeSeance?.rmCalcs?.length || 0;
  const workout = activeSeance?.workout;
  const itemsCount = workout?.items?.length || 0;

  let workoutStatus = "Aucun programme d'entraînement.";
  if (workout?.completedAt) {
    workoutStatus = `Entraînement loggé le ${new Date(workout.completedAt).toLocaleDateString('fr-FR')}.`;
  } else if (itemsCount > 0) {
    workoutStatus = `Programme prêt (${itemsCount} exercice${itemsCount > 1 ? 's' : ''}).`;
  }

  return (
    <div className="space-y-5 animate-fade-in pt-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('menu')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Nouvelle séance</h2>
      </div>

      {activeSeance && (
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl2 p-4 space-y-2">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">
            Dossier créé le {new Date(activeSeance.createdAt).toLocaleDateString('fr-FR')}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <ListChecks size={14} className="text-accent shrink-0" />
            {rmCount > 0 ? `${rmCount} calcul${rmCount > 1 ? 's' : ''} 1RM enregistré${rmCount > 1 ? 's' : ''}.` : "Aucun calcul 1RM enregistré."}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle size={14} className="text-emerald-400 shrink-0" />
            {workoutStatus}
          </div>
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
          title={itemsCount > 0 ? "Modifier l'entraînement" : "Programmer l'entraînement"}
          desc="Construire le programme d'exercices et lancer le chrono."
          onClick={() => setView('session_builder')}
          tint={{ bg: "bg-emerald-500/15", text: "text-emerald-400" }}
        />
      </div>
    </div>
  );
};
