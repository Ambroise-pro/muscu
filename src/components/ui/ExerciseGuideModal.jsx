import { BookOpen, Plus } from 'lucide-react';

export const ExerciseGuideModal = ({ title, guide, onClose }) => {
  if (!guide) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-700/50 rounded-xl shadow-2xl max-w-md md:max-w-lg w-full">
        <div className="flex items-center justify-between p-3 border-b border-slate-800">
          <div className="text-sm font-bold text-blue-200 flex items-center gap-2">
            <BookOpen size={16} /> Fiche technique • {title}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200" aria-label="Fermer">
            <Plus size={18} className="rotate-45" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-sm max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-xs uppercase tracking-wide text-blue-300 font-bold mb-1">Consignes</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-200">
              {guide.consignes.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-amber-300 font-bold mb-1">Erreurs fréquentes</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-200">
              {guide.erreurs.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-red-300 font-bold mb-1">Sécurité</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-200">
              {guide.securite.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs">
            <div className="text-slate-300"><span className="text-emerald-300 font-bold">Variante facile:</span> {guide.varianteFacile}</div>
            <div className="text-slate-300 mt-1"><span className="text-blue-300 font-bold">Variante plus difficile:</span> {guide.varianteDifficile}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
