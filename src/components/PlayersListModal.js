import React from "react";

export default function PlayersListModal({ isOpen, onClose, bluePlayers, redPlayers, spectatorPlayers, userName, isOwner, localPlayerId, pinnedSpectators, kickPlayer, togglePinPlayer }) {
  if (!isOpen) return null;

  const PlayerListGroup = ({ title, players, color }) => {
    if (players.length === 0) return null;
    const isSpectator = color === 'stone';
    const bgClass = 'bg-slate-900 border-slate-800';
    const textClass = 'text-slate-200';

    return (
      <div className="mb-4">
        <h4 className={`text-[11px] font-black mb-2 ${textClass} uppercase px-1 border-b border-slate-700 pb-1`}>
          {title} ({players.length})
        </h4>
        <div className="space-y-1.5">
          {players.map((p, i) => (
            <div key={i} className={`flex justify-between items-center p-2.5 rounded-xl border ${bgClass} shadow-sm`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.emoji}</span>
                <span className="text-xs font-bold text-slate-200">
                  {p.name} {p.name === userName && <span className="text-slate-400 font-bold">(أنت)</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-2 py-1 rounded-md font-bold ${isSpectator ? 'bg-slate-800 border border-slate-700 text-slate-400' : p.role === 'master' ? 'bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC]' : 'bg-[#4C7D7E] border border-[#385F60] text-[#F5F5DC]'}`}>
                  {isSpectator ? '🍿 مشاهد' : p.role === 'master' ? '👑 مُشفر' : '🔍 مفكك'}
                </span>
                {isOwner && p.id !== localPlayerId && (
                  <div className="flex gap-1">
                    {!isSpectator && (
                      <button onClick={() => kickPlayer(p.id)} className="bg-red-900/50 border border-red-800/50 text-red-300 text-[9px] px-2 py-1 rounded-md font-bold hover:bg-red-800 transition-colors">
                        طرد للمشاهدين
                      </button>
                    )}
                    {isSpectator && (
                      <button onClick={() => togglePinPlayer(p.id)} className={`${pinnedSpectators.includes(p.id) ? 'bg-teal-900/50 border-teal-800/50 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'} text-[9px] px-2 py-1 rounded-md font-bold transition-colors`}>
                        {pinnedSpectators.includes(p.id) ? '📌 مثبت' : '📌 تثبيت'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-slate-100 font-black text-sm uppercase tracking-widest">الأعضاء والمشاهدين 👥</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl font-bold">×</button>
        </div>
        <div className="space-y-2">
          <PlayerListGroup title="الدهاة 🔵" players={bluePlayers} color="blue" />
          <PlayerListGroup title="الجهابذة 🔴" players={redPlayers} color="red" />
          <PlayerListGroup title="المشاهدين 🍿" players={spectatorPlayers} color="stone" />
        </div>
      </div>
    </div>
  );
}