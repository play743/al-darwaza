"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase"; 

export default function Home() {
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
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center py-6 px-4 space-y-8 overflow-x-hidden" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body {
          font-family: 'Noto Kufi Arabic', sans-serif;
        }
      `}</style>

      {/* الترحيب والوصف */}
      <section className="w-full max-w-2xl text-center space-y-3 mt-2">
        <h1 className="text-2xl md:text-3xl font-black text-white">
          يا هلا فيك 👋
        </h1>

        <div className="space-y-1.5 px-2">
          <p className="text-slate-200 text-sm md:text-base leading-relaxed font-bold">
            الدروازة هي منصة ألعاب من مطور سعودي، قرر فيها يجمع الألعاب الحلوه ويعربها.
          </p>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-bold">
            و في حال عندك اقتراحات لألعاب مسلية أو انتقادات عالموقع تقدر تزودني فيها {" "}
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSeQabOUnRPa40dQkm7SqvrW-3YiCGtwi2r3wecDmdPEassO3A/viewform?usp=dialog" 
              target="_blank" 
              className="text-teal-400 underline hover:text-teal-300 transition-colors font-bold"
            >
              هنا
            </a> عشان احسن الموقع وصدقني كلامك مسموع 😉
          </p>
        </div>
      </section>

      {/* شريط الألعاب */}
      <section className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6 w-full">
          <div className="h-[1px] flex-1 bg-slate-800/50"></div>
          <h2 className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">ألعابنــــا</h2>
          <div className="h-[1px] flex-1 bg-slate-800/50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-2">
          {/* بطاقة فك الشفرة */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-3 hover:border-teal-500/20 transition-all group max-w-sm mx-auto w-full">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔍</div>
              <span className="bg-teal-500/10 text-teal-400 text-[8px] font-black px-2 py-1 rounded-lg">نشط الآن</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white mb-1">فك الشفرة</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">لعبة ذكاء وتواصل تعتمد على التلميحات وسرعة البديهة بين الفريقين.</p>
            </div>
            
            <div className="mt-2 pt-3 border-t border-slate-800/50 flex flex-col gap-2">
              <input 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                placeholder="اكتب اسمك للعب..." 
                className="w-full p-2.5 rounded-xl bg-[#020617] border border-slate-700 text-center text-xs font-bold text-white outline-none focus:border-teal-500 transition-colors" 
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={createQuickRoom} className="bg-[#020617] text-teal-400 border border-teal-500/20 py-2.5 rounded-xl text-[9px] font-black hover:bg-teal-500 hover:text-white transition-all shadow-md">
                  إنشاء روم 🚀
                </button>
                <button onClick={goToLobby} className="bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2.5 rounded-xl text-[9px] font-bold transition-all">
                  البحث في الرومات 👥
                </button>
              </div>
            </div>
          </div>

          {/* بطاقة قريباً */}
          <div className="bg-slate-900/20 border border-slate-800/30 rounded-2xl p-5 flex flex-col gap-3 opacity-40 grayscale max-w-sm mx-auto w-full">
            <div className="w-10 h-10 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-xl">⏳</div>
            <h3 className="text-sm font-black text-slate-400">قريباً..</h3>
          </div>
        </div>
      </section>

    </div>
  );
}