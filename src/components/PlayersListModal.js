import React from 'react';

export default function PlayersListModal({ 
  isOpen, onClose, bluePlayers, redPlayers, spectatorPlayers, 
  localPlayerId, isOwner, isRoomCreator, pinnedSpectators, 
  kickPlayer, togglePinPlayer, reportPlayer, toggleAdmin 
}) {
  if (!isOpen) return null;

  // دالة صغيرة ترسم صف اللاعب مع الأزرار
  const renderPlayerRow = (p) => (
    <div key={p.id} className="flex items-center justify-between bg-[#020617] p-2 rounded-xl border border-slate-800 mb-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xl">{p.emoji}</span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-200">{p.name}</span>
            {p.id === localPlayerId && <span className="text-[8px] bg-teal-900 text-teal-300 px-1.5 py-0.5 rounded-full font-black">أنت</span>}
            {p.is_admin && <span className="text-[8px] bg-amber-900/80 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded-full font-black">مشرف 👑</span>}
          </div>
          <span className="text-[9px] text-slate-500 font-bold">{p.role === 'master' ? 'مشفر 👑' : p.role === 'decoder' ? 'مفكك 🔍' : 'مشاهد 🍿'}</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {/* زر التثبيت والتنزيل (للمشرفين) */}
        {isOwner && p.id !== localPlayerId && (
          <button onClick={() => togglePinPlayer(p.id)} className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition-colors ${pinnedSpectators.includes(p.id) ? 'bg-amber-900/50 text-amber-400 border-amber-800 hover:bg-amber-900' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}>
            {pinnedSpectators.includes(p.id) ? 'إلغاء التثبيت 📌' : 'تثبيت كمشاهد 📌'}
          </button>
        )}

        {/* زر الترقية لمشرف (لمنشئ الروم الأساسي فقط) */}
        {isRoomCreator && p.id !== localPlayerId && (
          <button onClick={() => toggleAdmin(p.id, p.is_admin, p.name)} className={`text-[9px] px-2 py-1 rounded-lg font-bold border transition-colors ${p.is_admin ? 'bg-red-900/50 text-red-400 border-red-800 hover:bg-red-900' : 'bg-amber-900/50 text-amber-400 border-amber-800 hover:bg-amber-900'}`}>
            {p.is_admin ? 'سحب الإشراف 🔻' : 'ترقية لمشرف 🌟'}
          </button>
        )}

        {/* زر الإبلاغ (يظهر للكل إلا على أنفسهم، وما تقدر تبلغ على منشئ الروم) */}
        {p.id !== localPlayerId && !p.is_admin && (
          <button onClick={() => reportPlayer(p.id, p.name)} className="text-[9px] bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 px-2 py-1 rounded-lg font-bold transition-colors">
            إبلاغ 🚨
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-black text-teal-400 mb-4 text-center border-b border-slate-800 pb-3">اللاعبين المتصلين 👥</h3>
        
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 scrollbar-hide">
          {bluePlayers.length > 0 && (
            <div><h4 className="text-[10px] font-black text-blue-400 mb-2 px-1">الدهاة 🔵</h4>{bluePlayers.map(renderPlayerRow)}</div>
          )}
          {redPlayers.length > 0 && (
            <div><h4 className="text-[10px] font-black text-red-400 mb-2 px-1 mt-3">الجهابذة 🔴</h4>{redPlayers.map(renderPlayerRow)}</div>
          )}
          {spectatorPlayers.length > 0 && (
            <div><h4 className="text-[10px] font-black text-slate-400 mb-2 px-1 mt-3">المشاهدين 🍿</h4>{spectatorPlayers.map(renderPlayerRow)}</div>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-colors text-xs border border-slate-700">
          إغلاق
        </button>
      </div>
    </div>
  );
}