import { useState } from 'react';
import { Edit2, Plus, Trash2, Upload, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const ProfileSelect = ({ profiles = [], onSelect, onCreate, onRename, onDelete, onImportProfile }) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const ordered = [...profiles].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const submitCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setCreating(false);
  };

  const startRename = (profile) => {
    setRenamingId(profile.id);
    setRenameValue(profile.name);
  };

  const submitRename = (id) => {
    if (!renameValue.trim()) return;
    onRename(id, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-6">
      <div className="text-center space-y-1">
        <div className="bg-accent/15 text-accent w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <User size={26} />
        </div>
        <h1 className="text-2xl font-black text-white">Qui es-tu ?</h1>
        <p className="text-slate-400 text-sm">Choisis ton profil pour retrouver tes séances.</p>
      </div>

      <div className="grid gap-3">
        {ordered.map((profile) => (
          <Card key={profile.id}>
            {renamingId === profile.id ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitRename(profile.id)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white outline-none"
                />
                <button onClick={() => submitRename(profile.id)} className="bg-accent text-white rounded-lg px-3 text-sm font-bold">
                  OK
                </button>
                <button onClick={() => setRenamingId(null)} className="text-slate-400 px-2 text-sm">
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => onSelect(profile.id)} className="flex-1 flex items-center gap-3 text-left">
                  <span className="bg-accent/15 text-accent w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase shrink-0">
                    {profile.name.charAt(0)}
                  </span>
                  <span className="font-bold text-white">{profile.name}</span>
                </button>
                <button
                  onClick={() => startRename(profile)}
                  className="text-slate-500 hover:text-white p-1"
                  aria-label={`Renommer ${profile.name}`}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setPendingDeleteId(profile.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                  aria-label={`Supprimer ${profile.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {creating ? (
        <Card>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Prénom"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"
          />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => { setCreating(false); setNewName(''); }}
              className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg py-2.5 text-sm font-bold"
            >
              Annuler
            </button>
            <button
              onClick={submitCreate}
              className="bg-accent hover:bg-accent-dark text-white rounded-lg py-2.5 text-sm font-bold"
            >
              Créer
            </button>
          </div>
        </Card>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-600 text-slate-300 hover:border-accent hover:text-accent rounded-xl2 py-4 font-bold transition-colors"
        >
          <Plus size={18} /> Nouveau profil
        </button>
      )}

      {onImportProfile && (
        <div className="text-center pt-2">
          <button
            onClick={onImportProfile}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-accent text-sm font-semibold"
          >
            <Upload size={14} /> Tablette oubliée ? Importer mon profil
          </button>
        </div>
      )}

      {pendingDeleteId !== null && (
        <ConfirmDialog
          title="Supprimer ce profil ?"
          message="Toutes ses données (calculs 1RM, séances) seront définitivement supprimées."
          onConfirm={() => {
            onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
};
