"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState("register");
  
  const createQuickRoom = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    router.push(`/room/${randomRoomId}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center py-10 px-4 space-y-12 overflow-x-hidden">
      
      {/* استدعاء خط كوفي عصري */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body {
          font-family: 'Noto Kufi Arabic', sans-serif;
        }
      `}</style>

      {/* قسم الترحيب المحدث */}
      <section className="w-full max-w-2xl text-center space-y-6">
        <div className="space-y-1">
          <span className="text-teal-500/50 text-[9px] font-bold uppercase tracking-[0.4em]">المنصة الجماعية</span>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            يا هلااا بك
          </h1>
        </div>

        <div className="bg-slate-900/20 border border-slate-800/40 p-6 rounded-[2rem] space-y-4">
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">
            الدروازة هي منصة ألعاب من مطور سعودي، قرر فيها يعرب الألعاب ويخليها باللغة العربية. 
            في حال عندك اقتراحات لألعاب مسلية أو انتقادات عالموقع تقدر تزودني فيها {" "}
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSeQabOUnRPa40dQkm7SqvrW-3YiCGtwi2r3wecDmdPEassO3A/viewform?usp=dialog" 
              target="_blank" 
              className="text-teal-400 underline hover:text-teal-300 transition-colors"
            >
              هنا
            </a> لتطوير الموقع.
          </p>

          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            يمديك تسجل دخولك عشان تحفظ سجل لعبك، وتشوف تحليلات لعبك وتقدمك وبتستفيد من تسجيلك مستقبلاً 😉. 
            الموقع صمم لتتنافس مع باقي اللاعبين في منطقتك، وتتحدى في قائمة الصدارة.. مستعد؟
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
          <button 
            onClick={() => { setAuthType("register"); setIsAuthModalOpen(true); }}
            className="w-full sm:w-48 bg-teal-500 text-[#020617] py-3 rounded-xl font-black text-xs hover:bg-teal-400 transition-all shadow-lg"
          >
            إنشاء حساب جديد ✨
          </button>
          <button 
            onClick={() => { setAuthType("login"); setIsAuthModalOpen(true); }}
            className="w-full sm:w-48 bg-slate-900 border border-slate-800 text-slate-300 py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            تسجيل الدخول
          </button>
        </div>
      </section>

      {/* مساحة إعلانية صغيرة */}
      <section className="w-full max-w-3xl px-4">
        <div className="w-full h-20 bg-slate-900/30 border border-slate-800/50 rounded-2xl flex items-center justify-center">
          <span className="text-slate-700 font-bold text-[9px] uppercase tracking-widest">مساحة إعلانية فارغة 📢</span>
        </div>
      </section>

      {/* شريط الألعاب */}
      <section className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8 w-full">
          <div className="h-[1px] flex-1 bg-slate-800/50"></div>
          <h2 className="text-[10px] font-black text-slate-500 tracking-widest uppercase">ألعابنــــا</h2>
          <div className="h-[1px] flex-1 bg-slate-800/50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-2">
          {/* بطاقة فك الشفرة */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-[1.5rem] p-6 flex flex-col gap-4 hover:border-teal-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔍</div>
              <span className="bg-teal-500/10 text-teal-400 text-[8px] font-black px-2 py-1 rounded-lg">نشط الآن</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white mb-1">فك الشفرة</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">لعبة ذكاء وتواصل تعتمد على التلميحات وسرعة البديهة بين الفريقين.</p>
            </div>
            <button onClick={createQuickRoom} className="w-full bg-[#020617] text-teal-400 border border-teal-500/20 py-2.5 rounded-xl text-[10px] font-black hover:bg-teal-500 hover:text-white transition-all">
              العب كزائر سريع 🚀
            </button>
          </div>

          {/* بطاقة قريباً */}
          <div className="bg-slate-900/20 border border-slate-800/30 rounded-[1.5rem] p-6 flex flex-col gap-4 opacity-40 grayscale">
            <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-2xl">⏳</div>
            <h3 className="text-sm font-black text-slate-400">قريباً..</h3>
          </div>
        </div>
      </section>

      {/* نافذة الحساب المنسقة */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[7000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-white">{authType === "register" ? "عضوية جديدة" : "دخول"}</h2>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-500 hover:text-white text-xl">&times;</button>
            </div>
            <div className="space-y-4">
               {/* محتوى الفورم يوضع هنا */}
               <p className="text-[10px] text-center text-slate-500">سيتم ربط نظام التسجيل قريباً..</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}