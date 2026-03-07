import React from "react";

export default function ProfileModal({ isOpen, onClose, editName, setEditName, allowNameChange, isOwner, availableEmojis, editEmoji, setEditEmoji, isRoomLocked, userTeam, pinnedSpectators, localPlayerId, editTeam, setEditTeam, userRole, editRole, setEditRole, saveProfile }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-slate-100 font-black text-sm uppercase tracking-widest">ملفي 👤</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl font-bold">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الاسم</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!allowNameChange && !isOwner} className={`w-full bg-[#020617] border border-slate-700 rounded-xl p-3 text-sm font-bold text-center outline-none text-slate-200 ${!allowNameChange && !isOwner ? 'opacity-50 cursor-not-allowed' : 'focus:border-teal-500'}`} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">اختر الرمز الخاص بك</label>
            <div className={`flex flex-wrap gap-2 justify-center bg-[#020617] p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto ${!allowNameChange && !isOwner ? 'opacity-50 pointer-events-none' : ''}`}>
              {availableEmojis.map(e => (<button key={e} onClick={() => setEditEmoji(e)} className={`text-2xl p-1.5 rounded-lg transition-transform ${editEmoji === e ? 'bg-slate-800 scale-110 shadow-sm' : 'hover:scale-110'}`}>{e}</button>))}
            </div>
          </div>
          {!isRoomLocked || isOwner || userTeam !== 'none' ? (
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الفريق</label>
              {pinnedSpectators.includes(localPlayerId) ? (
                <div className="bg-slate-950 border border-slate-800 text-teal-400 p-3 rounded-xl text-center text-xs font-bold">تم تثبيتك كمشاهد من قبل المالك 📌</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setEditTeam("blue")} className={`p-2.5 rounded-xl font-bold text-xs transition-colors ${editTeam === 'blue' ? 'bg-blue-600 text-white shadow-md border-transparent' : 'bg-slate-950 text-blue-400 border border-slate-800 hover:bg-slate-800'}`}>الدهاة</button>
                  <button onClick={() => setEditTeam("red")} className={`p-2.5 rounded-xl font-bold text-xs transition-colors ${editTeam === 'red' ? 'bg-red-600 text-white shadow-md border-transparent' : 'bg-slate-950 text-red-400 border border-slate-800 hover:bg-slate-800'}`}>الجهابذة</button>
                  <button onClick={() => setEditTeam("none")} className={`p-2.5 rounded-xl font-bold text-xs transition-colors ${editTeam === 'none' ? 'bg-teal-600 text-white shadow-md border-transparent' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>مشاهد</button>
                </div>
              )}
            </div>
          ) : ( <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center text-xs font-bold text-slate-500">الروم مقفلة حالياً، لا يمكنك الانضمام للفرق.</div> )}
          {editTeam !== 'none' && !pinnedSpectators.includes(localPlayerId) && (!isRoomLocked || isOwner || userTeam !== 'none') && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الموقع (الدور)</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setEditRole("master")} className={`p-3 rounded-xl font-bold text-xs transition-colors ${editRole === 'master' ? 'bg-slate-700 text-white shadow-md border-slate-600' : 'bg-[#020617] text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>المُشفر 👑</button>
                <button onClick={() => userRole !== 'master' && setEditRole("decoder")} disabled={userRole === 'master'} className={`p-3 rounded-xl font-bold text-xs transition-colors ${editRole === 'decoder' ? 'bg-slate-700 text-white shadow-md border-slate-600' : 'bg-[#020617] text-slate-400 border border-slate-800 hover:bg-slate-800'} ${userRole === 'master' ? 'opacity-50 cursor-not-allowed' : ''}`}>مفكك الشفرة 🔍</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4"><button onClick={saveProfile} className="flex-1 bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold py-3 rounded-xl shadow-md hover:from-teal-400 hover:to-teal-600 transition-colors">حفظ التغييرات</button></div>
      </div>
    </div>
  );
}