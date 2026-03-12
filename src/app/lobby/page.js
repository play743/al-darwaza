"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

export default function Lobby() {
  const router = useRouter();
  
  const [playerName, setPlayerName] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 دالة تحويل التاريخ إلى (منذ 5 دقائق، منذ ساعة...)
  const timeAgo = (dateString) => {
    if (!dateString) return "";
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval >= 1) return `منذ ${Math.floor(interval)} دقيقة`;
    return "الآن";
  };

  useEffect(() => {
    const savedName = localStorage.getItem("darwaza_global_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      router.push("/");
    }
    
    fetchRooms();
    
    const channel = supabase
      .channel('lobby-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms(); 
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchRooms(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, is_locked, created_at, players(id, is_online)")
        .eq("is_locked", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("خطأ من قاعدة البيانات:", error);
        return;
      }

      if (data) {
        const formattedRooms = data.map((room) => {
          const activePlayers = room.players ? room.players.filter(p => p.is_online === true) : [];
          return {
            ...room,
            name: room.name || `غرفة عامة (${room.id})`, 
            playerCount: activePlayers.length, 
          };
        })
        .sort((a, b) => {
          if (b.playerCount !== a.playerCount) {
            return a.playerCount - b.playerCount; 
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        setActiveRooms(formattedRooms);
      }
    } catch (err) {
      console.error("خطأ في معالجة الغرف:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = (roomId) => {
    router.push(`/room/${roomId}`);
  };

  const filteredRooms = activeRooms.filter((room) => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center py-6 px-4 font-sans text-right" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body { font-family: 'Noto Kufi Arabic', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>

      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 p-4 sm:p-6 rounded-3xl shadow-2xl flex flex-col h-[85vh]">
        
        {/* الهيدر الداخلي */}
        <div className="grid grid-cols-3 items-center pb-4 mb-5 border-b border-slate-800">
          <div className="flex justify-start">
            <button 
              onClick={() => router.back()} 
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-xl transition-all text-xs font-bold border border-slate-700 flex items-center gap-2 shadow-sm active:scale-95 shrink-0 w-fit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="hidden sm:inline-block">رجوع</span>
            </button>
          </div>

          <div className="flex justify-center whitespace-nowrap">
            <h1 className="text-lg sm:text-xl font-black text-teal-400">
              صالة الانتظار 👥
            </h1>
          </div>
          <div className="flex justify-end"></div>
        </div>
        
        {/* شريط البحث والتحديث */}
        <div className="flex gap-2 mb-5">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="ابحث باسم الروم أو الكود..." 
            className="flex-1 bg-[#020617] border border-slate-700 rounded-xl p-3 sm:p-4 text-xs font-bold text-white outline-none focus:border-teal-500 transition-colors placeholder-slate-500" 
          />
          <button onClick={fetchRooms} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 sm:px-6 rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-sm flex items-center gap-2 active:scale-95">
            <span className="hidden sm:inline-block">تحديث</span> 🔄
          </button>
        </div>

        {/* قائمة الغرف */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="text-center text-teal-500/70 text-sm py-10 font-black animate-pulse">
              جاري البحث عن الغرف المتاحة... 📡
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center py-12 gap-3 opacity-60">
              <span className="text-4xl">🏜️</span>
              <p className="text-slate-400 text-sm font-bold">ما فيه أي غرف متاحة حالياً، ارجع وأنشئ غرفتك الخاصة!</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id} className="bg-[#020617] border border-slate-800/80 p-3 sm:p-4 rounded-2xl flex justify-between items-center hover:border-teal-900/50 transition-all group">
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs sm:text-sm font-black text-slate-200 group-hover:text-teal-400 transition-colors">{room.name}</h4>
                  
                  {/* 🚀 إضافة وقت الإنشاء بجانب الكود */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold bg-slate-900/80 px-2 py-0.5 rounded-md w-fit border border-slate-800">كود: {room.id}</span>
                    <span className="text-[8px] sm:text-[9px] text-slate-600 font-bold">⏱️ {timeAgo(room.created_at)}</span>
                  </div>

                </div>
                
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold mb-0.5">اللاعبين</span>
                    <span className={`text-xs sm:text-sm font-black ${room.playerCount < 4 ? 'text-amber-400' : 'text-teal-400'}`}>
                      {room.playerCount} 👥
                    </span>
                  </div>
                  <button onClick={() => joinRoom(room.id)} className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-5 sm:px-8 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-95">
                    دخول
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}