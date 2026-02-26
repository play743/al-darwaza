"use client";

import { useState, useEffect, useCallback } from "react";

export default function GameBoard({ params }) {
  // الحالات الأساسية
  const [blueScore, setBlueScore] = useState(8);
  const [redScore, setRedScore] = useState(9);
  const [currentTurn, setCurrentTurn] = useState("blue"); 
  const [timeLeft, setTimeLeft] = useState(120); 
  const [isActive, setIsActive] = useState(false); 

  // حالات الواجهة
  const [userName, setUserName] = useState("");
  const [userEmoji, setUserEmoji] = useState("👤");
  const [isNameSet, setIsNameSet] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false); 

  // نظام التلميحات
  const [hintWord, setHintWord] = useState(""); 
  const [hintCount, setHintCount] = useState(0);
  const [hintInput, setHintInput] = useState("");
  const [isHintSet, setIsHintSet] = useState(false);

  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 
  const [wordPack, setWordPack] = useState("najd");

  const [wordBank] = useState({
    najd: ["خبيز", "مبخرة", "دلة", "طويق", "عرضة", "محالة", "جصة", "ميقاع", "مرقب", "قليب", "وجار", "روشن", "صفة", "منفاخ", "دبيازة", "جريش", "قرصان", "مرقوق", "حنيني", "شقراء", "نقاء", "نفود", "خرازة", "سواني", "مذود"],
    cities: ["الرياض", "جدة", "مكة", "المدينة", "بريدة", "عنيزة", "أبها", "حائل", "تبوك", "الدمام", "الخبر", "نجران", "جيزان", "الجوف", "الباحة", "الطائف", "القطيف", "الجبيل", "ينبع", "الخرج", "عرعر", "سكاكا", "القنفذة", "بيشة", "محايل"]
  });

  // منطق العداد
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setCurrentTurn(currentTurn === "blue" ? "red" : "blue");
      setTimeLeft(120);
      setIsHintSet(false);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentTurn]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const savedName = localStorage.getItem("al-darwaza-name");
    const savedEmoji = localStorage.getItem("al-darwaza-emoji");
    if (savedName) {
      setUserName(savedName);
      setUserEmoji(savedEmoji || "👤");
      setIsNameSet(true);
    }
  }, []);

  const generateColors = useCallback(() => {
    const colors = [...Array(8).fill("bg-blue-600"), ...Array(8).fill("bg-red-600"), "bg-stone-800", ...Array(9).fill("bg-stone-300")];
    return colors.sort(() => 0.5 - Math.random());
  }, []);

  const shuffleWords = useCallback((packKey) => {
    const bank = wordBank[packKey] || wordBank.najd;
    setCurrentWords([...bank].sort(() => 0.5 - Math.random()).slice(0, 25));
    setWordColors(generateColors()); 
    setRevealedWords(Array(25).fill(false)); 
    setIsHintSet(false);
    setTimeLeft(120);
    setIsActive(false);
  }, [wordBank, generateColors]);

  useEffect(() => { shuffleWords(wordPack); }, [wordPack, shuffleWords]);

  if (!isNameSet) {
    return (
      <div className="fixed inset-0 bg-[#F5F5DC] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="bg-white border border-stone-200 p-8 rounded-3xl w-full max-w-sm shadow-xl">
          <h2 className="text-2xl font-black text-stone-800 mb-6">الدروازة 🚪</h2>
          <form onSubmit={(e) => { e.preventDefault(); if(userName.trim()){ localStorage.setItem("al-darwaza-name", userName); setIsNameSet(true); }}} className="space-y-4">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-center font-bold outline-none" placeholder="وش اسمك؟" required />
            <button className="w-full bg-stone-800 text-white py-4 rounded-xl font-black shadow-lg">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    /* 🛠️ الإصلاح هنا: استخدام fixed inset-0 للخلفية الأساسية 🛠️ */
    <div className="min-h-screen w-full relative font-sans text-right" dir="rtl">
      
      {/* طبقة الخلفية البيج الممتدة */}
      <div className="fixed inset-0 bg-[#F5F5DC] z-[-1]"></div>

      {/* الهيدر الممتد بالكامل */}
      <header className="w-full bg-white/70 border-b border-stone-200 backdrop-blur-md px-4 md:px-10 py-3 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-xl shadow-sm">{userEmoji}</button>
        <button onClick={() => window.location.reload()} className="text-stone-800 text-sm md:text-lg font-black uppercase italic tracking-widest hover:opacity-70 transition-opacity">الدروازة</button>
        <button onClick={() => setIsManageOpen(true)} className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-stone-600 shadow-sm active:scale-90">⚙️</button>
      </header>

      {/* حاوية المحتوى الوسطية */}
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center p-4 md:p-6 space-y-6">
        
        {/* السكور والأدوار */}
        <div className="w-full space-y-4">
          <div className={`w-full py-2 text-center text-[10px] font-black uppercase rounded-2xl border transition-all ${currentTurn === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' : 'bg-red-50 text-red-600 border-red-100 shadow-sm'}`}>
            دور: {currentTurn === 'blue' ? 'أهل الحارة' : 'أهل القصر'} {isHintSet ? "🕵️ فكوا الشفرة" : "🤫 المُشفر يلمح"}
          </div>
          
          <div className="flex justify-between items-center px-4">
            <div className="text-center">
              <span className="text-blue-600 text-[10px] font-black uppercase block mb-1">أهل الحارة</span>
              <div className={`text-5xl font-black ${currentTurn === 'blue' ? 'text-blue-600' : 'text-stone-300'}`}>{blueScore}</div>
            </div>
            <div className={`bg-white border-2 ${timeLeft < 20 ? 'border-red-500 text-red-600 animate-pulse' : 'border-stone-200 text-stone-800'} px-6 py-2 rounded-full font-mono text-xl shadow-md`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-center">
              <span className="text-red-600 text-[10px] font-black uppercase block mb-1">أهل القصر</span>
              <div className={`text-5xl font-black ${currentTurn === 'red' ? 'text-red-600' : 'text-stone-300'}`}>{redScore}</div>
            </div>
          </div>
        </div>

        {/* شبكة الكلمات */}
        <div className="w-full bg-white/40 p-1.5 border border-stone-200 rounded-[2.5rem] shadow-2xl grid grid-cols-5 gap-1.5">
          {currentWords.map((word, index) => {
            const isRevealed = revealedWords[index];
            const actualColor = wordColors[index];
            return (
              <button key={index} 
                onClick={() => {
                  if (!isHintSet || isRevealed) return;
                  const newRevealed = [...revealedWords];
                  newRevealed[index] = true;
                  setRevealedWords(newRevealed);
                  if (actualColor === "bg-blue-600") setBlueScore(s => Math.max(0, s - 1));
                  if (actualColor === "bg-red-600") setRedScore(s => Math.max(0, s - 1));
                  if (actualColor !== (currentTurn === "blue" ? "bg-blue-600" : "bg-red-600")) {
                    setTimeout(() => { setCurrentTurn(t => t === "blue" ? "red" : "blue"); setTimeLeft(120); setIsHintSet(false); setIsActive(false); }, 1000);
                  }
                }} 
                className={`aspect-[4/3] border rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden shadow-sm active:scale-95 ${isRevealed ? `${actualColor} border-transparent scale-95 text-white ring-4 ring-white/10` : 'bg-white border-stone-100 hover:bg-stone-50 text-stone-800'}`}>
                {!isRevealed && <div className={`absolute inset-x-0 bottom-0 h-1.5 ${actualColor} opacity-50`}></div>}
                <span className="text-[10px] sm:text-xs font-black text-center px-1 leading-tight">{word}</span>
              </button>
            );
          })}
        </div>

        {/* بار التلميحة والفرق السفلية */}
        <div className="w-full space-y-6 pb-10">
          {!isHintSet ? (
            <div className="flex gap-2 bg-white/90 p-2.5 rounded-3xl border border-stone-200 shadow-xl">
              <div className="flex bg-stone-50 border border-stone-100 rounded-xl p-1 gap-1">
                <button onClick={() => setHintCount(prev => Math.max(0, prev - 1))} className="w-8 h-8 text-stone-400 font-bold">-</button>
                <div className="w-8 h-8 flex items-center justify-center text-stone-800 font-black text-xs">{hintCount}</div>
                <button onClick={() => setHintCount(prev => prev + 1)} className="w-8 h-8 text-stone-400 font-bold">+</button>
              </div>
              <input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} placeholder="أدخل التلميحة..." className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 text-[10px] text-stone-800 font-bold outline-none text-right" />
              <button onClick={() => { if (hintCount > 0 && hintInput.trim()) { setHintWord(hintInput); setIsHintSet(true); setIsActive(true); setHintInput(""); } }} className="bg-stone-800 text-white px-5 rounded-xl font-black shadow-md transition-colors active:scale-95">📤</button>
            </div>
          ) : (
            <div className="bg-white border-2 border-stone-200 p-4 rounded-3xl flex justify-between items-center shadow-lg animate-in zoom-in">
              <div className="flex flex-col">
                <span className="text-[9px] text-stone-400 font-black uppercase block mb-1">تلميحة الفريق</span>
                <span className="text-xl font-black text-stone-800">{hintWord}</span>
              </div>
              <div className="bg-stone-800 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shadow-lg ring-2 ring-stone-100">{hintCount}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-4 shadow-sm">
              <h4 className="text-blue-600 text-[10px] font-black mb-2 border-b border-blue-100 pb-1 uppercase tracking-widest font-bold">أهل الحارة</h4>
              <div className="text-xs text-stone-600 font-bold flex items-center gap-2"><span>{userEmoji}</span> {userName}</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-4 text-right shadow-sm">
              <h4 className="text-red-600 text-[10px] font-black mb-2 border-b border-red-100 pb-1 uppercase tracking-widest font-bold text-right">أهل القصر</h4>
              <div className="text-[9px] text-stone-400 italic font-bold">بانتظار المنافس...</div>
            </div>
          </div>
        </div>
      </main>

      {/* نافذة الإدارة */}
      {isManageOpen && (
        <div className="fixed inset-0 z-[200] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setIsManageOpen(false)}>
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-stone-800 font-black text-sm uppercase border-b border-stone-100 pb-2">إدارة الروم ⚙️</h3>
            <button onClick={() => { setBlueScore(8); setRedScore(9); shuffleWords(wordPack); setIsManageOpen(false); }} className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black py-4 rounded-xl shadow-sm hover:bg-red-100 transition-all">جولة جديدة 🔄</button>
            <button onClick={() => setIsManageOpen(false)} className="w-full bg-stone-800 text-white py-3 rounded-xl font-black">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}