"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

// 🚀 إجبار Vercel على جلب بيانات حية دائماً
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function Lobby() {
  const router = useRouter();
  
  const [playerName, setPlayerName] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem("darwaza_global_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      router.push("/");
    }
    
    fetchRooms();

    // 📡 تفعيل الرادار (Realtime) لمراقبة صالة الغرف فوراً
    const channel = supabase
      .channel('lobby-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchRooms(); // إعادة جلب الغرف عند حدوث أي تغيير (إضافة/حذف/تعديل)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        fetchRooms(); // إعادة جلب الغرف لو تغير عدد اللاعبين داخلها
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  const fetchRooms = async () => {
    try {
      // 🚀 جلب الغرف التي أنشئت في آخر 24 ساعة لضمان ظهور كل شيء جديد
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, status, created_at, players(id, is_online)")
        .eq("status", "waiting") 
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false });

      if (data) {
        const formattedRooms = data.map((room) => {
          const activePlayers = room.players ? room.players.filter(p => p.is_online === true) : [];
          return {
            ...room,
            playerCount: activePlayers.length, 
          };
        })
        // أظهرنا الغرف حتى لو كانت 0 لاعبين عشان تقدر تنضم لها
        .sort((a, b) => {
          if (a.playerCount !== b.playerCount) {
            return a.playerCount - b.playerCount;
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        setActiveRooms(formattedRooms);
      }
    } catch (err) {
      console.error("خطأ في جلب الغرف:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = (roomId) => {
    router.push(`/room/${roomId}`);
  };

  const filteredRooms = activeRooms.filter((room) => 
    (room.name && room.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (room.id && room.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center py-8 px-4 font-sans text-right" dir="rtl">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
        body { font-family: 'Noto Kufi Arabic', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>

      {/* الهيدر */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          صالة الانتظار 👥
        </h1>
        <button onClick={() => router.push("/")} className="text-slate-400 hover:text-white text-xs font-bold transition-colors bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          العودة للرئيسية 🔙
        </button>
      </div>

      <div className="w-full max-w-3xl bg-slate-900/50 border border-slate-800/60 p-6 rounded-3xl shadow-xl flex flex-col h-[75vh]">
        
        {/* شريط البحث والتحديث */}
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="ابحث باسم الروم أو الكود..." 
            className="flex-1 bg-[#020617] border border-slate-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-teal-500 transition-colors placeholder-slate-500" 
          />
          <button onClick={fetchRooms} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-sm flex items-center gap-2">
            تحديث 🔄
          </button>
        </div>

        {/* قائمة الغرف */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
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
              <div key={room.id} className="bg-[#020617] border border-slate-800/80 p-4 rounded-2xl flex justify-between items-center hover:border-teal-900/50 transition-all group">
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-sm font-black text-slate-200 group-hover:text-teal-400 transition-colors">{room.name}</h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-900/80 px-2 py-0.5 rounded-md w-fit border border-slate-800">كود الروم: {room.id}</span>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-slate-500 font-bold mb-0.5">اللاعبين</span>
                    <span className={`text-sm font-black ${room.playerCount < 4 ? 'text-amber-400' : 'text-teal-400'}`}>
                      {room.playerCount} 👥
                    </span>
                  </div>
                  <button onClick={() => joinRoom(room.id)} className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-8 py-3 rounded-xl text-xs font-black hover:bg-teal-500 hover:text-white transition-all shadow-sm">
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