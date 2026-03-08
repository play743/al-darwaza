import React, { useState, useEffect } from 'react';

export default function ProfileModal({ 
  isOpen, onClose, editName, setEditName, allowNameChange, isOwner, 
  availableEmojis, editEmoji, setEditEmoji, isRoomLocked, userTeam, 
  pinnedSpectators, localPlayerId, editTeam, setEditTeam, userRole, 
  editRole, setEditRole, saveProfile 
}) {
  
  // حالة جديدة للتحكم بإظهار/إخفاء الخيارات الإضافية
  const [showAdvanced, setShowAdvanced] = useState(false);

  // تصفير الحالة كل مرة يفتح فيها المربع عشان يرجع صغير
  useEffect(() => {
    if (isOpen) setShowAdvanced(false);
  }, [isOpen]);

  if (!isOpen) return null;

  // 🚀 حركة تسريع الإغلاق (Optimistic UI Update)
  // راح نقفل النافذة فوراً، والداتا بتنحفظ في الخلفية بدون ما ينتظر اللاعب
  const handleFastSave = () => {
    saveProfile(); // إرسال أمر الحفظ للسيرفر
    onClose();     // إغلاق النافذة بوجه اللاعب فوراً عشان يحس بالسرعة ⚡
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* 🚀 صغرنا المربع هنا (max-w-xs بدال max-w-sm) */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xs rounded-3xl p-5 shadow-2xl relative transition-all duration-300">
        
        <h3 className="text-lg font-black text-teal-400 mb-4 text-center">ملفي 👤</h3>
        
        <div className="space-y-4">
          
          {/* مربع الاسم (يظهر دائماً) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold px-1">اسم اللاعب</label>
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              disabled={!allowNameChange && !isOwner}
              className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-black text-white text-right focus:border-teal-500 outline-none disabled:opacity-50 transition-colors"
            />
          </div>

          {/* زر الإظهار والإخفاء */}
          {!showAdvanced ? (
            <button 
              onClick={() => setShowAdvanced(true)} 
              className="w-full text-xs text-slate-400 hover:text-teal-400 py-1 font-bold underline decoration-dashed underline-offset-4 transition-colors"
            >
              عرض الخيارات المتقدمة (الفريق، الايموجي...) ⚙️
            </button>
          ) : (
            <div className="space-y-4 animate-fade-in-down border-t border-slate-800 pt-4 mt-2">
              
              {/* قسم الايموجي */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-400 font-bold px-1">اختر ايموجي</label>
                <div className="flex flex-wrap gap-1.5 justify-center bg-[#020617] p-2 rounded-xl border border-slate-800 h-24 overflow-y-auto scrollbar-hide">
                  {availableEmojis.map(emoji => (
                    <span 
                      key={emoji} 
                      onClick={() => setEditEmoji(emoji)} 
                      className={`text-xl cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors ${editEmoji === emoji ? 'bg-teal-900/50 border border-teal-500 scale-110 shadow-sm' : ''}`}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>

              {/* قسم الفريق والدور */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold px-1">الفريق</label>
                  <select 
                    value={editTeam} 
                    onChange={(e) => setEditTeam(e.target.value)} 
                    disabled={isRoomLocked && !isOwner}
                    className="w-full bg-[#020617] border border-slate-700 rounded-xl px-2 py-2 text-[11px] font-bold text-white outline-none disabled:opacity-50 text-center"
                  >
                    <option value="none">مشاهد 🍿</option>
                    <option value="blue">الدهاة 🔵</option>
                    <option value="red">الجهابذة 🔴</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold px-1">الدور</label>
                  <select 
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value)} 
                    disabled={(isRoomLocked && !isOwner) || editTeam === 'none'}
                    className="w-full bg-[#020617] border border-slate-700 rounded-xl px-2 py-2 text-[11px] font-bold text-white outline-none disabled:opacity-50 text-center"
                  >
                    <option value="decoder">مفكك 🔍</option>
                    <option value="master">مشفر 👑</option>
                  </select>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 🚀 الأزرار تم تغيير اسم الزر ليصبح "حفظ" فقط */}
        <div className="flex gap-2 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-xs"
          >
            إلغاء
          </button>
          <button 
            onClick={handleFastSave} 
            className="flex-1 bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 text-white font-black py-2.5 rounded-xl transition-all shadow-lg active:scale-95 text-xs"
          >
            حفظ
          </button>
        </div>

      </div>
    </div>
  );
}