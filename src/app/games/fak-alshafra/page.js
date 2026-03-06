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
    if (!playerName.trim()) return alert("تكفى اكتب اسمك قبل تدخل اللعب!");
    
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
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center py-10 px-4 font-sans text-right" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body { font-family: 'Noto Kufi Arabic', sans-serif; }
      `}</style>

      {/* زر العودة للرئيسية */}
      <div className="w-full max-w-2xl flex justify-end mb-6">
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white text-xs font-bold transition-colors bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
          العودة للرئيسية 🔙
        </button>
      </div>

      <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800/60 rounded-[2rem] p-6 sm:p-8 shadow-xl flex flex-col gap-8">
        
        {/* العنوان وطريقة اللعب */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-2xl shadow-inner">🔍</div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">فك الشفرة</h1>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800/50 p-5 rounded-2xl space-y-3">
            <h3 className="text-teal-400 font-black text-sm border-b border-slate-800 pb-2 mb-3">كيف تلعب؟ 📜</h3>
            <ul className="text-slate-300 text-xs sm:text-sm font-bold space-y-2.5 leading-relaxed list-disc list-inside px-2">
              <li>ينقسم اللاعبون إلى فريقين: <span className="text-blue-400">الدهاة</span> و <span className="text-red-400">الجهابذة</span>.</li>
              <li>كل فريق يختار <span className="text-amber-400">مُشفر (قائد)</span> والبقية يكونون <span className="text-slate-100">مفككين شفرات</span>.</li>
              <li>المُشفر يعطي تلميحة عبارة عن <span className="underline decoration-teal-500">كلمة واحدة فقط ورقم</span> (مثال: حيوان 3).</li>
              <li>المفككون يتشاورون ويرشحون الكلمات التابعة لفريقهم بناءً على التلميحة.</li>
              <li>احذروا من الكلمة <span className="text-red-500 font-black">السوداء (القاتلة)</span>، اختيارها ينهي اللعبة بخسارة فريقك فوراً! ☠️</li>
            </ul>
          </div>
        </section>

        {/* الخط الفاصل الخفيف */}
        <hr className="border-slate-800/80 w-3/4 mx-auto" />

        {/* منطقة إدخال الاسم والأزرار */}
        <section className="flex flex-col items-center gap-4 pt-2">
          <div className="w-full max-w-sm space-y-3">
            <label className="text-[10px] font-bold text-slate-400 block text-center uppercase tracking-widest">أدخل اسمك للبدء</label>
            <input 
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="وش اسمك؟" 
              className="w-full p-3.5 rounded-xl bg-[#020617] border border-slate-700 text-center text-sm font-bold text-white outline-none focus:border-teal-500 transition-colors shadow-inner" 
            />
          </div>

          <div className="w-full max-w-sm grid grid-cols-1 gap-3 mt-2">
            <button onClick={createQuickRoom} className="w-full bg-gradient-to-br from-teal-500 to-teal-700 text-white border border-teal-600/50 py-3.5 rounded-xl text-sm font-black hover:from-teal-400 hover:to-teal-600 transition-all shadow-lg flex justify-center items-center gap-2">
              إنشاء غرفة خاصة 🚀
            </button>
            <button onClick={goToLobby} className="w-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2">
              البحث عن غرف حالية 👥
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}