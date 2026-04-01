import React, { useState } from 'react';

export default function ProfileModal({
  isOpen, onClose, editName, setEditName, allowNameChange, isOwner,
  availableEmojis, editEmoji, setEditEmoji, isRoomLocked,
  userTeam, pinnedSpectators, localPlayerId,
  editTeam, setEditTeam, userRole, editRole, setEditRole, saveProfile
}) {
  // 🚀 حالة جديدة للتحكم في إظهار أو إخفاء الإيموجيات
  const [showMore, setShowMore] = useState(false);

  if (!isOpen) return null;

  const isPinned = pinnedSpectators.includes(localPlayerId);

  return (
    <div className="fixed inset-0 z-[6000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 text-right" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* الهيدر */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/80">
          <h3 className="text-base sm:text-lg font-black text-teal-400">ملفي الشخصي 👤</h3>
          <button onClick={() => { onClose(); setShowMore(false); }} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs">
            ✕
          </button>
        </div>

        {/* المحتوى */}
        <div className="p-4 overflow-y-auto space-y-4 hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>

          {/* 1. الاسم */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 px-1">اسمك باللعبة</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!allowNameChange && !isOwner}
              className={`w-full bg-[#020617] border rounded-xl p-3 text-xs font-black outline-none transition-colors ${!allowNameChange && !isOwner ? 'border-slate-800 text-slate-500 cursor-not-allowed' : 'border-slate-700 text-slate-200 focus:border-teal-500'}`}
              placeholder="اكتب اسمك هنا..."
            />
            {!allowNameChange && !isOwner && (
              <p className="text-[8px] text-red-400 mt-1 font-bold px-1">المشرف منع تغيير الأسماء حالياً 🔒</p>
            )}
          </div>

          {/* 2. الفريق */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 px-1">اختيار الفريق</label>
            {isPinned ? (
              <div className="bg-amber-900/20 border border-amber-900/50 p-3 rounded-xl text-center">
                <span className="text-[11px] font-black text-amber-500">أنت مثبت كمشاهد 📌 لا يمكنك تغيير فريقك</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setEditTeam('blue')} className={`p-2 rounded-xl text-[10px] font-black transition-all border ${editTeam === 'blue' ? 'bg-blue-600 border-blue-500 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  الدهاة 🔵
                </button>
                <button onClick={() => setEditTeam('red')} className={`p-2 rounded-xl text-[10px] font-black transition-all border ${editTeam === 'red' ? 'bg-red-600 border-red-500 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  الجهابذة 🔴
                </button>
                <button onClick={() => setEditTeam('none')} className={`p-2 rounded-xl text-[10px] font-black transition-all border ${editTeam === 'none' ? 'bg-slate-600 border-slate-500 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  مشاهد 🍿
                </button>
              </div>
            )}
          </div>

          {/* 3. الدور (يظهر فقط إذا اللاعب اختار فريق) */}
          {editTeam !== 'none' && !isPinned && (
            <div className="animate-in fade-in zoom-in duration-200">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 px-1">دورك في الفريق</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setEditRole('master')} className={`p-2.5 rounded-xl text-[10px] font-black transition-all border ${editRole === 'master' ? 'bg-teal-600 border-teal-500 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  مُشفر 👑
                </button>
                <button onClick={() => setEditRole('decoder')} className={`p-2.5 rounded-xl text-[10px] font-black transition-all border ${editRole === 'decoder' ? 'bg-teal-600 border-teal-500 text-white shadow-sm' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  مُفكك 🔍
                </button>
              </div>
            </div>
          )}

          {/* 🚀 زر عرض المزيد (لإظهار/إخفاء الإيموجيات) */}
          <div className="border-t border-slate-800 pt-3 mt-2">
            <button 
              onClick={() => setShowMore(!showMore)} 
              className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-teal-400 transition-colors flex items-center justify-center gap-1 p-1"
            >
              {showMore ? 'إخفاء الإيموجيات 🔼' : 'عرض الإيموجيات 🔽'}
            </button>
          </div>

          {/* 4. الإيموجيات (مخفية افتراضياً وتظهر بالضغط) */}
          {showMore && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 px-1 flex justify-between items-center">
                <span>اختر الإيموجي المفضل لك</span>
                <span className="text-xl bg-[#020617] rounded-lg p-1 border border-slate-700">{editEmoji}</span>
              </label>
              <div className="bg-[#020617] border border-slate-800 rounded-xl p-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
                {availableEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setEditEmoji(emoji)}
                    className={`text-xl sm:text-2xl hover:scale-125 transition-transform ${editEmoji === emoji ? 'bg-slate-800 rounded-lg scale-110 shadow-sm' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* زر الحفظ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 mt-auto">
          <button 
            onClick={() => {
              saveProfile();
              setShowMore(false); // نسكر القائمة المنسدلة إذا حفظ عشان ترجع نظيفة للمرة الجاية
            }} 
            className="w-full bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black py-3 rounded-xl shadow-lg hover:from-teal-400 hover:to-teal-600 transition-all active:scale-95 text-xs"
          >
            حفظ التغييرات 💾
          </button>
        </div>

      </div>
    </div>
  );
}