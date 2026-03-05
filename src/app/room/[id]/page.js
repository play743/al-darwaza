"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 

export default function GameBoard() {
  const params = useParams();
  const roomId = params?.id;
  const scrollRef = useRef(null);

  // حالات اللعبة الأساسية
  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [currentTurn, setCurrentTurn] = useState("blue"); 
  const [gamePhase, setGamePhase] = useState("hinting");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // إعدادات الروم والمالك (الجديدة)
  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [allowNameChange, setAllowNameChange] = useState(true);
  const [timerDuration, setTimerDuration] = useState(120); // بالثواني، 0 يعني مخفي
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // حالات اللاعب المحلي
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmoji, setUserEmoji] = useState("🎮");
  const [userTeam, setUserTeam] = useState("none"); 
  const [userRole, setUserRole] = useState("spectator"); 
  const [isJoined, setIsJoined] = useState(false);

  // حالات الواجهة
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddPackModalOpen, setIsAddPackModalOpen] = useState(false);
  
  // حالات الإعدادات
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editTeam, setEditTeam] = useState("");
  const [editRole, setEditRole] = useState("");
  const [gameLogs, setGameLogs] = useState([]);
  const [customPackText, setCustomPackText] = useState("");
  
  const availableEmojis = ["🇸🇦","🇰🇼","🎮","🐲","🌑","🪐","🌧️","😤","🥳","🥲","☠️","🤌🏼","👤","🧘‍♂️","⛹️","🤽","🎤","🎧","🛵","🚀","🗿","🚦","🌃","🏞️","📱","🖥️","⌚️","⏳","🪫","💡","🪤","🪓","🩺","🦠","🪭","🦅","🐢","🕸️"];

  const [wordPacks, setWordPacks] = useState({
    najd: { name: "نجديات 🐪", words: ["خبيز", "مبخرة", "دلة", "طويق", "عرضة", "محالة", "جصة", "ميقاع", "مرقب", "قليب", "وجار", "روشن", "صفة", "منفاخ", "دبيازة", "جريش", "قرصان", "مرقوق", "حنيني", "شقراء", "نقاء", "نفود", "خرازة", "سواني", "مذود"] },
    tech: { name: "تقنية 💻", words: ["لابتوب", "شاشة", "كيبورد", "ماوس", "سيرفر", "شبكة", "برمجة", "تطبيق", "موقع", "جوال", "شاحن", "بطارية", "ذاكرة", "معالج", "سحابة", "بيانات", "ذكاء", "كود", "هاكر", "فيروس", "حماية", "رابط", "متصفح", "نظام", "واي_فاي"] }
  });

  const [roomPlayers, setRoomPlayers] = useState([]);
  const [hintWord, setHintWord] = useState(""); 
  const [hintCount, setHintCount] = useState(0);
  const [hintInput, setHintInput] = useState("");
  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 

  const isOwner = localPlayerId && roomOwnerId === localPlayerId;

  // إعطاء رمز مبدئي
  useEffect(() => {
    const emojis = ["🦅", "🐺", "🐎", "🐪", "🐅", "🦉", "🦌", "🐆"];
    setUserEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  }, []);

  // النزول التلقائي للسجل
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [gameLogs]);

  // إدارة الوقت (العد التنازلي)
  useEffect(() => {
    if (!timerEndsAt || timerDuration === 0) {
      setTimeLeft(null);
      return;
    }
    const interval = setInterval(() => {
      const diff = new Date(timerEndsAt) - new Date();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEndsAt, timerDuration]);

  // جلب البيانات والمزامنة
  useEffect(() => {
    if (!isJoined || !roomId) return;

    const fetchRoomData = async () => {
      try {
        const { data: players } = await supabase.from('players').select('*').eq('room_id', roomId);
        if (players) setRoomPlayers(players);

        const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
        if (room) {
          setBlueScore(room.blue_score);
          setRedScore(room.red_score);
          setCurrentTurn(room.current_turn);
          setGamePhase(room.game_phase);
          setHintWord(room.hint_word ?? '');
          setHintCount(room.hint_count ?? 0);
          setGameLogs(room.logs ?? []);
          setRoomOwnerId(room.owner_id);
          setIsRoomLocked(room.is_locked ?? false);
          setAllowNameChange(room.allow_name_change ?? true);
          setTimerDuration(room.timer_duration ?? 120);
          setTimerEndsAt(room.timer_ends_at);
          if (room.board_words) setCurrentWords(room.board_words);
          if (room.board_colors) setWordColors(room.board_colors);
          if (room.board_revealed) setRevealedWords(room.board_revealed);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsDataLoaded(true);
      }
    };

    fetchRoomData();

    const channel = supabase.channel(`room_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const newData = payload.new;
        if (!newData) return;
        setBlueScore(newData.blue_score);
        setRedScore(newData.red_score);
        setCurrentTurn(newData.current_turn);
        setGamePhase(newData.game_phase);
        setHintWord(newData.hint_word);
        setHintCount(newData.hint_count);
        setGameLogs(newData.logs || []);
        setRoomOwnerId(newData.owner_id);
        setIsRoomLocked(newData.is_locked);
        setAllowNameChange(newData.allow_name_change);
        setTimerDuration(newData.timer_duration);
        setTimerEndsAt(newData.timer_ends_at);
        if (newData.board_revealed) setRevealedWords(newData.board_revealed);
        if (newData.board_words) setCurrentWords(newData.board_words);
        if (newData.board_colors) setWordColors(newData.board_colors);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) setRoomPlayers(data);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, isJoined]);

  const addGameLog = async (msg, type = "system") => {
    const newEntry = { msg, type, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) };
    const updatedLogs = [...gameLogs, newEntry].slice(-20);
    await supabase.from('rooms').update({ logs: updatedLogs }).eq('id', roomId);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !roomId) return;

    let isCreator = false;
    let localTempPlayerId = null;

    const { data: newPlayer } = await supabase.from('players').insert([{ room_id: roomId, name: userName, emoji: userEmoji, team: 'none', role: 'spectator' }]).select().single();
    if (newPlayer) {
      setLocalPlayerId(newPlayer.id);
      localTempPlayerId = newPlayer.id;
    }

    const { data: existingRoom } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
    
    if (!existingRoom || !existingRoom.board_words || existingRoom.board_words.length === 0) {
      isCreator = true;
      const words = [...wordPacks.najd.words].sort(() => 0.5 - Math.random()).slice(0, 25);
      const isBlueStarting = Math.random() > 0.5;
      const blueCount = isBlueStarting ? 9 : 8;
      const redCount = isBlueStarting ? 8 : 9;
      const startingTurn = isBlueStarting ? 'blue' : 'red';

      const colors = [
        ...Array(blueCount).fill("bg-blue-600"), 
        ...Array(redCount).fill("bg-red-600"), 
        "bg-stone-800", 
        ...Array(7).fill("bg-stone-300")
      ].sort(() => 0.5 - Math.random());
      
      await supabase.from('rooms').upsert({ 
        id: roomId, owner_id: localTempPlayerId, board_words: words, board_colors: colors, board_revealed: Array(25).fill(false), logs: [],
        blue_score: blueCount, red_score: redCount, current_turn: startingTurn, game_phase: 'hinting',
        is_locked: false, allow_name_change: true, timer_duration: 120, timer_ends_at: null
      });
    }

    setIsJoined(true);
    addGameLog(`دخل ${userName} ${isCreator ? '(المالك)' : ''} كـ مشاهد 🍿`);
  };

  // توليد روم جديدة (يستخدمها المالك عند تغيير الحزمة)
  const resetBoardWithWords = async (newWords) => {
    const isBlueStarting = Math.random() > 0.5;
    const blueCount = isBlueStarting ? 9 : 8;
    const redCount = isBlueStarting ? 8 : 9;
    const startingTurn = isBlueStarting ? 'blue' : 'red';
    const words = [...newWords].sort(() => 0.5 - Math.random()).slice(0, 25);
    const colors = [...Array(blueCount).fill("bg-blue-600"), ...Array(redCount).fill("bg-red-600"), "bg-stone-800", ...Array(7).fill("bg-stone-300")].sort(() => 0.5 - Math.random());
    
    await supabase.from('rooms').update({
      board_words: words, board_colors: colors, board_revealed: Array(25).fill(false),
      blue_score: blueCount, red_score: redCount, current_turn: startingTurn, game_phase: 'hinting', timer_ends_at: null, hint_word: '', hint_count: 0
    }).eq('id', roomId);
    
    addGameLog(`قام المالك بتحديث اللوحة بكلمات جديدة 🔄`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const words = text.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
      if (words.length >= 25) {
        setWordPacks(prev => ({ ...prev, custom: { name: "حزمة مخصصة 📦", words: words } }));
        alert("تمت إضافة الحزمة بنجاح!");
      } else {
        alert("الحزمة يجب أن تحتوي على 25 كلمة على الأقل!");
      }
    };
    reader.readAsText(file);
  };

  const saveCustomPack = () => {
    const words = customPackText.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
    if (words.length >= 25) {
      setWordPacks(prev => ({ ...prev, customUser: { name: "كلمات مكتوبة ✍️", words: words } }));
      setCustomPackText("");
      setIsAddPackModalOpen(false);
      alert("تمت إضافة الكلمات!");
    } else {
      alert(`الكلمات الحالية ${words.length}. يرجى إدخال 25 كلمة على الأقل.`);
    }
  };

  const openSettings = () => {
    setEditName(userName);
    setEditEmoji(userEmoji);
    setEditTeam(userTeam);
    setEditRole(userRole === 'spectator' && userTeam !== 'none' ? 'decoder' : userRole);
    setIsEditModalOpen(true);
  };

  const saveProfile = async () => {
    if (!editName.trim() || !localPlayerId) return;

    let finalRole = editRole;
    let finalTeam = editTeam;

    if (finalTeam === 'none') finalRole = 'spectator';
    if (finalTeam !== 'none' && finalRole === 'spectator') finalRole = 'decoder';
    if (userRole === 'master' && finalRole === 'decoder') finalRole = 'master'; 

    await supabase.from('players').update({ name: editName, emoji: editEmoji, team: finalTeam, role: finalRole }).eq('id', localPlayerId);

    setUserName(editName);
    setUserEmoji(editEmoji);
    setUserTeam(finalTeam);
    setUserRole(finalRole);
    setIsEditModalOpen(false);
    addGameLog(`قام ${editName} بتحديث بياناته/موقعه 🔄`);
  };

  const saveAdminSettings = async (newSettings) => {
    await supabase.from('rooms').update(newSettings).eq('id', roomId);
    addGameLog(`قام المالك بتغيير إعدادات الروم ⚙️`);
  };

  const handleWordClick = async (index) => {
    if (userRole !== "decoder" || userTeam !== currentTurn || gamePhase !== "guessing" || revealedWords[index]) return;

    // بدء الوقت مع أول ضغطة إذا لم يكن بدأ
    let currentTimerEndsAt = timerEndsAt;
    if (!timerEndsAt && timerDuration > 0) {
      currentTimerEndsAt = new Date(Date.now() + timerDuration * 1000).toISOString();
    }

    const newRevealed = [...revealedWords];
    newRevealed[index] = true;
    const actualColor = wordColors[index];
    const wordText = currentWords[index];
    
    let newBlue = blueScore;
    let newRed = redScore;
    let newTurn = currentTurn;
    let newPhase = gamePhase;

    if (actualColor === "bg-blue-600") newBlue = Math.max(0, blueScore - 1);
    else if (actualColor === "bg-red-600") newRed = Math.max(0, redScore - 1);
    
    const isCorrect = actualColor === (currentTurn === "blue" ? "bg-blue-600" : "bg-red-600");
    addGameLog(`${userName} اختار "${wordText}" - ${isCorrect ? 'صح ✅' : 'خطأ ❌'}`, currentTurn);

    if (!isCorrect) {
      newTurn = currentTurn === "blue" ? "red" : "blue";
      newPhase = "hinting";
    }

    await supabase.from('rooms').update({
      board_revealed: newRevealed, blue_score: newBlue, red_score: newRed, current_turn: newTurn, game_phase: newPhase,
      timer_ends_at: currentTimerEndsAt, hint_word: newPhase === "hinting" ? "" : hintWord, hint_count: newPhase === "hinting" ? 0 : hintCount
    }).eq('id', roomId);
  };

  const sendHint = async () => {
    if (hintCount > 0 && hintInput.trim() && userRole === "master") {
      let currentTimerEndsAt = timerEndsAt;
      if (!timerEndsAt && timerDuration > 0) currentTimerEndsAt = new Date(Date.now() + timerDuration * 1000).toISOString();

      await supabase.from('rooms').update({ hint_word: hintInput, hint_count: hintCount, game_phase: "guessing", timer_ends_at: currentTimerEndsAt }).eq('id', roomId);
      addGameLog(`المشفر ${userName} أرسل: ${hintInput} (${hintCount})`, userTeam);
      setHintInput("");
    }
  };

  const formatTime = (secs) => {
    if (secs === null || secs < 0) return "00:00";
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const sortPlayersByRole = (players) => [...players].sort((a, b) => (a.role === 'master' ? -1 : b.role === 'master' ? 1 : 0));
  const bluePlayers = sortPlayersByRole(roomPlayers.filter(p => p.team === 'blue'));
  const redPlayers = sortPlayersByRole(roomPlayers.filter(p => p.team === 'red'));
  const spectatorPlayers = roomPlayers.filter(p => p.team === 'none');

  let team1List = bluePlayers, team1Title = "الدهاة", team1Color = "blue";
  let team2List = redPlayers, team2Title = "الجهابذة", team2Color = "red";
  if (userTeam === 'red') {
    team1List = redPlayers; team1Title = "فريقك (الجهابذة)"; team1Color = "red";
    team2List = bluePlayers; team2Title = "الخصم (الدهاة)"; team2Color = "blue";
  } else if (userTeam === 'blue') {
    team1Title = "فريقك (الدهاة)"; team2Title = "الخصم (الجهابذة)";
  }

  const boardFaded = userRole === 'spectator' && isRoomLocked; // بهتان اللوحة للمشاهدين إذا الروم مقفلة

  if (!isJoined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-right relative" dir="rtl">
        <div className="fixed top-0 left-0 w-screen h-screen bg-[#F5F5DC] z-[-1]"></div>
        <div className="bg-white border border-stone-200 p-8 rounded-3xl w-full max-w-sm shadow-xl font-bold">
          <h2 className="text-2xl font-black text-stone-800 mb-6 text-center uppercase">الدروازة 🚪</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 text-center font-bold outline-none" placeholder="وش اسمك؟" required />
            <button type="submit" className="w-full bg-stone-800 text-white py-4 rounded-xl font-black shadow-lg hover:bg-stone-700 transition-colors">دخول للروم</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isDataLoaded || currentWords.length === 0) return <div className="min-h-[80vh] flex items-center justify-center font-bold text-stone-500 relative"><div className="fixed top-0 left-0 w-screen h-screen bg-[#F5F5DC] z-[-1]"></div>جاري فتح الدروازة وتجهيز الكلمات...</div>;

  return (
    <div className="w-full min-h-screen relative font-sans text-right py-6" dir="rtl">
      <div className="fixed top-0 left-0 w-screen h-screen bg-[#F5F5DC] z-[-1]"></div>

      <main className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-5">
        
        {/* شريط الحالة والمالك */}
        <div className="flex justify-between items-center w-full max-w-2xl bg-white border border-stone-200 p-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm border ${currentTurn === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              دور: {currentTurn === 'blue' ? 'الدهاة' : 'الجهابذة'} {gamePhase === "hinting" ? "(يلمح)" : "(يخمن)"}
            </div>
            {isOwner && (
              <button onClick={() => setIsAdminModalOpen(true)} className="bg-teal-400 text-teal-950 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-[0_0_15px_rgba(45,212,191,0.6)] hover:bg-teal-300 transition-all flex items-center gap-1">
                إعدادات اللعبة ⚙️
              </button>
            )}
          </div>
          
          {timerDuration > 0 && (
            <div className={`font-mono text-base font-black ${timeLeft !== null && timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-stone-700'}`}>
              {timerEndsAt === null ? formatTime(timerDuration) : formatTime(timeLeft)} ⏱️
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={() => setIsPlayersListOpen(true)} className="bg-stone-50 text-stone-700 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm border border-stone-200 hover:bg-stone-100">
              👥 ({roomPlayers.length})
            </button>
            <button onClick={openSettings} className="bg-stone-800 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm hover:bg-stone-700">
              ⚙️ إعداداتي
            </button>
          </div>
        </div>

        {/* لوحة الكلمات (تبهت للمشاهدين إذا مقفلة) */}
        <div className={`w-full max-w-2xl bg-white p-3 border border-stone-200 rounded-3xl shadow-sm grid grid-cols-5 gap-1.5 transition-all duration-500 ${boardFaded ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {currentWords.map((word, index) => {
            const isRevealed = revealedWords[index];
            const actualColor = wordColors[index];
            return (
              <button key={index} onClick={() => handleWordClick(index)} className={`min-h-[60px] sm:min-h-[75px] border rounded-xl flex items-center justify-center transition-all relative shadow-sm ${isRevealed ? `${actualColor} border-transparent text-white` : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'}`}>
                {(!isRevealed && userRole === "master") && <div className={`absolute inset-x-0 bottom-0 h-1.5 ${actualColor} opacity-50 rounded-b-xl`}></div>}
                <span className="text-[10px] sm:text-sm font-black text-center px-1 leading-tight">{word}</span>
              </button>
            );
          })}
        </div>

        {/* رسالة للمشاهدين إذا الروم مقفلة */}
        {boardFaded && <div className="text-stone-500 text-xs font-bold bg-stone-200 px-4 py-2 rounded-xl">الروم مقفلة حالياً، يمكنك المشاهدة فقط 🍿</div>}

        {/* باقي واجهة اللعبة (الأفرقة والتحكم والسجل) نفس السابق... */}
        {/* صناديق الأفرقة */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-2.5 px-1">
              <span className="text-blue-800 font-black text-sm uppercase">الدهاة</span>
              <span className="text-blue-600 font-black text-2xl bg-white px-3 py-0.5 rounded-lg shadow-sm">{blueScore}</span>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center gap-2 bg-blue-100/50 p-1.5 rounded-xl border border-blue-200">
                <span className="text-[8px] font-black text-blue-700 bg-blue-200/50 px-2 py-1 rounded-lg">المُشفر 👑</span>
                <div className="flex flex-1 overflow-hidden">
                  {bluePlayers.filter(p => p.role === 'master').map((p, i) => (<div key={i} className="flex items-center gap-1"><span className="text-sm">{p.emoji}</span><span className="text-[10px] font-black text-blue-900">{p.name}</span></div>))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-start w-full bg-white/60 rounded-xl p-2 min-h-[44px] border border-blue-100">
                {bluePlayers.filter(p => p.role === 'decoder').map((p, i) => (<div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-blue-100 shadow-sm"><span className="text-sm">{p.emoji}</span><span className="text-[9px] font-black text-blue-800">{p.name}</span></div>))}
              </div>
            </div>
          </div>
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-3 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-2.5 px-1">
              <span className="text-red-800 font-black text-sm uppercase">الجهابذة</span>
              <span className="text-red-600 font-black text-2xl bg-white px-3 py-0.5 rounded-lg shadow-sm">{redScore}</span>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center gap-2 bg-red-100/50 p-1.5 rounded-xl border border-red-200">
                <span className="text-[8px] font-black text-red-700 bg-red-200/50 px-2 py-1 rounded-lg">المُشفر 👑</span>
                <div className="flex flex-1 overflow-hidden">
                  {redPlayers.filter(p => p.role === 'master').map((p, i) => (<div key={i} className="flex items-center gap-1"><span className="text-sm">{p.emoji}</span><span className="text-[10px] font-black text-red-900">{p.name}</span></div>))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-start w-full bg-white/60 rounded-xl p-2 min-h-[44px] border border-red-100">
                {redPlayers.filter(p => p.role === 'decoder').map((p, i) => (<div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-red-100 shadow-sm"><span className="text-sm">{p.emoji}</span><span className="text-[9px] font-black text-red-800">{p.name}</span></div>))}
              </div>
            </div>
          </div>
        </div>

        {/* منطقة التحكم والتلميح */}
        {userRole === "spectator" ? (
          <div className="w-full max-w-2xl bg-stone-800 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
            <span className="text-xs font-bold">أنت تشاهد الآن 🍿</span>
            {!isRoomLocked && <button onClick={openSettings} className="bg-white text-stone-800 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-stone-200">انزل العب 🎮</button>}
          </div>
        ) : (
          <div className="w-full max-w-2xl">
            {gamePhase === "hinting" ? (
              userRole === "master" && userTeam === currentTurn && (
                <div className="flex gap-2 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex bg-stone-50 border border-stone-100 rounded-xl p-1 gap-1"><button onClick={() => setHintCount(prev => Math.max(0, prev - 1))} className="w-8 h-8 font-bold">-</button><div className="w-8 h-8 flex items-center justify-center text-xs font-black bg-white rounded-lg shadow-sm">{hintCount}</div><button onClick={() => setHintCount(prev => prev + 1)} className="w-8 h-8 font-bold">+</button></div>
                  <input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} placeholder="التلميحة..." className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 text-[10px] font-bold outline-none text-right" />
                  <button onClick={sendHint} className="bg-stone-800 text-white px-6 rounded-xl font-black">أرسل</button>
                </div>
              )
            ) : (
              <div className="bg-white border border-stone-200 p-3.5 rounded-2xl flex justify-between items-center shadow-sm"><div className="flex flex-col"><span className="text-[9px] text-stone-400 font-black uppercase mb-0.5">التلميحة</span><span className="text-lg font-black text-stone-800">{hintWord}</span></div><div className="bg-stone-800 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black">{hintCount}</div></div>
            )}
          </div>
        )}

        {/* سجل الأحداث */}
        <div className="w-full max-w-2xl bg-white border border-stone-200 rounded-2xl p-4 shadow-sm h-36 overflow-y-auto" ref={scrollRef}>
          <h4 className="text-[9px] font-black text-stone-400 mb-3 uppercase tracking-widest border-b border-stone-100 pb-1.5">تحركات اللعبة 📜</h4>
          <div className="space-y-2">
            {gameLogs.map((log, i) => (
              <div key={i} className={`text-[10px] font-bold flex justify-between items-center border-r-2 pr-2.5 ${log.type === 'blue' ? 'border-blue-500 text-blue-700 bg-blue-50/50 p-1.5 rounded-l-md' : log.type === 'red' ? 'border-red-500 text-red-700 bg-red-50/50 p-1.5 rounded-l-md' : 'border-stone-400 text-stone-600 p-1.5 bg-stone-50/50 rounded-l-md'}`}><span>{log.msg}</span><span className="text-[8px] text-stone-400">{log.time}</span></div>
            ))}
          </div>
        </div>

      </main>

      {/* نافذة إعدادات المالك (Admin) */}
      {isAdminModalOpen && isOwner && (
        <div className="fixed inset-0 z-[3000] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsAdminModalOpen(false)}>
          <div className="bg-white border-2 border-teal-200 w-full max-w-md rounded-[2rem] p-6 shadow-[0_0_30px_rgba(45,212,191,0.3)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-teal-800 font-black text-sm uppercase tracking-widest flex items-center gap-2">إعدادات اللعبة ⚙️ <span className="bg-teal-100 text-teal-800 text-[8px] px-2 py-1 rounded-md">خاص بالمالك</span></h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-2xl font-bold">×</button>
            </div>

            {/* أقفال الروم */}
            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-stone-700">قفل الروم 🔒 (للمشاهدة فقط)</span>
                <button onClick={() => saveAdminSettings({ is_locked: !isRoomLocked })} className={`w-12 h-6 rounded-full relative transition-colors ${isRoomLocked ? 'bg-teal-500' : 'bg-stone-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isRoomLocked ? 'left-1' : 'right-1'}`}></div>
                </button>
              </div>
              <div className="flex justify-between items-center border-t border-stone-200 pt-3">
                <span className="text-xs font-bold text-stone-700">منع تغيير الأسماء 📛</span>
                <button onClick={() => saveAdminSettings({ allow_name_change: !allowNameChange })} className={`w-12 h-6 rounded-full relative transition-colors ${!allowNameChange ? 'bg-teal-500' : 'bg-stone-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${!allowNameChange ? 'left-1' : 'right-1'}`}></div>
                </button>
              </div>
            </div>

            {/* إعدادات الوقت */}
            <div>
               <label className="text-[10px] font-black text-stone-500 mb-2 block">وقت التفكير (العداد)</label>
               <select value={timerDuration} onChange={(e) => saveAdminSettings({ timer_duration: parseInt(e.target.value) })} className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer">
                 <option value={60}>دقيقة واحدة</option>
                 <option value={120}>دقيقتين</option>
                 <option value={180}>3 دقائق</option>
                 <option value={300}>5 دقائق</option>
                 <option value={0}>بدون وقت (مخفي 🚫)</option>
               </select>
            </div>

            {/* حزم الكلمات */}
            <div className="border-t border-stone-200 pt-4">
               <label className="text-[10px] font-black text-stone-500 mb-2 block">حزمة الكلمات الحالية</label>
               <select onChange={(e) => {
                 if(e.target.value === "add_new") setIsAddPackModalOpen(true);
                 else if(e.target.value !== "") resetBoardWithWords(wordPacks[e.target.value].words);
               }} className="w-full bg-teal-50 text-teal-900 border border-teal-200 rounded-xl p-3 text-xs font-black outline-none cursor-pointer mb-2">
                 <option value="">-- اختر حزمة لتبدأ اللعبة من جديد --</option>
                 {Object.entries(wordPacks).map(([key, pack]) => (
                   <option key={key} value={key}>{pack.name} ({pack.words.length} كلمة)</option>
                 ))}
                 <option value="add_new">➕ إضافة حزمة جديدة...</option>
               </select>
               <p className="text-[9px] text-red-500 font-bold text-center">تنبيه: تغيير الحزمة سيقوم بمسح اللوحة وبدء لعبة جديدة!</p>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة حزمة جديدة */}
      {isAddPackModalOpen && (
        <div className="fixed inset-0 z-[4000] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-stone-800 font-black text-sm uppercase text-center border-b pb-3">إضافة حزمة 📦</h3>
            
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold bg-stone-100 p-3 rounded-xl text-center cursor-pointer border border-stone-300 hover:bg-stone-200">
                📂 رفع ملف (txt أو csv)
                <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
              </label>
              
              <div className="text-center text-[10px] text-stone-400 font-black my-1">أو</div>
              
              <textarea value={customPackText} onChange={(e) => setCustomPackText(e.target.value)} placeholder="اكتب الكلمات هنا، افصل بينها بفاصلة أو سطر جديد (أقل شيء 25 كلمة)" className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-bold outline-none resize-none"></textarea>
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={saveCustomPack} className="flex-1 bg-teal-500 text-white font-black py-2.5 rounded-xl">حفظ الحزمة</button>
              <button onClick={() => setIsAddPackModalOpen(false)} className="flex-1 bg-stone-200 text-stone-700 font-black py-2.5 rounded-xl">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إعدادات اللاعب (عادية) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-stone-800 font-black text-sm uppercase tracking-widest">إعدادات اللاعب ⚙️</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-2xl font-bold">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-stone-500 mb-1.5 block">الاسم</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!allowNameChange && !isOwner} className={`w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm font-bold text-center outline-none ${!allowNameChange && !isOwner ? 'opacity-50 cursor-not-allowed' : 'focus:border-stone-400'}`} />
                {!allowNameChange && !isOwner && <p className="text-[8px] text-red-500 mt-1 text-center">المالك منع تغيير الأسماء</p>}
              </div>

              <div>
                 <label className="text-[10px] font-black text-stone-500 mb-1.5 block">اختر الرمز الخاص بك</label>
                 <div className={`flex flex-wrap gap-2 justify-center bg-stone-50 p-3 rounded-xl border border-stone-200 max-h-32 overflow-y-auto ${!allowNameChange && !isOwner ? 'opacity-50 pointer-events-none' : ''}`}>
                   {availableEmojis.map(e => (
                     <button key={e} onClick={() => setEditEmoji(e)} className={`text-2xl p-1.5 rounded-lg transition-transform ${editEmoji === e ? 'bg-stone-300 scale-110 shadow-sm' : 'hover:scale-110'}`}>{e}</button>
                   ))}
                 </div>
              </div>

              {!isRoomLocked || isOwner || userTeam !== 'none' ? (
                <div>
                   <label className="text-[10px] font-black text-stone-500 mb-1.5 block">الفريق</label>
                   <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => setEditTeam("blue")} className={`p-2.5 rounded-xl font-black text-xs transition-colors ${editTeam === 'blue' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}>الدهاة</button>
                     <button onClick={() => setEditTeam("red")} className={`p-2.5 rounded-xl font-black text-xs transition-colors ${editTeam === 'red' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}>الجهابذة</button>
                     <button onClick={() => setEditTeam("none")} className={`p-2.5 rounded-xl font-black text-xs transition-colors ${editTeam === 'none' ? 'bg-stone-700 text-white shadow-md' : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'}`}>مشاهد</button>
                   </div>
                </div>
              ) : (
                <div className="bg-stone-100 p-3 rounded-xl text-center text-xs font-bold text-stone-500">الروم مقفلة بواسطة المالك، لا يمكنك الانضمام للفرق حالياً.</div>
              )}

              {editTeam !== 'none' && (!isRoomLocked || isOwner || userTeam !== 'none') && (
                <div>
                   <label className="text-[10px] font-black text-stone-500 mb-1.5 block">الموقع (الدور)</label>
                   <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setEditRole("master")} className={`p-3 rounded-xl font-black text-xs transition-colors ${editRole === 'master' ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-800 border border-stone-300 hover:bg-stone-200'}`}>المُشفر 👑</button>
                     <button onClick={() => userRole !== 'master' && setEditRole("decoder")} disabled={userRole === 'master'} className={`p-3 rounded-xl font-black text-xs transition-colors ${editRole === 'decoder' ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-50 text-stone-800 border border-stone-300'} ${userRole === 'master' ? 'opacity-50 cursor-not-allowed bg-stone-200' : 'hover:bg-stone-200'}`}>المفكك 🔍</button>
                   </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={saveProfile} className="flex-1 bg-stone-800 text-white font-black py-3 rounded-xl shadow-lg hover:bg-stone-700 transition-colors">حفظ التغييرات</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}