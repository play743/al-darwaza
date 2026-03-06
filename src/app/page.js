"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center py-10 px-4 space-y-6 overflow-x-hidden" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body {
          font-family: 'Noto Kufi Arabic', sans-serif;
        }
      `}</style>

      {/* الترحيب (بدون الوصف) */}
      <section className="w-full text-center mt-6">
        <h1 className="text-3xl md:text-4xl font-black text-white">
          يا هلا فيك 👋
        </h1>
      </section>

      {/* شريط الألعاب */}
      <section className="w-full max-w-4xl flex flex-col items-center mt-4">
        
        {/* كلمة ألعابنا الممتدة بدون تقطيع */}
        <div className="flex items-center gap-3 mb-8 w-full px-4">
          <div className="h-[1px] flex-1 bg-slate-800/80"></div>
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
            ألـعـابـنـا
          </h2>
          <div className="h-[1px] flex-1 bg-slate-800/80"></div>
        </div>

        {/* شبكة الألعاب - 4 بالعرض دائماً */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg mx-auto px-2">
          
          {/* لعبة فك الشفرة (أيقونة مصغرة) */}
          <div 
            onClick={() => router.push('/games/fak-alshafra')}
            className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 hover:border-teal-500/50 transition-all group cursor-pointer shadow-lg aspect-square relative"
          >
            {/* نقطة خضراء تدل إن اللعبة شغالة */}
            <div className="absolute top-2 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_5px_#14b8a6]"></div>
            
            <div className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform mt-1">🔍</div>
            <h3 className="text-[9px] sm:text-[11px] font-black text-white mt-1 text-center leading-tight">فك<br/>الشفرة</h3>
          </div>

          {/* بطاقة قريباً 1 */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 opacity-50 grayscale cursor-not-allowed aspect-square">
            <div className="text-2xl sm:text-3xl opacity-60">⏳</div>
            <h3 className="text-[9px] sm:text-[11px] font-black text-slate-500 mt-1 text-center">قريباً</h3>
          </div>

          {/* بطاقة قريباً 2 */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 opacity-50 grayscale cursor-not-allowed aspect-square">
            <div className="text-2xl sm:text-3xl opacity-60">⏳</div>
            <h3 className="text-[9px] sm:text-[11px] font-black text-slate-500 mt-1 text-center">قريباً</h3>
          </div>

          {/* بطاقة قريباً 3 */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 opacity-50 grayscale cursor-not-allowed aspect-square">
            <div className="text-2xl sm:text-3xl opacity-60">⏳</div>
            <h3 className="text-[9px] sm:text-[11px] font-black text-slate-500 mt-1 text-center">قريباً</h3>
          </div>

        </div>
      </section>

    </div>
  );
}