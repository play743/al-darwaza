import React from 'react';

export default function PlayersListModal({ 
  isOpen, onClose, bluePlayers, redPlayers, spectatorPlayers, 
  localPlayerId, isOwner, isRoomCreator, pinnedSpectators, 
  kickPlayer, togglePinPlayer, reportPlayer, toggleAdmin 
}) {
  if (!isOpen) return null;

  // 🚀 دالة ذكية ترسم صف اللاعب وتلون خلفيته حسب فريقه
  const renderPlayerRow = (p) => {
    // تحديد الألوان بناءً على الفريق
    let rowColors = "bg-slate-800/40 border-slate-700"; // لون المشاهدين (رمادي)
    if (p.team === 'blue') rowColors = "bg-blue-950/40 border-blue-900"; // الدهاة
    else if (p.team === 'red') rowColors = "bg-red-950/40 border-red-900"; // الجهابذة

    return (
      <div key={p.id} className={`flex items-center justify-between p-2 rounded-xl border mb-1.5 transition-colors ${rowColors}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{p.emoji}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-200">{p.name}</span>
              {p.id === localPlayerId && <span className="text-[8px] bg-teal-900 text-teal-300 px-1.5 py-0.5 rounded-full font-black">أنت</span>}
              {p.is_admin && <span className="text-[8px] bg-amber-900/80 text-amber-300 border border-amber-700 px-1.5 py-0.5 rounded-full font-black">مشرف 👑</span>}
            </div>
            <span className={`text-[9px] font-bold ${p.team === 'blue' ? 'text-blue-300' : p.team === 'red' ? 'text-red-300' : 'text-slate-400'}`}>
              {p.role === 'master' ? 'مشفر 👑' : p.role === 'decoder' ? 'مفكك 🔍' : 'مشاهد 🍿'}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 shrink-0">
          
          {/* زر المشاهد (رمادي ويقلب أخضر إذا تنشط + يجبر اللاعب يصير مشاهد فوراً) */}
          <div className="w-[50px] sm:w-[55px] flex justify-center">
            {isOwner && p.id !== localPlayerId && (
              <button 
                onClick={() => {
                  togglePinPlayer(p.id);
                  if (p.team !== 'none') kickPlayer(p.id); 
                }} 
                className={`w-full text-[9px] py-1 rounded-lg font-bold border transition-colors ${pinnedSpectators.includes(p.id) ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
              >
                {pinnedSpectators.includes(p.id) ? 'إلغاء 📌' : 'مشاهد 📌'}
              </button>
            )}
          </div>

          {/* زر الترقية (رمادي ويقلب أخضر إذا ترقى) */}
          <div className="w-[50px] sm:w-[55px] flex justify-center">
            {isRoomCreator && p.id !== localPlayerId && (
              <button 
                onClick={() => toggleAdmin(p.id, p.is_admin, p.name)} 
                className={`w-full text-[9px] py-1 rounded-lg font-bold border transition-colors ${p.is_admin ? 'bg-green-900/50 text-green-400 border-green-800' : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
              >
                {p.is_admin ? 'تنزيل 🔻' : 'ترقية 👑'}
              </button>
            )}
          </div>

          {/* زر الإبلاغ (أحمر وثابت لجميع اللاعبين بدون استثناء) */}
          <div className="w-[50px] sm:w-[55px] flex justify-center">
            {p.id !== localPlayerId && (
              <button 
                onClick={() => reportPlayer(p.id, p.name)} 
                className="w-full text-[9px] bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 py-1 rounded-lg font-bold transition-colors"
              >
                إبلاغ 🚨
              </button>
            )}
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-black text-teal-400 mb-4 text-center border-b border-slate-800 pb-3">اللاعبين المتصلين 👥</h3>
        
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 scrollbar-hide">
          
          {/* قسم الدهاة (ثابت دائماً) */}
          <div>
            <h4 className="text-[10px] font-black text-blue-400 mb-2 px-1">الدهاة 🔵</h4>
            {bluePlayers.length > 0 ? (
              bluePlayers.map(renderPlayerRow)
            ) : (
              <div className="text-center text-slate-600 text-[10px] font-bold py-3 bg-[#020617]/50 rounded-xl border border-slate-800/50 border-dashed">
                لا يوجد لاعبين في هذا الفريق
              </div>
            )}
          </div>

          {/* قسم الجهابذة (ثابت دائماً) */}
          <div>
            <h4 className="text-[10px] font-black text-red-400 mb-2 px-1 mt-3">الجهابذة 🔴</h4>
            {redPlayers.length > 0 ? (
              redPlayers.map(renderPlayerRow)
            ) : (
              <div className="text-center text-slate-600 text-[10px] font-bold py-3 bg-[#020617]/50 rounded-xl border border-slate-800/50 border-dashed">
                لا يوجد لاعبين في هذا الفريق
              </div>
            )}
          </div>

          {/* قسم المشاهدين (ثابت دائماً) */}
          <div>
            <h4 className="text-[10px] font-black text-slate-400 mb-2 px-1 mt-3">المشاهدين 🍿</h4>
            {spectatorPlayers.length > 0 ? (
              spectatorPlayers.map(renderPlayerRow)
            ) : (
              <div className="text-center text-slate-600 text-[10px] font-bold py-3 bg-[#020617]/50 rounded-xl border border-slate-800/50 border-dashed">
                المدرجات فارغة
              </div>
            )}
          </div>

        </div>

        <button onClick={onClose} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-colors text-xs border border-slate-700">
          إغلاق
        </button>
      </div>
    </div>
  );
}