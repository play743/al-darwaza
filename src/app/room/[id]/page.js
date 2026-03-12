"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 
import fpPromise from '@fingerprintjs/fingerprintjs';
import confetti from 'canvas-confetti';

import AddPackModal from "../../../components/AddPackModal";
import PlayersListModal from "../../../components/PlayersListModal";
import AdminModal from "../../../components/AdminModal";
import ProfileModal from "../../../components/ProfileModal";

let winAudio = null;
let loseAudio = null;
if (typeof window !== 'undefined') {
  winAudio = new Audio('/sounds/win.mp3');
  loseAudio = new Audio('/sounds/lose.mp3');
}

const playSound = (type) => {
    try {
      const audio = type === 'win' ? winAudio : loseAudio;
      if (audio) {
          audio.currentTime = 0;
          audio.volume = 0.5; 
          audio.play().catch(e => console.log("المتصفح يحتاج تفاعل لتشغيل الصوت:", e));
      }
    } catch (error) {
      console.error("فشل تشغيل الصوت:", error);
    }
};

const fireFullScreenConfetti = () => {
  var duration = 3 * 1000;
  var end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, zIndex: 9999 });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, zIndex: 9999 });
    if (Date.now() < end) { requestAnimationFrame(frame); }
  }());
};

export default function GameBoard() {
  const params = useParams();
  const roomId = params?.id;
  const scrollRef = useRef(null);

  const [wordPacks, setWordPacks] = useState({
    general: { name: "حزمة عامة 🌍", words: ["تفاحة", "فراولة", "بطيخ", "موز", "تمر", "كليجا", "طيارة", "سيارة", "دباب", "سيكل", "باص", "كتاب", "دفتر", "قلم حبر", "بحر", "بر", "مفتاح", "ريموت", "شجرة", "نخلة", "ساعة", "قمر", "شمس", "نجوم", "زحل", "المريخ", "نهر", "تراب", "رمل", "جبل", "مبنى", "برج", "مدرسة", "دوام", "عمل", "كرسي", "طاولة", "مقلمة", "شنطة", "دريشة", "مكيف", "دفاية", "ابجوره", "جوال", "ايباد", "لابتوب", "صورة", "فيديو", "صوت", "ضوء", "ملعب", "كورة", "مرمى", "حصان", "بعير", "فارس", "رحال", "قرية", "طريق", "شارع", "حاره", "حي", "خبز", "صامولي", "عجين", "مفرود", "حديقة", "ممشى", "نادي", "ونترلاند", "سماء", "سحب", "برق", "مطر", "غيث", "نظارة", "ليزر", "الرياض", "القصيم", "جده", "الكويت", "السعودية", "العراق", "موية", "ببسي", "فصفص", "كودرد", "خبيز"] },
    najd: { name: "كلمات شعبية", words: ["دلة", "ابريق", "فنجال", "بيالة", "قهوة", "شاهي", "طويق", "الدرعية", "عرضة", "سامري", "محالة", "بندق", "سيف", "خنجر", "جصة", "تمر", "كليجا", "وجار", "سجاد", "روشن", "منفاخ", "دبيازة", "جريش", "رز", "قرصان", "مرقوق", "مصابيب", "حنيني", "شقراء", "بكة", "المدينة المنورة", "نقاء", "العرفج", "الرمث", "القحيوان", "نفود", "خيمة", "زير", "عج", "غيث", "خرازة", "المعزب", "ذبيحة", "بعير", "ناقى", "حليب", "الحكاكة", "السكة", "السيارة", "مصقاع", "مرود", "مبرد", "ملقاط", "مذود", "جمر", "حطب", "غضارة", "مشلح", "محزم", "مطرقة", "مبخرة", "حصني", "ضبع", "المربعانية", "الوسم", "سهيل", "نجر", "مهفة", "نار", "الدراعة", "الدقلة", "الحايك"] }
  });

  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [blueWins, setBlueWins] = useState(0);
  const [redWins, setRedWins] = useState(0);
  
  const [currentTurn, setCurrentTurn] = useState("blue"); 
  const [gamePhase, setGamePhase] = useState("hinting");
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showEndBanner, setShowEndBanner] = useState(false);

  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [allowNameChange, setAllowNameChange] = useState(true);
  const [timerDuration, setTimerDuration] = useState(0); 
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
  
  const [isCopied, setIsCopied] = useState(false);

  const availableEmojis = ["🇸🇦","🇰🇼","🎮","🐲","🌑","🪐","🌧️","😤","🥳","🥲","☠️","🤌🏼","👤","🧘‍♂️","⛹️","🤽","🎤","🎧","🛵","🚀","🗿","🚦","🌃","🏞️","📱","🖥️","⌚️","⏳","🪫","💡","🪤","🪓","🩺","🦠","🪭","🦅","🐢","🕸️"];

  const [roomPlayers, setRoomPlayers] = useState([]);
  const [hintWord, setHintWord] = useState(""); 
  const [hintCount, setHintCount] = useState(0); 
  const [hintInput, setHintInput] = useState("");
  const [currentWords, setCurrentWords] = useState([]);
  const [revealedWords, setRevealedWords] = useState(Array(25).fill(false)); 
  const [wordColors, setWordColors] = useState([]); 
  const [nominations, setNominations] = useState({});

  const currentPlayer = roomPlayers.find(p => p.id === localPlayerId);
  const isRoomCreator = localPlayerId && roomOwnerId === localPlayerId; 
  const isOwner = isRoomCreator || currentPlayer?.is_admin; 
  
  const autoJoinAttempted = useRef(false);
  const lastNotifiedTurn = useRef(null);

  // 🚀 مرجع المزامنة العالمية للوقت (عشان نحل مشكلة اختلاف الساعات بين الجوال واللابتوب)
  const serverTimeOffsetRef = useRef(0);

  useEffect(() => {
    const syncTime = async () => {
      try {
        const res = await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
        const dateHeader = res.headers.get('Date');
        if (dateHeader) {
          const serverTime = new Date(dateHeader).getTime();
          const localTime = Date.now();
          serverTimeOffsetRef.current = serverTime - localTime;
        }
      } catch(e) {}
    };
    syncTime();
    const syncInterval = setInterval(syncTime, 60000); // تحديث المزامنة كل دقيقة
    return () => clearInterval(syncInterval);
  }, []);

  // 🚀 دالة ذكية تجيب الوقت الموحد لكل الأجهزة
  const getTrueTime = () => Date.now() + serverTimeOffsetRef.current;

  // حساسات السكرول الذكي والرادار
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [unreadLogs, setUnreadLogs] = useState(0);
  const loggedNominationsRef = useRef("");

  const handleChatScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 25; 
    setIsScrolledUp(isUp);
    if (!isUp) setUnreadLogs(0); 
  };

  const nominatedIndicesStr = Object.keys(nominations).filter(k => nominations[k].length > 0).sort().join(',');
  
  useEffect(() => {
    if (!isOwner || gamePhase !== 'guessing' || !nominatedIndicesStr) return;

    const timer = setTimeout(() => {
      const indices = nominatedIndicesStr.split(',').map(Number);
      const words = indices.slice(0, 3).map(idx => currentWords[idx]);
      const wordsString = words.join('" "'); 
      
      if (loggedNominationsRef.current !== wordsString) {
        addGameLog('', `المفككين محتارين بالكلمات "${wordsString}" 🤔`, currentTurn, 'normal');
        loggedNominationsRef.current = wordsString;
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [nominatedIndicesStr, isOwner, gamePhase, currentWords, currentTurn]);

  useEffect(() => { 
    if (!scrollRef.current) return;
    if (!isScrolledUp) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else {
      setUnreadLogs(prev => prev + 1);
    }
  }, [gameLogs]);

  useEffect(() => {
    const unlockAudio = () => {
      if (winAudio && loseAudio) {
         winAudio.play().then(() => { winAudio.pause(); winAudio.currentTime = 0; }).catch(()=>{});
         loseAudio.play().then(() => { loseAudio.pause(); loseAudio.currentTime = 0; }).catch(()=>{});
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

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

  useEffect(() => {
    if (!isJoined || userTeam === 'none' || typeof window === 'undefined') return;
    if ("Notification" in window && Notification.permission === "granted") {
      if (gamePhase === 'guessing' && currentTurn === userTeam && userRole === 'decoder' && hintWord) {
        const notifId = `${currentTurn}-${hintWord}`;
        if (lastNotifiedTurn.current !== notifId) {
          new Notification('دورك يا بطل! 🕵️‍♂️', { body: `الشفرة وصلت: ${hintWord} (${hintCount === 99 ? '∞' : hintCount})` });
          lastNotifiedTurn.current = notifId;
        }
      }
      if (gamePhase === 'hinting' && currentTurn === userTeam && userRole === 'master') {
        const notifId = `${currentTurn}-hinting-${blueScore}-${redScore}`;
        if (lastNotifiedTurn.current !== notifId) {
          new Notification('دورك تشفر! 👑', { body: `اكتب الشفرة لفريقك عشان يخمنون` });
          lastNotifiedTurn.current = notifId;
        }
      }
    }
  }, [gamePhase, currentTurn, userTeam, userRole, hintWord, hintCount, blueScore, redScore, isJoined]);

  const gatherPlayerData = async () => {
    let ip = "unknown";
    try { const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json(); ip = data.ip; } catch(e) {}
    let fingerprint = "unknown";
    try { const fp = await fpPromise.load(); const result = await fp.get(); fingerprint = result.visitorId; } catch(e) {}
    const getLocation = () => new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition( (pos) => resolve(`POINT(${pos.coords.longitude} ${pos.coords.latitude})`), (err) => resolve(null), { enableHighAccuracy: true } );
    });
    const locationPoint = await getLocation();
    let deviceToken = localStorage.getItem('darwaza_device_token');
    if (!deviceToken) { deviceToken = 'DEV-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now(); localStorage.setItem('darwaza_device_token', deviceToken); }
    const deviceData = { userAgent: navigator.userAgent, language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`, darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches, referrer: document.referrer || 'Direct Entry', joinTime: new Date().toISOString() };
    return { ip, fingerprint, locationPoint, deviceToken, deviceData };
  };

  const executeJoin = async (targetName) => {
    if (!targetName.trim() || !roomId) return;
    setIsJoiningUI(true);

    // 🚀 1. التحقق من حالة الروم أولاً قبل استهلاك أي موارد أو تسجيل الدخول
    const { data: roomCheck } = await supabase.from('rooms').select('is_locked').eq('id', roomId).maybeSingle();
    let currentPlayerId = localStorage.getItem(`darwaza_player_${roomId}`);

    // 🚀 إذا الروم مقفلة، واللاعب ما عنده حساب سابق فيها (يعني لاعب جديد)، نطرده من الباب
    if (roomCheck?.is_locked && !currentPlayerId) {
      alert("عذراً، الروم مقفلة بواسطة المشرف ولا يمكنك الدخول 🔒");
      setIsJoiningUI(false);
      return; 
    }

    await requestNotificationPermission();
    const { ip, fingerprint, locationPoint, deviceToken, deviceData } = await gatherPlayerData();

    await supabase.from('device_profiles').upsert({ device_token: deviceToken, browser_fingerprint: fingerprint, current_ip: ip, location: locationPoint ? locationPoint : null, last_active: new Date().toISOString() }, { onConflict: 'device_token' });
    await supabase.from('name_history').insert([{ device_token: deviceToken, player_name: targetName, room_id: roomId }]);

    let isNewPlayer = false;
    let pData = null;

    if (!currentPlayerId) {
      const { data: newP } = await supabase.from('players').insert([{ room_id: roomId, name: targetName, emoji: "🎮", team: 'none', role: 'spectator', ip_address: ip, device_data: deviceData, is_online: true }]).select().single();
      currentPlayerId = newP.id;
      pData = newP;
      localStorage.setItem(`darwaza_player_${roomId}`, currentPlayerId);
      isNewPlayer = true;
    } else {
      const { data: existingP } = await supabase.from('players').update({ name: targetName, ip_address: ip, device_data: deviceData, is_online: true }).eq('id', currentPlayerId).select().maybeSingle();
      if (existingP) {
        pData = existingP;
      } else {
        // 🚀 حماية إضافية: لو اللاعب عنده آيدي قديم بس انحذف من قاعدة البيانات، والروم مقفلة، نطرده!
        if (roomCheck?.is_locked) {
          alert("عذراً، الروم مقفلة بواسطة المشرف ولا يمكنك الدخول 🔒");
          setIsJoiningUI(false);
          localStorage.removeItem(`darwaza_player_${roomId}`); // تنظيف جهازه
          return;
        }
        const { data: fallbackP } = await supabase.from('players').insert([{ room_id: roomId, name: targetName, emoji: "🎮", team: 'none', role: 'spectator', ip_address: ip, device_data: deviceData, is_online: true }]).select().single();
        currentPlayerId = fallbackP.id;
        pData = fallbackP;
        localStorage.setItem(`darwaza_player_${roomId}`, currentPlayerId);
        isNewPlayer = true;
      }
    }

    if (pData) {
      setLocalPlayerId(pData.id);
      setUserTeam(pData.team || 'none');
      setUserRole(pData.role || 'spectator');
      setUserName(pData.name);
      setUserEmoji(pData.emoji || '🎮');
      
      setRoomPlayers(prev => {
        const exists = prev.find(p => p.id === pData.id);
        if (exists) return prev.map(p => p.id === pData.id ? { ...p, ...pData, is_online: true } : p);
        return [...prev, { ...pData, is_online: true }];
      });
    }

    const { data: existingRoom } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();

    if (!existingRoom || !existingRoom.board_words || existingRoom.board_words.length === 0) {
      const words = shuffleArray(wordPacks.general.words).slice(0, 25);
      const isBlueStarting = Math.random() > 0.5;
      const blueCount = isBlueStarting ? 9 : 8; const redCount = isBlueStarting ? 8 : 9; const startingTurn = isBlueStarting ? 'blue' : 'red';
      const colors = shuffleArray([...Array(blueCount).fill("bg-blue-600"), ...Array(redCount).fill("bg-red-600"), "bg-black", ...Array(7).fill("bg-slate-100")]);
      
      await supabase.from('rooms').upsert({ 
        id: roomId, owner_id: currentPlayerId, board_words: words, board_colors: colors, board_revealed: Array(25).fill(false), logs: [], board_nominations: {}, 
        blue_score: blueCount, red_score: redCount, blue_wins: 0, red_wins: 0, current_turn: startingTurn, game_phase: 'hinting', is_locked: false, allow_name_change: true, timer_duration: 0, timer_ends_at: null, pinned_spectators: []
      });
      setRoomOwnerId(currentPlayerId);
    } else {
      setRoomOwnerId(existingRoom.owner_id);
    }

    setIsJoined(true); setIsJoiningUI(false);
    if (isNewPlayer) addGameLog(targetName, 'انضم مشاهد 🍿', 'none', 'gray');
  };

  useEffect(() => {
    if (gamePhase === 'ended' && winnerTeam) {
      setShowEndBanner(true); 
      setTimeout(() => {
        if (userTeam === winnerTeam) {
          playSound('win');
          fireFullScreenConfetti();
          document.body.classList.add('win-filter');
          setTimeout(() => document.body.classList.remove('win-filter'), 5000);
        } else if (userTeam === 'blue' || userTeam === 'red') {
          playSound('lose');
          document.body.classList.add('shake-screen-hard', 'lose-filter');
          setTimeout(() => document.body.classList.remove('shake-screen-hard'), 600);
          setTimeout(() => document.body.classList.remove('lose-filter'), 4000);
        }
      }, 100);
    } else {
      setShowEndBanner(false); 
    }
  }, [gamePhase, winnerTeam, userTeam]);

  useEffect(() => {
    if (autoJoinAttempted.current || !roomId) return;
    const savedName = localStorage.getItem("darwaza_global_name");
    if (savedName) { autoJoinAttempted.current = true; setUserName(savedName); executeJoin(savedName); } 
    else { autoJoinAttempted.current = true; }
  }, [roomId]);

  const handleJoinSubmit = (e) => { e.preventDefault(); localStorage.setItem("darwaza_global_name", userName); executeJoin(userName); };

  useEffect(() => {
    if (!localPlayerId) return;
    const setPresence = async (status) => { await supabase.from('players').update({ is_online: status }).eq('id', localPlayerId); };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') setPresence(false);
      else setPresence(true);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => setPresence(false));
    
    setPresence(true); 
    return () => { 
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', () => setPresence(false));
    };
  }, [localPlayerId]);

  // 🚀 مرجع ذكي للنقل التلقائي إذا انتهى الوقت
  const handleTimeUpRef = useRef(null);
  
  useEffect(() => {
    handleTimeUpRef.current = async () => {
      // 🚀 المشرف فقط هو اللي ينفذ الأمر عشان ما يصير ضغط على قاعدة البيانات
      if (!isOwner || gamePhase === 'ended') return; 
      
      const newTurn = currentTurn === "blue" ? "red" : "blue";
      let currentTimerEndsAt = null;
      if (timerDuration > 0) currentTimerEndsAt = new Date(getTrueTime() + timerDuration * 1000).toISOString();
      
      await supabase.from('rooms').update({
        current_turn: newTurn,
        game_phase: "hinting",
        hint_word: "",
        hint_count: 0,
        timer_ends_at: currentTimerEndsAt,
        board_nominations: {}
      }).eq('id', roomId);

      addGameLog("النظام", "انتهى الوقت وانتقل الدور ⏱️", 'none', 'gray');
    };
  }, [isOwner, gamePhase, currentTurn, timerDuration, roomId]);

  // 🚀 المؤقت يعتمد على التوقيت العالمي (getTrueTime) عشان يطابق كل الأجهزة
  useEffect(() => {
    if (!timerEndsAt || timerDuration === 0) { setTimeLeft(null); return; }
    const interval = setInterval(() => {
      const diff = new Date(timerEndsAt).getTime() - getTrueTime();
      if (diff <= 0) { 
        setTimeLeft(0); 
        clearInterval(interval); 
        if (handleTimeUpRef.current) handleTimeUpRef.current(); // نقل الدور فوراً إذا وصل 0
      } 
      else { setTimeLeft(Math.floor(diff / 1000)); }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEndsAt, timerDuration]);

  useEffect(() => {
    if (!isJoined || !roomId || !localPlayerId) return;
    const fetchRoomData = async () => {
      try {
        const { data: players } = await supabase.from('players').select('*').eq('room_id', roomId);
        if (players) setRoomPlayers(players);

        const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
        if (room) {
          setBlueScore(room.blue_score ?? 0); setRedScore(room.red_score ?? 0); 
          setBlueWins(room.blue_wins ?? 0); setRedWins(room.red_wins ?? 0);
          setCurrentTurn(room.current_turn ?? 'blue'); setGamePhase(room.game_phase ?? 'hinting');
          setWinnerTeam(room.winner_team ?? null);
          setHintWord(room.hint_word ?? ''); setHintCount(room.hint_count ?? 0); setGameLogs(room.logs ?? []); setRoomOwnerId(room.owner_id);
          setIsRoomLocked(room.is_locked ?? false); setAllowNameChange(room.allow_name_change ?? true); setTimerDuration(room.timer_duration ?? 0);
          setTimerEndsAt(room.timer_ends_at ?? null); setPinnedSpectators(room.pinned_spectators ?? []);
          if (room.board_words) setCurrentWords(room.board_words); if (room.board_colors) setWordColors(room.board_colors);
          if (room.board_revealed) setRevealedWords(room.board_revealed); setNominations(room.board_nominations ?? {});
        }
      } catch (error) { console.error("Fetch error:", error); } 
      finally { setIsDataLoaded(true); }
    };

    fetchRoomData();

    const channel = supabase.channel(`room_${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        const d = payload.new;
        if (!d) return;
        setBlueScore(d.blue_score ?? 0); setRedScore(d.red_score ?? 0); 
        setBlueWins(d.blue_wins ?? 0); setRedWins(d.red_wins ?? 0);
        setCurrentTurn(d.current_turn ?? 'blue'); setGamePhase(d.game_phase ?? 'hinting');
        setWinnerTeam(d.winner_team ?? null);
        setHintWord(d.hint_word ?? ''); setHintCount(d.hint_count ?? 0); setGameLogs(d.logs ?? []); setRoomOwnerId(d.owner_id);
        setIsRoomLocked(d.is_locked ?? false); setAllowNameChange(d.allow_name_change ?? true); setTimerDuration(d.timer_duration ?? 0); setTimerEndsAt(d.timer_ends_at ?? null);
        setPinnedSpectators(d.pinned_spectators ?? []);
        if (d.board_revealed) setRevealedWords(d.board_revealed); if (d.board_words) setCurrentWords(d.board_words);
        if (d.board_colors) setWordColors(d.board_colors); setNominations(d.board_nominations ?? {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => { 
          if (data) {
            setRoomPlayers(data); 
            const me = data.find(p => p.id === localPlayerId);
            if (me) {
              setUserTeam(me.team);
              setUserRole(me.role);
            }
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, isJoined, localPlayerId]);

  // 🚀 دالة المشاركة (تفتح الواتساب بالجوال، وتنسخ باللابتوب أو في حال عدم وجود HTTPS)
  const handleShareRoom = async () => {
    const roomLink = window.location.href; 
    
    // محاولة المشاركة الأساسية
    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share({
          title: 'الدروازة - فك الشفرة 🔍',
          text: 'تعال العب معي فك الشفرة! غرفتنا جاهزة 🚀',
          url: roomLink,
        });
        return; // إذا نجحت، وقف هنا
      } catch (error) {
        console.log('المستخدم ألغى المشاركة');
      }
    } 
    
    // إذا ما دعم المشاركة، انسخ الرابط إجبارياً
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomLink);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = roomLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      alert('انسخ الرابط من المتصفح فوق ☝️');
    }
  };

  const addGameLog = async (playerName, actionText, team = 'none', styleType = 'normal') => {
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const newLog = { playerName, action: actionText, type: team, time: timeStr, styleType };
      
      let updatedLogs = [...gameLogs, newLog];
      
      while (updatedLogs.length > 50) {
        const oldestNormalLogIndex = updatedLogs.findIndex(l => l.styleType !== 'hint');
        if (oldestNormalLogIndex !== -1) {
          updatedLogs.splice(oldestNormalLogIndex, 1);
        } else {
          break; 
        }
      }
      
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
    // 🚀 تم إزالة المنع الداخلي، وصار المنع فقط للمثبتين كمشاهدين
    if (pinnedSpectators.includes(localPlayerId)) return alert("المالك ثبتك كمشاهد، ما تقدر تلعب! 📌");
    let finalRole = targetRole;
    if (userRole === 'master' && targetRole === 'decoder') { alert("حركات نص كم! 👀 شفت الكلمات كمشفر تبي ترجع مفكك؟ بنرجعك مشفر تلقائياً 👑"); finalRole = 'master'; }
    
    await supabase.from('players').update({ team: targetTeam, role: finalRole, is_online: true }).eq('id', localPlayerId);
    setUserTeam(targetTeam); setUserRole(finalRole);
    setRoomPlayers(prev => prev.map(p => p.id === localPlayerId ? { ...p, team: targetTeam, role: finalRole, is_online: true } : p));

    const teamName = targetTeam === 'blue' ? 'الدهاة' : 'الجهابذة';
    const roleTitle = finalRole === 'master' ? 'مشفر' : 'مفكك';
    addGameLog(userName, `انضم ${teamName} ${roleTitle} ⚡`, targetTeam, 'normal');
  };

  const skipTurn = async () => {
    if (gamePhase !== 'guessing' || currentTurn !== userTeam || userRole !== 'decoder') return;
    const newTurn = currentTurn === "blue" ? "red" : "blue";
    
    // 🚀 التجديد الإجباري للوقت عند التخطي
    let currentTimerEndsAt = null;
    if (timerDuration > 0) currentTimerEndsAt = new Date(getTrueTime() + timerDuration * 1000).toISOString();
    
    await supabase.from('rooms').update({
      current_turn: newTurn,
      game_phase: "hinting",
      hint_word: "",
      hint_count: 0,
      timer_ends_at: currentTimerEndsAt,
      board_nominations: {} 
    }).eq('id', roomId);
    
    addGameLog(userName, 'تخطى الدور ⏭️', currentTurn, 'normal');
  };

  const reportPlayer = async (targetId, targetName) => {
    const reason = window.prompt(`أنت على وشك الإبلاغ عن ${targetName} 🚨\nالرجاء كتابة سبب البلاغ (مثل: تخريب، حرق الكلمات.. الخ):`);
    if (reason === null) return; 
    
    const p = roomPlayers.find(pl => pl.id === targetId);
    if(!p) return;
    const newReports = (p.report_count || 0) + 1;
    
    if (newReports >= 3) {
       await supabase.from('players').update({ team: 'none', role: 'spectator', report_count: 0 }).eq('id', targetId);
       addGameLog(targetName, 'انطرد 🚨', 'none', 'gray');
    } else {
       await supabase.from('players').update({ report_count: newReports }).eq('id', targetId);
       addGameLog(targetName, 'انذار ⚠️', 'none', 'gray');
    }
  };

  const toggleAdmin = async (targetId, currentAdminStatus, targetName) => {
    if(!isRoomCreator) return; 
    const newStatus = !currentAdminStatus;
    await supabase.from('players').update({ is_admin: newStatus }).eq('id', targetId);
    addGameLog(targetName, newStatus ? 'ترقى مشرف 👑' : 'انسحب اشرافه 🔻', 'none', 'gray');
  };

  const resetBoardWithWords = async (newWords) => {
    const isBlueStarting = Math.random() > 0.5;
    const blueCount = isBlueStarting ? 9 : 8; const redCount = isBlueStarting ? 8 : 9; const startingTurn = isBlueStarting ? 'blue' : 'red';
    const words = shuffleArray(newWords).slice(0, 25);
    const colors = shuffleArray([...Array(blueCount).fill("bg-blue-600"), ...Array(redCount).fill("bg-red-600"), "bg-black", ...Array(7).fill("bg-slate-100")]);
    
    document.body.classList.remove('win-filter', 'lose-filter', 'shake-screen-hard');

    // 🚀 تجديد الوقت عند بدء جولة جديدة
    let currentTimerEndsAt = null;
    if (timerDuration > 0) currentTimerEndsAt = new Date(getTrueTime() + timerDuration * 1000).toISOString();

    await supabase.from('rooms').update({
      board_words: words, board_colors: colors, board_revealed: Array(25).fill(false), board_nominations: {}, winner_team: null,
      blue_score: blueCount, red_score: redCount, current_turn: startingTurn, game_phase: 'hinting', timer_ends_at: currentTimerEndsAt, hint_word: '', hint_count: 0
    }).eq('id', roomId);
    
    await supabase.from('players').update({ team: 'none', role: 'spectator' }).eq('room_id', roomId);

    setUserTeam('none');
    setUserRole('spectator');
    setRoomPlayers(prev => prev.map(p => ({ ...p, team: 'none', role: 'spectator' })));

    addGameLog(userName, 'بدأ جولة 🔄', 'none', 'gray');
  };

  // 🚀 1. جلب الحزم الخاصة من الجهاز، والحزم العامة من قاعدة البيانات
  useEffect(() => {
    const loadPacks = async () => {
      let loadedPacks = {};
      
      // جلب الحزم الخاصة 🔒
      const localPacks = JSON.parse(localStorage.getItem('darwaza_private_packs') || '{}');
      loadedPacks = { ...loadedPacks, ...localPacks };

      // جلب الحزم العامة المقبولة 🌍
      const { data: publicPacks } = await supabase.from('public_word_packs').select('*').eq('is_approved', true);
      if (publicPacks) {
        publicPacks.forEach(pack => {
          loadedPacks[`public_${pack.id}`] = { name: `${pack.name} 🌍`, words: pack.words };
        });
      }
      
      setWordPacks(prev => ({ ...prev, ...loadedPacks }));
    };
    loadPacks();
  }, []);

  // 🚀 2. دالة حفظ الحزمة (تدعم الحفظ المحلي والعام في نفس الوقت)
  const handleAddNewPack = async (packName, wordsArray, saveLocal, savePublic) => {
    let alertMsg = "";

    // حفظ في الجهاز
    if (saveLocal) {
      const newPackId = `private_${Date.now()}`;
      const newPackData = { name: `${packName} 🔒`, words: wordsArray };
      const existingLocal = JSON.parse(localStorage.getItem('darwaza_private_packs') || '{}');
      existingLocal[newPackId] = newPackData;
      localStorage.setItem('darwaza_private_packs', JSON.stringify(existingLocal));
      
      setWordPacks(prev => ({ ...prev, [newPackId]: newPackData }));
      alertMsg += "✅ تم حفظ الحزمة في مكتبتك الخاصة 🔒\n";
    }

    // إرسال لقاعدة البيانات
    if (savePublic) {
      const { error } = await supabase.from('public_word_packs').insert([{ name: packName, words: wordsArray, is_approved: false }]);
      if (error) {
        alertMsg += "❌ حدث خطأ أثناء إرسال الحزمة للعامة!\n";
      } else {
        alertMsg += "🚀 تم إرسال حزمتك للإدارة للمراجعة (المكتبة العامة 🌍)\n";
      }
    }

    if (alertMsg) alert(alertMsg.trim());
    setIsAddPackModalOpen(false);
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
    
    await supabase.from('players').update({ name: editName, emoji: editEmoji, team: finalTeam, role: finalRole, is_online: true }).eq('id', localPlayerId);
    setUserName(editName); setUserEmoji(editEmoji); setUserTeam(finalTeam); setUserRole(finalRole); setIsEditModalOpen(false);

    setRoomPlayers(prev => prev.map(p => p.id === localPlayerId ? { ...p, name: editName, emoji: editEmoji, team: finalTeam, role: finalRole, is_online: true } : p));
  };

  const saveAdminSettings = async (newSettings) => {
    if (!isOwner) return;
    if (newSettings.is_locked !== undefined) setIsRoomLocked(newSettings.is_locked);
    if (newSettings.allow_name_change !== undefined) setAllowNameChange(newSettings.allow_name_change);
    if (newSettings.timer_duration !== undefined) setTimerDuration(newSettings.timer_duration);
    await supabase.from('rooms').update(newSettings).eq('id', roomId);
    addGameLog(userName, 'عدل الاعدادات ⚙️', 'none', 'gray');
  };

  const handleWordClick = async (index, action = 'toggle') => {
    if (userRole !== "decoder" || userTeam !== currentTurn || revealedWords[index] || gamePhase !== 'guessing') return;

    const wordNoms = nominations[index] || [];
    const isNominatedByMe = wordNoms.includes(localPlayerId); 

    if (action === 'toggle') {
      const newNoms = { ...nominations };
      if (isNominatedByMe) {
        newNoms[index] = wordNoms.filter(n => n !== localPlayerId);
        if (newNoms[index].length === 0) delete newNoms[index];
      } else {
        newNoms[index] = [...wordNoms, localPlayerId];
      }
      setNominations(newNoms); 
      await supabase.from('rooms').update({ board_nominations: newNoms }).eq('id', roomId);
      return; 
    }

    if (action === 'confirm' && isNominatedByMe) {
      const newRevealed = [...revealedWords]; newRevealed[index] = true;
      const actualColor = wordColors[index]; const wordText = currentWords[index];
      const newNoms = { ...nominations }; delete newNoms[index];

      let newBlue = blueScore; let newRed = redScore; let newTurn = currentTurn; let newPhase = gamePhase;
      let winningTeam = null;
      let newBlueWins = blueWins; let newRedWins = redWins;

      if (actualColor === "bg-black") {
        winningTeam = currentTurn === "blue" ? "red" : "blue";
        addGameLog(userName, `اختار "${wordText}" الموت ☠️`, currentTurn, 'black');
        newPhase = "ended";
        if (winningTeam === 'blue') newBlueWins += 1; else newRedWins += 1;
      } else {
        if (actualColor === "bg-blue-600") newBlue = Math.max(0, blueScore - 1);
        else if (actualColor === "bg-red-600") newRed = Math.max(0, redScore - 1);
        
        const isCorrect = actualColor === (currentTurn === "blue" ? "bg-blue-600" : "bg-red-600");
        addGameLog(userName, `اختار "${wordText}" اجابة ${isCorrect ? 'صحيحة ✅' : 'خاطئة ❌'}`, currentTurn, 'normal');

        if (newBlue === 0) { winningTeam = 'blue'; newPhase = "ended"; newBlueWins += 1; }
        else if (newRed === 0) { winningTeam = 'red'; newPhase = "ended"; newRedWins += 1; }
        else if (!isCorrect) {
          newTurn = currentTurn === "blue" ? "red" : "blue"; 
          newPhase = "hinting";
        }
      }

      let finalNoms = newNoms;
      let currentTimerEndsAt = timerEndsAt;

      // 🚀 تجديد الوقت عند الانتقال للدور التالي (للمشفر)
      if (newTurn !== currentTurn || newPhase !== "guessing") {
        finalNoms = {};
        if (newPhase === "ended") {
          currentTimerEndsAt = null;
        } else if (timerDuration > 0) {
          currentTimerEndsAt = new Date(getTrueTime() + timerDuration * 1000).toISOString();
        }
      }

      setRevealedWords(newRevealed);
      await supabase.from('rooms').update({
        board_revealed: newRevealed, board_nominations: finalNoms, blue_score: newBlue, red_score: newRed, 
        blue_wins: newBlueWins, red_wins: newRedWins,
        current_turn: newTurn, game_phase: newPhase, winner_team: winningTeam,
        timer_ends_at: currentTimerEndsAt, 
        hint_word: newPhase === "hinting" || newPhase === "ended" ? "" : hintWord, 
        hint_count: newPhase === "hinting" || newPhase === "ended" ? 0 : hintCount
      }).eq('id', roomId);
    }
  };

  const sendHint = async () => {
    const finalCount = hintCount === 99 || hintCount === "∞" ? 99 : parseInt(hintCount) || 0;
    
    if (!hintInput.trim()) return alert("⚠️ اكتب الشفرة أولاً في المربع!");
    if (finalCount === 0) return alert("⚠️ لا تنسى تختار عدد الكلمات من القائمة المنسدلة!");

    if (userRole === "master") {
      // 🚀 تجديد الوقت للمفككين عند إرسال الشفرة
      let currentTimerEndsAt = null;
      if (timerDuration > 0) currentTimerEndsAt = new Date(getTrueTime() + timerDuration * 1000).toISOString();
      
      const { error } = await supabase.from('rooms').update({ 
         hint_word: hintInput.trim(), 
         hint_count: finalCount, 
         game_phase: "guessing", 
         timer_ends_at: currentTimerEndsAt 
      }).eq('id', roomId);

      if (error) return alert("حدث خطأ في الشبكة، لم يتم إرسال الشفرة.");

      addGameLog(userName, `ارسل شفرة "${hintInput}" عدد ${finalCount === 99 ? '∞' : finalCount} 🎯`, userTeam, 'hint');
      setHintInput("");
    }
  };

  const formatTime = (secs) => {
    if (secs === null || secs <= 0) return "00:00";
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

// 🚀 اللوحة تتغبش وتقفل عليك بس إذا المشرف ثبتك كمشاهد 📌
  const boardFaded = userRole === 'spectator' && pinnedSpectators.includes(localPlayerId);
  if (!isJoined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-right relative" dir="rtl">
        <div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-xl font-bold flex flex-col items-center">
          <h2 className="text-2xl font-black text-teal-400 mb-6 text-center uppercase tracking-widest">الدروازة 🚪</h2>
          {isJoiningUI ? (
            <div className="text-center text-slate-300 font-bold animate-pulse text-sm py-4">جاري الدخول وتجهيز مكانك... 🚀</div>
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
    <div className="w-full min-h-screen relative font-sans text-right py-4 mb-10" dir="rtl">
      <style>{`
        @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animated-gradient-board { background: linear-gradient(135deg, #0f172a, #020617, #1e293b); background-size: 200% 200%; animation: bg-pan 15s ease infinite; }
      `}</style>

      {showEndBanner && winnerTeam && (
        <div onClick={() => setShowEndBanner(false)} className="fixed inset-0 z-[6000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-sm md:max-w-md p-8 rounded-3xl border-2 shadow-2xl flex flex-col items-center animate-bounce pointer-events-auto
            ${userTeam === winnerTeam ? 'bg-blue-900/90 border-blue-400 text-blue-100 shadow-[0_0_40px_rgba(59,130,246,0.6)]' : 'bg-red-900/90 border-red-400 text-red-100 shadow-[0_0_40px_rgba(239,68,68,0.6)]'}`}>
            <span className="text-6xl mb-4">{userTeam === winnerTeam ? '🏆' : '💀'}</span>
            <h2 className="text-3xl font-black text-center">
              {userTeam === winnerTeam ? 'كفو! فريقكم فاز' : 'هاردلك! تعوضونها بالجايات'}
            </h2>
            <p className="text-base font-bold opacity-90 mt-2">الفائز الجولة هذي: {winnerTeam === 'blue' ? 'الدهاة' : 'الجهابذة'}</p>
            <p onClick={() => setShowEndBanner(false)} className="text-xs text-white/50 mt-6 animate-pulse cursor-pointer px-4 py-2 bg-black/20 rounded-xl hover:bg-black/40 transition">(اضغط هنا لإخفاء الرسالة)</p>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 w-screen h-screen bg-[#020617] z-[-1]"></div>

      <main className="w-full max-w-4xl mx-auto flex flex-col items-center px-2 sm:px-4 space-y-4 relative z-10">
        
        {userRole === "spectator" && (
          <div onClick={openSettings} className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-teal-400 p-2.5 rounded-xl flex justify-center items-center shadow-lg cursor-pointer transition-colors hover:bg-slate-800 mx-2" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
            <span className="text-[11px] font-black tracking-widest">أنت تشاهد الآن 🍿 (انقر هنا للعب 🎮)</span>
          </div>
        )}

        {/* 🚀 شريط المهام العلوي (مستوى وسطر واحد إجباري لجميع الأجهزة) */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-2 sm:p-3 rounded-2xl shadow-sm flex flex-row items-center mx-2 relative z-40 overflow-x-auto hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
          
          {/* 1. زر ملفي (أخضر ذكي) */}
          <button onClick={openSettings} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white border border-teal-700 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-xl shadow-sm hover:from-teal-500 hover:to-teal-700 transition-colors cursor-pointer shrink-0 ml-1 sm:ml-1.5">
            ملفي 👤
          </button>
          
          {/* 2. زر الأعضاء (أخضر ذكي) */}
          <button onClick={() => setIsPlayersListOpen(true)} className="bg-gradient-to-br from-teal-500 to-teal-700 text-white border border-teal-600 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0 ml-1 sm:ml-1.5">
            الأعضاء 👥
          </button>
          
          {/* 3. زر المشاركة (رمادي) */}
          <button onClick={handleShareRoom} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0">
            {isCopied ? 'تم النسخ ✅' : 'مشاركة 📤'}
          </button>
          
          {/* 4. المؤقت (يأخذ باقي المساحة ليدفع الإعدادات لليسار، ويظل بنفس السطر) */}
          <div className={`flex-1 text-center font-mono text-[13px] sm:text-xl font-black shrink-0 px-1 min-w-[50px] ${timeLeft !== null && timeLeft <= 10 ? 'text-[#FECACA] animate-pulse' : 'text-[#F5F5DC]'}`}>
            {timerDuration > 0 && (timerEndsAt === null ? formatTime(timerDuration) : formatTime(timeLeft))}
          </div>

          {/* 5. زر الإعدادات (أخضر ذكي - يثبت في أقصى اليسار) */}
          {isOwner && (
            <button onClick={() => setIsAdminModalOpen(true)} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white border border-teal-700 px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors cursor-pointer shrink-0">
              الإعدادات ⚙️
            </button>
          )}
        </div>

        <div className={`w-full max-w-2xl bg-[#4C7D7E] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-lg grid grid-cols-5 gap-1.5 animated-gradient-board border border-slate-800 transition-all duration-500 mx-2 ${boardFaded ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          {currentWords.map((word, index) => {
            const isRevealed = revealedWords[index];
            const actualColor = wordColors[index];
            const wordNoms = nominations[index] || [];
            const isNominatedByMe = wordNoms.includes(localPlayerId); 

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
                btnClasses = "bg-gradient-to-br from-[#FDF8E1] to-[#F3E5AB] text-amber-900 border-[#D4C49A] hover:from-[#F3E5AB] hover:to-[#EAD189] shadow-md";
              }
            }

            if (!isRevealed && wordNoms.length > 0) {
              btnClasses += " border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-[1.02] z-10";
            }

            return (
              <div key={index} onClick={() => handleWordClick(index, 'toggle')} className={`min-h-[55px] sm:min-h-[75px] rounded-xl flex items-center justify-center transition-all relative cursor-pointer select-none overflow-hidden ${btnClasses}`}>
                <span className="text-[9px] sm:text-sm font-black text-center px-0.5 leading-tight">{word}</span>
                
                {!isRevealed && wordNoms.length > 0 && (
                  <div className="absolute top-0.5 right-0.5 left-0.5 flex flex-wrap gap-[2px] justify-start z-20 pointer-events-none">
                    {wordNoms.map((nId, i) => {
                      const p = roomPlayers.find(pl => pl.id === nId);
                      const displayName = p ? p.name : 'لاعب';
                      return (
                        <div key={i} className="bg-slate-800/90 backdrop-blur-md rounded-[3px] border border-slate-600/70 text-[6px] sm:text-[8px] px-1 py-[2px] shadow-sm flex items-center text-slate-200 shrink-0">
                          <span className="truncate max-w-[30px] sm:max-w-[45px] leading-none">{displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isNominatedByMe && !isRevealed && (
                  <div 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      handleWordClick(index, 'confirm'); 
                    }} 
                    className="absolute bottom-0 left-0 w-[28px] h-[28px] sm:w-[45px] sm:h-[45px] bg-teal-600 hover:bg-teal-400 z-30 cursor-pointer transition-colors"
                    style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
                  >
                    <span className="absolute bottom-[2px] left-[4px] sm:bottom-1.5 sm:left-2 text-white text-[9px] sm:text-[14px] font-black drop-shadow-md leading-none">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

{boardFaded && <div className="text-slate-300 text-xs font-bold bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl mx-2">تم تثبيتك كمشاهد بواسطة المشرف 📌 يمكنك المشاهدة فقط 🍿</div>}
        <div className="w-full max-w-2xl px-2 mt-1 mb-6 relative z-50 h-[65px] sm:h-[75px] flex-shrink-0 flex items-center justify-center">
          {gamePhase === "hinting" ? (
            userRole === "master" && userTeam === currentTurn ? (
              <div className="flex gap-1.5 sm:gap-3 bg-slate-900 px-2 sm:px-4 rounded-2xl border border-teal-500/50 shadow-lg animate-radar w-full h-full items-center">
                <span className="text-[8px] sm:text-xs text-slate-500 font-bold shrink-0 opacity-80 hidden sm:inline-block">الشفرة:</span>
                
                <div className="flex-1 flex items-center bg-[#020617] border border-slate-700 rounded-lg sm:rounded-xl focus-within:border-teal-500 transition-colors h-[35px] sm:h-[45px] overflow-hidden">
                  <input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} placeholder="الكلمة..." className="flex-1 w-full bg-transparent px-2 sm:px-3 text-[11px] sm:text-sm font-bold outline-none text-right text-slate-200 placeholder-slate-600 transition-colors" />
                  
                  <div className="w-[1px] h-[60%] bg-slate-700"></div>
                  
                  <div className="w-[35px] sm:w-[45px] h-full flex items-center justify-center relative bg-transparent">
                    <select 
                      value={hintCount === 99 ? "∞" : hintCount === 0 ? "" : hintCount} 
                      onChange={(e) => { const val = e.target.value; if(val === "∞") setHintCount(99); else setHintCount(parseInt(val) || 0); }} 
                      className="w-full h-full bg-transparent text-[13px] sm:text-base font-black outline-none text-teal-400 appearance-none cursor-pointer p-0 m-0"
                      style={{ textAlignLast: 'center', direction: 'ltr' }}
                    >
                      <option value="" disabled hidden className="text-slate-600">0</option>
                      {[1,2,3,4,5,6,7,8,9,'∞'].map(v => <option key={v} value={v} className="bg-slate-900">{v}</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={sendHint} className="bg-gradient-to-br from-teal-500 to-teal-700 text-white px-3 sm:px-6 h-[35px] sm:h-[45px] rounded-lg sm:rounded-xl text-[9px] sm:text-sm font-bold shadow-md hover:from-teal-400 hover:to-teal-600 transition-colors shrink-0">إرسال</button>
              </div>
            ) : (
              <div className="flex justify-center items-center bg-slate-900/60 px-2 rounded-2xl border border-slate-800 shadow-inner w-full h-full">
                <span className={`text-[10px] sm:text-sm font-bold animate-pulse flex items-center justify-center gap-1.5 text-center ${currentTurn === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
                  <span className="truncate">دور مُشفر {currentTurn === 'blue' ? 'الدهاة' : 'الجهابذة'} يجهز الشفرة</span>
                  <span className="text-xs sm:text-base shrink-0">✍️</span>
                </span>
              </div>
            )
          ) : gamePhase === "guessing" && hintWord ? (
            <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 border border-teal-500/50 px-2.5 sm:px-5 rounded-2xl shadow-lg w-full h-full relative overflow-hidden gap-1">
              
              <style>{`@keyframes drawLineRightToLeft { 0% { width: 0%; opacity: 0; } 100% { width: 100%; opacity: 1; } }`}</style>
              
              <div className="flex items-center h-full flex-1 overflow-hidden">
                <span className="text-[9px] sm:text-xs text-slate-500 font-bold opacity-80 shrink-0 ml-1.5 sm:ml-2">الشفرة:</span>
                
                <div className="relative inline-flex items-center gap-1.5 sm:gap-2 pb-1">
                  <span className="text-[14px] sm:text-2xl font-black text-teal-400 tracking-wider drop-shadow-md truncate leading-none pt-1">{hintWord}</span>
                  <span className="text-[11px] sm:text-lg font-black text-teal-200 bg-[#020617]/50 border border-teal-500/30 px-1.5 sm:px-2 py-0.5 rounded shrink-0 leading-none">
                    {hintCount === 99 ? '∞' : hintCount}
                  </span>
                  <div className="absolute bottom-0 right-0 h-[2px] bg-gradient-to-l from-teal-400 to-teal-900 rounded-full" style={{ animation: 'drawLineRightToLeft 1.2s ease-out forwards' }}></div>
                </div>
              </div>

              {userRole === 'decoder' && userTeam === currentTurn && (
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); skipTurn(); }} className="bg-red-600 hover:bg-red-500 text-white border sm:border-2 border-red-700 px-2 py-1.5 sm:px-4 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[12px] font-black transition-all shadow-[0_0_10px_rgba(220,38,38,0.5)] whitespace-nowrap cursor-pointer relative z-50 active:scale-95 flex items-center gap-1 shrink-0">
                  <span className="hidden sm:inline-block">تخطي الدور</span>
                  <span className="sm:hidden">تخطي</span>
                  <span className="text-[10px] sm:text-sm">⏭️</span>
                </button>
              )}
            </div>
          ) : (
            <div className={`flex justify-between items-center rounded-2xl border shadow-inner w-full h-full px-3 sm:px-4 ${gamePhase === 'ended' ? (winnerTeam === 'blue' ? 'bg-blue-900/30 border-blue-600/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-red-900/30 border-red-600/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]') : 'bg-slate-900/40 border-slate-800'}`}>
              {gamePhase === 'ended' ? (
                <>
                  <div className="flex flex-col justify-center overflow-hidden pr-1">
                    <span className={`text-[11px] sm:text-sm font-black flex items-center gap-1.5 truncate ${winnerTeam === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
                      <span>الفائز: {winnerTeam === 'blue' ? 'الدهاة' : 'الجهابذة'}</span>
                      <span className="text-sm sm:text-base shrink-0">{winnerTeam === 'blue' ? '🥇' : '🏆'}</span>
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-slate-300 font-bold mt-1 truncate">
                      الانتصارات 📊 الدهاة: <span className="text-blue-400">{blueWins}</span> | الجهابذة: <span className="text-red-400">{redWins}</span>
                    </span>
                  </div>
                  
                  {isOwner ? (
                    <button onClick={() => resetBoardWithWords(wordPacks.general.words)} className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border border-amber-600 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all animate-bounce cursor-pointer flex items-center gap-1 shrink-0">
                      <span className="hidden sm:inline-block">جولة أخرى</span>
                      <span className="sm:hidden">جولة أخرى</span>
                      <span className="text-[10px] sm:text-sm">🔄</span>
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        const btn = e.currentTarget;
                        if (btn.disabled) return;
                        
                        addGameLog(userName, 'يصوت لجولة 🙋‍♂️', 'none', 'gray');
                        
                        btn.disabled = true;
                        btn.style.transition = 'none';
                        btn.style.filter = 'blur(4px)';
                        btn.style.opacity = '0.4';
                        
                        void btn.offsetWidth;
                        
                        btn.style.transition = 'filter 5s linear, opacity 5s linear';
                        btn.style.filter = 'blur(0px)';
                        btn.style.opacity = '1';

                        setTimeout(() => {
                          if (btn && btn.isConnected) {
                            btn.disabled = false;
                            btn.style.transition = '';
                            btn.style.filter = '';
                            btn.style.opacity = '';
                          }
                        }, 5000);
                      }} 
                      className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-teal-900/60 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-black shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0 min-w-[100px] sm:min-w-[130px]"
                    >
                      <span className="whitespace-nowrap">تصويت لجولة أخرى</span>
                      <span className="text-[11px] sm:text-sm">🙋‍♂️</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 italic mx-auto">
                  بانتظار بدء اللعب
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 mx-2 px-2">
          {/* الدهاة */}
          <div className="bg-[#0f172a]/80 border border-blue-900/60 rounded-2xl p-3 flex flex-col shadow-sm relative overflow-hidden">
            {winnerTeam === 'blue' && <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none"></div>}
            <div className="flex justify-between items-center mb-3 px-1 relative z-10">
              <div className="flex flex-col">
                <span className="text-[#BAE6FD] font-black text-sm uppercase tracking-widest">الدهاة</span>
                <span className="text-blue-300 text-[9px] font-bold mt-0.5">الجولات: {blueWins} 🏆</span>
              </div>
              <span className="text-[#F5F5DC] font-black text-xl sm:text-2xl bg-[#4C7D7E] border border-[#385F60] shadow-sm px-3 py-0.5 rounded-lg">{blueScore}</span>
            </div>
            <div className="flex flex-col gap-2 w-full relative z-10">
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#BAE6FD] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {blueMasters.length > 1 ? 'المُشفرين 👑' : 'المُشفر 👑'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {blueMasters.map((p, i) => (
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className={`flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer transition-all ${!p.is_online ? 'opacity-30 grayscale' : 'hover:bg-[#2A4B4C]'}`} title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{!p.is_online ? '💤' : p.emoji}</span>
                    </div>
                  ))}
                  {/* 🚀 إزالة شرط القفل ليتمكن المشاهد من الانضمام */}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && (
                    <button onClick={() => quickJoin('blue', 'master')} className="text-[8px] sm:text-[9px] bg-blue-900/40 border border-blue-800 text-blue-200 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {blueMasters.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">بانتظار القائد</span>}
                </div>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#BAE6FD] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {blueDecoders.length > 1 ? 'مفككين الشفرات 🔍' : 'مفكك الشفرة 🔍'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {blueDecoders.map((p, i) => (
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className={`flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer transition-all ${!p.is_online ? 'opacity-30 grayscale' : 'hover:bg-[#2A4B4C]'}`} title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{!p.is_online ? '💤' : p.emoji}</span>
                    </div>
                  ))}
                  {/* 🚀 إزالة شرط القفل */}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && (
                    <button onClick={() => quickJoin('blue', 'decoder')} className="text-[8px] sm:text-[9px] bg-blue-900/40 border border-blue-800 text-blue-200 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {blueDecoders.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">لا يوجد لاعبين</span>}
                </div>
              </div>
            </div>
          </div>

          {/* الجهابذة */}
          <div className="bg-[#0f172a]/80 border border-red-900/60 rounded-2xl p-3 flex flex-col shadow-sm relative overflow-hidden">
            {winnerTeam === 'red' && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>}
            <div className="flex justify-between items-center mb-3 px-1 relative z-10">
              <div className="flex flex-col">
                <span className="text-[#FECACA] font-black text-sm uppercase tracking-widest">الجهابذة</span>
                <span className="text-red-300 text-[9px] font-bold mt-0.5">الجولات: {redWins} 🏆</span>
              </div>
              <span className="text-[#F5F5DC] font-black text-xl sm:text-2xl bg-[#4C7D7E] border border-[#385F60] shadow-sm px-3 py-0.5 rounded-lg">{redScore}</span>
            </div>
            <div className="flex flex-col gap-2 w-full relative z-10">
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#FECACA] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {redMasters.length > 1 ? 'المُشفرين 👑' : 'المُشفر 👑'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {redMasters.map((p, i) => (
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className={`flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer transition-all ${!p.is_online ? 'opacity-30 grayscale' : 'hover:bg-[#2A4B4C]'}`} title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{!p.is_online ? '💤' : p.emoji}</span>
                    </div>
                  ))}
                  {/* 🚀 إزالة شرط القفل */}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && (
                    <button onClick={() => quickJoin('red', 'master')} className="text-[8px] sm:text-[9px] bg-red-900/40 border border-red-800 text-red-200 hover:bg-red-700 px-2.5 py-1.5 rounded-lg transition-colors font-bold flex items-center shadow-sm relative z-10 cursor-pointer">
                      + انضمام
                    </button>
                  )}
                  {redMasters.length === 0 && userTeam !== 'none' && <span className="text-[8px] sm:text-[9px] text-[#F5F5DC]/60 font-bold italic my-auto">بانتظار القائد</span>}
                </div>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="text-[9px] font-black text-[#FECACA] shrink-0 w-[70px] sm:w-[80px] flex items-center justify-start">
                  {redDecoders.length > 1 ? 'مفككين الشفرات 🔍' : 'مفكك الشفرة 🔍'}
                </div>
                <div className="w-[1px] self-stretch bg-[#385F60] mx-0.5"></div>
                <div className="flex flex-wrap gap-1.5 justify-start flex-1 py-0.5">
                  {redDecoders.map((p, i) => (
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className={`flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer transition-all ${!p.is_online ? 'opacity-30 grayscale' : 'hover:bg-[#2A4B4C]'}`} title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{!p.is_online ? '💤' : p.emoji}</span>
                    </div>
                  ))}
                  {/* 🚀 إزالة شرط القفل */}
                  {userTeam === 'none' && !pinnedSpectators.includes(localPlayerId) && (
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

        {/* 🚀 صندوق مجريات الأحداث (النسخة المصلحة والمرتبة) */}
        <div className="w-full max-w-2xl relative mx-2 mt-2">
          
          {isScrolledUp && unreadLogs > 0 && (
            <button 
              onClick={() => { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; setIsScrolledUp(false); setUnreadLogs(0); }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-teal-300 p-2 rounded-full shadow-lg border border-white/20 z-20 flex items-center justify-center animate-bounce hover:bg-white/20 transition-all cursor-pointer"
            >
              <span className="text-sm drop-shadow-md">⬇️</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {unreadLogs}
              </span>
            </button>
          )}

          <div onScroll={handleChatScroll} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm h-36 overflow-y-auto w-full relative" ref={scrollRef}>
            
            <h4 className="text-[9px] font-bold text-slate-500 mb-3 uppercase tracking-widest border-b border-slate-800 pb-1.5 text-right">مجريات اللعبة 📜</h4>
            
            <div className="space-y-1.5 flex flex-col items-start w-full">
              {gameLogs.map((log, i) => {
                
                const hasPlayerName = log.playerName !== undefined && log.playerName !== '';
                const msgToRender = hasPlayerName ? log.action : log.action || log.msg;
                const nameToRender = hasPlayerName ? log.playerName : '';

                // 🚀 تنسيقات الأساس
                let containerClass = "text-[10px] w-full flex justify-between items-center p-1.5 border-r-[3px] bg-slate-900/50 ";
                let nameClass = "font-black cursor-pointer hover:opacity-70 underline decoration-1 underline-offset-4 ml-1 ";
                let actionClass = "font-bold ";
                let textStyle = {}; 

                if (log.styleType === 'hint') {
                    containerClass += "border-r-teal-400 bg-teal-900/10 rounded-l-md";
                    nameClass += "text-teal-400 ";
                    actionClass += "text-teal-400 tracking-wide text-[11px]";
                } else if (log.styleType === 'black') {
                    containerClass += log.type === 'blue' ? 'border-r-blue-600 bg-black/40 rounded-l-md' : 'border-r-red-600 bg-black/40 rounded-l-md';
                    nameClass += "text-black ";
                    actionClass += "text-black text-[11px] font-black";
                    textStyle = { WebkitTextStroke: log.type === 'blue' ? '0.5px #3B82F6' : '0.5px #EF4444' };
                } else {
                    nameClass += "text-amber-500 "; 
                    if (log.styleType === 'gray') {
                        containerClass += "border-r-slate-600";
                        actionClass += "text-slate-400";
                    } else {
                        containerClass += log.type === 'blue' ? 'border-r-blue-500' : 'border-r-red-500';
                        actionClass += log.type === 'blue' ? 'text-blue-400' : 'text-red-400';
                    }
                }

                return (
                    <div key={i} className={containerClass} dir="rtl">
                        <div className="flex-1 text-right flex items-center justify-start flex-wrap gap-x-1" style={textStyle}>
                            {nameToRender && (
                                <span 
                                   onClick={(e) => { e.stopPropagation(); setIsPlayersListOpen(true); }} 
                                   className={nameClass}
                                >
                                    {nameToRender}
                                </span>
                            )}
                            <span className={actionClass}>
                                {msgToRender}
                            </span>
                        </div>
                        <span className="text-[8px] text-slate-500 shrink-0 mr-2">{log.time}</span>
                    </div>
                )
              })}
            </div>
          </div>
        </div>

      </main>

      <AddPackModal isOpen={isAddPackModalOpen} onClose={() => setIsAddPackModalOpen(false)} onSavePack={handleAddNewPack} />
      <PlayersListModal isOpen={isPlayersListOpen} onClose={() => setIsPlayersListOpen(false)} bluePlayers={bluePlayers} redPlayers={redPlayers} spectatorPlayers={spectatorPlayers} localPlayerId={localPlayerId} isOwner={isOwner} isRoomCreator={isRoomCreator} pinnedSpectators={pinnedSpectators} kickPlayer={kickPlayer} togglePinPlayer={togglePinPlayer} reportPlayer={reportPlayer} toggleAdmin={toggleAdmin} />
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} isOwner={isOwner} isRoomLocked={isRoomLocked} allowNameChange={allowNameChange} timerDuration={timerDuration} saveAdminSettings={saveAdminSettings} wordPacks={wordPacks} setIsAddPackModalOpen={setIsAddPackModalOpen} resetBoardWithWords={resetBoardWithWords} />
      <ProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} editName={editName} setEditName={setEditName} allowNameChange={allowNameChange} isOwner={isOwner} availableEmojis={availableEmojis} editEmoji={editEmoji} setEditEmoji={setEditEmoji} isRoomLocked={isRoomLocked} userTeam={userTeam} pinnedSpectators={pinnedSpectators} localPlayerId={localPlayerId} editTeam={editTeam} setEditTeam={setEditTeam} userRole={userRole} editRole={editRole} setEditRole={setEditRole} saveProfile={saveProfile} />
    </div>
  );
}