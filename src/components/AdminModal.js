import React from 'react';

export default function AdminModal({ isOpen, onClose, isOwner, isRoomLocked, allowNameChange, timerDuration, saveAdminSettings, wordPacks, setIsAddPackModalOpen, resetBoardWithWords }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <h3 className="text-xl font-black text-teal-400 mb-4 text-center">إعدادات الروم ⚙️</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#020617] p-3 rounded-xl border border-slate-800">
            <span className="text-sm font-bold text-slate-300">قفل الروم 🔒</span>
            <input type="checkbox" checked={isRoomLocked} onChange={(e) => saveAdminSettings({ is_locked: e.target.checked })} className="w-5 h-5 accent-teal-500" />
          </div>

          <div className="flex items-center justify-between bg-[#020617] p-3 rounded-xl border border-slate-800">
            <span className="text-sm font-bold text-slate-300">تغيير الأسماء ✏️</span>
            <input type="checkbox" checked={allowNameChange} onChange={(e) => saveAdminSettings({ allow_name_change: e.target.checked })} className="w-5 h-5 accent-teal-500" />
          </div>

          <div className="bg-[#020617] p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-300">وقت التفكير ⏳</span>
            <select value={timerDuration} onChange={(e) => saveAdminSettings({ timer_duration: Number(e.target.value) })} className="bg-slate-800 text-white p-2 rounded-lg text-sm font-bold outline-none border border-slate-700">
              <option value={0}>بدون وقت ♾️</option>
              <option value={60}>دقيقة ⏱️</option>
              <option value={120}>دقيقتين ⏱️</option>
              <option value={180}>3 دقائق ⏱️</option>
            </select>
          </div>

          {/* زر إضافة الكلمات المخصصة */}
          <button onClick={() => { onClose(); setIsAddPackModalOpen(true); }} className="w-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-bold py-2.5 rounded-xl transition-colors">
            إضافة كلمات مخصصة 📦
          </button>

          {/* 🚀 الزر الجديد: إعادة الجولة */}
          <button 
            onClick={() => {
              if(window.confirm("متأكد تبي تصفر اللوحة وتبدأ جولة جديدة؟ النقاط راح تنحفظ.")) {
                resetBoardWithWords(wordPacks.general.words); 
                onClose();
              }
            }} 
            className="w-full mt-2 bg-gradient-to-br from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
          >
            إعادة الجولة (لعب من جديد) 🔄
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-6 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
          إغلاق
        </button>
      </div>
    </div>
  );
}