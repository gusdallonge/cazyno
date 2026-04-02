import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { User, Mail, Lock, AlertTriangle, GamepadIcon, TrendingUp, Calendar } from 'lucide-react';

function fmt(n) { return Number(parseFloat(n || 0)).toLocaleString('fr-FR'); }

export default function Profile() {
  const { credits, xp, totalWagered, gamesPlayed } = useOutletContext();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initial = (user?.full_name || user?.email || '?')[0].toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const handleSaveProfile = () => {
    localStorage.setItem('cazyno_display_name', displayName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Profile header block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">Mon Profil</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Gerez votre compte</span>
        </div>
        <div className="px-5 py-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,231,1,0.1)', border: '2px solid rgba(0,231,1,0.3)' }}>
            <User className="w-10 h-10" style={{color:'#00e701'}} />
          </div>
          <div className="flex-1">
            <h2 className="font-orbitron text-xl font-bold text-white">{user?.full_name || 'Joueur'}</h2>
            <p className="text-sm" style={{color:'#94a3b8'}}>{user?.email}</p>
            <p className="text-xs mt-1" style={{color:'#94a3b8'}}>Membre depuis {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Parties jouees', value: gamesPlayed || 0, icon: GamepadIcon, color: '#3b82f6' },
          { label: 'Total mise', value: `${fmt(totalWagered)} EUR`, icon: TrendingUp, color: '#00e701' },
          { label: 'XP total', value: fmt(xp), icon: Calendar, color: '#eab308' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <Icon className="w-5 h-5 mx-auto mb-2" style={{color}} />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{label}</p>
            <p className="font-orbitron font-bold text-white text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Edit display name block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Informations personnelles</h2>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{color:'#4b5c6f'}}>Nom d'affichage</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              style={{background:'#111a25', border:'1px solid #1a2a38'}} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{color:'#4b5c6f'}}>Email</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" style={{color:'#94a3b8'}} />
              <input value={user?.email || ''} readOnly
                className="w-full rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}} />
            </div>
          </div>
          <button onClick={handleSaveProfile}
            className="rounded-xl font-bold px-6 py-2.5 font-orbitron text-xs"
            style={{background:'#00e701', color:'#000'}}>
            {saved ? 'Sauvegarde !' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Password change block */}
      <form onSubmit={handleChangePassword}>
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Changer le mot de passe</h2>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            {[
              { label: 'Mot de passe actuel', val: currentPassword, set: setCurrentPassword },
              { label: 'Nouveau mot de passe', val: newPassword, set: setNewPassword },
              { label: 'Confirmer le mot de passe', val: confirmPassword, set: setConfirmPassword },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{color:'#4b5c6f'}}>{label}</label>
                <input type="password" value={val} onChange={e => set(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  style={{background:'#111a25', border:'1px solid #1a2a38'}} />
              </div>
            ))}
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs" style={{color:'#ef4444'}}>Les mots de passe ne correspondent pas</p>
            )}
            <button type="submit"
              className="rounded-xl px-6 py-2.5 font-orbitron font-bold text-xs transition"
              style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
              Mettre a jour
            </button>
          </div>
        </div>
      </form>

      {/* Danger zone block */}
      <div className="rounded-2xl" style={{background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid rgba(239,68,68,0.15)'}}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{color:'#ef4444'}} />
            <h2 className="font-orbitron font-black text-sm" style={{color:'#ef4444'}}>Zone dangereuse</h2>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-xs" style={{color:'#94a3b8'}}>
            La suppression de votre compte est irreversible. Toutes vos donnees seront perdues.
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2.5 font-orbitron font-bold text-xs rounded-xl transition-all"
              style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444'}}>
              Supprimer mon compte
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2 rounded-xl text-xs"
                style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>Annuler</button>
              <button className="px-5 py-2 rounded-xl font-orbitron font-bold text-xs transition-all"
                style={{background:'#ef4444', color:'#fff'}}>
                Confirmer la suppression
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
