import { useState } from 'react';
import { ArrowLeft, Calculator, Calendar, Dumbbell, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SESSION_GOALS } from '../../constants/exercises';

export const SessionHistory = ({ seances = [], onOpenSeance, deleteSeance, setView }) => {
  const ordered = [...seances].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleConfirmDelete = () => {
    deleteSeance(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-2">
        <button onClick={() => setView('menu')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Historique Séances</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {ordered.length === 0 ? (
          <div className="col-span-full text-center text-slate-500 py-10 italic">
            Aucune séance créée pour le moment.
          </div>
        ) : (
          ordered.map((seance) => {
            const rmCount = seance.rmCalcs?.length || 0;
            const workout = seance.workout;
            const itemsCount = workout?.items?.length || 0;

            return (
              <Card key={seance.id} className="relative overflow-hidden group">
                <button
                  onClick={() => onOpenSeance(seance.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2 pr-8">
                    <div className="text-accent text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <Calendar size={12} /> {new Date(seance.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calculator size={14} className="text-accent shrink-0" />
                      {rmCount > 0 ? `${rmCount} calcul${rmCount > 1 ? 's' : ''} 1RM` : "Aucun calcul 1RM"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Dumbbell size={14} className="text-emerald-400 shrink-0" />
                      {workout?.completedAt
                        ? `Entraînement loggé (${SESSION_GOALS[workout.settings?.goal]?.label || "Séance"})`
                        : itemsCount > 0
                          ? `Programme prêt (${itemsCount} exercice${itemsCount > 1 ? 's' : ''})`
                          : "Aucun entraînement programmé"}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPendingDeleteId(seance.id)}
                  className="absolute top-3 right-3 text-slate-600 hover:text-red-400 p-1"
                  aria-label="Supprimer ce dossier"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })
        )}
      </div>

      {pendingDeleteId !== null && (
        <ConfirmDialog
          title="Supprimer ce dossier de séance ?"
          message="Le dossier, ses calculs 1RM et son programme d'entraînement seront définitivement supprimés."
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
};
