"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 

export default function GameBoard() {
  const params = useParams();
  const roomId = params?.id;
  const scrollRef = useRef(null);

  // حزم الكلمات المحدثة بناءً على طلبك
  const [wordPacks, setWordPacks] = useState({
    general: { 
      name: "حزمة عامة 🌍", 
      words: [
        "تفاحة", "فراولة", "بطيخ", "موز", "تمر", "كليجا", 
        "طيارة", "سيارة", "دباب", "سيكل", "باص", 
        "كتاب", "دفتر", "قلم حبر", "بحر", "بر", 
        "مفتاح", "ريموت", "شجرة", "نخلة", "ساعة", 
        "قمر", "شمس", "نجوم", "زحل", "المريخ", 
        "نهر", "تراب", "رمل", "جبل", "مبنى", "برج", 
        "مدرسة", "دوام", "عمل", "كرسي", "طاولة", "مقلمة", 
        "شنطة", "دريشة", "مكيف", "دفاية", "ابجوره", 
        "جوال", "ايباد", "لابتوب", "صورة", "فيديو", "صوت", 
        "ضوء", "ملعب", "كورة", "مرمى", "حصان", "بعير", 
        "فارس", "رحال", "قرية", "طريق", "شارع", "حاره", 
        "حي", "خبز", "صامولي", "عجين", "مفرود", "حديقة", 
        "ممشى", "نادي", "ونترلاند", "سماء", "سحب", "برق", 
        "مطر", "غيث", "نظارة", "ليزر", "الرياض", "القصيم", 
        "جده", "الكويت", "السعودية", "العراق", "موية", "ببسي", 
        "فصفص", "كودرد", "خبيز"
      ] 
    },
    najd: { 
      name: "نجديات 🐪", 
      words: [
        "دلة", "ابريق", "فنجال", "بيالة", "قهوة", "شاهي", 
        "طويق", "الدرعية", "عرضة", "سامري", "محالة", "بندق", 
        "سيف", "خنجر", "جصة", "تمر", "كليجا", "وجار", "سجاد", 
        "روشن", "منفاخ", "دبيازة", "جريش", "رز", "قرصان", 
        "مرقوق", "مصابيب", "حنيني", "شقراء", "بكة", "المدينة المنورة", 
        "نقاء", "العرفج", "الرمث", "القحيوان", "نفود", "خيمة", 
        "زير", "عج", "غيث", "خرازة", "المعزب", "ذبيحة", "بعير", 
        "ناقى", "حليب", "الحكاكة", "السكة", "السيارة", "مصقاع", 
        "مرود", "مبرد", "ملقاط", "مذود", "جمر", "حطب", "غضارة", 
        "مشلح", "محزم", "مطرقة", "مبخرة", "حصني", "ضبع", 
        "المربعانية", "الوسم", "سهيل", "نجر", "مهفة", "نار", 
        "الدراعة", "الدقلة", "الحايك"
      ] 
    }
  });

  // حالات اللعبة الأساسية
  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [currentTurn, setCurrentTurn] = useState("blue"); 
  const [gamePhase, setGamePhase] = useState("hinting");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // إعدادات الروم والمالك 
  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [allowNameChange, setAllowNameChange] = useState(true);
  const [timerDuration, setTimerDuration] = useState(120); 
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pinnedSpectators, setPinnedSpectators] = useState([]);

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

  const [roomPlayers, setRoomPlayers] = useState([]);
  const [hintWord, setHintWord] = useState(""); 
  const [hintCount, setHintCount] = useState(0);
  const [hintInput, setHintInput] = useState("");
  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 

  const isOwner = localPlayerId && roomOwnerId === localPlayerId;

  useEffect(() => {
    const emojis = ["🦅", "🐺", "🐎", "🐪", "🐅", "🦉", "🦌", "🐆"];
    setUserEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [gameLogs]);

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
          setPinnedSpectators(room.pinned_spectators || []);
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
        setPinnedSpectators(newData.pinned_spectators || []);
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

    let localTempPlayerId = null;

    const { data: newPlayer } = await supabase.from('players').insert([{ room_id: roomId, name: userName, emoji: "🎮", team: 'none', role: 'spectator' }]).select().single();
    if (newPlayer) {
      setLocalPlayerId(newPlayer.id);
      localTempPlayerId = newPlayer.id;
    }

    const { data: existingRoom } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
    
    if (!existingRoom || !existingRoom.board_words || existingRoom.board_words.length === 0) {
      // اختيار الحزمة العامة افتراضياً
      const words = [...wordPacks.general.words].sort(() => 0.5 - Math.random()).slice(0, 25);
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
        is_locked: false, allow_name_change: true, timer_duration: 120, timer_ends_at: null, pinned_spectators: []
      });
      setRoomOwnerId(localTempPlayerId);
    } else {
      setRoomOwnerId(existingRoom.owner_id);
    }

    setIsJoined(true);
    addGameLog(`دخل ${userName} كـ مشاهد 🍿`);
  };

  const kickPlayer = async (playerId) => {
    await supabase.from('players').update({ team: 'none', role: 'spectator' }).eq('id', playerId);
  };

  const togglePinPlayer = async (playerId) => {
    let newPinned = [...pinnedSpectators];
    if (newPinned.includes(playerId)) {
      newPinned = newPinned.filter(id => id !== playerId);
    } else {
      newPinned.push(playerId);
    }
    await supabase.from('rooms').update({ pinned_spectators: newPinned }).eq('id', roomId);
  };

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
    
    addGameLog(`تم تحديث اللوحة بكلمات جديدة 🔄`);
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
    
    if (pinnedSpectators.includes(localPlayerId)) {
      finalTeam = 'none';
      finalRole = 'spectator';
    }

    if (finalTeam === 'none') finalRole = 'spectator';
    if (finalTeam !== 'none' && finalRole === 'spectator') finalRole = 'decoder';
    if (userRole === 'master' && finalRole === 'decoder') finalRole = 'master'; 

    await supabase.from('players').update({ name: editName, emoji: editEmoji, team: finalTeam, role: finalRole }).eq('id', localPlayerId);

    setUserName(editName);
    setUserEmoji(editEmoji);
    setUserTeam(finalTeam);
    setUserRole(finalRole);
    setIsEditModalOpen(false);
  };

  const saveAdminSettings = async (newSettings) => {
    if (!isOwner) return;
    await supabase.from('rooms').update(newSettings).eq('id', roomId);
    addGameLog(`تم تعديل إعدادات الروم ⚙️`);
  };

  const handleWordClick = async (index) => {
    if (userRole !== "decoder" || userTeam !== currentTurn || gamePhase !== "guessing" || revealedWords[index]) return;

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
  const blueMasters = bluePlayers.filter(p => p.role === 'master');
  const blueDecoders = bluePlayers.filter(p => p.role === 'decoder');

  const redPlayers = sortPlayersByRole(roomPlayers.filter(p => p.team === 'red'));
  const redMasters = redPlayers.filter(p => p.role === 'master');
  const redDecoders = redPlayers.filter(p => p.role === 'decoder');

  const spectatorPlayers = roomPlayers.filter(p => p.team === 'none');

  let team1List = bluePlayers, team1Title = "الدهاة", team1Color = "blue";
  let team2List = redPlayers, team2Title = "الجهابذة", team2Color = "red";
  if (userTeam === 'red') {
    team1List = redPlayers; team1Title = "فريقك (الجهابذة)"; team1Color = "red";
    team2List = bluePlayers; team2Title = "الخصم (الدهاة)"; team2Color = "blue";
  } else if (userTeam === 'blue') {
    team1Title = "فريقك (الدهاة)"; team2Title = "الخصم (الجهابذة)";
  }

  const boardFaded = userRole === 'spectator' && isRoomLocked; 

  const PlayerListGroup = ({ title, players, color }) => {
    if (players.length === 0) return null;
    const isSpectator = color === 'stone';
    const bgClass = 'bg-slate-900 border-slate-800';
    const textClass = 'text-slate-200';

    return (
      <div className="mb-5 last:mb-0">
        <h4 className={`text-[10px] font-black mb-2 ${textClass} uppercase tracking-widest px-1 border-b border-slate-700 pb-1`}>
          {title} ({players.length})
        </h4>
        <div className="space-y-1.5">
          {players.map((p, i) => (
            <div key={i} className={`flex justify-between items-center p-2 rounded-xl border ${bgClass} shadow-sm`}>
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                    {p.name} {p.name === userName && <span className="text-slate-400 font-bold">(أنت)</span>}
                    <span className="text-lg bg-transparent flex items-center justify-center">{p.emoji}</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[8px] px-2.5 py-1 rounded-md font-bold ${isSpectator ? 'bg-slate-800 border border-slate-700 text-slate-400' : p.role === 'master' ? 'bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC]' : 'bg-[#4C7D7E] border border-[#385F60] text-[#F5F5DC]'}`}>
                  {isSpectator ? '🍿 مشاهد' : p.role === 'master' ? '👑 مُشفر' : '🔍 مفكك'}
                </span>
                
                {isOwner && p.id !== localPlayerId && (
                  <div className="flex gap-1">
                    {!isSpectator && (
                      <button onClick={() => kickPlayer(p.id)} className="bg-[#4C7D7E] border border-[#385F60] text-[#F5F5DC] text-[8px] px-2 py-1 rounded-md font-bold hover:bg-[#385F60] transition-colors">
                        طرد
                      </button>
                    )}
                    {isSpectator && (
                      <button onClick={() => togglePinPlayer(p.id)} className={`${pinnedSpectators.includes(p.id) ? 'bg-[#203B3C] text-[#F5F5DC]' : 'bg-[#4C7D7E] border border-[#385F60] text-[#F5F5DC]'} text-[8px] px-2 py-1 rounded-md font-bold hover:bg-[#122223] transition-colors`}>
                        {pinnedSpectators.includes(p.id) ? '📌 مثبت' : '📌 تثبيت'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isJoined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-right relative" dir="rtl">
        <div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-xl font-bold">
          <h2 className="text-2xl font-black text-teal-400 mb-6 text-center uppercase tracking-widest">الدروازة 🚪</h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-4 rounded-xl bg-[#020617] border border-slate-700 text-center font-bold outline-none focus:border-teal-500 text-slate-200 placeholder-slate-500 transition-colors" placeholder="وش اسمك؟" required />
            <button type="submit" className="w-full bg-gradient-to-br from-teal-500 to-teal-700 text-white py-4 rounded-xl font-black shadow-lg hover:from-teal-400 hover:to-teal-600 transition-colors">انشاء غرفة لعب 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  if (!isDataLoaded || currentWords.length === 0) return <div className="min-h-[80vh] flex items-center justify-center font-bold text-slate-500 relative"><div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>جاري فتح الدروازة وتجهيز الكلمات...</div>;

  return (
    <div className="w-full min-h-screen relative font-sans text-right py-4" dir="rtl">
      
      <style>{`
        @keyframes bg-pan {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-board {
          background: linear-gradient(135deg, #0f172a, #020617, #1e293b);
          background-size: 200% 200%;
          animation: bg-pan 15s ease infinite;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>

      <main className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 space-y-4">
        
        {/* صندوق أنت تشاهد الآن */}
        {userRole === "spectator" && (
          <div onClick={openSettings} className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-teal-400 p-2.5 rounded-xl flex justify-center items-center shadow-lg cursor-pointer transition-colors hover:bg-slate-800" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <span className="text-[11px] font-black tracking-widest">أنت تشاهد الآن 🍿 (انقر هنا للعب 🎮)</span>
          </div>
        )}

        {/* شريط المهام */}
        <div className="flex justify-between items-center w-full max-w-2xl bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase bg-transparent border border-slate-700 ${currentTurn === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
              دور: <span className="font-black">{currentTurn === 'blue' ? 'الدهاة' : 'الجهابذة'}</span> {gamePhase === "hinting" ? "(يلمح)" : "(يخمن)"}
            </div>
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm hover:from-teal-500 hover:to-teal-700 transition-colors flex items-center gap-1">
              إعدادات اللعبة ⚙️
            </button>
          </div>
          
          {timerDuration > 0 && (
            <div className={`font-mono text-base font-black ${timeLeft !== null && timeLeft <= 10 ? 'text-[#FECACA] animate-pulse' : 'text-[#F5F5DC]'}`}>
              {timerEndsAt === null ? formatTime(timerDuration) : formatTime(timeLeft)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={() => setIsPlayersListOpen(true)} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm hover:from-teal-500 hover:to-teal-700 transition-colors">
              👥 ({roomPlayers.length})
            </button>
            <button onClick={openSettings} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm hover:from-teal-500 hover:to-teal-700 transition-colors">
              ⚙️ إعداداتي
            </button>
          </div>
        </div>

        {/* لوحة الكلمات */}
        <div className={`w-full max-w-2xl bg-[#4C7D7E] p-2.5 rounded-3xl shadow-lg grid grid-cols-5 gap-1.5 animated-gradient-board border border-slate-800 transition-all duration-500 ${boardFaded ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {currentWords.map((word, index) => {
            const isRevealed = revealedWords[index];
            const actualColor = wordColors[index];
            
            let btnClasses = "";
            if (isRevealed) {
              if (actualColor === "bg-blue-600") btnClasses = "bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white opacity-50";
              else if (actualColor === "bg-red-600") btnClasses = "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white opacity-50";
              else if (actualColor === "bg-stone-300") btnClasses = "bg-[#4C7D7E] border border-[#385F60] text-[#F5F5DC] opacity-60";
              else if (actualColor === "bg-stone-800") btnClasses = "bg-gradient-to-b from-stone-800 to-black text-white opacity-50";
            } else {
              if (userRole === "master") {
                if (actualColor === "bg-blue-600") btnClasses = "bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-md border-[#1E3A8A]";
                else if (actualColor === "bg-red-600") btnClasses = "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white shadow-md border-[#7F1D1D]";
                else if (actualColor === "bg-stone-300") btnClasses = "bg-[#4C7D7E] text-[#F5F5DC] border-[#385F60] shadow-sm hover:bg-[#385F60]";
                else if (actualColor === "bg-stone-800") btnClasses = "bg-gradient-to-b from-stone-800 to-black text-white shadow-md border-black";
              } else {
                btnClasses = "bg-gradient-to-br from-[#ebf5ed] to-[#d6ebd9] text-stone-800 border-[#c2e0cd] hover:from-[#d6ebd9] hover:to-[#c2e0cd] shadow-sm";
              }
            }

            return (
              <button key={index} onClick={() => handleWordClick(index)} className={`min-h-[60px] sm:min-h-[75px] border rounded-xl flex items-center justify-center transition-all relative ${btnClasses}`}>
                <span className="text-[10px] sm:text-sm font-black text-center px-1 leading-tight">{word}</span>
              </button>
            );
          })}
        </div>

        {boardFaded && <div className="text-slate-300 text-xs font-bold bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">الروم مقفلة حالياً، يمكنك المشاهدة فقط 🍿</div>}

        {/* صناديق الأفرقة - تصميم طولي ذكي يوفر مساحة */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
          
          {/* صندوق الدهاة */}
          <div className="bg-[#0f172a]/80 border border-blue-900/60 rounded-2xl p-3 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[#BAE6FD] font-black text-sm uppercase tracking-widest">الدهاة</span>
              <span className="text-[#F5F5DC] font-black text-2xl bg-[#4C7D7E] border border-[#385F60] shadow-sm px-3 py-0.5 rounded-lg">{blueScore}</span>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#BAE6FD] shrink-0 w-[80px] flex items-center justify-start">
                  {blueMasters.length > 1 ? 'المُشفرين 👑' : 'المُشفر 👑'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-1"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {blueMasters.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[10px] font-bold">{p.name}</span><span className="text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {blueMasters.length === 0 && <span className="text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">بانتظار القائد...</span>}
                </div>
              </div>
              
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#BAE6FD] shrink-0 w-[80px] flex items-center justify-start">
                  {blueDecoders.length > 1 ? 'مفككين الشفرات 🔍' : 'مفكك الشفرة 🔍'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-1"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {blueDecoders.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[10px] font-bold">{p.name}</span><span className="text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {blueDecoders.length === 0 && <span className="text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">لا يوجد لاعبين</span>}
                </div>
              </div>
            </div>
          </div>

          {/* صندوق الجهابذة */}
          <div className="bg-[#0f172a]/80 border border-red-900/60 rounded-2xl p-3 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[#FECACA] font-black text-sm uppercase tracking-widest">الجهابذة</span>
              <span className="text-[#F5F5DC] font-black text-2xl bg-[#4C7D7E] border border-[#385F60] shadow-sm px-3 py-0.5 rounded-lg">{redScore}</span>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#FECACA] shrink-0 w-[80px] flex items-center justify-start">
                  {redMasters.length > 1 ? 'المُشفرين 👑' : 'المُشفر 👑'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-1"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {redMasters.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[10px] font-bold">{p.name}</span><span className="text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {redMasters.length === 0 && <span className="text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">بانتظار القائد...</span>}
                </div>
              </div>
              
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#FECACA] shrink-0 w-[80px] flex items-center justify-start">
                  {redDecoders.length > 1 ? 'مفككين الشفرات 🔍' : 'مفكك الشفرة 🔍'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-1"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {redDecoders.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[10px] font-bold">{p.name}</span><span className="text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {redDecoders.length === 0 && <span className="text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">لا يوجد لاعبين</span>}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* التلميحة */}
        {userRole !== "spectator" && (
          <div className="w-full max-w-2xl">
            {gamePhase === "hinting" ? (
              userRole === "master" && userTeam === currentTurn && (
                <div className="flex gap-2 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-sm">
                  <div className="flex bg-[#020617] border border-slate-700 rounded-xl p-1 gap-1"><button onClick={() => setHintCount(prev => Math.max(0, prev - 1))} className="w-8 h-8 font-bold text-slate-400 hover:text-white rounded-lg">-</button><div className="w-8 h-8 flex items-center justify-center text-xs font-black text-teal-400 bg-slate-800 rounded-lg">{hintCount}</div><button onClick={() => setHintCount(prev => prev + 1)} className="w-8 h-8 font-bold text-slate-400 hover:text-white rounded-lg">+</button></div>
                  <input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} placeholder="التلميحة..." className="flex-1 bg-[#020617] border border-slate-700 rounded-xl px-4 text-[10px] font-bold outline-none text-right focus:border-teal-500 text-slate-200 placeholder-slate-500 transition-colors" />
                  <button onClick={sendHint} className="bg-gradient-to-br from-teal-500 to-teal-700 text-white px-6 rounded-xl font-bold shadow-md hover:from-teal-400 hover:to-teal-600 transition-colors">أرسل</button>
                </div>
              )
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex justify-between items-center shadow-sm"><div className="flex flex-col"><span className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">التلميحة</span><span className="text-lg font-black text-slate-200">{hintWord}</span></div><div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-md">{hintCount}</div></div>
            )}
          </div>
        )}

        {/* مجريات اللعبة */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm h-36 overflow-y-auto" ref={scrollRef}>
          <h4 className="text-[9px] font-bold text-slate-500 mb-3 uppercase tracking-widest border-b border-slate-800 pb-1.5">مجريات اللعبة 📜</h4>
          <div className="space-y-1.5">
            {gameLogs.map((log, i) => (
              <div key={i} className={`text-[10px] font-bold flex justify-between items-center p-1.5 border-r-2 ${log.type === 'blue' ? 'border-blue-600 text-blue-400' : log.type === 'red' ? 'border-red-600 text-red-400' : 'border-slate-600 text-slate-300'}`}>
                <span>{log.msg}</span>
                <span className="text-[8px] text-slate-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* نافذة إعدادات اللعبة */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsAdminModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-slate-100 font-black text-sm uppercase tracking-widest flex items-center gap-2">إعدادات اللعبة ⚙️</h3>
              <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-500 hover:text-white text-2xl font-bold">×</button>
            </div>
            {!isOwner && <div className="bg-slate-950 border border-slate-800 text-slate-400 p-2 rounded-xl text-center text-[10px] font-bold">هذه الإعدادات مقفلة 🔒 (خاصة بمالك الروم فقط)</div>}
            <div className={`space-y-5 ${!isOwner ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="space-y-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">قفل الروم 🔒 (للمشاهدة فقط)</span>
                  <button onClick={() => saveAdminSettings({ is_locked: !isRoomLocked })} className={`w-12 h-6 rounded-full relative transition-colors ${isRoomLocked ? 'bg-teal-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isRoomLocked ? 'left-1' : 'right-1'}`}></div></button>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                  <span className="text-xs font-bold text-slate-300">منع تغيير الأسماء 📛</span>
                  <button onClick={() => saveAdminSettings({ allow_name_change: !allowNameChange })} className={`w-12 h-6 rounded-full relative transition-colors ${!allowNameChange ? 'bg-teal-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${!allowNameChange ? 'left-1' : 'right-1'}`}></div></button>
                </div>
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 mb-2 block">وقت التفكير (العداد)</label>
                 <select value={timerDuration} onChange={(e) => saveAdminSettings({ timer_duration: parseInt(e.target.value) })} className="w-full bg-[#020617] border border-slate-700 text-slate-200 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer focus:border-teal-500">
                   <option value={60}>دقيقة واحدة</option><option value={120}>دقيقتين</option><option value={180}>3 دقائق</option><option value={300}>5 دقائق</option><option value={0}>بدون وقت (مخفي 🚫)</option>
                 </select>
              </div>
              <div className="border-t border-slate-800 pt-4">
                 <label className="text-[10px] font-bold text-slate-400 mb-2 block">حزمة الكلمات الحالية</label>
                 <select onChange={(e) => { if(e.target.value === "add_new") setIsAddPackModalOpen(true); else if(e.target.value !== "") resetBoardWithWords(wordPacks[e.target.value].words); }} className="w-full bg-slate-950 text-teal-400 border border-slate-800 rounded-xl p-3 text-xs font-bold outline-none cursor-pointer mb-2 focus:border-teal-500">
                   <option value="">-- اختر حزمة لتبدأ اللعبة من جديد --</option>
                   {Object.entries(wordPacks).map(([key, pack]) => (<option key={key} value={key}>{pack.name} ({pack.words.length} كلمة)</option>))}
                   <option value="add_new">➕ إضافة حزمة جديدة...</option>
                 </select>
                 <p className="text-[9px] text-red-400 font-bold text-center mt-2">تنبيه: تغيير الحزمة سيقوم بمسح اللوحة وبدء لعبة جديدة!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة إضافة حزمة جديدة */}
      {isAddPackModalOpen && (
        <div className="fixed inset-0 z-[4000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-slate-100 font-black text-sm uppercase text-center border-b border-slate-800 pb-3">إضافة حزمة 📦</h3>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold bg-[#020617] p-3 rounded-xl text-center cursor-pointer border border-slate-700 text-teal-400 hover:border-teal-500 transition-colors">📂 رفع ملف (txt أو csv)<input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} /></label>
              <div className="text-center text-[10px] text-slate-500 font-black my-1">أو</div>
              <textarea value={customPackText} onChange={(e) => setCustomPackText(e.target.value)} placeholder="اكتب الكلمات هنا، افصل بينها بفاصلة أو سطر جديد (أقل شيء 25 كلمة)" className="w-full h-32 bg-[#020617] border border-slate-700 rounded-xl p-3 text-xs font-bold outline-none resize-none text-slate-200 focus:border-teal-500 placeholder-slate-600"></textarea>
            </div>
            <div className="flex gap-2 mt-2"><button onClick={saveCustomPack} className="flex-1 bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold py-2.5 rounded-xl hover:from-teal-400 hover:to-teal-600 transition-colors">حفظ الحزمة</button><button onClick={() => setIsAddPackModalOpen(false)} className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-slate-700 transition-colors">إلغاء</button></div>
          </div>
        </div>
      )}

      {/* نافذة إعدادات اللاعب */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-slate-100 font-black text-sm uppercase tracking-widest">إعدادات اللاعب ⚙️</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الاسم</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={!allowNameChange && !isOwner} className={`w-full bg-[#020617] border border-slate-700 rounded-xl p-3 text-sm font-bold text-center outline-none text-slate-200 ${!allowNameChange && !isOwner ? 'opacity-50 cursor-not-allowed' : 'focus:border-teal-500'}`} />
              </div>
              <div>
                 <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">اختر الرمز الخاص بك</label>
                 <div className={`flex flex-wrap gap-2 justify-center bg-[#020617] p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto ${!allowNameChange && !isOwner ? 'opacity-50 pointer-events-none' : ''}`}>
                   {availableEmojis.map(e => (<button key={e} onClick={() => setEditEmoji(e)} className={`text-2xl p-1.5 rounded-lg transition-transform ${editEmoji === e ? 'bg-slate-800 scale-110 shadow-sm' : 'hover:scale-110'}`}>{e}</button>))}
                 </div>
              </div>
              {!isRoomLocked || isOwner || userTeam !== 'none' ? (
                <div>
                   <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الفريق</label>
                   {pinnedSpectators.includes(localPlayerId) ? (
                     <div className="bg-slate-950 border border-slate-800 text-teal-400 p-3 rounded-xl text-center text-xs font-bold">تم تثبيتك كمشاهد من قبل المالك 📌</div>
                   ) : (
                     <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => setEditTeam("blue")} className={`p-2.5 rounded-xl font-bold text-xs transition-colors ${editTeam === 'blue' ? 'bg-blue-600 text-white shadow-md border-transparent' : 'bg-slate-950 text-blue-400 border border-slate-800 hover:bg-slate-800'}`}>الدهاة</button>
                       <button onClick={() => setEditTeam("red")} className={`p-2.5 rounded-xl font-bold text-xs transition-colors ${editTeam === 'red' ? 'bg-red-600 text-white shadow-md border-transparent' : 'bg-slate-950 text-red-400 border border-slate-800 hover:bg-slate-800'}`}>الجهابذة</button>
                       <button onClick={() => setEditTeam("none")} className={`p-2.5 rounded-xl font-bold text-xs transition-colors ${editTeam === 'none' ? 'bg-teal-600 text-white shadow-md border-transparent' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>مشاهد</button>
                     </div>
                   )}
                </div>
              ) : ( <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center text-xs font-bold text-slate-500">الروم مقفلة حالياً، لا يمكنك الانضمام للفرق.</div> )}
              {editTeam !== 'none' && !pinnedSpectators.includes(localPlayerId) && (!isRoomLocked || isOwner || userTeam !== 'none') && (
                <div>
                   <label className="text-[10px] font-bold text-slate-400 mb-1.5 block">الموقع (الدور)</label>
                   <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setEditRole("master")} className={`p-3 rounded-xl font-bold text-xs transition-colors ${editRole === 'master' ? 'bg-slate-700 text-white shadow-md border-slate-600' : 'bg-[#020617] text-slate-400 border border-slate-800 hover:bg-slate-800'}`}>المُشفر 👑</button>
                     <button onClick={() => userRole !== 'master' && setEditRole("decoder")} disabled={userRole === 'master'} className={`p-3 rounded-xl font-bold text-xs transition-colors ${editRole === 'decoder' ? 'bg-slate-700 text-white shadow-md border-slate-600' : 'bg-[#020617] text-slate-400 border border-slate-800 hover:bg-slate-800'} ${userRole === 'master' ? 'opacity-50 cursor-not-allowed' : ''}`}>مفكك الشفرة 🔍</button>
                   </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4"><button onClick={saveProfile} className="flex-1 bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold py-3 rounded-xl shadow-md hover:from-teal-400 hover:to-teal-600 transition-colors">حفظ التغييرات</button></div>
          </div>
        </div>
      )}
    </div>
  );
}