"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // 🛠️ استخدمنا هذا لضمان قراءة الرابط
import { supabase } from "../../../lib/supabase"; 

export default function GameBoard() {
  const params = useParams();
  const roomId = params?.id; // استخراج اسم الروم بأمان

  // حالات اللعبة
  const [blueScore, setBlueScore] = useState(8);
  const [redScore, setRedScore] = useState(9);
  const [currentTurn, setCurrentTurn] = useState("blue"); 
  const [timeLeft, setTimeLeft] = useState(120); 
  const [gamePhase, setGamePhase] = useState("hinting");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // حالات اللاعب المحلي (جهازك)
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmoji, setUserEmoji] = useState("👤");
  const [userTeam, setUserTeam] = useState("none"); 
  const [userRole, setUserRole] = useState("spectator"); 
  const [isJoined, setIsJoined] = useState(false);

  // حالات الواجهة
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(false); 
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [tempTeam, setTempTeam] = useState(""); 
  
  // بيانات السيرفر
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [hintWord, setHintWord] = useState(""); 
  const [hintCount, setHintCount] = useState(0);
  const [hintInput, setHintInput] = useState("");
  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 

  const [wordBank] = useState({
    najd: ["خبيز", "مبخرة", "دلة", "طويق", "عرضة", "محالة", "جصة", "ميقاع", "مرقب", "قليب", "وجار", "روشن", "صفة", "منفاخ", "دبيازة", "جريش", "قرصان", "مرقوق", "حنيني", "شقراء", "نقاء", "نفود", "خرازة", "سواني", "مذود"]
  });

  // 1. مزامنة البيانات من قاعدة البيانات
  useEffect(() => {
    if (!isJoined || !roomId) return;

    const fetchRoomData = async () => {
      try {
        const { data: players } = await supabase.from('players').select('*').eq('room_id', roomId);
        if (players) setRoomPlayers(players);

        const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
        if (room) {
          setBlueScore(room.blue_score ?? 8);
          setRedScore(room.red_score ?? 9);
          setCurrentTurn(room.current_turn ?? 'blue');
          setGamePhase(room.game_phase ?? 'hinting');
          setHintWord(room.hint_word ?? '');
          setHintCount(room.hint_count ?? 0);
          if (room.board_words) setCurrentWords(room.board_words);
          if (room.board_colors) setWordColors(room.board_colors);
          if (room.board_revealed) setRevealedWords(room.board_revealed);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsDataLoaded(true); // 🛠️ هذا السطر يضمن اختفاء شاشة التحميل دائماً
      }
    };

    fetchRoomData();

    const channel = supabase.channel(`room_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newData = payload.new;
        setBlueScore(newData.blue_score);
        setRedScore(newData.red_score);
        setCurrentTurn(newData.current_turn);
        setGamePhase(newData.game_phase);
        setHintWord(newData.hint_word);
        setHintCount(newData.hint_count);
        if (newData.board_revealed) setRevealedWords(newData.board_revealed);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) setRoomPlayers(data);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, isJoined]);

  // 2. الدخول كمشاهد (Spectator)
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !roomId) return;

    try {
      const { data: existingRoom } = await supabase.from('rooms').select('id').eq('id', roomId).maybeSingle();
      
      if (!existingRoom) {
        const words = [...wordBank.najd].sort(() => 0.5 - Math.random()).slice(0, 25);
        const colors = [...Array(9).fill("bg-blue-600"), ...Array(8).fill("bg-red-600"), "bg-stone-800", ...Array(7).fill("bg-stone-300")].sort(() => 0.5 - Math.random());
        
        await supabase.from('rooms').insert([{
          id: roomId, board_words: words, board_colors: colors, board_revealed: Array(25).fill(false)
        }]);
      }

      const { data: newPlayer } = await supabase.from('players').insert([{
        room_id: roomId, name: userName, emoji: userEmoji, team: 'none', role: 'spectator'
      }]).select().single();

      if (newPlayer) {
        setLocalPlayerId(newPlayer.id);
      }
    } catch (error) {
      console.error("Join error:", error);
    } finally {
      setIsJoined(true); // 🛠️ يضمن دخولك للروم حتى لو واجه تأخير بالاتصال
    }
  };

  // 3. اختيار الدور من داخل الروم
  const handleRoleSelect = async (selectedRole) => {
    if (localPlayerId) {
      await supabase.from('players').update({ team: tempTeam, role: selectedRole }).eq('id', localPlayerId);
    }
    setUserTeam(tempTeam);
    setUserRole(selectedRole);
    setIsRoleModalOpen(false);
  };

  // 4. التفاعل مع الكلمات
  const handleWordClick = async (index) => {
    if (userRole !== "decoder" || userTeam !== currentTurn || gamePhase !== "guessing" || revealedWords[index]) return;

    const newRevealed = [...revealedWords];
    newRevealed[index] = true;
    
    const actualColor = wordColors[index];
    let newBlue = blueScore;
    let newRed = redScore;
    let newTurn = currentTurn;
    let newPhase = gamePhase;

    if (actualColor === "bg-blue-600") newBlue = Math.max(0, blueScore - 1);
    if (actualColor === "bg-red-600") newRed = Math.max(0, redScore - 1);
    
    if (actualColor !== (currentTurn === "blue" ? "bg-blue-600" : "bg-red-600")) {
      newTurn = currentTurn === "blue" ? "red" : "blue";
      newPhase = "hinting";
    }

    await supabase.from('rooms').update({
      board_revealed: newRevealed, blue_score: newBlue, red_score: newRed, current_turn: newTurn, game_phase: newPhase,
      hint_word: newPhase === "hinting" ? "" : hintWord,
      hint_count: newPhase === "hinting" ? 0 : hintCount
    }).eq('id', roomId);
  };

  const sendHint = async () => {
    if (hintCount > 0 && hintInput.trim()) {
      await supabase.from('rooms').update({ hint_word: hintInput, hint_count: hintCount, game_phase: "guessing" }).eq('id', roomId);
      setHintInput("");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isJoined) {
    return (
      <div className="fixed inset-0 bg-[#F5F5DC] flex items-center justify-center p-6 text-right font-sans" dir="rtl">
        <div className="bg-white border border-stone-200 p-8 rounded-3xl w-full max-w-sm shadow-xl font-bold">
          <h2 className="text-2xl font-black text-stone-800 mb-6 text-center tracking-widest uppercase">الدروازة 🚪</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-center font-bold outline-none" placeholder="وش اسمك؟" required />
            <button type="submit" className="w-full bg-stone-800 text-white py-4 rounded-xl font-black shadow-lg">دخول للروم</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isDataLoaded) {
    return <div className="min-h-screen bg-[#F5F5DC] flex items-center justify-center font-bold text-stone-800">جاري تجهيز الروم...</div>;
  }

  return (
    <div className="min-h-screen w-full relative font-sans text-right pb-24" dir="rtl">
      <div className="fixed inset-0 bg-[#F5F5DC] z-[-1]"></div>

      <header className="w-full bg-white/70 border-b border-stone-200 backdrop-blur-md px-4 md:px-10 py-3 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-xl shadow-sm">{userEmoji}</button>
          <button onClick={() => setIsPlayersListOpen(true)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2">
            👥 الأعضاء ({roomPlayers.length})
          </button>
        </div>
        <button onClick={() => window.location.reload()} className="text-stone-800 text-sm md:text-lg font-black uppercase italic tracking-widest">الدروازة</button>
      </header>

      <main className="w-full max-w-4xl mx-auto flex flex-col items-center p-4 space-y-6">
        
        {userRole === "spectator" && (
          <div className="w-full bg-stone-800 text-white p-4 rounded-2xl shadow-lg flex justify-between items-center animate-pulse">
            <span className="text-xs font-bold">أنت الآن في وضع المشاهدة 🍿</span>
            <button onClick={() => setIsRoleModalOpen(true)} className="bg-white text-stone-800 px-4 py-2 rounded-xl text-[10px] font-black shadow-sm">انزل العب 🎮</button>
          </div>
        )}

        <div className="w-full space-y-4">
          <div className={`w-full py-2.5 text-center text-xs font-black uppercase rounded-2xl border shadow-sm transition-all ${currentTurn === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            دور: {currentTurn === 'blue' ? 'أهل الحارة' : 'أهل القصر'} {gamePhase === "hinting" ? "(يلمح)" : "(يخمن)"}
          </div>
          <div className="flex justify-between items-center px-4 font-bold">
            <div className="text-center">
              <span className="text-blue-600 text-[10px] font-black uppercase block mb-1">أهل الحارة</span>
              <div className={`text-5xl font-black ${currentTurn === 'blue' ? 'text-blue-600' : 'text-stone-300'}`}>{blueScore}</div>
            </div>
            <div className={`bg-white border-2 px-6 py-2 rounded-full font-mono text-xl shadow-md border-stone-200 text-stone-800`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-center">
              <span className="text-red-600 text-[10px] font-black uppercase block mb-1">أهل القصر</span>
              <div className={`text-5xl font-black ${currentTurn === 'red' ? 'text-red-600' : 'text-stone-300'}`}>{redScore}</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-white/40 p-2 border border-stone-200 rounded-[2.5rem] shadow-2xl grid grid-cols-5 gap-2">
          {currentWords.map((word, index) => {
            const isRevealed = revealedWords[index];
            const actualColor = wordColors[index];
            return (
              <button key={index} onClick={() => handleWordClick(index)} className={`aspect-[4/3] border rounded-2xl flex items-center justify-center transition-all duration-300 relative shadow-sm active:scale-95 ${isRevealed ? `${actualColor} border-transparent text-white ring-4 ring-white/10` : 'bg-white border-stone-100 hover:border-stone-300 text-stone-800'}`}>
                {(!isRevealed && userRole === "master") && <div className={`absolute inset-x-0 bottom-0 h-1.5 ${actualColor} opacity-50`}></div>}
                <span className="text-[10px] sm:text-sm font-black text-center px-1 leading-tight">{word}</span>
              </button>
            );
          })}
        </div>

        {userRole !== "spectator" && (
          <div className="w-full pt-4">
            {gamePhase === "hinting" ? (
              userRole === "master" && userTeam === currentTurn && (
                <div className="flex gap-2 bg-white/90 p-2.5 rounded-3xl border border-stone-200 shadow-xl">
                  <div className="flex bg-stone-50 border border-stone-100 rounded-xl p-1 gap-1">
                    <button onClick={() => setHintCount(prev => Math.max(0, prev - 1))} className="w-8 h-8 text-stone-400 font-bold">-</button>
                    <div className="w-8 h-8 flex items-center justify-center text-stone-800 font-black text-xs">{hintCount}</div>
                    <button onClick={() => setHintCount(prev => prev + 1)} className="w-8 h-8 text-stone-400 font-bold">+</button>
                  </div>
                  <input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} placeholder="أدخل التلميحة..." className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 text-[10px] text-stone-800 font-bold outline-none text-right" />
                  <button onClick={sendHint} className="bg-stone-800 text-white px-5 rounded-xl font-black shadow-md">أرسل</button>
                </div>
              )
            ) : (
              <div className="bg-white border-2 border-stone-200 p-4 rounded-3xl flex justify-between items-center shadow-lg">
                <div className="flex flex-col">
                  <span className="text-[9px] text-stone-400 font-black uppercase block mb-1">تلميحة الفريق</span>
                  <span className="text-xl font-black text-stone-800">{hintWord}</span>
                </div>
                <div className="bg-stone-800 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black shadow-lg">{hintCount}</div>
              </div>
            )}
          </div>
        )}
      </main>

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-[200] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setIsRoleModalOpen(false)}>
          <div className="bg-white border border-stone-200 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-stone-800 font-black text-center text-lg">اختر موقعك باللعبة 🎮</h3>
            {!tempTeam ? (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setTempTeam("blue")} className="bg-blue-50 text-blue-600 border border-blue-200 p-4 rounded-2xl font-black hover:bg-blue-100">أهل الحارة</button>
                <button onClick={() => setTempTeam("red")} className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl font-black hover:bg-red-100">أهل القصر</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleRoleSelect("master")} className="bg-stone-800 text-white p-4 rounded-2xl font-black">المُشفر 🤫</button>
                <button onClick={() => handleRoleSelect("decoder")} className="bg-stone-100 text-stone-800 border border-stone-300 p-4 rounded-2xl font-black">مفكك الشفرة 🕵️</button>
              </div>
            )}
            <button onClick={() => { setIsRoleModalOpen(false); setTempTeam(""); }} className="text-stone-400 text-sm font-bold mt-2 hover:text-stone-600">إلغاء</button>
          </div>
        </div>
      )}

      {isPlayersListOpen && (
        <div className="fixed inset-0 z-[200] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setIsPlayersListOpen(false)}>
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-stone-800 font-black text-sm uppercase font-bold tracking-widest">المتواجدون في الدروازة 👥</h3>
              <button onClick={() => setIsPlayersListOpen(false)} className="text-stone-400 hover:text-stone-600 text-2xl font-bold">×</button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
              {roomPlayers.map((p, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border shadow-sm ${p.role === 'spectator' ? 'bg-stone-50 border-stone-200' : p.team === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-stone-800">{p.name} {p.name === userName && "(أنت)"}</span>
                      {p.role !== 'spectator' && (
                        <span className={`text-[8px] font-black uppercase ${p.team === 'blue' ? 'text-blue-500' : 'text-red-500'}`}>{p.team === 'blue' ? 'أهل الحارة' : 'أهل القصر'}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[8px] px-3 py-1 rounded-full font-black ${p.role === 'spectator' ? 'bg-stone-200 text-stone-600' : 'bg-stone-800 text-white'}`}>
                    {p.role === 'spectator' ? '👀 مشاهد' : p.role === 'master' ? '🤫 مُشفر' : '🕵️ مفكك'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}