"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 
import fpPromise from '@fingerprintjs/fingerprintjs';
import confetti from 'canvas-confetti';

// استدعاء المكونات
import AddPackModal from "../../../components/AddPackModal";
import PlayersListModal from "../../../components/PlayersListModal";
import AdminModal from "../../../components/AdminModal";
import ProfileModal from "../../../components/ProfileModal";

// 🚀 تجهيز الأصوات برمجياً خارج المكون
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
    najd: { name: "نجديات 🐪", words: ["دلة", "ابريق", "فنجال", "بيالة", "قهوة", "شاهي", "طويق", "الدرعية", "عرضة", "سامري", "محالة", "بندق", "سيف", "خنجر", "جصة", "تمر", "كليجا", "وجار", "سجاد", "روشن", "منفاخ", "دبيازة", "جريش", "رز", "قرصان", "مرقوق", "مصابيب", "حنيني", "شقراء", "بكة", "المدينة المنورة", "نقاء", "العرفج", "الرمث", "القحيوان", "نفود", "خيمة", "زير", "عج", "غيث", "خرازة", "المعزب", "ذبيحة", "بعير", "ناقى", "حليب", "الحكاكة", "السكة", "السيارة", "مصقاع", "مرود", "مبرد", "ملقاط", "مذود", "جمر", "حطب", "غضارة", "مشلح", "محزم", "مطرقة", "مبخرة", "حصني", "ضبع", "المربعانية", "الوسم", "سهيل", "نجر", "مهفة", "نار", "الدراعة", "الدقلة", "الحايك"] }
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
    await requestNotificationPermission();
    const { ip, fingerprint, locationPoint, deviceToken, deviceData } = await gatherPlayerData();

    await supabase.from('device_profiles').upsert({ device_token: deviceToken, browser_fingerprint: fingerprint, current_ip: ip, location: locationPoint ? locationPoint : null, last_active: new Date().toISOString() }, { onConflict: 'device_token' });
    await supabase.from('name_history').insert([{ device_token: deviceToken, player_name: targetName, room_id: roomId }]);

    let currentPlayerId = localStorage.getItem(`darwaza_player_${roomId}`);
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
    if (isNewPlayer) addGameLog(`دخل ${targetName} كـ مشاهد 🍿`);
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
    const setOffline = async () => { await supabase.from('players').update({ is_online: false }).eq('id', localPlayerId); };
    window.addEventListener('beforeunload', setOffline);
    return () => { window.removeEventListener('beforeunload', setOffline); };
  }, [localPlayerId]);

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

  // 🚀 تحديث جذري لدالة الاستماع عشان تسحب الجميع للمشاهدة فوراً عند الإعادة
  useEffect(() => {
    if (!isJoined || !roomId || !localPlayerId) return;
    const fetchRoomData = async () => {
      try {
        const { data: players } = await supabase.from('players').select('*').eq('room_id', roomId);
        if (players) setRoomPlayers(players);

        const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
        if (room) {
          setBlueScore(room.blue_score); setRedScore(room.red_score); 
          setBlueWins(room.blue_wins || 0); setRedWins(room.red_wins || 0);
          setCurrentTurn(room.current_turn); setGamePhase(room.game_phase);
          setWinnerTeam(room.winner_team ?? null);
          setHintWord(room.hint_word ?? ''); setHintCount(room.hint_count ?? 0); setGameLogs(room.logs ?? []); setRoomOwnerId(room.owner_id);
          setIsRoomLocked(room.is_locked ?? false); setAllowNameChange(room.allow_name_change ?? true); setTimerDuration(room.timer_duration ?? 0);
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
        setBlueScore(d.blue_score); setRedScore(d.red_score); 
        setBlueWins(d.blue_wins || 0); setRedWins(d.red_wins || 0);
        setCurrentTurn(d.current_turn); setGamePhase(d.game_phase);
        setWinnerTeam(d.winner_team ?? null);
        setHintWord(d.hint_word); setHintCount(d.hint_count); setGameLogs(d.logs || []); setRoomOwnerId(d.owner_id);
        setIsRoomLocked(d.is_locked); setAllowNameChange(d.allow_name_change); setTimerDuration(d.timer_duration); setTimerEndsAt(d.timer_ends_at);
        setPinnedSpectators(d.pinned_spectators || []);
        if (d.board_revealed) setRevealedWords(d.board_revealed); if (d.board_words) setCurrentWords(d.board_words);
        if (d.board_colors) setWordColors(d.board_colors); if (d.board_nominations) setNominations(d.board_nominations); else setNominations({});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => { 
          if (data) {
            setRoomPlayers(data); 
            // 🚀 التزامن اللحظي لحالة اللاعب: لو أُجبر على المشاهدة بسبب زر الإعادة، ينفذ فوراً عنده
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

  const handleShareRoom = async () => {
    const roomLink = window.location.href; 
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'الدروازة - فك الشفرة 🔍',
          text: 'تعال العب معي فك الشفرة! غرفتنا جاهزة 🚀',
          url: roomLink,
        });
      } catch (error) {
        console.log('تم إلغاء المشاركة');
      }
    } else {
      try {
        await navigator.clipboard.writeText(roomLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); 
      } catch (error) {
        console.error('فشل النسخ:', error);
      }
    }
  };

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

  // 🚀 حل مشكلة المالك (إجبار حالة is_online: true) لضمان ظهوره
  const quickJoin = async (targetTeam, targetRole) => {
    if (isRoomLocked && !isOwner) return alert("الروم مقفلة، ما تقدر تنضم! 🔒");
    if (pinnedSpectators.includes(localPlayerId)) return alert("المالك ثبتك كمشاهد، ما تقدر تلعب! 📌");
    let finalRole = targetRole;
    if (userRole === 'master' && targetRole === 'decoder') { alert("حركات نص كم! 👀 شفت الكلمات كمشفر تبي ترجع مفكك؟ بنرجعك مشفر تلقائياً 👑"); finalRole = 'master'; }
    
    await supabase.from('players').update({ team: targetTeam, role: finalRole, is_online: true }).eq('id', localPlayerId);
    setUserTeam(targetTeam); setUserRole(finalRole);
    setRoomPlayers(prev => prev.map(p => p.id === localPlayerId ? { ...p, team: targetTeam, role: finalRole, is_online: true } : p));

    const teamName = targetTeam === 'blue' ? 'الدهاة' : 'الجهابذة';
    const roleTitle = finalRole === 'master' ? 'مُشفر' : 'مفكك';
    addGameLog(`انضم ${userName} سريعاً لفريق ${teamName} كـ ${roleTitle} ⚡`, targetTeam);
  };

  const skipTurn = async () => {
    if (gamePhase !== 'guessing' || currentTurn !== userTeam || userRole !== 'decoder') return;
    const newTurn = currentTurn === "blue" ? "red" : "blue";
    let currentTimerEndsAt = null;
    if (timerDuration > 0) currentTimerEndsAt = new Date(Date.now() + timerDuration * 1000).toISOString();
    
    await supabase.from('rooms').update({
      current_turn: newTurn,
      game_phase: "hinting",
      hint_word: "",
      hint_count: 0,
      timer_ends_at: currentTimerEndsAt
    }).eq('id', roomId);
    
    addGameLog(`⏭️ ${userName} تخطى الدور، الدور للفريق الثاني.`, currentTurn);
  };

  const reportPlayer = async (targetId, targetName) => {
    const reason = window.prompt(`أنت على وشك الإبلاغ عن ${targetName} 🚨\nالرجاء كتابة سبب البلاغ (مثل: تخريب، حرق الكلمات.. الخ):`);
    if (reason === null) return; 
    const finalReason = reason.trim() === "" ? "سلوك غير رياضي" : reason.trim();
    
    const p = roomPlayers.find(pl => pl.id === targetId);
    if(!p) return;
    const newReports = (p.report_count || 0) + 1;
    
    if (newReports >= 3) {
       await supabase.from('players').update({ team: 'none', role: 'spectator', report_count: 0 }).eq('id', targetId);
       addGameLog(`🚨 كرت أحمر! تم طرد ${targetName} للمدرجات! السبب: ${finalReason}`, 'none');
    } else {
       await supabase.from('players').update({ report_count: newReports }).eq('id', targetId);
       addGameLog(`⚠️ إنذار: تم الإبلاغ عن ${targetName} (${newReports}/3) - السبب: ${finalReason}`, 'none');
    }
  };

  const toggleAdmin = async (targetId, currentAdminStatus, targetName) => {
    if(!isRoomCreator) return; 
    const newStatus = !currentAdminStatus;
    await supabase.from('players').update({ is_admin: newStatus }).eq('id', targetId);
    addGameLog(newStatus ? `👑 تم ترقية ${targetName} إلى مشرف!` : `🔻 تم سحب الإشراف من ${targetName}`, 'none');
  };

  // 🚀 التحديث لتصفير الجولة وطرد الجميع للمشاهدة
  const resetBoardWithWords = async (newWords) => {
    const isBlueStarting = Math.random() > 0.5;
    const blueCount = isBlueStarting ? 9 : 8; const redCount = isBlueStarting ? 8 : 9; const startingTurn = isBlueStarting ? 'blue' : 'red';
    const words = shuffleArray(newWords).slice(0, 25);
    const colors = shuffleArray([...Array(blueCount).fill("bg-blue-600"), ...Array(redCount).fill("bg-red-600"), "bg-black", ...Array(7).fill("bg-slate-100")]);
    
    document.body.classList.remove('win-filter', 'lose-filter', 'shake-screen-hard');

    // 1. تصفير لوحة اللعب
    await supabase.from('rooms').update({
      board_words: words, board_colors: colors, board_revealed: Array(25).fill(false), board_nominations: {}, winner_team: null,
      blue_score: blueCount, red_score: redCount, current_turn: startingTurn, game_phase: 'hinting', timer_ends_at: null, hint_word: '', hint_count: 0
    }).eq('id', roomId);
    
    // 2. إرجاع الكل للمشاهدة
    await supabase.from('players').update({ team: 'none', role: 'spectator' }).eq('room_id', roomId);

    // تحديث الواجهة فوراً للمالك اللي ضغط الزر
    setUserTeam('none');
    setUserRole('spectator');
    setRoomPlayers(prev => prev.map(p => ({ ...p, team: 'none', role: 'spectator' })));

    addGameLog(`تم بدء جولة جديدة 🔄 وعاد الجميع للمشاهدة 🍿`, 'none');
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

  // 🚀 حل مشكلة المالك (إجبار حالة is_online: true) في الحفظ
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
    addGameLog(`تم تعديل إعدادات الروم ⚙️`, 'none');
  };

  const handleWordClick = async (index, action = 'toggle') => {
    if (userRole !== "decoder" || userTeam !== currentTurn || revealedWords[index] || gamePhase === 'ended') return;

    const wordNoms = nominations[index] || [];
    const isNominatedByMe = wordNoms.includes(userName);

    if (action === 'toggle') {
      const newNoms = { ...nominations };
      if (isNominatedByMe) {
        newNoms[index] = wordNoms.filter(n => n !== userName);
        if (newNoms[index].length === 0) delete newNoms[index];
      } else {
        newNoms[index] = [...wordNoms, userName];
        addGameLog(`🔍 ${userName} رشّح كلمة "${currentWords[index]}"`, currentTurn);
      }
      setNominations(newNoms); 
      await supabase.from('rooms').update({ board_nominations: newNoms }).eq('id', roomId);
      return; 
    }

    if (action === 'confirm' && isNominatedByMe) {
      let currentTimerEndsAt = timerEndsAt;
      if (!timerEndsAt && timerDuration > 0) currentTimerEndsAt = new Date(Date.now() + timerDuration * 1000).toISOString();

      const newRevealed = [...revealedWords]; newRevealed[index] = true;
      const actualColor = wordColors[index]; const wordText = currentWords[index];
      const newNoms = { ...nominations }; delete newNoms[index];

      let newBlue = blueScore; let newRed = redScore; let newTurn = currentTurn; let newPhase = gamePhase;
      let winningTeam = null;
      let newBlueWins = blueWins; let newRedWins = redWins;

      if (actualColor === "bg-black") {
        winningTeam = currentTurn === "blue" ? "red" : "blue";
        addGameLog(`☠️ كارثة! ${userName} اختار الكلمة السوداء "${wordText}"!`, currentTurn);
        newPhase = "ended";
        if (winningTeam === 'blue') newBlueWins += 1; else newRedWins += 1;
      } else {
        if (actualColor === "bg-blue-600") newBlue = Math.max(0, blueScore - 1);
        else if (actualColor === "bg-red-600") newRed = Math.max(0, redScore - 1);
        
        const isCorrect = actualColor === (currentTurn === "blue" ? "bg-blue-600" : "bg-red-600");
        addGameLog(`${userName} أكد اختيار "${wordText}" - ${isCorrect ? 'إجابة صحيحة ✅' : 'إجابة خاطئة ❌'}`, currentTurn);

        if (newBlue === 0) { winningTeam = 'blue'; newPhase = "ended"; newBlueWins += 1; }
        else if (newRed === 0) { winningTeam = 'red'; newPhase = "ended"; newRedWins += 1; }
        else if (!isCorrect) {
          newTurn = currentTurn === "blue" ? "red" : "blue"; 
          newPhase = "hinting";
        }
      }

      setRevealedWords(newRevealed);
      await supabase.from('rooms').update({
        board_revealed: newRevealed, board_nominations: newNoms, blue_score: newBlue, red_score: newRed, 
        blue_wins: newBlueWins, red_wins: newRedWins,
        current_turn: newTurn, game_phase: newPhase, winner_team: winningTeam,
        timer_ends_at: currentTimerEndsAt, hint_word: newPhase === "hinting" ? "" : hintWord, hint_count: newPhase === "hinting" ? 0 : hintCount
      }).eq('id', roomId);
    }
  };

  const sendHint = async () => {
    const finalCount = hintCount === 99 || hintCount === "∞" ? 99 : parseInt(hintCount) || 0;
    if (finalCount > 0 && hintInput.trim() && userRole === "master") {
      let currentTimerEndsAt = timerEndsAt;
      if (!timerEndsAt && timerDuration > 0) currentTimerEndsAt = new Date(Date.now() + timerDuration * 1000).toISOString();
      await supabase.from('rooms').update({ hint_word: hintInput, hint_count: finalCount, game_phase: "guessing", timer_ends_at: currentTimerEndsAt }).eq('id', roomId);
      addGameLog(`المشفر ${userName} أرسل الشفرة: ${hintInput} (${finalCount === 99 ? '∞' : finalCount})`, userTeam);
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

        {/* 🚀 الهيدر العلوي */}
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-y-3 gap-x-2 mx-2 relative z-40">
          <div className="flex items-center gap-1.5 sm:gap-2 w-auto relative">
             <div className={`px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase bg-[#020617] border border-slate-800 ${currentTurn === 'blue' ? 'text-blue-400' : 'text-red-400'}`}>
              دور: <span className="font-black">{currentTurn === 'blue' ? 'الدهاة' : 'الجهابذة'}</span> {gamePhase === "hinting" ? "(يلمح)" : "(يخمن)"}
            </div>
            {isOwner && (
              <button onClick={() => setIsAdminModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors cursor-pointer relative z-10">
                الإعدادات ⚙️
              </button>
            )}
            {gamePhase === 'ended' && isOwner && (
              <button onClick={() => resetBoardWithWords(wordPacks.general.words)} className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border border-amber-600 px-2 sm:px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)] transition-all animate-bounce relative z-50 cursor-pointer">
                إعادة 🔄
              </button>
            )}
          </div>
          
          {timerDuration > 0 && (
            <div className={`font-mono text-lg sm:text-xl font-black order-first w-full text-center sm:order-none sm:w-auto ${timeLeft !== null && timeLeft <= 10 ? 'text-[#FECACA] animate-pulse' : 'text-[#F5F5DC]'}`}>
              {timerEndsAt === null ? formatTime(timerDuration) : formatTime(timeLeft)}
            </div>
          )}

          {/* 🚀 قسم الأزرار وفيه زر المشاركة الجديد */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-auto">
            <button 
              onClick={handleShareRoom}
              className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer relative z-10"
            >
              {isCopied ? 'تم النسخ ✅' : 'انسخ الرابط 🔗'}
            </button>
            <button onClick={() => setIsPlayersListOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer relative z-10">
              👥 ({roomPlayers.filter(p => p.is_online).length})
            </button>
            <button onClick={openSettings} className="bg-gradient-to-br from-teal-600 to-teal-800 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-xl shadow-sm hover:from-teal-500 hover:to-teal-700 transition-colors cursor-pointer relative z-10">
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
              <div key={index} onClick={() => handleWordClick(index, 'toggle')} className={`min-h-[55px] sm:min-h-[75px] rounded-xl flex items-center justify-center transition-all relative cursor-pointer select-none ${btnClasses}`}>
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
                  <div 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      handleWordClick(index, 'confirm'); 
                    }} 
                    className="absolute bottom-0 w-full text-center bg-black/90 hover:bg-black text-amber-300 hover:text-amber-100 text-[9px] sm:text-[11px] font-black py-1.5 rounded-b-xl backdrop-blur-md z-30 cursor-pointer transition-all shadow-[0_-2px_10px_rgba(0,0,0,0.5)] border-t border-amber-500/30"
                  >
                    تأكيد الاختيار 🎯
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {boardFaded && <div className="text-slate-300 text-xs font-bold bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl mx-2">الروم مقفلة حالياً، يمكنك المشاهدة فقط 🍿</div>}

        {/* صندوق الشفرة المعدل */}
        {userRole !== "spectator" && (
          <div className="w-full max-w-2xl px-2 my-1 relative z-50">
            {gamePhase === "hinting" ? (
              userRole === "master" && userTeam === currentTurn && (
                <div className="flex gap-1.5 sm:gap-2 bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-teal-500/50 shadow-lg animate-radar w-full items-center">
                  <span className="text-[9px] sm:text-xs text-slate-500 font-bold shrink-0 opacity-80">الشفرة:</span>
                  
                  <input type="text" value={hintInput} onChange={(e) => setHintInput(e.target.value)} placeholder="الكلمة..." className="flex-1 min-w-[60px] bg-[#020617] border border-slate-700 rounded-lg sm:rounded-xl px-2 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold outline-none text-right focus:border-teal-500 text-slate-200 placeholder-slate-500 transition-colors" />
                  
                  <select 
                    value={hintCount === 99 ? "∞" : hintCount === 0 ? "" : hintCount} 
                    onChange={(e) => { const val = e.target.value; if(val === "∞") setHintCount(99); else setHintCount(parseInt(val) || 0); }} 
                    className="w-[45px] sm:w-[60px] bg-[#020617] border border-slate-700 rounded-lg sm:rounded-xl px-1 py-1.5 sm:py-2 text-[10px] sm:text-sm font-black outline-none focus:border-teal-500 text-teal-400 shrink-0 appearance-none text-center cursor-pointer"
                  >
                    <option value="" disabled hidden>العدد</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="∞">∞</option>
                  </select>

                  <button onClick={sendHint} className="bg-gradient-to-br from-teal-500 to-teal-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold shadow-md hover:from-teal-400 hover:to-teal-600 transition-colors shrink-0">إرسال</button>
                </div>
              )
            ) : (
              gamePhase === "guessing" && hintWord && (
                <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 border border-teal-500/50 p-2.5 sm:p-3 rounded-2xl shadow-lg animate-radar">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold opacity-80 mt-0.5">الشفرة:</span>
                    <span className="text-base sm:text-2xl font-black text-teal-400 tracking-wider bg-[#020617] px-3 sm:px-4 py-1 rounded-lg border border-slate-700 shadow-inner">
                      {hintWord}
                    </span>
                    <span className="bg-teal-900/60 border border-teal-500/40 text-teal-200 text-xs sm:text-base font-black px-2.5 py-1 rounded-lg flex items-center justify-center min-w-[30px] shadow-md">
                      {hintCount === 99 ? '∞' : hintCount}
                    </span>
                  </div>
                  
                  {userRole === 'decoder' && userTeam === currentTurn && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); skipTurn(); }} 
                      className="bg-red-600 hover:bg-red-500 text-white border-2 border-red-700 px-3 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-[12px] font-black transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] whitespace-nowrap cursor-pointer relative z-50 active:scale-95"
                    >
                      تخطي الدور ⏭️
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}

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
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer hover:bg-[#2A4B4C] transition-colors" title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{p.emoji}</span>
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
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer hover:bg-[#2A4B4C] transition-colors" title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{p.emoji}</span>
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
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer hover:bg-[#2A4B4C] transition-colors" title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{p.emoji}</span>
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
                    <div key={i} onClick={() => { if(p.id === localPlayerId) openSettings(); else setIsPlayersListOpen(true); }} className="flex items-center gap-1.5 bg-gradient-to-br from-[#203B3C] to-[#122223] text-[#F5F5DC] px-2 py-1 rounded-lg shadow-sm border border-[#15292A] cursor-pointer hover:bg-[#2A4B4C] transition-colors" title={p.name}>
                      <span className="text-[9px] sm:text-[10px] font-bold truncate max-w-[45px] sm:max-w-[65px] inline-block align-bottom">{p.name}</span>
                      <span className="text-[10px] sm:text-xs shrink-0">{p.emoji}</span>
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

        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm h-36 overflow-y-auto mx-2 mt-2" ref={scrollRef}>
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

      <AddPackModal isOpen={isAddPackModalOpen} onClose={() => setIsAddPackModalOpen(false)} handleFileUpload={handleFileUpload} customPackText={customPackText} setCustomPackText={setCustomPackText} saveCustomPack={saveCustomPack} />
      <PlayersListModal isOpen={isPlayersListOpen} onClose={() => setIsPlayersListOpen(false)} bluePlayers={bluePlayers} redPlayers={redPlayers} spectatorPlayers={spectatorPlayers} localPlayerId={localPlayerId} isOwner={isOwner} isRoomCreator={isRoomCreator} pinnedSpectators={pinnedSpectators} kickPlayer={kickPlayer} togglePinPlayer={togglePinPlayer} reportPlayer={reportPlayer} toggleAdmin={toggleAdmin} />
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} isOwner={isOwner} isRoomLocked={isRoomLocked} allowNameChange={allowNameChange} timerDuration={timerDuration} saveAdminSettings={saveAdminSettings} wordPacks={wordPacks} setIsAddPackModalOpen={setIsAddPackModalOpen} resetBoardWithWords={resetBoardWithWords} />
      <ProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} editName={editName} setEditName={setEditName} allowNameChange={allowNameChange} isOwner={isOwner} availableEmojis={availableEmojis} editEmoji={editEmoji} setEditEmoji={setEditEmoji} isRoomLocked={isRoomLocked} userTeam={userTeam} pinnedSpectators={pinnedSpectators} localPlayerId={localPlayerId} editTeam={editTeam} setEditTeam={setEditTeam} userRole={userRole} editRole={editRole} setEditRole={setEditRole} saveProfile={saveProfile} />
    </div>
  );
} 