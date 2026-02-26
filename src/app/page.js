"use client"; // هذا السطر ضروري عشان نقدر نتفاعل مع ضغطات الأزرار

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FakAlshafra() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 1. دالة لتوليد كود عشوائي للروم (5 حروف وأرقام)
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // 2. دالة تتنفذ لما يضغط اللاعب على الزر
  const handleCreateRoom = () => {
    setIsLoading(true); // نغير حالة الزر لـ "جاري الإنشاء..."
    
    // نولد الكود
    const newRoomCode = generateRoomCode();
    
    // نوجه اللاعب لصفحة الروم الجديدة (مثال: /room/X7A9Q)
    router.push(`/room/${newRoomCode}`);
  };

  return (
    <div className="min-h-[75vh] bg-slate-950 flex flex-col items-center justify-center rounded-xl shadow-2xl border border-slate-800 p-6 relative overflow-hidden">
      
      {/* تأثير إضاءة خفيف في الخلفية */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        
        <div className="text-center space-y-2">
          <h2 className="text-teal-400 text-3xl font-black tracking-wide">
            ساحة فك الشفرة
          </h2>
          <p className="text-slate-400 text-sm max-w-sm">
            العبها بذكاء.. أنشئ رومك الخاص واعزم أخوياك للتحدي.
          </p>
        </div>

        {/* زر إنشاء روم المبرمج */}
        <button 
          onClick={handleCreateRoom}
          disabled={isLoading}
          className="group relative bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xl py-4 px-12 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-wait"
        >
          <span>{isLoading ? "جاري تجهيز الروم..." : "إنشاء روم"}</span>
          {!isLoading && <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">⚙️</span>}
        </button>

      </div>
    </div>
  );
}