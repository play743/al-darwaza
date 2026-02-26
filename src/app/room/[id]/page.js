"use client";

import { useState, useEffect, useCallback } from "react";

export default function GameBoard({ params }) {
  const [blueScore, setBlueScore] = useState(8);
  const [redScore, setRedScore] = useState(9);
  
  const [userName, setUserName] = useState("");
  const [userEmoji, setUserEmoji] = useState("👤");
  const [isNameSet, setIsNameSet] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false); 
  const [gameTime, setGameTime] = useState("02:00");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  
  // نظام التلميحات (المشفر)
  const [hintWord, setHintWord] = useState(""); 
  const [hintCount, setHintCount] = useState(0);
  const [hintInput, setHintInput] = useState("");
  const [isHintSet, setIsHintSet] = useState(false);

  const [players, setPlayers] = useState([]);
  const [wordPack, setWordPack] = useState("najd");
  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 

  const [wordBank] = useState({
    najd: ["خبيز", "مبخرة", "دلة", "طويق", "عرضة", "محالة", "جصة", "ميقاع", "مرقب", "قليب", "وجار", "روشن", "صفة", "منفاخ", "دبيازة", "جريش", "قرصان", "مرقوق", "حنيني", "شقراء", "نقاء", "نفود", "خرازة", "سواني", "مذود"],
    cities: ["الرياض", "جدة", "مكة", "المدينة", "بريدة", "عنيزة", "أبها", "حائل", "تبوك", "الدمام", "الخبر", "نجران", "جيزان", "الجوف", "الباحة", "الطائف", "القطيف", "الجبيل", "ينبع", "الخرج", "عرعر", "سكاكا", "القنفذة", "بيشة", "محايل"],
    gaming: ["بلايستيشن", "كيبورد", "ماوس", "لعبة", "تحدي", "بث", "سكواد", "نوب", "احتراف", "فوز", "خسارة", "لاغ", "تيم", "درع", "سيف", "قنبلة", "خريطة", "سكين", "مهمة", "ليفيل", "نقاط", "رتبة", "اونلاين", "بطولة", "جيمر"],
    general: ["نخلة", "سيف", "بحر", "صقر", "جمل", "خيمة", "تمر", "ليل", "نجم", "قمر", "شمس", "سحاب", "مطر", "وادي", "جبل", "رمل", "غزال", "قهوة", "مبخرة", "عود", "فنجال", "رياض", "سماء", "نور", "ظلام"]
  });

  useEffect(() => {
    const savedName = localStorage.getItem("al-darwaza-name");
    const savedEmoji = localStorage.getItem("al-darwaza-emoji");
    if (savedName) {
      setUserName(savedName);
      setUserEmoji(savedEmoji || "👤");
      setIsNameSet(true);
      setPlayers([{ id: 1, name: savedName, emoji: savedEmoji || "👤", role: "owner", team: "blue" }]);
    }
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem("al-darwaza-name", userName);
      localStorage.setItem("al-darwaza-emoji", userEmoji);
      setIsNameSet(true);
      setPlayers([{ id: 1, name: userName, emoji: userEmoji, role: "owner", team: "blue" }]);
    }
  };

  const generateColors = useCallback(() => {
    const colors = [...Array(8).fill("bg-blue-600"), ...Array(8).fill("bg-red-600"), "bg-slate-950", ...Array(8).fill("bg-slate-500")];
    return colors.sort(() => 0.5 - Math.random());
  }, []);

  const shuffleWords = useCallback((packKey) => {
    const bank = wordBank[packKey];
    if (!bank) return;
    setCurrentWords([...bank].sort(() => 0.5 - Math.random()).slice(0, 25));
    setWordColors(generateColors()); 
    setRevealedWords(Array(25).fill(false)); 
    setIsHintSet(false); 
    setHintWord("");
    setHintCount(0);
  }, [wordBank, generateColors]);

  useEffect(() => { shuffleWords(wordPack); }, [wordPack, shuffleWords]);

  const handleWordClick = (index) => {
    // 1. منع الضغط إذا لم تكن هناك تلميحة مثبتة
    if (!isHintSet) {
      alert("لازم المُشفر يرسل تلميحة أول! 🤫");
      return;
    }
    
    // 2. منع المشفر (أنت) من اختيار الكلمات بعد إرسال التلميحة
    if (isHintSet) {
       console.log("المشفر يشاهد فقط ولا يفك الشفرة");
       return; 
    }

    if (revealedWords[index]) return;
    const newRevealed = [...revealedWords];
    newRevealed[index] = true;
    setRevealedWords(newRevealed);
    const color = wordColors[index];
    if (color === "bg-blue-600") setBlueScore(prev => Math.max(0, prev - 1));
    if (color === "bg-red-600") setRedScore(prev => Math.max(0, prev - 1));
  };

  const sendHint = () => {
    if (hintInput.trim() !== "" && hintCount > 0) {
      setHintWord(hintInput.trim());
      setIsHintSet(true);
      setHintInput("");
    }
  };

  const shareRoom = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    });
  };

  if (!isNameSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-right font-sans" dir="rtl">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
          <h2 className="text-2xl font-black text-teal-500 mb-6 tracking-tighter text-center">حياك في الدروازة 🚪</h2>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-center font-bold outline-none focus:border-teal-500" placeholder="وش اسمك؟" required />
            <div className="flex justify-center gap-2 py-2">
              {["👤", "👑", "🗡️", "☕", "🌴"].map(e => (
                <button key={e} type="button" onClick={() => setUserEmoji(e)} className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl transition-all ${userEmoji === e ? 'bg-teal-500/20 border border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'bg-slate-800 border border-slate-700'}`}>{e}</button>
              ))}
            </div>
            <button className="w-full bg-teal-600 text-slate-950 py-4 rounded-xl font-black shadow-lg hover:bg-teal-500 transition-all active:scale-95">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full max-w-2xl mx-auto overflow-hidden relative bg-slate-950 text-right font-sans" dir="rtl">
      
      {showCopyAlert && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-teal-500 text-slate-950 px-8 py-3 rounded-2xl font-black text-sm shadow-2xl animate-in zoom-in duration-300">
          تم نسخ رابط الدروازة 📋
        </div>
      )}

      {/* الهيدر */}
      <div className="w-full flex justify-between items-center mb-4 px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-md relative z-30 font-bold">
        <button onClick={() => { setIsProfileOpen(true); setIsManageOpen(false); }} className="w-9 h-9 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-center text-lg active:scale-90 shadow-md">{userEmoji}</button>
        <span className="text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase opacity-40 italic">الدروازة</span>
        <div className="flex gap-2">
          <button onClick={shareRoom} className="w-9 h-9 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-center text-slate-400 active:scale-90">📤</button>
          <button onClick={() => { setIsManageOpen(true); setIsProfileOpen(false); }} className={`w-9 h-9 bg-slate-950/80 border rounded-lg flex items-center justify-center transition-all active:scale-90 ${isManageOpen ? 'border-teal-500 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.2)]' : 'border-slate-800 text-slate-400'}`}>⚙️</button>
        </div>
      </div>

      {/* عرض التلميحة المثبتة */}
      {isHintSet && (
        <div className="w-full max-w-md px-4 mb-4 animate-in slide-in-from-top duration-500">
          <div className="bg-teal-500/10 border border-teal-500/30 p-3 rounded-2xl flex justify-between items-center shadow-lg backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[8px] text-teal-500 font-black uppercase tracking-widest">التلميحة المثبتة</span>
              <span className="text-xl font-black text-slate-100 tracking-tighter">{hintWord}</span>
            </div>
            <div className="bg-teal-500 text-slate-950 h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner">
              {hintCount}
            </div>
          </div>
        </div>
      )}

      {/* السكور */}
      <div className="relative z-20 w-full flex flex-col items-center px-1">
        <div className="w-full flex justify-between items-center mb-6 px-5 font-black">
          <div className="flex flex-col items-center"><span className="text-blue-500 text-[9px] uppercase tracking-widest opacity-80">أهل الحارة</span><div className="text-blue-400 text-4xl tracking-tighter">{blueScore}</div></div>
          <div className="bg-slate-900/50 border border-slate-800 px-5 py-2 rounded-full font-mono text-[11px] text-slate-500 shadow-inner">{gameTime}</div>
          <div className="flex flex-col items-center"><span className="text-red-500 text-[9px] uppercase tracking-widest opacity-80">أهل القصر</span><div className="text-red-400 text-4xl tracking-tighter">{redScore}</div></div>
        </div>

        {/* شبكة الكلمات */}
        <div className="w-full bg-slate-900/40 p-1.5 border border-slate-800 rounded-2xl shadow-2xl mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {currentWords.map((word, index) => (
            <button key={index} onClick={() => handleWordClick(index)} className={`border rounded-lg flex items-center justify-center transition-all duration-500 shadow-sm font-bold relative overflow-hidden active:scale-95 ${revealedWords[index] ? `${wordColors[index]} border-transparent scale-95 shadow-inner` : 'bg-slate-800 border-slate-700/50 hover:bg-slate-750'}`} style={{ aspectRatio: '4/3' }}>
              <span className={`text-[9px] sm:text-xs font-bold text-center px-1 tracking-tighter select-none ${revealedWords[index] ? 'text-white' : 'text-slate-200'}`}>{word}</span>
            </button>
          ))}
        </div>

        {/* بار التلميحة للمشفر - يختفي عند الإرسال لقفل الدور */}
        {!isHintSet ? (
          <div className="w-full max-w-md px-2 mb-8">
            <div className="flex gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 shadow-lg backdrop-blur-md">
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
                <button onClick={() => setHintCount(prev => Math.max(0, prev - 1))} className="h-8 w-8 bg-slate-900 text-slate-400 rounded-lg font-bold flex items-center justify-center">-</button>
                <div className="h-8 w-8 flex items-center justify-center text-teal-500 font-black text-xs">{hintCount}</div>
                <button onClick={() => setHintCount(prev => prev + 1)} className="h-8 w-8 bg-slate-900 text-slate-400 rounded-lg font-bold flex items-center justify-center">+</button>
              </div>
              <input 
                type="text" 
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                placeholder="أدخل التلميحة (للمُشفر فقط)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-slate-200 font-bold outline-none focus:border-teal-500 transition-all text-right"
              />
              <button onClick={sendHint} className="bg-teal-600 hover:bg-teal-500 text-slate-950 px-5 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center">
            <div className="text-teal-500 text-[10px] font-black italic bg-slate-900/30 px-6 py-2 rounded-full border border-teal-500/20 shadow-sm animate-pulse">
              التلميحة فعلت.. الآن دور مفككين الشفرة! 🕵️‍♂️
            </div>
          </div>
        )}

        {/* قوائم اللاعبين */}
        <div className="w-full grid grid-cols-2 gap-4 px-2 mt-auto pb-4 font-bold">
          <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-blue-500 text-[10px] font-black mb-2 border-b border-blue-500/10 pb-1 uppercase tracking-tighter">أهل الحارة</h4>
            {players.filter(p => p.team === "blue").map(p => (
              <div key={p.id} className="text-xs text-slate-400 flex items-center gap-2 mb-1 tracking-tighter truncate"><span>{p.emoji}</span> {p.name}</div>
            ))}
          </div>
          <div className="bg-red-600/5 border border-red-500/10 rounded-2xl p-4 shadow-sm backdrop-blur-sm text-right">
            <h4 className="text-red-500 text-[10px] font-black mb-2 border-b border-red-500/10 pb-1 uppercase tracking-tighter font-black">أهل القصر</h4>
            <div className="text-[9px] text-slate-600 italic font-bold">بانتظار المنافس...</div>
          </div>
        </div>
      </div>

      {/* نافذة الإدارة (تعديل السكور وإعادة اللعب) */}
      {isManageOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px] flex items-start justify-center overflow-y-auto" onClick={() => setIsManageOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 w-[95%] max-w-[480px] rounded-3xl p-5 gap-6 mt-[70px] mb-10 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-teal-500 tracking-widest uppercase text-[10px] font-black">إدارة الروم 🛠️</h3>
            <button onClick={() => { setBlueScore(8); setRedScore(9); shuffleWords(wordPack); setIsManageOpen(false); }} className="w-full bg-red-600/20 border border-red-600/30 text-red-500 text-[11px] font-black py-4 rounded-xl shadow-lg hover:bg-red-600/30 transition-all">بدء جولة جديدة ⚠️</button>
            <button onClick={() => setIsManageOpen(false)} className="w-full bg-slate-950 text-slate-400 py-3 rounded-xl text-xs font-bold">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}