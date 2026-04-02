import { useState, useEffect, useRef } from 'react';
import {
  Shield, Users, Search, Ban, CheckCircle, RefreshCw,
  TrendingUp, DollarSign, Snowflake, Ticket, Send,
  MessageSquare, ChevronRight, ArrowUpCircle, ArrowDownCircle,
  Activity, X, Clock, AlertCircle
} from 'lucide-react';
import { api } from '@/api';

/* --- Small components --- */

function StatCard({ icon: Icon, label, value, color = '#00e701' }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <Icon className="w-5 h-5" style={{color}} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{label}</p>
        <p className="font-orbitron font-black text-lg" style={{color}}>{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    open: { label: 'Ouvert', bg: 'rgba(234,179,8,0.1)', color: '#eab308', border: 'rgba(234,179,8,0.2)' },
    in_progress: { label: 'En cours', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
    resolved: { label: 'Resolu', bg: 'rgba(0,231,1,0.1)', color: '#00e701', border: 'rgba(0,231,1,0.2)' },
  };
  const { label, bg, color, border } = map[status] || map.open;
  return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:bg, color, border:`1px solid ${border}`}}>{label}</span>;
}

/* --- Main page --- */

export default function Admin() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  const [appUsers, setAppUsers] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [rounds, setRounds] = useState([]);
  const [roundsSearch, setRoundsSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(100);
  const [adminNote, setAdminNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [log, setLog] = useState([]);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyInput, setReplyInput] = useState('');
  const ticketPollRef = useRef(null);
  const ticketBottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await api.auth.me();
        if (user.role === 'admin') {
          setAuthorized(true);
          await Promise.all([loadUsers(), loadTickets()]);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const loadRounds = async () => {
    const data = await api.entities.GameRound.list('-created_date', 500);
    setRounds(data);
  };

  useEffect(() => {
    if (tab === 'tickets') {
      loadTickets();
      ticketPollRef.current = setInterval(loadTickets, 5000);
    } else {
      clearInterval(ticketPollRef.current);
    }
    return () => clearInterval(ticketPollRef.current);
  }, [tab]);

  useEffect(() => {
    ticketBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  const loadUsers = async () => {
    setRefreshing(true);
    const profiles = await api.entities.UserProfile.list('-updated_date', 200);
    setUsers(profiles);
    setSelected(prev => prev ? profiles.find(u => u.id === prev.id) || prev : prev);
    setRefreshing(false);
  };

  const loadTickets = async () => {
    const tks = await api.entities.SupportTicket.list('-created_date', 100);
    setTickets(tks);
    setSelectedTicket(prev => prev ? tks.find(t => t.id === prev.id) || prev : prev);
  };

  useEffect(() => {
    if ((tab === 'history' || tab === 'revenue') && authorized) loadRounds();
  }, [tab, authorized]);

  useEffect(() => {
    if (tab === 'admins' && authorized) loadAppUsers();
  }, [tab, authorized]);

  const loadAppUsers = async () => {
    const list = await api.entities.User.list();
    setAppUsers(list);
  };

  const toggleAdminRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    await api.entities.User.update(u.id, { role: newRole });
    setAppUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    addLog(`Role change -> ${u.email} : ${newRole}`);
  };

  const addLog = (msg) => setLog(l => [`${new Date().toLocaleTimeString('fr-FR')} -- ${msg}`, ...l.slice(0, 49)]);

  const selectUser = (u) => { setSelected(u); setAdminNote(u.admin_notes || ''); };

  const adjustCredits = async (delta) => {
    if (!selected) return;
    const newCredits = parseFloat(Math.max(0, (selected.credits || 0) + delta).toFixed(2));
    await api.entities.UserProfile.update(selected.id, { credits: newCredits });
    addLog(`Credits : ${delta > 0 ? '+' : ''}${delta} EUR -> ${selected.user_email}`);
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, credits: newCredits } : u));
    setSelected(s => ({ ...s, credits: newCredits }));
  };

  const toggleBan = async () => {
    if (!selected) return;
    const val = !selected.is_banned;
    await api.entities.UserProfile.update(selected.id, { is_banned: val });
    addLog(`${val ? 'Bannissement' : 'Debannissement'} -- ${selected.user_email}`);
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, is_banned: val } : u));
    setSelected(s => ({ ...s, is_banned: val }));
  };

  const toggleFreeze = async () => {
    if (!selected) return;
    const val = !selected.is_frozen;
    await api.entities.UserProfile.update(selected.id, { is_frozen: val });
    addLog(`${val ? 'Gel des retraits' : 'Degel'} -- ${selected.user_email}`);
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, is_frozen: val } : u));
    setSelected(s => ({ ...s, is_frozen: val }));
  };

  const saveNote = async () => {
    if (!selected) return;
    await api.entities.UserProfile.update(selected.id, { admin_notes: adminNote });
    addLog(`Note enregistree -- ${selected.user_email}`);
  };

  const sendEmail = async () => {
    if (!selected || !emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    await api.integrations.Core.SendEmail({
      to: selected.user_email,
      subject: emailSubject,
      body: emailBody,
    });
    setEmailSending(false);
    setEmailSent(true);
    addLog(`Email envoye -> ${selected.user_email} : "${emailSubject}"`);
    setTimeout(() => { setEmailSent(false); setShowEmailModal(false); setEmailSubject(''); setEmailBody(''); }, 2000);
  };

  const replyToTicket = async () => {
    if (!selectedTicket || !replyInput.trim()) return;
    const msg = { role: 'admin', content: replyInput.trim(), date: new Date().toISOString(), sender: 'Admin' };
    const updated = [...(selectedTicket.messages || []), msg];
    await api.entities.SupportTicket.update(selectedTicket.id, { messages: updated, status: 'in_progress' });
    setSelectedTicket(s => ({ ...s, messages: updated, status: 'in_progress' }));
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, messages: updated, status: 'in_progress' } : t));
    setReplyInput('');
    addLog(`Reponse envoyee -> ${selectedTicket.user_email}`);
  };

  const resolveTicket = async () => {
    if (!selectedTicket) return;
    await api.entities.SupportTicket.update(selectedTicket.id, { status: 'resolved' });
    setSelectedTicket(s => ({ ...s, status: 'resolved' }));
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t));
    addLog(`Ticket resolu -- ${selectedTicket.user_email}`);
  };

  const filtered = users.filter(u =>
    (u.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.user_name || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalCredits = users.reduce((s, u) => s + (u.credits || 0), 0);
  const totalWagered = users.reduce((s, u) => s + (u.total_wagered || 0), 0);
  const openTickets = tickets.filter(t => t.status !== 'resolved').length;

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{borderColor:'rgba(0,231,1,0.3)', borderTopColor:'#00e701'}} />
    </div>
  );

  if (!authorized) return (
    <div className="max-w-sm mx-auto pt-24 text-center space-y-4 fade-up">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)'}}>
        <Shield className="w-8 h-8" style={{color:'#ef4444'}} />
      </div>
      <h1 className="font-orbitron text-2xl font-black" style={{color:'#ef4444'}}>Acces refuse</h1>
      <p className="text-sm" style={{color:'#94a3b8'}}>Reserve aux administrateurs.</p>
    </div>
  );

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Header */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:'rgba(0,231,1,0.15)', border:'1px solid rgba(0,231,1,0.3)'}}>
              <Shield className="w-6 h-6" style={{color:'#00e701'}} />
            </div>
            <div>
              <h1 className="font-orbitron text-xl font-black" style={{color:'#00e701'}}>Admin Panel</h1>
              <p className="text-xs" style={{color:'#94a3b8'}}>{users.length} utilisateurs - {openTickets} ticket(s) ouvert(s)</p>
            </div>
          </div>
          <button onClick={() => { loadUsers(); loadTickets(); }} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Utilisateurs" value={users.length} color="#3b82f6" />
        <StatCard icon={DollarSign} label="Credits en jeu" value={`${totalCredits.toLocaleString('fr-FR')} EUR`} color="#00e701" />
        <StatCard icon={TrendingUp} label="Total mise" value={`${totalWagered.toFixed(0)} EUR`} color="#eab308" />
        <StatCard icon={Ticket} label="Tickets ouverts" value={openTickets} color={openTickets > 0 ? '#f97316' : '#00e701'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{borderBottom:'1px solid #1a2a38'}}>
        {[
          { id: 'users', label: 'Utilisateurs', count: null },
          { id: 'tickets', label: 'Tickets', count: openTickets > 0 ? openTickets : null },
          { id: 'admins', label: 'Admins', count: null },
          { id: 'revenue', label: 'Revenus', count: null },
          { id: 'history', label: 'Historique', count: null },
          { id: 'activity', label: 'Journal', count: null },
        ].map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all rounded-t-xl"
            style={tab === id
              ? { background:'#111a25', border:'1px solid #1a2a38', borderBottom:'1px solid #111a25', color:'#fff', marginBottom:'-1px', zIndex:10 }
              : { color:'#94a3b8', border:'1px solid transparent' }}>
            {label}
            {count !== null && <span className="text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center" style={{background:'#f97316', color:'#000'}}>{count}</span>}
          </button>
        ))}
      </div>

      {/* ====== USERS TAB ====== */}
      {tab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-2xl p-4 flex flex-col gap-3" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
              <Search className="w-4 h-4 shrink-0" style={{color:'#94a3b8'}} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-white placeholder:text-[#94a3b8]" />
              {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{color:'#94a3b8'}} /></button>}
            </div>
            <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
              {filtered.map(u => (
                <button key={u.id} onClick={() => selectUser(u)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={selected?.id === u.id
                    ? { border:'2px solid #00e701', background:'rgba(0,231,1,0.08)' }
                    : { border:'2px solid transparent', background:'#111a25' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{background:'rgba(0,231,1,0.15)', color:'#00e701'}}>
                    {(u.user_name || u.user_email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold text-sm truncate ${u.is_banned ? 'line-through opacity-50' : ''}`} style={{color:'#fff'}}>
                      {u.user_name || u.user_email}
                    </p>
                    <p className="text-[11px] truncate" style={{color:'#94a3b8'}}>{u.user_email}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className="font-orbitron font-bold text-xs" style={{color:'#00e701'}}>{(u.credits || 0).toLocaleString()} EUR</span>
                    <div className="flex gap-1">
                      {u.is_banned && <span className="text-[10px] px-1.5 rounded-full" style={{background:'rgba(239,68,68,0.15)', color:'#ef4444'}}>Banni</span>}
                      {u.is_frozen && <span className="text-[10px] px-1.5 rounded-full" style={{background:'rgba(59,130,246,0.15)', color:'#3b82f6'}}>Gele</span>}
                    </div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="text-center py-10 text-sm" style={{color:'#94a3b8'}}>Aucun resultat</div>}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" style={{color:'#00e701'}} />
                      <h2 className="font-orbitron font-black text-white text-sm">{selected.user_name || 'Sans nom'}</h2>
                      {selected.is_banned && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)'}}>Banni</span>}
                      {selected.is_frozen && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(59,130,246,0.1)', color:'#3b82f6', border:'1px solid rgba(59,130,246,0.2)'}}>Retraits bloques</span>}
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-sm mb-1" style={{color:'#94a3b8'}}>{selected.user_email}</p>
                    {selected.last_seen && (
                      <p className="text-xs flex items-center gap-1" style={{color:'#94a3b8'}}>
                        <Clock className="w-3 h-3" /> Derniere activite : {new Date(selected.last_seen).toLocaleString('fr-FR')}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap mt-4">
                      <button onClick={() => { setShowEmailModal(true); setEmailSent(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
                        <Send className="w-4 h-4" /> Envoyer un email
                      </button>
                      <button onClick={toggleFreeze}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={selected.is_frozen
                          ? {background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.4)', color:'#3b82f6'}
                          : {background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
                        <Snowflake className="w-4 h-4" />
                        {selected.is_frozen ? 'Degeler les retraits' : 'Bloquer les retraits'}
                      </button>
                      <button onClick={toggleBan}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={selected.is_banned
                          ? {background:'rgba(0,231,1,0.1)', border:'1px solid rgba(0,231,1,0.4)', color:'#00e701'}
                          : {background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.4)', color:'#ef4444'}}>
                        {selected.is_banned ? <><CheckCircle className="w-4 h-4" /> Debannir</> : <><Ban className="w-4 h-4" /> Bannir</>}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-5">
                      {[
                        { label: 'Credits', value: `${(selected.credits || 0).toLocaleString('fr-FR')} EUR`, highlight: true },
                        { label: 'XP', value: (selected.xp || 0).toLocaleString('fr-FR') },
                        { label: 'Parties', value: selected.games_played || 0 },
                        { label: 'Total mise', value: `${(selected.total_wagered || 0).toFixed(0)} EUR` },
                        { label: 'Total gagne', value: `${(selected.total_won || 0).toFixed(0)} EUR` },
                        { label: 'Rakeback', value: `${(selected.rakeback || 0).toFixed(2)} EUR` },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="rounded-xl p-3 text-center"
                          style={highlight
                            ? { background:'rgba(0,231,1,0.08)', border:'1px solid rgba(0,231,1,0.2)' }
                            : { background:'#111a25', border:'1px solid #1a2a38' }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{label}</p>
                          <p className="font-orbitron font-bold text-sm" style={{color: highlight ? '#00e701' : '#fff'}}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {showEmailModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEmailModal(false)}>
                    <div className="rounded-2xl p-6 max-w-md w-full mx-4 space-y-4" style={{background:'#111a25', border:'1px solid #1a2a38'}} onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-orbitron font-bold text-base flex items-center gap-2"><Send className="w-4 h-4" style={{color:'#00e701'}} /> Email a {selected.user_name || selected.user_email}</h3>
                        <button onClick={() => setShowEmailModal(false)}><X className="w-4 h-4" style={{color:'#94a3b8'}} /></button>
                      </div>
                      <div className="text-xs rounded-xl px-3 py-2" style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>{selected.user_email}</div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Objet</label>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Ex : Offre exclusive pour vous !"
                          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white placeholder:text-[#94a3b8]"
                          style={{background:'#111a25', border:'1px solid #1a2a38'}} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Message</label>
                        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={5} placeholder="Bonjour, nous avons une offre speciale pour vous..."
                          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-white placeholder:text-[#94a3b8] resize-none"
                          style={{background:'#111a25', border:'1px solid #1a2a38'}} />
                      </div>
                      {emailSent ? (
                        <div className="rounded-xl py-3 text-center font-semibold text-sm" style={{ background: 'rgba(0,231,1,0.1)', border: '1px solid rgba(0,231,1,0.3)', color: '#00e701' }}>Email envoye avec succes !</div>
                      ) : (
                        <button onClick={sendEmail} disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                          className="w-full py-3 rounded-xl font-orbitron font-bold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                          style={{background:'#00e701', color:'#000'}}>
                          <Send className="w-4 h-4" /> {emailSending ? 'Envoi en cours...' : 'Envoyer'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" style={{color:'#00e701'}} />
                      <h2 className="font-orbitron font-black text-white text-sm">Ajuster les credits</h2>
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <div className="flex gap-2 flex-wrap mb-3">
                      {[50, 100, 500, 1000, 5000].map(v => (
                        <button key={v} onClick={() => setAdjustAmount(v)}
                          className="px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all"
                          style={adjustAmount === v
                            ? {background:'#00e701', color:'#000', border:'1px solid #00e701'}
                            : {background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
                          {v} EUR
                        </button>
                      ))}
                    </div>
                    <input type="number" min={1} value={adjustAmount}
                      onChange={e => setAdjustAmount(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full rounded-xl px-4 py-3 font-orbitron font-bold text-lg text-center focus:outline-none mb-3"
                      style={{background:'#111a25', border:'1px solid #1a2a38', color:'#00e701'}} />
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => adjustCredits(adjustAmount)}
                        className="rounded-xl font-bold py-3 font-orbitron text-sm flex items-center justify-center gap-2"
                        style={{background:'#00e701', color:'#000'}}>
                        <ArrowUpCircle className="w-4 h-4" /> + Crediter
                      </button>
                      <button onClick={() => adjustCredits(-adjustAmount)}
                        className="py-3 rounded-xl font-orbitron font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                        style={{border:'2px solid #ef4444', color:'#ef4444', background:'transparent'}}>
                        <ArrowDownCircle className="w-4 h-4" /> - Debiter
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5" style={{color:'#00e701'}} />
                      <h2 className="font-orbitron font-black text-white text-sm">Note interne</h2>
                    </div>
                  </div>
                  <div className="px-5 py-5">
                    <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                      placeholder="Ex : Joueur VIP, signalement fraude..."
                      className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none placeholder:text-[#94a3b8]"
                      style={{background:'#111a25', border:'1px solid #1a2a38'}} />
                    <button onClick={saveNote} className="rounded-xl font-bold mt-3 px-6 py-2.5 text-sm font-orbitron" style={{background:'#00e701', color:'#000'}}>
                      Enregistrer la note
                    </button>
                  </div>
                </div>

                {(selected.transactions || []).length > 0 && (
                  <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                    <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" style={{color:'#00e701'}} />
                        <h2 className="font-orbitron font-black text-white text-sm">Dernieres transactions</h2>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-1.5 max-h-52 overflow-y-auto">
                      {selected.transactions.slice(0, 25).map((tx, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl text-xs" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                          <span className="w-24 shrink-0" style={{color:'#94a3b8'}}>{new Date(tx.date).toLocaleDateString('fr-FR')}</span>
                          <span className="flex-1 text-white truncate px-2">{tx.label}</span>
                          <span className="font-orbitron font-bold shrink-0" style={{color: tx.type === 'deposit' ? '#00e701' : '#ef4444'}}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount} EUR
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl p-16 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <Users className="w-14 h-14 mx-auto mb-4 opacity-30" style={{color:'#94a3b8'}} />
                <p className="font-medium" style={{color:'#94a3b8'}}>Selectionne un utilisateur dans la liste</p>
                <p className="text-xs mt-1" style={{color:'#94a3b8'}}>Ses details et actions apparaitront ici.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====== ADMINS TAB ====== */}
      {tab === 'admins' && (
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Gestion des roles ({appUsers.length} comptes)</h2>
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
              <Search className="w-4 h-4 shrink-0" style={{color:'#94a3b8'}} />
              <input value={adminSearch} onChange={e => setAdminSearch(e.target.value)} placeholder="Rechercher..."
                className="w-40 bg-transparent text-sm focus:outline-none text-white placeholder:text-[#94a3b8]" />
            </div>
          </div>
          <div className="px-5 py-4 space-y-2 max-h-[560px] overflow-y-auto">
            {appUsers
              .filter(u => !adminSearch || u.email?.toLowerCase().includes(adminSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(adminSearch.toLowerCase()))
              .map(u => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{background:'rgba(0,231,1,0.15)', color:'#00e701'}}>
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{u.full_name || 'Sans nom'}</p>
                      <p className="text-xs truncate" style={{color:'#94a3b8'}}>{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={u.role === 'admin'
                        ? { background:'rgba(0,231,1,0.1)', color:'#00e701', border:'1px solid rgba(0,231,1,0.3)' }
                        : { background:'#111a25', color:'#94a3b8', border:'1px solid #1a2a38' }}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                    <button onClick={() => toggleAdminRole(u)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={u.role === 'admin'
                        ? { background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)' }
                        : { background:'rgba(0,231,1,0.1)', color:'#00e701', border:'1px solid rgba(0,231,1,0.3)' }}>
                      {u.role === 'admin' ? 'Retrograder' : 'Promouvoir admin'}
                    </button>
                  </div>
                </div>
              ))
            }
            {appUsers.length === 0 && <div className="text-center py-12 text-sm" style={{color:'#94a3b8'}}>Chargement...</div>}
          </div>
        </div>
      )}

      {/* ====== TICKETS TAB ====== */}
      {tab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl p-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{color:'#4b5c6f'}}>
              {tickets.length} ticket(s) -- {openTickets} ouvert(s)
            </p>
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {tickets.length === 0 && <div className="text-center py-12 text-sm" style={{color:'#94a3b8'}}>Aucun ticket pour l'instant</div>}
              {tickets.map(tk => (
                <button key={tk.id} onClick={() => { setSelectedTicket(tk); setReplyInput(''); }}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all"
                  style={selectedTicket?.id === tk.id
                    ? { border:'2px solid #00e701', background:'rgba(0,231,1,0.08)' }
                    : { border:'2px solid #1a2a38', background:'#111a25' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-white truncate">{tk.user_name || tk.user_email}</p>
                      <p className="text-xs truncate" style={{color:'#94a3b8'}}>{tk.user_email}</p>
                      <p className="text-xs text-white/70 mt-1 line-clamp-1">{tk.subject}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <StatusBadge status={tk.status} />
                      <span className="text-[10px]" style={{color:'#94a3b8'}}>{(tk.messages || []).length} msg</span>
                    </div>
                  </div>
                  <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{color:'#94a3b8'}}>
                    <Clock className="w-3 h-3" />{new Date(tk.created_date).toLocaleString('fr-FR')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedTicket ? (
            <div className="rounded-2xl p-4 flex flex-col" style={{background:'#111a25', border:'1px solid #1a2a38', height: 620}}>
              <div className="flex items-start justify-between gap-3 pb-3 shrink-0" style={{borderBottom:'1px solid #1a2a38'}}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-orbitron font-bold text-sm text-white">{selectedTicket.user_name || selectedTicket.user_email}</p>
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                  <p className="text-xs mt-0.5" style={{color:'#94a3b8'}}>{selectedTicket.user_email}</p>
                  <p className="text-xs font-medium text-white/80 mt-1 line-clamp-2">{selectedTicket.subject}</p>
                </div>
                {selectedTicket.status !== 'resolved' && (
                  <button onClick={resolveTicket}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{background:'rgba(0,231,1,0.1)', color:'#00e701', border:'1px solid rgba(0,231,1,0.3)'}}>
                    <CheckCircle className="w-3.5 h-3.5" /> Marquer resolu
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto py-3 space-y-3">
                {(selectedTicket.messages || []).map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm"
                      style={m.role === 'admin'
                        ? { background:'#00e701', color:'#000', borderBottomRightRadius:'4px' }
                        : { background:'#111a25', border:'1px solid #1a2a38', color:'#fff', borderBottomLeftRadius:'4px' }}>
                      <p className="leading-relaxed">{m.content}</p>
                      <p className="text-[10px] mt-1.5" style={{color: m.role === 'admin' ? 'rgba(0,0,0,0.5)' : '#94a3b8'}}>
                        {m.role === 'admin' ? 'Admin' : `${m.sender || 'Utilisateur'}`} - {new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={ticketBottomRef} />
              </div>
              {selectedTicket.status !== 'resolved' ? (
                <div className="flex gap-2 pt-3 shrink-0" style={{borderTop:'1px solid #1a2a38'}}>
                  <input value={replyInput} onChange={e => setReplyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && replyToTicket()}
                    placeholder="Repondre a l'utilisateur..."
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none text-white placeholder:text-[#94a3b8]"
                    style={{background:'#111a25', border:'1px solid #1a2a38'}} />
                  <button onClick={replyToTicket} disabled={!replyInput.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all"
                    style={{background:'#00e701'}}>
                    <Send className="w-4 h-4" style={{color:'#000'}} />
                  </button>
                </div>
              ) : (
                <div className="pt-3 shrink-0 text-center text-sm font-semibold" style={{borderTop:'1px solid #1a2a38', color:'#00e701'}}>
                  <CheckCircle className="w-4 h-4 inline mr-1" /> Ce ticket est resolu
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-16 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
              <MessageSquare className="w-14 h-14 mx-auto mb-4 opacity-30" style={{color:'#94a3b8'}} />
              <p className="font-medium" style={{color:'#94a3b8'}}>Selectionne un ticket</p>
              <p className="text-xs mt-1" style={{color:'#94a3b8'}}>Le fil de conversation apparaitra ici.</p>
            </div>
          )}
        </div>
      )}

      {/* ====== REVENUE TAB ====== */}
      {tab === 'revenue' && (() => {
        const totalWageredAll = users.reduce((s, u) => s + (u.total_wagered || 0), 0);
        const totalWonAll = users.reduce((s, u) => s + (u.total_won || 0), 0);
        const casinoProfit = totalWageredAll - totalWonAll;
        const margin = totalWageredAll > 0 ? ((casinoProfit / totalWageredAll) * 100).toFixed(2) : '0.00';
        const totalCreds = users.reduce((s, u) => s + (u.credits || 0), 0);
        const totalGames = users.reduce((s, u) => s + (u.games_played || 0), 0);
        const gameStats = {};
        rounds.forEach(r => {
          if (!gameStats[r.game]) gameStats[r.game] = { wagered: 0, profit: 0, count: 0 };
          gameStats[r.game].wagered += r.bet || 0;
          gameStats[r.game].profit += -(r.profit || 0);
          gameStats[r.game].count += 1;
        });
        const gameRows = Object.entries(gameStats).sort((a, b) => b[1].profit - a[1].profit);
        const recent = rounds.slice(0, 50);
        const topLosers = [...users].sort((a, b) => ((b.total_wagered||0)-(b.total_won||0)) - ((a.total_wagered||0)-(a.total_won||0))).slice(0, 8);
        const bigWins = rounds.filter(r => (r.profit || 0) > 50).sort((a, b) => b.profit - a.profit).slice(0, 5);

        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total mise', value: `${totalWageredAll.toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR`, color: '#eab308' },
                { label: 'Redistribue', value: `${totalWonAll.toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR`, color: '#3b82f6' },
                { label: 'Profit casino', value: `${casinoProfit.toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR`, color: casinoProfit >= 0 ? '#00e701' : '#ef4444' },
                { label: 'Marge house', value: `${margin} %`, color: '#f97316' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl p-5" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{label}</p>
                  <p className="font-orbitron font-black text-xl" style={{color}}>{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Joueurs actifs', value: users.length, color: '#3b82f6' },
                { label: 'Parties totales', value: totalGames.toLocaleString('fr-FR'), color: '#a855f7' },
                { label: 'Credits en circulation', value: `${totalCreds.toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR`, color: '#eab308' },
                { label: 'Parties enregistrees', value: rounds.length.toLocaleString('fr-FR'), color: '#00e701' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl p-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{label}</p>
                  <p className="font-orbitron font-bold text-lg" style={{color}}>{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{color:'#00e701'}} />
                    <h2 className="font-orbitron font-black text-white text-sm">Profit par jeu</h2>
                  </div>
                </div>
                <div className="px-5 py-4">
                  {gameRows.length === 0 ? (
                    <p className="text-xs text-center py-6" style={{color:'#94a3b8'}}>Aucune partie enregistree</p>
                  ) : (
                    <div className="space-y-2">
                      {gameRows.map(([game, s]) => {
                        const profitPct = s.wagered > 0 ? ((s.profit / s.wagered) * 100).toFixed(1) : '0.0';
                        const barW = Math.min(100, Math.abs(s.profit / Math.max(...gameRows.map(g => Math.abs(g[1].profit)), 1)) * 100);
                        return (
                          <div key={game} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{game}</span>
                                <span style={{color:'#94a3b8'}}>{s.count} parties</span>
                              </div>
                              <span className="font-orbitron font-bold" style={{color: s.profit >= 0 ? '#00e701' : '#ef4444'}}>
                                {s.profit >= 0 ? '+' : ''}{s.profit.toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR ({profitPct}%)
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{background:'#0b1219'}}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, background: s.profit >= 0 ? '#00e701' : '#ef4444' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" style={{color:'#00e701'}} />
                    <h2 className="font-orbitron font-black text-white text-sm">Top contributeurs</h2>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {topLosers.map((u, i) => {
                    const loss = (u.total_wagered || 0) - (u.total_won || 0);
                    const pct = u.total_wagered > 0 ? ((loss / u.total_wagered) * 100).toFixed(0) : 0;
                    return (
                      <div key={u.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-orbitron text-[10px] w-5 shrink-0" style={{color:'#94a3b8'}}>#{i+1}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{u.user_name || u.user_email}</p>
                            <p className="text-[10px]" style={{color:'#94a3b8'}}>{(u.total_wagered||0).toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-orbitron font-bold text-xs" style={{color: loss >= 0 ? '#00e701' : '#ef4444'}}>{loss >= 0 ? '+' : ''}{loss.toLocaleString('fr-FR', {maximumFractionDigits:0})} EUR</p>
                          <p className="text-[10px]" style={{color:'#94a3b8'}}>{pct}% marge</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {bigWins.length > 0 && (
              <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{color:'#eab308'}} />
                    <h2 className="font-orbitron font-black text-white text-sm">Gros gains joueurs</h2>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {bigWins.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                      <div className="flex items-center gap-3 min-w-0">
                        <TrendingUp className="w-4 h-4" style={{color:'#00e701'}} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{r.user_name || r.user_email}</p>
                          <p className="text-xs" style={{color:'#94a3b8'}}>{r.game} -- {r.result}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-orbitron font-bold text-sm" style={{color:'#00e701'}}>+{(r.profit||0).toFixed(2)} EUR</p>
                        <p className="text-[10px]" style={{color:'#94a3b8'}}>{new Date(r.created_date).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" style={{color:'#00e701'}} />
                  <h2 className="font-orbitron font-black text-white text-sm">Activite recente</h2>
                </div>
              </div>
              <div className="px-5 py-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{borderBottom:'1px solid #1a2a38'}}>
                      {['Heure', 'Joueur', 'Jeu', 'Mise', 'Profit joueur', 'Profit casino'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id} className="transition-colors" style={{borderBottom:'1px solid rgba(26,42,56,0.4)'}}>
                        <td className="py-2 px-3" style={{color:'#94a3b8'}}>{new Date(r.created_date).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}</td>
                        <td className="py-2 px-3 text-white truncate max-w-[100px]">{r.user_name || r.user_email}</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{background:'#111a25', border:'1px solid #1a2a38'}}>{r.game}</span></td>
                        <td className="py-2 px-3 font-orbitron font-bold text-white">{(r.bet||0).toFixed(2)} EUR</td>
                        <td className="py-2 px-3 font-orbitron font-bold" style={{ color: (r.profit||0) >= 0 ? '#00e701' : '#ef4444' }}>
                          {(r.profit||0) >= 0 ? '+' : ''}{(r.profit||0).toFixed(2)} EUR
                        </td>
                        <td className="py-2 px-3 font-orbitron font-bold" style={{ color: -(r.profit||0) >= 0 ? '#00e701' : '#ef4444' }}>
                          {-(r.profit||0) >= 0 ? '+' : ''}{(-(r.profit||0)).toFixed(2)} EUR
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recent.length === 0 && <p className="text-center py-8 text-sm" style={{color:'#94a3b8'}}>Aucune partie encore enregistree</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ====== HISTORY TAB ====== */}
      {tab === 'history' && (
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-3" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Toutes les parties ({rounds.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <Search className="w-4 h-4 shrink-0" style={{color:'#94a3b8'}} />
                <input value={roundsSearch} onChange={e => setRoundsSearch(e.target.value)} placeholder="Email ou jeu..."
                  className="w-48 bg-transparent text-sm focus:outline-none text-white placeholder:text-[#94a3b8]" />
              </div>
              <button onClick={loadRounds} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="px-5 py-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{borderBottom:'1px solid #1a2a38'}}>
                  {['Date', 'Joueur', 'Jeu', 'Mise', 'Resultat', 'Profit'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rounds
                  .filter(r => !roundsSearch || (r.user_email||'').includes(roundsSearch) || (r.game||'').toLowerCase().includes(roundsSearch.toLowerCase()))
                  .map(r => (
                    <tr key={r.id} className="transition-colors" style={{borderBottom:'1px solid rgba(26,42,56,0.4)'}}>
                      <td className="py-2 px-3" style={{color:'#94a3b8'}}>{new Date(r.created_date).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td>
                      <td className="py-2 px-3 text-white truncate max-w-[120px]">{r.user_name || r.user_email}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{background:'#111a25', border:'1px solid #1a2a38'}}>{r.game}</span>
                      </td>
                      <td className="py-2 px-3 font-orbitron font-bold text-white">{(r.bet||0).toFixed(2)} EUR</td>
                      <td className="py-2 px-3 truncate max-w-[140px]" style={{color:'#94a3b8'}}>{r.result}</td>
                      <td className="py-2 px-3 font-orbitron font-bold" style={{ color: (r.profit||0) >= 0 ? '#00e701' : '#ef4444' }}>
                        {(r.profit||0) >= 0 ? '+' : ''}{(r.profit||0).toFixed(2)} EUR
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {rounds.length === 0 && <div className="text-center py-12 text-sm" style={{color:'#94a3b8'}}>Aucune partie enregistree pour l'instant</div>}
          </div>
        </div>
      )}

      {/* ====== ACTIVITY LOG TAB ====== */}
      {tab === 'activity' && (
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Journal d'activite</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            {log.length === 0 ? (
              <div className="text-center py-12 text-sm" style={{color:'#94a3b8'}}>
                Aucune action effectuee pour l'instant dans cette session.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
                {log.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                    <span className="shrink-0" style={{color:'#94a3b8'}}>{entry.split(' -- ')[0]}</span>
                    <ChevronRight className="w-3 h-3 shrink-0" style={{color:'#94a3b8'}} />
                    <span className="text-white">{entry.split(' -- ')[1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
