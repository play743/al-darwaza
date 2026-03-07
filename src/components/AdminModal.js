import React from "react";

export default function AdminModal({ isOpen, onClose, isOwner, isRoomLocked, allowNameChange, timerDuration, saveAdminSettings, wordPacks, setIsAddPackModalOpen, resetBoardWithWords }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-slate-100 font-black text-sm uppercase tracking-widest flex items-center gap-2">إعدادات اللعبة ⚙️</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl font-bold">×</button>
        </div>
        {!isOwner && <div className="bg-slate-950 border border-slate-800 text-slate-400 p-2 rounded-xl text-center text-[10px] font-bold">هذه الإعدادات مقفلة 🔒 (خاصة بمالك الروم فقط)</div>}
        <div className={`space-y-5 ${!isOwner ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">قفل الروم 🔒 (للمشاهدة فقط)</span>
              <button onClick={() => saveAdminSettings({ is_locked: !isRoomLocked })} className={`w-12 h-6 rounded-full relative transition-colors ${isRoomLocked ? 'bg-teal-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isRoomLocked ? 'left-1' : 'right-1'}`}></div></button>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-3">
              <span className="text-xs font-bold text-slate-300">منع تغيير الأسماء 📛</span>
              <button onClick={() => saveAdminSettings({ allow_name_change: !allowNameChange })} className={`w-12 h-6 rounded-full relative transition-colors ${!allowNameChange ? 'bg-teal-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${!allowNameChange ? 'left-1' : 'right-1'}`}></div></button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-2 block">وقت التفكير (العداد)</label>
            <select value={timerDuration} onChange={(e) => saveAdminSettings({ timer_duration: parseInt(e.target.value) })} className="w-full bg-[#020617] border border-slate-700 text-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer focus:border-teal-500">
              <option value={60}>دقيقة واحدة</option><option value={120}>دقيقتين</option><option value={180}>3 دقائق</option><option value={300}>5 دقائق</option><option value={0}>بدون وقت (مخفي 🚫)</option>
            </select>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <label className="text-[10px] font-bold text-slate-400 mb-2 block">حزمة الكلمات الحالية</label>
            <select onChange={(e) => { if(e.target.value === "add_new") setIsAddPackModalOpen(true); else if(e.target.value !== "") resetBoardWithWords(wordPacks[e.target.value].words); }} className="w-full bg-slate-950 text-teal-400 border border-slate-800 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer mb-2 focus:border-teal-500">
              <option value="">-- اختر حزمة لتبدأ اللعبة من جديد --</option>
              {Object.entries(wordPacks).map(([key, pack]) => (<option key={key} value={key}>{pack.name} ({pack.words.length} كلمة)</option>))}
              <option value="add_new">➕ إضافة حزمة جديدة...</option>
            </select>
            <p className="text-[9px] text-red-400 font-bold text-center mt-2">تنبيه: تغيير الحزمة سيقوم بمسح اللوحة وبدء لعبة جديدة!</p>
          </div>
        </div>
      </div>
    </div>
  );
}