import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({ title, message, confirmLabel = "Supprimer", onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-red-700/50 rounded-xl2 shadow-pop max-w-sm w-full p-5 space-y-4">
      <div className="flex items-center gap-2 text-red-300">
        <AlertTriangle size={20} />
        <h3 className="font-bold text-lg text-white">{title}</h3>
      </div>
      {message && <p className="text-slate-400 text-sm">{message}</p>}
      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg py-2.5 font-bold text-sm"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-lg py-2.5 font-bold text-sm"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);
