"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 
import fpPromise from '@fingerprintjs/fingerprintjs'; // 🚀 ضفنا هذي عشان نسجل موقعه وجهازه للسيرفر

export default function Lobby() {
  const router = useRouter();
  
  const [playerName, setPlayerName] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(5); // 🚀 عداد يعرض 5 رومات كبداية

  // 🚀 متغيرات جدار الحماية (الموقع)
  const [locationGranted, setLocationGranted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

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

  // 🚀 دالة طلب الموقع وتسجيل الجهاز في قاعدة البيانات
  const requestLocationAccess = useCallback(() => {
    setIsRequestingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("متصفحك لا يدعم تحديد الموقع!");
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // 1. أخذنا الإحداثيات
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // 2. نسجل بياناته في السيرفر بسرية تامة عشان التتبع
        try {
          let ip = "unknown";
          try { const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json(); ip = data.ip; } catch(e) {}
          let fingerprint = "unknown";
          try { const fp = await fpPromise.load(); const result = await fp.get(); fingerprint = result.visitorId; } catch(e) {}
          
          let deviceToken = localStorage.getItem('darwaza_device_token');
          if (!deviceToken) { 
            deviceToken = 'DEV-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now(); 
            localStorage.setItem('darwaza_device_token', deviceToken); 
          }

          await supabase.rpc('secure_log_device', {
            p_device_token: deviceToken,
            p_fingerprint: fingerprint,
            p_ip: ip,
            p_location: `POINT(${lng} ${lat})`,
            p_last_active: new Date().toISOString()
          });
        } catch (e) {
          console.error("فشل تسجيل الجهاز", e);
        }

        // 3. نفتح له بوابة اللوبي
        setLocationGranted(true);
        setIsRequestingLocation(false);
      },
      (error) => {
        setIsRequestingLocation(false);
        setLocationError("عذراً، لا يمكنك تصفح الغرف بدون تفعيل الموقع 📍. يرجى السماح من إعدادات المتصفح ثم المحاولة مجدداً.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // 🚀 نتحقق هل هو معطينا الصلاحية من قبل؟ (عشان إذا حدث الصفحة ما نغثه ويفتح فوراً)
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
        if (result.state === 'granted') {
          requestLocationAccess(); 
        }
      });
    }
  }, [requestLocationAccess]);

  useEffect(() => {
    const savedName = localStorage.getItem("darwaza_global_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      router.push("/");
    }
    
    // 🚀 ما نخليه يبحث في الرومات ولا يتصل بالسيرفر إلا إذا سمح بالموقع
    if (locationGranted) {
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
    }
  }, [router, locationGranted]); // 🚀 أضفنا الصلاحية كشرط للتشغيل

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
          // 🚀 هل الروم لسا ما اكتملت؟ (أقل من 6 لاعبين متصلين)
          const aNeedsPlayers = a.playerCount < 6;
          const bNeedsPlayers = b.playerCount < 6;

          // إذا الأولى تحتاج لاعبين والثانية فل (6 وفوق)، نرفع الأولى فوق
          if (aNeedsPlayers && !bNeedsPlayers) return -1;
          if (!aNeedsPlayers && bNeedsPlayers) return 1;

          // إذا كلهم نفس الحالة (كلهم يحتاجون، أو كلهم فل)، نرتبهم بالأحدث إنشاءً
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

  // 🚀 البوابة الأمنية: إذا ما فعل الموقع، نعرض له شاشة السماح
  if (!locationGranted) {
    return (
      <div className="w-full min-h-screen bg-[#020617] flex flex-col items-center justify-center py-6 px-4 font-sans text-right" dir="rtl">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap');
          body { font-family: 'Noto Kufi Arabic', sans-serif; }
        `}</style>
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          {/* تأثيرات جمالية بالخلفية */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-6xl mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(45,212,191,0.4)]">📍</div>
          <h2 className="text-xl font-black text-teal-400 mb-4">لعرض الرومات القريبة منك</h2>
          <p className="text-sm text-slate-400 font-bold mb-8 leading-relaxed px-2">
            عشان نعرض لك الغرف المتاحة حولك بشكل دقيق، نحتاج إذنك للوصول لموقعك الجغرافي.
          </p>
          
          <button 
            onClick={requestLocationAccess} 
            disabled={isRequestingLocation}
            className="w-full bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-400 hover:to-teal-600 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(20,184,166,0.5)] transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequestingLocation ? "جاري التفعيل..." : "تفعيل الموقع 📍"}
          </button>
          
          {locationError && (
            <div className="mt-4 text-xs font-bold text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-900/50 w-full animate-pulse">
              {locationError}
            </div>
          )}
          
          <button onClick={() => router.back()} className="mt-6 text-xs text-slate-500 hover:text-slate-300 font-bold underline decoration-slate-600 underline-offset-4 transition-colors">
            تراجع والعودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // 🚀 واجهة اللوبي تفتح بعد تفعيل الموقع
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
            <>
              {filteredRooms.slice(0, displayLimit).map((room) => (
                <div key={room.id} className="bg-[#020617] border border-slate-800/80 p-3 sm:p-4 rounded-2xl flex justify-between items-center hover:border-teal-900/50 transition-all group">
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-xs sm:text-sm font-black text-slate-200 group-hover:text-teal-400 transition-colors">{room.name}</h4>
                    
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
              ))}

              {/* 🚀 زر عرض المزيد (يظهر بس إذا كان فيه رومات مخفية) */}
              {displayLimit < filteredRooms.length && (
                <button 
                  onClick={() => setDisplayLimit(prev => prev + 1)} 
                  className="w-full bg-slate-800/30 hover:bg-slate-800 text-teal-400/80 hover:text-teal-400 border border-slate-700/50 hover:border-slate-600 border-dashed py-3 rounded-2xl text-[10px] sm:text-xs font-bold transition-all mt-2 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>عرض المزيد</span>
                  <span className="text-[12px] animate-bounce">👇</span>
                </button>
              )}
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}