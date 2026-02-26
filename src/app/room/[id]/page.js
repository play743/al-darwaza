"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function GameBoard() {
  const [blueScore, setBlueScore] = useState(8);
  const [redScore, setRedScore] = useState(9);
  
  const [userName, setUserName] = useState("عزام");
  const [userEmoji, setUserEmoji] = useState("👤");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false); 
  const [gameTime, setGameTime] = useState("02:00");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  
  const [isNameChangeLocked, setIsNameChangeLocked] = useState(false);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [players, setPlayers] = useState([
    { id: 1, name: "عزام", emoji: "👤", role: "owner", team: "blue" },
    { id: 2, name: "فيصل", emoji: "👑", role: "player", team: "red" }
  ]);

  const [wordPack, setWordPack] = useState("najd");
  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 
  const fileInputRef = useRef(null);

  const [wordBank, setWordBank] = useState({
    najd: ["خبيز", "مبخرة", "دلة", "طويق", "عرضة", "محالة", "جصة", "ميقاع", "مرقب", "قليب", "وجار", "روشن", "صفة", "منفاخ", "دبيازة", "جريش", "قرصان", "مرقوق", "حنيني", "شقراء", "نقاء", "نفود", "خرازة", "سواني", "مذود"],
    cities: ["الرياض", "جدة", "مكة", "المدينة", "بريدة", "عنيزة", "أبها", "حائل", "تبوك", "الدمام", "الخبر", "نجران", "جيزان", "الجوف", "الباحة", "الطائف", "القطيف", "الجبيل", "ينبع", "الخرج", "عرعر", "سكاكا", "القنفذة", "بيشة", "محايل"],
    gaming: ["بلايستيشن", "كيبورد", "ماوس", "لعبة", "تحدي", "بث", "سكواد", "نوب", "احتراف", "فوز", "خسارة", "لاغ", "تيم", "درع", "سيف", "قنبلة", "خريطة", "سكين", "مهمة", "ليفيل", "نقاط", "رتبة", "اونلاين", "بطولة", "جيمر"],
    general: ["نخلة", "سيف", "بحر", "صقر", "جمل", "خيمة", "تمر", "ليل", "نجم", "قمر", "شمس", "سحاب", "مطر", "وادي", "جبل", "رمل", "غزال", "قهوة", "مبخرة", "عود", "فنجال", "رياض", "سماء", "نور", "ظلام"],
    custom: [] 
  });

  const generateColors = useCallback(() => {
    const colors = [...Array(8).fill("bg-blue-600"), ...Array(8).fill("bg-red-600"), "bg-slate-950", ...Array(8).fill("bg-slate-500")];
    return colors.sort(() => 0.5 - Math.random());
  }, []);

  const shuffleWords = useCallback((packKey, sourceBank = wordBank) => {
    const bank = sourceBank[packKey];
    if (!bank || bank.length < 1) return;
    const shuffled = [...bank].sort(() => 0.5 - Math.random());
    setCurrentWords(shuffled.slice(0, 25));
    setWordColors(generateColors()); 
    setRevealedWords(Array(25).fill(false)); 
  }, [wordBank, generateColors]);

  useEffect(() => { shuffleWords(wordPack); }, [wordPack, shuffleWords]);

  const handleWordClick = (index) => {
    const newRevealed = [...revealedWords];
    newRevealed[index] = true;
    setRevealedWords(newRevealed);
  };

  // دالة النشر (المحسنة للعمل على جميع الجوالات)
  const shareRoom = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setShowCopyAlert(true);
        setTimeout(() => setShowCopyAlert(false), 2000);
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  const resetGameTotal = () => {
    setBlueScore(0);
    setRedScore(0);
    setPlayers(players.map(p => p.role === "owner" ? p : { ...p, role: "spectator", team: null }));
    shuffleWords(wordPack); 
    setIsManageOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full max-w-2xl mx-auto overflow-hidden relative bg-slate-950 text-right font-sans" dir="rtl">
      
      {/* تنبيه النسخ */}
      {showCopyAlert && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-teal-500 text-slate-950 px-8 py-3 rounded-2xl font-black text-sm shadow-2xl animate-in zoom-in duration-300">
          تم نسخ رابط الدروازة 📋
        </div>
      )}

      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* الشريط العلوي */}
      <div className="w-full flex justify-between items-center mb-6 px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-md relative z-30 shadow-sm font-bold">
        <button onClick={() => { setIsProfileOpen(true); setIsManageOpen(false); }} className="w-9 h-9 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-center text-lg shadow-md active:scale-90">{userEmoji}</button>

        <span className="text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase opacity-40 italic">الدروازة</span>

        <div className="flex gap-2">
          {/* زر النشر */}
          <button onClick={shareRoom} className="w-9 h-9 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
          </button>
          {/* زر الإدارة */}
          <button onClick={() => { setIsManageOpen(true); setIsProfileOpen(false); }} className={`w-9 h-9 bg-slate-950/80 border rounded-lg flex items-center justify-center transition-all active:scale-90 ${isManageOpen ? 'border-teal-500 text-teal-400' : 'border-slate-800 text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 18H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 12h11.25" /></svg>
          </button>
        </div>
      </div>

      {/* نافذة الملف الشخصي */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px] flex items-start justify-center" onClick={() => setIsProfileOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 w-[92%] max-w-[420px] rounded-2xl p-4 flex flex-row items-center gap-4 mt-[70px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-1 flex-col gap-1 border-l border-slate-800/30 pr-2">
              <label className="text-[8px] text-teal-500 font-black uppercase tracking-tighter">اسمك</label>
              <input type="text" disabled={isNameChangeLocked} value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg text-right font-bold text-[10px] w-full" />
            </div>
            <div className="flex flex-[2.5] flex-col gap-1 text-right">
              <label className="text-[8px] text-teal-500 font-black uppercase tracking-tighter">شعارك</label>
              <div className="flex gap-2 justify-center">
                {["👤", "👑", "🗡️", "☕", "🌴", "🦅", "🐪", "🔥"].map(emoji => (
                  <button key={emoji} onClick={() => { setUserEmoji(emoji); setIsProfileOpen(false); }} className={`h-7 w-7 rounded-md flex items-center justify-center text-sm ${userEmoji === emoji ? 'bg-teal-500/20 border border-teal-500/30 text-teal-400' : ''}`}>{emoji}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإدارة الموحدة */}
      {isManageOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto" onClick={() => setIsManageOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 w-[95%] max-w-[480px] rounded-3xl p-5 gap-6 mt-[70px] mb-10 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800/50 pb-3 font-black text-[10px]">
               <h3 className="text-teal-500 tracking-widest uppercase">إدارة الجيم 🛠️</h3>
               <button onClick={() => setIsManageOpen(false)} className="bg-green-600/20 text-green-500 p-2 rounded-lg">✓ تم</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">وقت الجولة</label><select value={gameTime} onChange={(e) => setGameTime(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl text-center"><option value="01:00">دقيقة</option><option value="02:00">دقيقتين</option><option value="03:00">3 دقائق</option></select></div>
              <div className="flex flex-col gap-2"><label className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">حزم الكلمات</label><select value={wordPack} onChange={(e) => setWordPack(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-xl text-center"><option value="najd">نجدية 🌴</option><option value="cities">مدن 🇸🇦</option><option value="gaming">ألعاب 🎮</option><option value="general">عامة 🌍</option></select></div>
            </div>
            <div className="space-y-3 pt-2 border-t border-slate-800/50">
               <label className="text-[9px] text-yellow-500 font-black uppercase tracking-widest">صلاحيات المالك 👑</label>
               <div className="grid grid-cols-2 gap-3 font-black">
                  <button onClick={() => setIsNameChangeLocked(!isNameChangeLocked)} className={`p-3 rounded-xl border text-[9px] ${isNameChangeLocked ? 'bg-orange-600/20 border-orange-500 text-orange-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>قفل الأسماء 🔒</button>
                  <button onClick={() => setIsRoomLocked(!isRoomLocked)} className={`p-3 rounded-xl border text-[9px] ${isRoomLocked ? 'bg-orange-600/20 border-orange-500 text-orange-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>قفل الروم 🚪</button>
               </div>
               <button onClick={resetGameTotal} className="w-full bg-red-600/20 border border-red-600/30 text-red-500 text-[9px] font-black py-4 rounded-xl shadow-lg uppercase active:scale-95 transition-all">تصفير النقاط وإعادة الجميع للمشاهدة ⚠️</button>
            </div>
          </div>
        </div>
      )}

      {/* محتوى اللعبة */}
      <div className="relative z-20 w-full flex flex-col items-center px-1">
        <div className="w-full flex justify-between items-center mb-8 px-5 font-black">
          <div className="flex flex-col items-center"><span className="text-blue-500 text-[9px] uppercase tracking-widest opacity-80">أهل الحارة</span><div className="text-blue-400 text-4xl tracking-tighter">{blueScore}</div></div>
          <div className="bg-slate-900/50 border border-slate-800 px-5 py-2 rounded-full font-mono text-[11px] text-slate-500 shadow-inner">{gameTime}</div>
          <div className="flex flex-col items-center"><span className="text-red-500 text-[9px] uppercase tracking-widest opacity-80">أهل القصر</span><div className="text-red-400 text-4xl tracking-tighter">{redScore}</div></div>
        </div>

        <div className="w-full bg-slate-900/40 p-1.5 border border-slate-800 rounded-2xl shadow-2xl mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {currentWords.map((word, index) => (
            <button key={index} onClick={() => handleWordClick(index)} className={`border rounded-lg flex items-center justify-center active:scale-95 transition-all duration-500 shadow-sm font-bold relative overflow-hidden ${revealedWords[index] ? `${wordColors[index]} border-transparent scale-95` : 'bg-slate-800 border-slate-700/50 hover:bg-slate-750'}`} style={{ aspectRatio: '4/3' }}>
              <span className={`text-[9px] sm:text-xs font-bold text-center px-1 tracking-tighter select-none ${revealedWords[index] ? 'text-white' : 'text-slate-200'}`}>{word}</span>
            </button>
          ))}
        </div>

        <div className="w-full grid grid-cols-2 gap-4 px-2 mt-auto pb-4 font-bold">
          <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-blue-500 text-[10px] font-black mb-2 border-b border-blue-500/10 pb-1 uppercase text-right">أهل الحارة</h4>
            {players.filter(p => p.team === "blue" && p.role !== "spectator").map(p => (
              <div key={p.id} className="text-xs text-slate-400 flex items-center gap-2 justify-start mb-1 font-bold tracking-tighter"><span className="text-blue-400 text-sm">{p.emoji}</span> {p.name}</div>
            ))}
          </div>
          <div className="bg-red-600/5 border border-red-500/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm text-right">
            <h4 className="text-red-500 text-[10px] font-black mb-2 border-b border-red-500/10 pb-1 uppercase font-black">أهل القصر</h4>
            {players.filter(p => p.team === "red" && p.role !== "spectator").map(p => (
              <div key={p.id} className="text-xs text-slate-400 flex items-center gap-2 justify-end mb-1 font-bold tracking-tighter">{p.name} <span className="text-red-400 text-sm">{p.emoji}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}