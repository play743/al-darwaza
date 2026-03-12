"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 

export default function FakAlshafraHome() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("darwaza_global_name");
    if (savedName) setPlayerName(savedName);
  }, []);

  const createQuickRoom = async () => {
    if (!playerName.trim()) return alert(" اكتب اسمك قبل تدخل تلعب ");
    
    localStorage.setItem("darwaza_global_name", playerName);
    const randomRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase.from("rooms").insert({
      id: randomRoomId,
      name: `غرفة ${playerName}`,
      status: "waiting",
      is_locked: false
    });

    if (error) {
      console.error("خطأ الإنشاء:", error);
      return alert("فشل الاتصال بقاعدة البيانات لإنشاء الغرفة!");
    }

    router.push(`/room/${randomRoomId}`);
  };

  const goToLobby = () => {
    if (!playerName.trim()) return alert("اكتب اسمك قبل الدخول!");
    localStorage.setItem("darwaza_global_name", playerName);
    router.push(`/lobby`); 
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center justify-center py-6 px-4 font-sans text-right" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body { font-family: 'Noto Kufi Arabic', sans-serif; }
      `}</style>

      {/* المربع الرئيسي (موحد مع باقي النوافذ) */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 p-4 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        
        {/* 🚀 الهيدر الداخلي */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          
          {/* 🚀 1. زر الرجوع (موجود في اليمين ويشير لليمين) */}
          <button 
            onClick={() => router.push("/")} 
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-xl transition-all text-xs font-bold border border-slate-700 flex items-center gap-2 shadow-sm active:scale-95 shrink-0"
          >
            {/* 🚀 سهم نظيف يشير لليمين 👉 */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="hidden sm:inline-block">رجوع</span>
          </button>

          {/* 🚀 2. العنوان (أخذ باقي المساحة لمنع الضغط) */}
          <div className="flex-1 flex items-center justify-start gap-2.5 sm:gap-3 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#020617] rounded-xl border border-slate-800 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              🔍
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-teal-400 whitespace-nowrap truncate">
              فك الشفرة
            </h1>
          </div>

        </div>
        
        {/* صندوق طريقة اللعب */}
        <section className="bg-[#020617] border border-slate-800/80 p-5 rounded-2xl shadow-inner">
          <h3 className="text-teal-500 font-black text-xs sm:text-sm mb-3">طريقة اللعبة 📜</h3>
          <ul className="text-slate-300 text-[11px] sm:text-xs font-bold space-y-3 leading-relaxed list-disc list-inside px-1">
            <li>ينقسم اللاعبون إلى فريقين: <span className="text-blue-400">الدهاة</span> و <span className="text-red-400">الجهابذة</span></li>
            <li>كل فريق يتكون من <span className="text-amber-400">مُشفر</span> والبقية يكونون <span className="text-slate-100">مفككين للشفرات</span></li>
            <li>المُشفر يعطي تلميحة عبارة عن <span className="underline decoration-teal-500 underline-offset-4">كلمة واحدة فقط ورقم</span> (مثال: حيوان 3)</li>
            <li>المفككون يتشاورون ويرشحون الكلمات التابعة لفريقهم بناءً على الشفرة للوصول لجميع كلماتهم قبل المنافس</li>
            <li>احذروا من الكلمة <span className="text-red-500 font-black">السوداء (القاتلة)</span>، اختيارها ينهي اللعبة بخسارة فريقك فوراً ☠️</li>
          </ul>
        </section>

        {/* منطقة الدخول */}
        <section className="flex flex-col items-center gap-5 pt-2">
          <div className="w-full max-w-sm space-y-2">
            <label className="text-[10px] font-bold text-slate-400 block px-1">اكتب اسمك أولاً لتبدأ اللعب:</label>
            <input 
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="وش اسمك؟" 
              className="w-full p-3.5 sm:p-4 rounded-xl bg-[#020617] border border-slate-700 text-center text-sm font-bold text-white outline-none focus:border-teal-500 transition-colors shadow-inner placeholder-slate-600" 
            />
          </div>

          <div className="w-full max-w-sm grid grid-cols-1 gap-2.5">
            <button onClick={createQuickRoom} className="w-full bg-gradient-to-br from-teal-500 to-teal-700 text-white border border-teal-600/50 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black hover:from-teal-400 hover:to-teal-600 transition-all shadow-lg flex justify-center items-center gap-2 active:scale-95">
              إنشاء غرفة جديدة 🚀
            </button>
            <button onClick={goToLobby} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95">
              البحث عن غرف حالية 👥
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}