"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  // دالة إنشاء روم جديد
  const createRoom = () => {
    const newCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    router.push(`/room/${newCode}`);
  };

  // دالة الانضمام لروم موجود
  const joinRoom = (e) => {
    e.preventDefault();
    if (roomCode.length === 5) {
      router.push(`/room/${roomCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* تأثيرات الإضاءة الخلفية */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">الدروازة</h1>
        <p className="text-slate-400 mb-12">تحدي الذكاء، فك الشفرة، واجمع أخوياك</p>

        <div className="space-y-6">
          {/* زر الإنشاء */}
          <button 
            onClick={createRoom}
            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-4 rounded-2xl text-xl shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all active:scale-95"
          >
            إنشاء غرفة جديدة 🎮
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-grow h-[1px] bg-slate-800"></div>
            <span className="text-slate-600 text-sm font-bold">أو</span>
            <div className="flex-grow h-[1px] bg-slate-800"></div>
          </div>

          {/* نموذج الانضمام */}
          <form onSubmit={joinRoom} className="space-y-3">
            <input 
              type="text" 
              placeholder="اكتب كود الغرفة (مثال: C1XRG)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={5}
              className="w-full bg-slate-900 border border-slate-800 text-white text-center py-4 rounded-2xl focus:outline-none focus:border-teal-500 transition-all uppercase font-mono tracking-widest"
            />
            <button 
              type="submit"
              disabled={roomCode.length !== 5}
              className="w-full bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold py-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              انضمام للغرفة
            </button>
          </form>
        </div>
      </div>

      <footer className="absolute bottom-8 text-slate-700 text-xs font-bold tracking-widest">
        DARWAZA ENGINE v1.0
      </footer>
    </div>
  );
}