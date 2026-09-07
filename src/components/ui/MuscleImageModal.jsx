import { Plus } from 'lucide-react';
import { getMuscleImage } from '../../utils/format';

export const MuscleImageModal = ({ muscle, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={onClose}
        className="absolute -top-11 right-0 text-slate-300 hover:text-white bg-slate-800/80 rounded-full p-2"
        aria-label="Fermer"
      >
        <Plus size={22} className="rotate-45" />
      </button>
      <img
        src={getMuscleImage(muscle)}
        alt={muscle}
        className="w-full h-auto rounded-xl2 border border-slate-700 bg-slate-900"
      />
      <div className="text-center text-white font-bold mt-3 text-lg">{muscle}</div>
    </div>
  </div>
);
