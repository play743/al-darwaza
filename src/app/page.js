"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from 'canvas-confetti';

// خوارزمية الألعاب النارية السلسة
const fireSmoothFireworks = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;
  const colors = ['#14b8a6', '#f59e0b', '#ef4444', '#ffffff', '#3b82f6'];

  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: colors, zIndex: 10000 });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: colors, zIndex: 10000 });
    if (Date.now() < end) requestAnimationFrame(frame);
  }());
};

export default function Home() {
  const router = useRouter();
  
  const [showDatePopup, setShowDatePopup] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const footerPages = {
    privacy: {
      title: "سياسة الخصوصية 🛡️",
      content: "نحن نحترم خصوصيتك في 'الدروازة'. لا نقوم بجمع أو حفظ أو مشاركة أي بيانات شخصية مع أطراف خارجية. جميع الأسماء المدخلة تستخدم محلياً لأغراض اللعب فقط وتُحذف تلقائياً، لتستمتع بتجربة لعب آمنة ومريحة."
    },
    terms: {
      title: "الشروط والأحكام 📜",
      content: "باستخدامك لموقع 'الدروازة'، فأنت توافق على اللعب بروح رياضية واحترام جميع اللاعبين. يُمنع استخدام الأسماء المسيئة أو تخريب الغرف. نحتفظ بالحق الكامل في طرد أو حظر أي مستخدم نهائياً من استخدام الموقع. كما نود التنويه إلى أن الموقع مخصص للعب فقط، والتواصل أو التعارف بين الجنسين داخل اللعبة غير مرغوب فيه تماماً. نهدف لتوفير بيئة لعب نظيفة للجميع."
    },
    contact: {
      title: "تواصل معنا ✉️",
      content: "نسعد بسماع اقتراحاتكم وملاحظاتكم لتطوير اللعبة! (سيتم إضافة روابط حساباتنا في منصات التواصل الاجتماعي قريباً)."
    }
  };

  useEffect(() => {
    // 1. نظام الاحتفال
    const hasCelebrated = localStorage.getItem("darwaza_launch_celebration_v3");
    if (!hasCelebrated) {
      fireSmoothFireworks();
      localStorage.setItem("darwaza_launch_celebration_v3", "true");
    }

    // 2. الصوت الترحيبي البسيط (يشتغل مرة وحدة بالجلسة)
    let audio = new Audio('/sounds/welcome.mp3');
    audio.volume = 0.5;

    const playWelcomeSound = () => {
      if (sessionStorage.getItem("darwaza_welcome_played") !== "true") {
        audio.play().catch(e => console.log("الصوت بانتظار تفاعل المستخدم"));
        sessionStorage.setItem("darwaza_welcome_played", "true");
      }
      document.removeEventListener('click', playWelcomeSound);
      document.removeEventListener('touchstart', playWelcomeSound);
    };

    if (sessionStorage.getItem("darwaza_welcome_played") !== "true") {
      document.addEventListener('click', playWelcomeSound);
      document.addEventListener('touchstart', playWelcomeSound);
    }

    return () => {
      document.removeEventListener('click', playWelcomeSound);
      document.removeEventListener('touchstart', playWelcomeSound);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center justify-between pt-10 font-sans text-right relative overflow-x-hidden" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body { font-family: 'Noto Kufi Arabic', sans-serif; }
      `}</style>

      {/* المحتوى العلوي */}
      <div className="w-full flex flex-col items-center px-4 space-y-6 flex-1">
        <section className="w-full text-center mt-6">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide">
            يا هلا فيك 👋
          </h1>
        </section>

        <section className="w-full max-w-4xl flex flex-col items-center mt-8">
          
          <div className="flex items-center gap-3 mb-8 w-full px-4">
            <div className="h-[1px] flex-1 bg-slate-800/80"></div>
            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">ألـعـابـنـا</h2>
            <div className="h-[1px] flex-1 bg-slate-800/80"></div>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-lg mx-auto px-1 sm:px-2">
            
            {/* لعبة فك الشفرة */}
            <div 
              onClick={() => router.push('/games/fak-alshafra')}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-1.5 sm:p-4 flex flex-col items-center justify-center hover:border-teal-500/50 hover:bg-slate-800/80 transition-all group cursor-pointer shadow-lg aspect-square relative"
            >
              <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full animate-pulse shadow-[0_0_6px_#14b8a6]"></div>
              <div className="text-xl sm:text-4xl group-hover:scale-110 transition-transform mb-1 sm:mb-2 mt-1">🔍</div>
              <h3 className="text-[8px] sm:text-[14px] font-black text-white text-center leading-none">فك الشفرة</h3>
              <p className="text-[5.5px] sm:text-[10px] text-slate-400 font-bold text-center mt-1 sm:mt-2 leading-[1.4] opacity-80 group-hover:opacity-100 transition-opacity px-0.5">
                تحدي بين فريقين يختبر قدرتك على التشفير وزملائك على فك الشفرة.
              </p>
            </div>

            {/* قريباً */}
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-1.5 sm:p-4 flex flex-col items-center justify-center opacity-50 grayscale cursor-not-allowed aspect-square">
              <div className="text-xl sm:text-4xl opacity-60 mb-1 sm:mb-2 mt-1">⏳</div>
              <h3 className="text-[8px] sm:text-[14px] font-black text-slate-500 text-center leading-none">قريباً</h3>
            </div>
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-1.5 sm:p-4 flex flex-col items-center justify-center opacity-50 grayscale cursor-not-allowed aspect-square">
              <div className="text-xl sm:text-4xl opacity-60 mb-1 sm:mb-2 mt-1">⏳</div>
              <h3 className="text-[8px] sm:text-[14px] font-black text-slate-500 text-center leading-none">قريباً</h3>
            </div>
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-1.5 sm:p-4 flex flex-col items-center justify-center opacity-50 grayscale cursor-not-allowed aspect-square">
              <div className="text-xl sm:text-4xl opacity-60 mb-1 sm:mb-2 mt-1">⏳</div>
              <h3 className="text-[8px] sm:text-[14px] font-black text-slate-500 text-center leading-none">قريباً</h3>
            </div>

          </div>
        </section>
      </div>

      {/* الفوتر */}
      <footer className="w-full mt-20 border-t border-slate-800/60 bg-gradient-to-t from-[#020617] to-transparent pb-6 pt-10 flex flex-col items-center gap-6 relative z-10">
        
        <div 
          className="relative cursor-pointer flex flex-col items-center select-none px-4"
          onClick={() => setShowDatePopup(!showDatePopup)}
        >
          <p className={`font-bold text-[11px] sm:text-xs transition-colors duration-300 tracking-wide flex items-center gap-2 ${showDatePopup ? 'text-slate-300' : 'text-slate-500/80'}`}>
            <span className="animate-pulse">🎉</span> تم إطلاق الموقع في 20 رمضان 🌙 <span className="animate-pulse">🎉</span>
          </p>
          <div className={`absolute bottom-full mb-3 transition-all duration-300 ease-out bg-slate-800 text-teal-300 text-[10px] font-bold px-4 py-2 rounded-xl shadow-xl border border-slate-600 whitespace-nowrap ${showDatePopup ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            1447 هـ - 2026 م
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-600"></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 px-4">
          <button onClick={() => setActiveModal('privacy')} className="text-[10px] sm:text-[11px] font-bold text-slate-600 hover:text-teal-400 transition-colors outline-none">سياسة الخصوصية</button>
          <span className="text-slate-800">•</span>
          <button onClick={() => setActiveModal('terms')} className="text-[10px] sm:text-[11px] font-bold text-slate-600 hover:text-teal-400 transition-colors outline-none">الشروط والأحكام</button>
          <span className="text-slate-800">•</span>
          <button onClick={() => setActiveModal('contact')} className="text-[10px] sm:text-[11px] font-bold text-slate-600 hover:text-teal-400 transition-colors outline-none">تواصل معنا</button>
        </div>

        <p className="text-[9px] text-slate-700 font-bold mt-2 tracking-widest">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
        </p>
      </footer>

      {/* النافذة المنبثقة */}
      {activeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-fade-in-down">
            <h3 className="text-lg font-black text-teal-400 mb-4 text-center border-b border-slate-800 pb-3">{footerPages[activeModal].title}</h3>
            <p className="text-sm text-slate-300 font-bold leading-loose text-justify mb-6">{footerPages[activeModal].content}</p>
            <button onClick={() => setActiveModal(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl transition-all shadow-sm active:scale-95">إغلاق</button>
          </div>
        </div>
      )}

    </div>
  );
}