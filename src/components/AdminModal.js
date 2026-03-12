import React, { useState, useEffect } from 'react';

export default function AdminModal({
  isOpen, onClose, isOwner,
  isRoomLocked, allowNameChange, timerDuration,
  saveAdminSettings, wordPacks,
  setIsAddPackModalOpen, resetBoardWithWords
}) {
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeStr, setCustomTimeStr] = useState("");

  // 🚀 مصفوفة الساعات: عقارب الساعة تتغير بناءً على الوقت المحدد
  const clockEmojis = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚'];
  const currentClock = timerDuration === 0 ? '⏱️' : clockEmojis[Math.floor(timerDuration / 30) % 12];

  // 🚀 تهيئة المربع اليدوي لو كان الوقت محفوظ مسبقاً برقم مخصص
  useEffect(() => {
    if (![0, 60, 90, 120, 180].includes(timerDuration) && timerDuration !== 0) {
      setIsCustomTime(true);
      if (!customTimeStr) { // عشان ما يمسح اللي يكتبه المستخدم وهو يكتب
        const m = Math.floor(timerDuration / 60);
        const s = timerDuration % 60;
        setCustomTimeStr(`${m}:${s.toString().padStart(2, '0')}`);
      }
    }
  }, [timerDuration, customTimeStr]);

  if (!isOpen || !isOwner) return null;

  // مكون ذكي لتوحيد شكل الإعدادات
  const SettingRow = ({ icon, title, description, buttonText, buttonClass, onClick }) => (
    <div className="flex items-center justify-between bg-[#020617]/60 p-3 rounded-xl border border-slate-800 mb-2 transition-colors hover:bg-[#020617]">
      <div className="flex items-center gap-3">
        <span className="text-xl transition-all duration-300">{icon}</span>
        <div className="flex flex-col text-right">
          <span className="text-xs font-black text-slate-200">{title}</span>
          <span className="text-[9px] font-bold text-slate-500">{description}</span>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`text-[10px] px-3 py-1.5 rounded-lg font-black transition-colors border shrink-0 shadow-sm ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );

  // 🚀 دالة تحويل النص (مثل 2:30) إلى ثواني وحفظه فوراً
  const handleCustomTimeChange = (e) => {
    const val = e.target.value;
    setCustomTimeStr(val);

    if (val.includes(':')) {
      const [m, s] = val.split(':');
      const totalSecs = (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
      saveAdminSettings({ timer_duration: totalSecs });
    } else {
      // لو كتب بس الدقائق بدون نقطتين (مثلاً 2) يحسبها 120 ثانية
      const totalSecs = (parseInt(val) || 0) * 60;
      saveAdminSettings({ timer_duration: totalSecs });
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* الهيدر */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/80">
          <h3 className="text-base sm:text-lg font-black text-teal-400">إعدادات الروم ⚙️</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs">
            ✕
          </button>
        </div>

        {/* المحتوى */}
        <div className="p-4 overflow-y-auto space-y-5 hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
          
          {/* 1. إعدادات الوصول والقوانين */}
          <div>
            <h4 className="text-[9px] font-black text-slate-500 mb-2 px-1 uppercase tracking-widest">الصلاحيات والقوانين</h4>
            
            <SettingRow
              icon={isRoomLocked ? "🔒" : "🔓"}
              title="قفل الروم"
              description="يمنع دخول مشاهدين جدد للروم"
              onClick={() => saveAdminSettings({ is_locked: !isRoomLocked })}
              buttonText={isRoomLocked ? "الروم مقفلة 🔒" : "الروم مفتوحة 🔓"}
              buttonClass={isRoomLocked ? "bg-red-900/50 text-red-400 border-red-800" : "bg-green-900/50 text-green-400 border-green-800"}
            />

            <SettingRow
              icon={allowNameChange ? "✅" : "❌"}
              title="تغيير الأسماء"
              description="يسمح للاعبين بتعديل أسمائهم"
              onClick={() => saveAdminSettings({ allow_name_change: !allowNameChange })}
              buttonText={allowNameChange ? "تم السماح ✅" : "تم المنع ❌"}
              buttonClass={allowNameChange ? "bg-green-900/50 text-green-400 border-green-800" : "bg-red-900/50 text-red-400 border-red-800"}
            />
          </div>

          {/* 2. إعدادات المؤقت */}
          <div>
            <h4 className="text-[9px] font-black text-slate-500 mb-2 px-1 uppercase tracking-widest">مؤقت اللعبة</h4>
            <div className="flex items-center justify-between bg-[#020617]/60 p-3 rounded-xl border border-slate-800 hover:bg-[#020617] transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl transition-all duration-300 transform scale-110">{currentClock}</span>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-black text-slate-200">وقت الجولة</span>
                  <span className="text-[9px] font-bold text-slate-500">اختر من القائمة أو حدد يدوياً</span>
                </div>
              </div>
              
              {/* 🚀 القائمة المنسدلة + الإدخال اليدوي */}
              <div className="flex items-center gap-1.5">
                {!isCustomTime ? (
                  <select
                    value={timerDuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setIsCustomTime(true);
                        setCustomTimeStr("");
                      } else {
                        saveAdminSettings({ timer_duration: Number(val) });
                      }
                    }}
                    className="bg-slate-800 border border-slate-700 text-teal-400 text-[11px] font-black rounded-lg px-2 py-1.5 outline-none focus:border-teal-500 cursor-pointer"
                    dir="rtl"
                  >
                    <option value={0}>بلا</option>
                    <option value={60}>1 دقيقة</option>
                    <option value={90}>1.5 دقيقة</option>
                    <option value={120}>2 دقيقتين</option>
                    <option value={180}>3 دقائق</option>
                    <option value="custom">يدوي ✏️</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1 relative">
                    <input
                      type="text"
                      autoFocus
                      value={customTimeStr}
                      onChange={handleCustomTimeChange}
                      className="bg-slate-800 border border-teal-500 text-teal-400 text-xs font-black rounded-lg px-2 py-1.5 outline-none w-[75px] text-center placeholder-slate-600 tracking-wider"
                      placeholder="2:30"
                      dir="ltr"
                    />
                    <button 
                      onClick={() => {
                        setIsCustomTime(false);
                        saveAdminSettings({ timer_duration: 0 }); 
                      }} 
                      className="bg-slate-700 hover:bg-red-900/80 text-slate-300 hover:text-red-400 rounded-lg p-1.5 text-[10px] transition-colors"
                      title="العودة للقائمة المنسدلة وإلغاء الوقت"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 3. بدء جولة واختيار الحزم */}
          <div>
            <h4 className="text-[9px] font-black text-slate-500 mb-2 px-1 uppercase tracking-widest">بدء جولة جديدة (اختيار الحزمة)</h4>
            <div className="grid grid-cols-2 gap-2">
              
              {Object.entries(wordPacks).map(([key, pack]) => (
                <button
                  key={key}
                  onClick={() => {
                    resetBoardWithWords(pack.words);
                    onClose();
                  }}
                  className="bg-[#020617]/60 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
                >
                  <span className="text-xs font-black group-hover:text-teal-400 transition-colors">{pack.name}</span>
                  <span className="text-[8px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded-full">{pack.words.length} كلمة</span>
                </button>
              ))}
              
              <button
                onClick={() => {
                  onClose();
                  setIsAddPackModalOpen(true);
                }}
                className="bg-[#020617]/30 hover:bg-[#020617]/80 border border-slate-700 border-dashed text-slate-400 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
              >
                <span className="text-xs font-black group-hover:text-amber-400 transition-colors">إضافة حزمة ➕</span>
                <span className="text-[8px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded-full">كلمات خاصة بك</span>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}