"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 

// استدعاء المكونات الجديدة
import AddPackModal from "../../../components/AddPackModal";
import PlayersListModal from "../../../components/PlayersListModal";
import AdminModal from "../../../components/AdminModal";
import ProfileModal from "../../../components/ProfileModal";

export default function GameBoard() {
  const params = useParams();
  const roomId = params?.id;
  const scrollRef = useRef(null);

  const [wordPacks, setWordPacks] = useState({
    general: { name: "حزمة عامة 🌍", words: ["تفاحة", "فراولة", "بطيخ", "موز", "تمر", "كليجا", "طيارة", "سيارة", "دباب", "سيكل", "باص", "كتاب", "دفتر", "قلم حبر", "بحر", "بر", "مفتاح", "ريموت", "شجرة", "نخلة", "ساعة", "قمر", "شمس", "نجوم", "زحل", "المريخ", "نهر", "تراب", "رمل", "جبل", "مبنى", "برج", "مدرسة", "دوام", "عمل", "كرسي", "طاولة", "مقلمة", "شنطة", "دريشة", "مكيف", "دفاية", "ابجوره", "جوال", "ايباد", "لابتوب", "صورة", "فيديو", "صوت", "ضوء", "ملعب", "كورة", "مرمى", "حصان", "بعير", "فارس", "رحال", "قرية", "طريق", "شارع", "حاره", "حي", "خبز", "صامولي", "عجين", "مفرود", "حديقة", "ممشى", "نادي", "ونترلاند", "سماء", "سحب", "برق", "مطر", "غيث", "نظارة", "ليزر", "الرياض", "القصيم", "جده", "الكويت", "السعودية", "العراق", "موية", "ببسي", "فصفص", "كودرد", "خبيز"] },
    najd: { name: "نجديات 🐪", words: ["دلة", "ابريق", "فنجال", "بيالة", "قهوة", "شاهي", "طويق", "الدرعية", "عرضة", "سامري", "محالة", "بندق", "سيف", "خنجر", "جصة", "تمر", "كليجا", "وجار", "سجاد", "روشن", "منفاخ", "دبيازة", "جريش", "رز", "قرصان", "مرقوق", "مصابيب", "حنيني", "شقراء", "بكة", "المدينة المنورة", "نقاء", "العرفج", "الرمث", "القحيوان", "نفود", "خيمة", "زير", "عج", "غيث", "خرازة", "المعزب", "ذبيحة", "بعير", "ناقى", "حليب", "الحكاكة", "السكة", "السيارة", "مصقاع", "مرود", "مبرد", "ملقاط", "مذود", "جمر", "حطب", "غضارة", "مشلح", "محزم", "مطرقة", "مبخرة", "حصني", "ضبع", "المربعانية", "الوسم", "سهيل", "نجر", "مهفة", "نار", "الدراعة", "الدقلة", "الحايك"] }
  });

  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [currentTurn, setCurrentTurn] = useState("blue"); 
  const [gamePhase, setGamePhase] = useState("hinting");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [allowNameChange, setAllowNameChange] = useState(true);
  const [timerDuration, setTimerDuration] = useState(120); 
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pinnedSpectators, setPinnedSpectators] = useState([]);

  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmoji, setUserEmoji] = useState("🎮"); 
  const [userTeam, setUserTeam] = useState("none"); 
  const [userRole, setUserRole] = useState("spectator"); 
  const [isJoined, setIsJoined] = useState(false);
  const [isJoiningUI, setIsJoiningUI] = useState(false); 

  const [isPlayersListOpen, setIsPlayersListOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddPackModalOpen, setIsAddPackModalOpen] = useState(false);
  
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
  const [nominations, setNominations] = useState({});

  const isOwner = localPlayerId && roomOwnerId === localPlayerId;
  const autoJoinAttempted = useRef(false);

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") console.log("تم تفعيل الإشعارات");
    }
  };

  const gatherPlayerData = async () => {
    let ip = "unknown";
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ip = data.ip;
    } catch(e) { console.error("فشل سحب الـ IP"); }
    const deviceData = {
      userAgent: navigator.userAgent, language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`, darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
      referrer: document.referrer || 'Direct Entry', joinTime: new Date().toISOString()
    };
    return { ip, deviceData };
  };

  const executeJoin = async (targetName) => {
    if (!targetName.trim() || !roomId) return;
    setIsJoiningUI(true);

    await requestNotificationPermission();
    const { ip, deviceData } = await gatherPlayerData();

    if (ip !== "unknown") {
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('room_id', roomId).eq('ip_address', ip);
      if (count >= 2) {
        alert("🚫 تم حظر دخولك: لا يمكنك إدخال أكثر من حسابين من نفس الشبكة لمنع التخريب!");
        setIsJoiningUI(false); return; 
      }
    }

    let currentPlayerId = localStorage.getItem(`darwaza_player_${roomId}`);
    let isNewPlayer = false;

    if (!currentPlayerId) {
      const { data: newPlayer, error: playerError } = await supabase.from('players').insert([{ room_id: roomId, name: targetName, emoji: "🎮", team: 'none', role: 'spectator', ip_address: ip, device_data: deviceData, is_online: true }]).select().single();
      if (playerError || !newPlayer) { alert("فشل الاتصال بقاعدة البيانات لإنشاء اللاعب!"); setIsJoiningUI(false); return; }
      currentPlayerId = newPlayer.id;
      localStorage.setItem(`darwaza_player_${roomId}`, currentPlayerId);
      isNewPlayer = true;
    } else {
      await supabase.from('players').update({ name: targetName, ip_address: ip, device_data: deviceData, is_online: true }).eq('id', currentPlayerId);
    }

    setLocalPlayerId(currentPlayerId);

    const { data: existingRoom } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();

    if (!existingRoom || !existingRoom.board_words || existingRoom.board_words.length === 0) {
      const words = shuffleArray(wordPacks.general.words).slice(0, 25);
      const isBlueStarting = Math.random() > 0.5;
      const blueCount = isBlueStarting ? 9 : 8;
      const redCount = isBlueStarting ? 8 : 9;
      const startingTurn = isBlueStarting ? 'blue' : 'red';
      
      const colors = shuffleArray([...Array(blueCount).fill("bg-blue-600"), ...Array(redCount).fill("bg-red-600"), "bg-black", ...Array(7).fill("bg-slate-100")]);
      
      await supabase.from('rooms').upsert({ 
        id: roomId, owner_id: currentPlayerId, board_words: words, board_colors: colors, board_revealed: Array(25).fill(false), logs: [], board_nominations: {}, 
        blue_score: blueCount, red_score: redCount, current_turn: startingTurn, game_phase: 'hinting', is_locked: false, allow_name_change: true, timer_duration: 120, timer_ends_at: null, pinned_spectators: []
      });
      setRoomOwnerId(currentPlayerId);
    } else {
      setRoomOwnerId(existingRoom.owner_id);
    }

    setIsJoined(true);
    setIsJoiningUI(false);
    if (isNewPlayer) addGameLog(`دخل ${targetName} كـ مشاهد 🍿`);
  };

  useEffect(() => {
    if (autoJoinAttempted.current || !roomId) return;
    const savedName = localStorage.getItem("darwaza_global_name");
    if (savedName) { autoJoinAttempted.current = true; setUserName(savedName); executeJoin(savedName); } 
    else { autoJoinAttempted.current = true; }
  }, [roomId]);

  const handleJoinSubmit = (e) => { e.preventDefault(); localStorage.setItem("darwaza_global_name", userName); executeJoin(userName); };

  useEffect(() => {
    if (!localPlayerId) return;
    const setOffline = async () => { await supabase.from('players').update({ is_online: false }).eq('id', localPlayerId); };
    window.addEventListener('beforeunload', setOffline);
    return () => { window.removeEventListener('beforeunload', setOffline); setOffline(); };
  }, [localPlayerId]);

  useEffect(() => {
    const emojis = ["🦅", "🐺", "🐎", "🐪", "🐅", "🦉", "🦌", "🐆"];
    setUserEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [gameLogs]);

  useEffect(() => {
    if (!timerEndsAt || timerDuration === 0) { setTimeLeft(null); return; }
    const interval = setInterval(() => {
      const diff = new Date(timerEndsAt) - new Date();
      if (diff <= 0) { setTimeLeft(0); clearInterval(interval); } 
      else { setTimeLeft(Math.floor(diff / 1000)); }
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
          setBlueScore(room.blue_score); setRedScore(room.red_score); setCurrentTurn(room.current_turn); setGamePhase(room.game_phase);
          setHintWord(room.hint_word ?? ''); setHintCount(room.hint_count ?? 0); setGameLogs(room.logs ?? []); setRoomOwnerId(room.owner_id);
          setIsRoomLocked(room.is_locked ?? false); setAllowNameChange(room.allow_name_change ?? true); setTimerDuration(room.timer_duration ?? 120);
          setTimerEndsAt(room.timer_ends_at); setPinnedSpectators(room.pinned_spectators || []);
          if (room.board_words) setCurrentWords(room.board_words); if (room.board_colors) setWordColors(room.board_colors);
          if (room.board_revealed) setRevealedWords(room.board_revealed); if (room.board_nominations) setNominations(room.board_nominations);
        }
      } catch (error) { console.error("Fetch error:", error); } 
      finally { setIsDataLoaded(true); }
    };

    fetchRoomData();

    const channel = supabase.channel(`room_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const d = payload.new;
        if (!d) return;
        setBlueScore(d.blue_score); setRedScore(d.red_score); setCurrentTurn(d.current_turn); setGamePhase(d.game_phase);
        setHintWord(d.hint_word); setHintCount(d.hint_count); setGameLogs(d.logs || []); setRoomOwnerId(d.owner_id);
        setIsRoomLocked(d.is_locked); setAllowNameChange(d.allow_name_change); setTimerDuration(d.timer_duration); setTimerEndsAt(d.timer_ends_at);
        setPinnedSpectators(d.pinned_spectators || []);
        if (d.board_revealed) setRevealedWords(d.board_revealed); if (d.board_words) setCurrentWords(d.board_words);
        if (d.board_colors) setWordColors(d.board_colors); if (d.board_nominations) setNominations(d.board_nominations); else setNominations({});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => { if (data) setRoomPlayers(data); });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, isJoined]);

  const addGameLog = async (msg, team = 'none') => {
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const newLog = { msg, type: team, time: timeStr };
      const updatedLogs = [newLog, ...gameLogs].slice(0, 50);
      await supabase.from('rooms').update({ logs: updatedLogs }).eq('id', roomId);
  };

  const kickPlayer = async (playerId) => {
    const p = roomPlayers.find(player => player.id === playerId);
    const safeRole = p?.role === 'master' ? 'master' : 'spectator';
    await supabase.from('players').update({ team: 'none', role: safeRole }).eq('id', playerId);
  };

  const togglePinPlayer = async (playerId) => {
    let newPinned = [...pinnedSpectators];
    if (newPinned.includes(playerId)) newPinned = newPinned.filter(id => id !== playerId); else newPinned.push(playerId);
    await supabase.from('rooms').update({ pinned_spectators: newPinned }).eq('id', roomId);
  };

  const quickJoin = async (targetTeam, targetRole) => {
    if (isRoomLocked && !isOwner) return alert("الروم مقفلة، ما تقدر تنضم! 🔒");
    if (pinnedSpectators.includes(localPlayerId)) return alert("المالك ثبتك كمشاهد، ما تقدر تلعب! 📌");
    let finalRole = targetRole;
    if (userRole === 'master' && targetRole === 'decoder') { alert("حركات نص كم! 👀 شفت الكلمات كمشفر تبي ترجع مفكك؟ بنرجعك مشفر تلقائياً 👑"); finalRole = 'master'; }
    await supabase.from('players').update({ team: targetTeam, role: finalRole }).eq('id', localPlayerId);
    setUserTeam(targetTeam); setUserRole(finalRole);
    const teamName = targetTeam === 'blue' ? 'الدهاة' : 'الجهابذة';
    const roleTitle = finalRole === 'master' ? 'مُشفر' : 'مفكك';
    addGameLog(`انضم ${userName} سريعاً لفريق ${teamName} كـ ${roleTitle} ⚡`, targetTeam);
  };

  const resetBoardWithWords = async (newWords) => {
    const isBlueStarting = Math.random() > 0.5;
    const blueCount = isBlueStarting ? 9 : 8; const redCount = isBlueStarting ? 8 : 9; const startingTurn = isBlueStarting ? 'blue' : 'red';
    const words = shuffleArray(newWords).slice(0, 25);
    const colors = shuffleArray([...Array(blueCount).fill("bg-blue-600"), ...Array(redCount).fill("bg-red-600"), "bg-black", ...Array(7).fill("bg-slate-100")]);
    await supabase.from('rooms').update({
      board_words: words, board_colors: colors, board_revealed: Array(25).fill(false), board_nominations: {},
      blue_score: blueCount, red_score: redCount, current_turn: startingTurn, game_phase: 'hinting', timer_ends_at: null, hint_word: '', hint_count: 0
    }).eq('id', roomId);
    addGameLog(`تم تحديث اللوحة بكلمات جديدة 🔄`, 'none');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const words = text.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
      if (words.length >= 25) {
        setWordPacks(prev => ({ ...prev, custom: { name: "حزمة مخصصة 📦", words: words } })); alert("تمت إضافة الحزمة بنجاح!");
      } else alert("الحزمة يجب أن تحتوي على 25 كلمة على الأقل!");
    };
    reader.readAsText(file);
  };

  const saveCustomPack = () => {
    const words = customPackText.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
    if (words.length >= 25) {
      setWordPacks(prev => ({ ...prev, customUser: { name: "كلمات مكتوبة ✍️", words: words } }));
      setCustomPackText(""); setIsAddPackModalOpen(false); alert("تمت إضافة الكلمات!");
    } else alert(`الكلمات الحالية ${words.length}. يرجى إدخال 25 كلمة على الأقل.`);
  };

  const openSettings = () => {
    setEditName(userName); setEditEmoji(userEmoji); setEditTeam(userTeam); setEditRole(userRole === 'spectator' && userTeam !== 'none' ? 'decoder' : userRole);
    setIsEditModalOpen(true);
  };

  const saveProfile = async () => {
    if (!editName.trim() || !localPlayerId) return;
    let finalRole = editRole; let finalTeam = editTeam;
    if (pinnedSpectators.includes(localPlayerId)) finalTeam = 'none';
    if (userRole === 'master' && finalRole === 'decoder') finalRole = 'master';
    if (finalTeam === 'none') finalRole = userRole === 'master' ? 'master' : 'spectator'; else if (finalRole === 'spectator') finalRole = 'decoder';
    await supabase.from('players').update({ name: editName, emoji: editEmoji, team: finalTeam, role: finalRole }).eq('id', localPlayerId);
    setUserName(editName); setUserEmoji(editEmoji); setUserTeam(finalTeam); setUserRole(finalRole); setIsEditModalOpen(false);
  };

  const saveAdminSettings = async (newSettings) => {
    if (!isOwner) return;
    if (newSettings.is_locked !== undefined) setIsRoomLocked(newSettings.is_locked);
    if (newSettings.allow_name_change !== undefined) setAllowNameChange(newSettings.allow_name_change);
    if (newSettings.timer_duration !== undefined) setTimerDuration(newSettings.timer_duration);
    await supabase.from('rooms').update(newSettings).eq('id', roomId);
    addGameLog(`تم تعديل إعدادات الروم ⚙️`, 'none');
  };

  const handleWordClick = async (index) => {
    if (userRole !== "decoder" || userTeam !== currentTurn || gamePhase !== "guessing" || revealedWords[index]) return;
    const wordNoms = nominations[index] || [];
    const isNominatedByMe = wordNoms.includes(userName);

    if (!isNominatedByMe) {
      const newNoms = { ...nominations }; newNoms[index] = [...wordNoms, userName];
      setNominations(newNoms); 
      await supabase.from('rooms').update({ board_nominations: newNoms }).eq('id', roomId);
      addGameLog(`🔍 ${userName} رشّح كلمة "${currentWords[index]}"`, currentTurn);
      return; 
    }

    let currentTimerEndsAt = timerEndsAt;
    if (!timerEndsAt && timerDuration > 0) currentTimerEndsAt = new Date(Date.now() + timerDuration * 1000).toISOString();

    const newRevealed = [...revealedWords]; newRevealed[index] = true;
    const actualColor = wordColors[index]; const wordText = currentWords[index];
    const newNoms = { ...nominations }; delete newNoms[index];

    let newBlue = blueScore; let newRed = redScore; let newTurn = currentTurn; let newPhase = gamePhase;

    if (actualColor === "bg-blue-600") newBlue = Math.max(0, blueScore - 1);
    else if (actualColor === "bg-red-600") newRed = Math.max(0, redScore - 1);
    
    const isCorrect = actualColor === (currentTurn === "blue" ? "bg-blue-600" : "bg-red-600");
    addGameLog(`${userName} أكد اختيار "${wordText}" - ${isCorrect ? 'إجابة صحيحة ✅' : 'إجابة خاطئة ❌'}`, currentTurn);

    if (!isCorrect) { newTurn = currentTurn === "blue" ? "red" : "blue"; newPhase = "hinting"; }

    await supabase.from('rooms').update({
      board_revealed: newRevealed, board_nominations: newNoms, blue_score: newBlue, red_score: newRed, current_turn: newTurn, game_phase: newPhase,
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
  const bluePlayers = sortPlayersByRole(roomPlayers.filter(p => p.team === 'blue' && p.is_online));
  const blueMasters = bluePlayers.filter(p => p.role === 'master');
  const blueDecoders = bluePlayers.filter(p => p.role === 'decoder');
  const redPlayers = sortPlayersByRole(roomPlayers.filter(p => p.team === 'red' && p.is_online));
  const redMasters = redPlayers.filter(p => p.role === 'master');
  const redDecoders = redPlayers.filter(p => p.role === 'decoder');
  const spectatorPlayers = roomPlayers.filter(p => p.team === 'none' && p.is_online);

  const boardFaded = userRole === 'spectator' && isRoomLocked; 

  if (!isJoined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-right relative" dir="rtl">
        <div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-xl font-bold flex flex-col items-center">
          <h2 className="text-2xl font-black text-teal-400 mb-6 text-center uppercase tracking-widest">الدروازة 🚪</h2>
          {isJoiningUI ? (
            <div className="text-center text-slate-300 font-bold animate-pulse text-sm py-4">جاري دخول الدروازة... 🚀</div>
          ) : (
            <form onSubmit={handleJoinSubmit} className="space-y-4 w-full">
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-4 rounded-xl bg-[#020617] border border-slate-700 text-center font-bold outline-none focus:border-teal-500 text-slate-200 placeholder-slate-500 transition-colors" placeholder="وش اسمك؟" required />
              <button type="submit" className="w-full bg-gradient-to-br from-teal-500 to-teal-700 text-white py-4 rounded-xl font-black shadow-lg hover:from-teal-400 hover:to-teal-600 transition-colors">دخول اللعبة 🚀</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!isDataLoaded || currentWords.length === 0) return <div className="min-h-[80vh] flex items-center justify-center font-bold text-slate-500 relative"><div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>جاري فتح الدروازة وتجهيز الكلمات...</div>;

  return (
    <div className="w-full min-h-screen relative font-sans text-right py-4" dir="rtl">
      <style>{`
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animated-gradient-board { background: linear-gradient(135deg, #0f172a, #020617, #1e293b); background-size: 200% 200%; animation: bg-pan 15s ease infinite; }
      `}</style>

      <div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>

      <main className="w-full max-w-4xl mx-auto flex flex-col items-center px-2 sm:px-4 space-y-4">
        
        {userRole === "spectator" && (
          <div onClick={openSettings} className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-teal-400 p-2.5 rounded-xl flex justify-center items-center shadow-lg cursor-pointer transition-colors hover:bg-slate-800 mx-2" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <span className="text-[11px] font-black tracking-widest">أنت تشاهد الآن 🍿 (انقر هنا للعب 🎮)</span>
          </div>
        )}

        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-y-3 gap-x-2 mx-2">
          <div className="flex items-center gap-2 w-auto">
             <div className={`px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase bg-[#020617] border border-slate-800 ${currentTurn === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
              دور: <span className="font-black">{currentTurn === 'blue' ? 'الدهاة' : 'الجهابذة'}</span> {gamePhase === "hinting" ? "(يلمح)" : "(يخمن)"}
            </div>
            {isOwner && (
              <button onClick={() => setIsAdminModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors relative z-10 cursor-pointer">
                الإعدادات ⚙️
              </button>
            )}
          </div>
          
          {timerDuration > 0 && (
            <div className={`font-mono text-lg sm:text-xl font-black order-first w-full text-center sm:order-none sm:w-auto ${timeLeft !== null && timeLeft <= 10 ? 'text-[#FECACA] animate-pulse' : 'text-[#F5F5DC]'}`}>
              {timerEndsAt === null ? formatTime(timerDuration) : formatTime(timeLeft)}
            </div>
          )}

          <div className="flex items-center gap-2 w-auto">
            <button onClick={() => setIsPlayersListOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors relative z-10 cursor-pointer">
              👥 ({roomPlayers.filter(p => p.is_online).length})
            </button>
            <button onClick={openSettings} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-sm hover:from-teal-500 hover:to-teal-700 transition-colors relative z-10 cursor-pointer">
              ملفي 👤
            </button>
          </div>
        </div>

        <div className={`w-full max-w-2xl bg-[#4C7D7E] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-lg grid grid-cols-5 gap-1.5 animated-gradient-board border border-slate-800 transition-all duration-500 mx-2 ${boardFaded ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {currentWords.map((word, index) => {
            const isRevealed = revealedWords[index];
            const actualColor = wordColors[index];
            const wordNoms = nominations[index] || [];
            const isNominatedByMe = wordNoms.includes(userName);

            let btnClasses = "";
            if (isRevealed) {
              if (actualColor === "bg-blue-600") btnClasses = "bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white opacity-40 grayscale-[50%]";
              else if (actualColor === "bg-red-600") btnClasses = "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white opacity-40 grayscale-[50%]";
              else if (actualColor === "bg-slate-100") btnClasses = "bg-slate-300 text-slate-500 opacity-60"; 
              else if (actualColor === "bg-black") btnClasses = "bg-black text-red-500 font-black opacity-80 border-2 border-red-500"; 
            } else {
              if (userRole === "master") {
                if (actualColor === "bg-blue-600") btnClasses = "bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-md border-[#1E3A8A]";
                else if (actualColor === "bg-red-600") btnClasses = "bg-gradient-to-b from-[#EF4444] to-[#DC2626] text-white shadow-md border-[#7F1D1D]";
                else if (actualColor === "bg-slate-100") btnClasses = "bg-slate-100 text-slate-800 shadow-sm border-slate-300";
                else if (actualColor === "bg-black") btnClasses = "bg-black text-white shadow-md border-slate-800";
              } else {
                btnClasses = "bg-gradient-to-br from-[#ebf5ed] to-[#d6ebd9] text-stone-800 border-[#c2e0cd] hover:from-[#d6ebd9] hover:to-[#c2e0cd] shadow-sm";
              }
            }

            if (!isRevealed && wordNoms.length > 0) {
              btnClasses += " border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-[1.02] z-10";
            }

            return (
              <button key={index} onClick={() => handleWordClick(index)} className={`min-h-[55px] sm:min-h-[75px] rounded-xl flex items-center justify-center transition-all relative ${btnClasses}`}>
                <span className="text-[9px] sm:text-sm font-black text-center px-0.5 leading-tight">{word}</span>
                
                {!isRevealed && wordNoms.length > 0 && (
                  <div className="absolute -top-2 -right-2 flex gap-0.5">
                    {wordNoms.map((nName, i) => {
                      const p = roomPlayers.find(pl => pl.name === nName);
                      return <span key={i} className="bg-slate-800 rounded-full text-[10px] sm:text-xs p-0.5 shadow-md border border-slate-600 z-20">{p ? p.emoji : '👤'}</span>;
                    })}
                  </div>
                )}

                {isNominatedByMe && !isRevealed && (
                  <div className="absolute bottom-0 w-full bg-black/70 text-amber-300 text-[7px] sm:text-[9px] font-black py-0.5 sm:py-1 rounded-b-xl backdrop-blur-sm z-20">
                    اضغط للتأكيد
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {boardFaded && <div className="text-slate-300 text-xs font-bold bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl mx-2">الروم مقفلة حالياً، يمكنك المشاهدة فقط 🍿</div>}

        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 mx-2 px-2">
          <div className="bg-[#0f172a]/80 border border-blue-900/60 rounded-2xl p-3 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[#BAE6FD] font-black text-sm uppercase tracking-widest">الدهاة</span>
              <span className="text-[#F5F5DC] font-black text-xl sm:text-2xl bg-[#4C7D7E] border border-[#385F60] shadow-sm px-3 py-0.5 rounded-lg">{blueScore}</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#BAE6FD] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {blueMasters.length > 1 ? 'المُشفرين 👑' : 'المُشفر 👑'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {blueMasters.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[9px] sm:text-[10px] font-bold">{p.name}</span><span className="text-[10px] sm:text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && !isRoomLocked && (
                    <button onClick={() => quickJoin('blue', 'master')} className="text-[8px] sm:text-[9px] bg-blue-900/40 border border-blue-800 text-blue-200 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {blueMasters.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">بانتظار القائد...</span>}
                </div>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#BAE6FD] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {blueDecoders.length > 1 ? 'مفككين الشفرات 🔍' : 'مفكك الشفرة 🔍'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {blueDecoders.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[9px] sm:text-[10px] font-bold">{p.name}</span><span className="text-[10px] sm:text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && !isRoomLocked && (
                    <button onClick={() => quickJoin('blue', 'decoder')} className="text-[8px] sm:text-[9px] bg-blue-900/40 border border-blue-800 text-blue-200 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {blueDecoders.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">لا يوجد لاعبين</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a]/80 border border-red-900/60 rounded-2xl p-3 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-3 px-1">
              <span className="text-[#FECACA] font-black text-sm uppercase tracking-widest">الجهابذة</span>
              <span className="text-[#F5F5DC] font-black text-xl sm:text-2xl bg-[#4C7D7E] border border-[#385F60] shadow-sm px-3 py-0.5 rounded-lg">{redScore}</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#FECACA] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {redMasters.length > 1 ? 'المُشفرين 👑' : 'المُشفر 👑'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {redMasters.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[9px] sm:text-[10px] font-bold">{p.name}</span><span className="text-[10px] sm:text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && !isRoomLocked && (
                    <button onClick={() => quickJoin('red', 'master')} className="text-[8px] sm:text-[9px] bg-red-900/40 border border-red-800 text-red-200 hover:bg-red-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {redMasters.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">بانتظار القائد...</span>}
                </div>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#FECACA] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {redDecoders.length > 1 ? 'مفككين الشفرات 🔍' : 'مفكك الشفرة 🔍'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {redDecoders.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A]">
                      <span className="text-[9px] sm:text-[10px] font-bold">{p.name}</span><span className="text-[10px] sm:text-xs">{p.emoji}</span>
                    </div>
                  ))}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && !isRoomLocked && (
                    <button onClick={() => quickJoin('red', 'decoder')} className="text-[8px] sm:text-[9px] bg-red-900/40 border border-red-800 text-red-200 hover:bg-red-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {redDecoders.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">لا يوجد لاعبين</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {userRole !== "spectator" && (
          <div className="w-full max-w-2xl px-2">
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

        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm h-36 overflow-y-auto mx-2" ref={scrollRef}>
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

      {/* استدعاء النوافذ المستقلة */}
      <AddPackModal 
        isOpen={isAddPackModalOpen} 
        onClose={() => setIsAddPackModalOpen(false)} 
        handleFileUpload={handleFileUpload} 
        customPackText={customPackText} 
        setCustomPackText={setCustomPackText} 
        saveCustomPack={saveCustomPack} 
      />

      <PlayersListModal 
        isOpen={isPlayersListOpen} 
        onClose={() => setIsPlayersListOpen(false)} 
        bluePlayers={bluePlayers} 
        redPlayers={redPlayers} 
        spectatorPlayers={spectatorPlayers} 
        userName={userName} 
        isOwner={isOwner} 
        localPlayerId={localPlayerId} 
        pinnedSpectators={pinnedSpectators} 
        kickPlayer={kickPlayer} 
        togglePinPlayer={togglePinPlayer} 
      />

      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        isOwner={isOwner} 
        isRoomLocked={isRoomLocked} 
        allowNameChange={allowNameChange} 
        timerDuration={timerDuration} 
        saveAdminSettings={saveAdminSettings} 
        wordPacks={wordPacks} 
        setIsAddPackModalOpen={setIsAddPackModalOpen} 
        resetBoardWithWords={resetBoardWithWords} 
      />

      <ProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        editName={editName} 
        setEditName={setEditName} 
        allowNameChange={allowNameChange} 
        isOwner={isOwner} 
        availableEmojis={availableEmojis} 
        editEmoji={editEmoji} 
        setEditEmoji={setEditEmoji} 
        isRoomLocked={isRoomLocked} 
        userTeam={userTeam} 
        pinnedSpectators={pinnedSpectators} 
        localPlayerId={localPlayerId} 
        editTeam={editTeam} 
        setEditTeam={setEditTeam} 
        userRole={userRole} 
        editRole={editRole} 
        setEditRole={setEditRole} 
        saveProfile={saveProfile} 
      />
    </div>
  );
}